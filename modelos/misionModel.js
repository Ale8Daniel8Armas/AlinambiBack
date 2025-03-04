const mongoose = require("mongoose");

const misionSchema = new mongoose.Schema({
  description: { type: String, default: "" },
  imageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MisionModel = mongoose.model("Mision", misionSchema);

module.exports = MisionModel;
