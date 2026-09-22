const express = require("express");
const Factory = require("../models/Factory");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const factory = new Factory(req.body);
    const savedFactory = await factory.save();

    res.status(201).json(savedFactory);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const factories = await Factory.find().sort({ createdAt: -1 });
    res.json(factories);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;