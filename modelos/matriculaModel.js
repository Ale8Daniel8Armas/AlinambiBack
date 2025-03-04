const mongoose = require("mongoose");

const matriculaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["inicial", "basica"],
    required: true,
  },
  matriculaFee: { type: Number, required: true }, // Costo de matrícula
  tuitionFee: { type: Number, required: true }, // Costo de pensión
  requiredDocuments: [{ type: String }], // Documentos requeridos
  importantDates: [{ type: String }], // Fechas importantes
  createdAt: { type: Date, default: Date.now },
});

const MatriculaModel = mongoose.model("matricula", matriculaSchema);

module.exports = MatriculaModel;
