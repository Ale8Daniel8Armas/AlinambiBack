const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // Nombre del archivo
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID del archivo en GridFS
  etiqueta: { type: String, required: true }, // Etiqueta para categorizar o describir el archivo
  mimetype: { type: String, required: true }, // Tipo MIME del archivo (ej: "application/pdf")
  size: { type: Number, required: true }, // Tamaño del archivo en bytes
  createdAt: { type: Date, default: Date.now }, // Fecha de creación
  updatedAt: { type: Date, default: Date.now }, // Fecha de última modificación
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
