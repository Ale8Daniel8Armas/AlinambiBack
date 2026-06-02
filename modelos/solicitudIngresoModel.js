const mongoose = require("mongoose");

const solicitudIngresoSchema = new mongoose.Schema({
  // Código automático generado al crear
  codigoSolicitud: { type: String, unique: true },

  // ── Datos del estudiante ──────────────────────────────────────────
  nombres: { type: String, required: true, trim: true },
  apellidos: { type: String, required: true, trim: true },
  cedula: { type: String, trim: true, default: "" },
  fechaNacimiento: { type: Date, required: true },
  genero: {
    type: String,
    enum: ["masculino", "femenino", "otro"],
    required: true,
  },
  lugarNacimiento: { type: String, trim: true, default: "" },
  nacionalidad: { type: String, trim: true, default: "Ecuatoriana" },
  etnia: {
    type: String,
    enum: [
      "mestizo",
      "indigena",
      "afroecuatoriano",
      "montubio",
      "blanco",
      "otro",
    ],
    default: "mestizo",
  },
  direccion: { type: String, trim: true, default: "" },
  barrio: { type: String, trim: true, default: "" },
  tieneDiscapacidad: { type: Boolean, default: false },
  tipoDiscapacidad: { type: String, trim: true, default: "" },
  porcentajeDiscapacidad: { type: Number, min: 0, max: 100, default: 0 },
  condicionMedica: { type: String, trim: true, default: "" },

  // ── Información académica ─────────────────────────────────────────
  nivelSolicitado: {
    type: String,
    enum: [
      "inicial_1",
      "inicial_2",
      "preparatoria",
      "basica_1",
      "basica_2",
      "basica_3",
      "basica_4",
      "basica_5",
      "basica_6",
      "basica_7",
    ],
    required: true,
  },
  anoLectivo: { type: String, required: true, trim: true },
  institucionAnterior: { type: String, trim: true, default: "" },
  motivoCambio: { type: String, trim: true, default: "" },

  // ── Representante legal ───────────────────────────────────────────
  parentescoRepresentante: {
    type: String,
    enum: ["padre", "madre", "tutor_legal", "otro"],
    required: true,
  },
  nombresRepresentante: { type: String, required: true, trim: true },
  apellidosRepresentante: { type: String, required: true, trim: true },
  cedulaRepresentante: { type: String, required: true, trim: true },
  ocupacionRepresentante: { type: String, trim: true, default: "" },
  telefonoRepresentante: { type: String, trim: true, default: "" },
  celularRepresentante: { type: String, required: true, trim: true },
  emailRepresentante: { type: String, required: true, trim: true },

  // ── Datos del padre ───────────────────────────────────────────────
  nombresPadre: { type: String, trim: true, default: "" },
  apellidosPadre: { type: String, trim: true, default: "" },
  cedulaPadre: { type: String, trim: true, default: "" },
  ocupacionPadre: { type: String, trim: true, default: "" },
  telefonoPadre: { type: String, trim: true, default: "" },

  // ── Datos de la madre ─────────────────────────────────────────────
  nombresMadre: { type: String, trim: true, default: "" },
  apellidosMadre: { type: String, trim: true, default: "" },
  cedulaMadre: { type: String, trim: true, default: "" },
  ocupacionMadre: { type: String, trim: true, default: "" },
  telefonoMadre: { type: String, trim: true, default: "" },

  // ── Contacto de emergencia ────────────────────────────────────────
  nombreEmergencia: { type: String, required: true, trim: true },
  parentescoEmergencia: { type: String, required: true, trim: true },
  telefonoEmergencia: { type: String, required: true, trim: true },

  // ── Gestión administrativa ────────────────────────────────────────
  estado: {
    type: String,
    enum: ["pendiente", "en_revision", "aceptado", "rechazado"],
    default: "pendiente",
  },
  observaciones: { type: String, trim: true, default: "" },
  fechaSolicitud: { type: Date, default: Date.now },
});

// Genera código secuencial SOL-YYYY-NNNN antes de guardar
solicitudIngresoSchema.pre("save", async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("SolicitudIngreso").countDocuments();
    this.codigoSolicitud = `SOL-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("SolicitudIngreso", solicitudIngresoSchema);
