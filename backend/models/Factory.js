const mongoose = require("mongoose");

const factorySchema = new mongoose.Schema(
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
quality: {
type: String,
required: true,
},
availabilityDate: {
type: Date,
required: true,
},
},
{
timestamps: true,
}
);
module.exports = mongoose.model("Factory", factorySchema);