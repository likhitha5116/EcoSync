const express = require("express");
const Requirement = require("../models/Requirement");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const requirement = new Requirement(req.body);
    const savedRequirement = await requirement.save();

    res.status(201).json(savedRequirement);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const requirements = await Requirement.find().sort({ createdAt: -1 });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;