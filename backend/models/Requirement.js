const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
{
companyName: {
type: String,
required: true,
},
industryType: {
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
required: true,
},
minimumQuality: {
type: String,
required: true,
},
requiredDate: {
type: Date,
required: true,
},
},
{
timestamps: true,
}
);

module.exports = mongoose.model("Requirement", requirementSchema);