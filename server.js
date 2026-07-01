const express = require("express");
const path = require("path");

const app = express();

const employeeRoutes = require("./routes/employeeRoutes");

const loggerMiddleware = require("./middleware/loggerMiddleware");
const { default: mongoose } = require("mongoose");


app.use((req, res, next) => {
  if (req.body) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(loggerMiddleware);

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));


// Routes
app.use("/employees", employeeRoutes);
app.use("/api/employees", employeeRoutes);

// Export for Vercel serverless deployment
module.exports = app;

mongoose.connect("mongodb+srv://hitesh:hitesh15@hitesh.gnitjvd.mongodb.net/EMS")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Only listen when running locally (not on Vercel)
if (require.main === module) {
  app.listen(4000, () => {
    console.log("Server Running on Port 4000");
  });
}