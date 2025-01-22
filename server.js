const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FormData = require("./FormData");
const http = require("http");

dotenv.config();

const app = express();

console.log("PORT:", process.env.PORT);

const allowedOrigins = [
  "http://localhost:5173",
  "https://server-backend.azurewebsites.net",
  "https://wonderful-moss-0687ca600.4.azurestaticapps.net/"
];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); 
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT"], 
  allowedHeaders: ["Content-Type", "Authorization"],  
  credentials: true  
}));


app.use(bodyParser.json());

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI is not defined in the environment variables");
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("MongoDB connected"))
  .catch(error => {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  });

app.get('/api/formdata', async (req, res) => {
  try {
    const formData = await FormData.find();
    res.json(formData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/formdata', async (req, res) => {
  const formData = new FormData(req.body);
  try {
    const newFormData = await formData.save();
    res.status(201).json(newFormData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/formdata/:id', async (req, res) => {
  try {
    const updatedFormData = await FormData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFormData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const port = process.env.PORT || 8181;

const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
