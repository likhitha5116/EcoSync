const express = require("express");
const WasteGenerator = require("../models/WasteGenerator");

const router = express.Router();


// CREATE PICKUP REQUEST
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      generatorType,
      location,
      wasteType,
      quantity,
      unit,
      moistureStatus,
      pricePerUnit,
    } = req.body;

    if (
      !name ||
      !phone ||
      !generatorType ||
      !location ||
      !wasteType ||
      !quantity
    ) {
      return res.status(400).json({
        message: "Please fill all required fields.",
      });
    }

    const quantityNumber = Number(quantity);
    const priceNumber = Number(pricePerUnit || 0);

    const totalAmount =
      quantityNumber * priceNumber;

    const generatorEarnings =
      totalAmount * 0.80;

    const collectorFee =
      totalAmount * 0.15;

    const platformFee =
      totalAmount * 0.05;

    const wasteGenerator =
      new WasteGenerator({
        name,
        phone,
        generatorType,
        location,
        wasteType,
        quantity: quantityNumber,
        unit: unit || "Kg",
        moistureStatus:
          moistureStatus || "Fresh/Wet",

        pricePerUnit: priceNumber,
        totalAmount,
        generatorEarnings,
        collectorFee,
        platformFee,

        paymentStatus: "Pending",
        transactionId: "",
        paidAt: null,

        pickupStatus: "Pending",
      });

    const savedRequest =
      await wasteGenerator.save();

    res.status(201).json(savedRequest);

  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: error.message,
    });
  }
});


// GET ALL PICKUP REQUESTS
router.get("/", async (req, res) => {
  try {
    const wasteGenerators =
      await WasteGenerator.find().sort({
        createdAt: -1,
      });

    res.json(wasteGenerators);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// UPDATE PICKUP STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Picked Up",
      "Delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid pickup status",
      });
    }

    const updatedRequest =
      await WasteGenerator.findByIdAndUpdate(
        req.params.id,
        {
          pickupStatus: status,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedRequest) {
      return res.status(404).json({
        message: "Pickup request not found",
      });
    }

    res.json(updatedRequest);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});


// DEMO PAYMENT
router.patch("/:id/pay", async (req, res) => {
  try {
    const request =
      await WasteGenerator.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message: "Pickup request not found",
      });
    }

    if (request.pickupStatus !== "Delivered") {
      return res.status(400).json({
        message:
          "Payment can be made only after delivery.",
      });
    }

    if (request.paymentStatus === "Paid") {
      return res.status(400).json({
        message: "Payment already completed.",
      });
    }

    const transactionId =
      "ECO-" +
      Date.now();

    request.paymentStatus = "Paid";
    request.transactionId = transactionId;
    request.paidAt = new Date();

    await request.save();

    res.json({
      message:
        "Demo payment successful",
      transactionId,
      paymentStatus:
        request.paymentStatus,
      paidAt:
        request.paidAt,
      totalAmount:
        request.totalAmount,
      generatorEarnings:
        request.generatorEarnings,
      collectorFee:
        request.collectorFee,
      platformFee:
        request.platformFee,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});


module.exports = router;