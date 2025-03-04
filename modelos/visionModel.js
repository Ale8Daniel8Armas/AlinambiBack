const mongoose = require("mongoose");

const visionSchema = new mongoose.Schema({
  description: { type: String, default: "" },
  imageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const VisionModel = mongoose.model("Vision", visionSchema);

module.exports = VisionModel;
