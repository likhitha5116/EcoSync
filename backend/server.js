const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Factory = require("./models/Factory");
const Requirement = require("./models/Requirement");

const factoryRoutes = require("./routes/factoryRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const wasteGeneratorRoutes = require("./routes/wasteGeneratorRoutes");
const authRoutes = require("./routes/authRoutes");

const { findMatches } = require("./matchingEngine");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EcoSync Backend is running successfully!");
});

app.use("/api/auth", authRoutes);
app.use("/api/factories", factoryRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/waste-generators", wasteGeneratorRoutes);

app.get("/api/matches", async (req, res) => {
  try {
    const factories = await Factory.find();
    const requirements = await Requirement.find();

    const matches = findMatches(factories, requirements);

    res.json(matches);
  } catch (error) {
    console.error("Match API error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  });