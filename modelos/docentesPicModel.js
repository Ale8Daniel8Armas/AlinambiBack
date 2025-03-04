const mongoose = require("mongoose");

const docentesPicModelSchema = new mongoose.Schema({
  description: { type: String, default: "" },
  imageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const DocentesPicModel = mongoose.model(
  "DocentesPicModel",
  docentesPicModelSchema
);

module.exports = DocentesPicModel;
