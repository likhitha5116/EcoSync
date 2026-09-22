const mongoose = require("mongoose");

const wasteGeneratorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    generatorType: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    wasteType: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      default: "Kg",
    },

    moistureStatus: {
      type: String,
      enum: ["Fresh/Wet", "Partially Dry", "Dry"],
      default: "Fresh/Wet",
    },

    pricePerUnit: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    generatorEarnings: {
      type: Number,
      default: 0,
    },

    collectorFee: {
      type: Number,
      default: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Agreed", "Paid", "Settled"],
      default: "Pending",
    },

    transactionId: {
      type: String,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    pickupStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Picked Up",
        "Delivered",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WasteGenerator",
  wasteGeneratorSchema
);