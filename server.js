const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GridFSBucket } = require("mongodb");
require("dotenv").config();

const authRoutes = require("./rutas/routes.js");

const app = express();
const port = process.env.PORT || 5000;

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Permitir solo este origen
    credentials: true, // Permitir credenciales (si las usas)
  })
);

// Manejar solicitudes OPTIONS (preflight)
app.options("*", cors());

// Middleware
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.log("Error en conexión MongoDB:", err));

// Configuración de GridFS
let gfs; // Para archivos generales
let gfsTeamMembers; // Para imágenes de miembros
let gfsTeachersMembersPic; // Para imágenes de docentes
let gfsMision; // Para imágenes de Misión
let gfsVision; // Para imágenes de Visión

const conn = mongoose.connection;
conn.once("open", () => {
  // Configurar el bucket general para archivos
  gfs = new GridFSBucket(conn.db, { bucketName: "uploads" });

  // Configurar el bucket específico para imágenes de miembros
  gfsTeamMembers = new GridFSBucket(conn.db, {
    bucketName: "uploads.imagesMembers",
  });

  // Configurar el bucket específico para imágenes de docentes
  gfsTeachersMembersPic = new GridFSBucket(conn.db, {
    bucketName: "uploads.teachersMembers",
  });

  // Configurar el bucket específico para imágenes de Misión
  gfsMision = new GridFSBucket(conn.db, {
    bucketName: "uploads.mision",
  });

  // Configurar el bucket específico para imágenes de Visión
  gfsVision = new GridFSBucket(conn.db, {
    bucketName: "uploads.vision",
  });

  console.log("GridFS configurado:");
  console.log("- Bucket general (uploads) listo.");
  console.log(
    "- Bucket de imágenes de miembros (uploads.imagesMembers) listo."
  );
  console.log(
    "- Bucket de imágenes de docentes (uploads.teachersMembers) listo."
  );
  console.log("- Bucket de imágenes de Misión (uploads.mision) listo.");
  console.log("- Bucket de imágenes de Visión (uploads.vision) listo.");
});

// Rutas
app.use("/api", authRoutes);

// Ruta para servir archivos desde GridFS (bucket general)
app.get("/api/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const downloadStream = gfs.openDownloadStreamByName(filename);

  downloadStream.on("error", () => {
    res.status(404).json({ message: "Archivo no encontrado" });
  });

  downloadStream.pipe(res);
});

// Ruta para servir imágenes de miembros desde GridFS (bucket específico)
app.get("/api/member-images/:filename", (req, res) => {
  const filename = req.params.filename;
  const downloadStream = gfsTeamMembers.openDownloadStreamByName(filename);

  downloadStream.on("error", () => {
    res.status(404).json({ message: "Imagen de miembro no encontrada" });
  });

  downloadStream.pipe(res);
});

// Ruta para servir imágenes de docentes desde GridFS (bucket específico)
app.get("/api/teacher-images/:filename", (req, res) => {
  const filename = req.params.filename;
  const downloadStream =
    gfsTeachersMembersPic.openDownloadStreamByName(filename);

  downloadStream.on("error", () => {
    res.status(404).json({ message: "Imagen de docente no encontrada" });
  });

  downloadStream.pipe(res);
});

// Ruta para servir imágenes de Misión desde GridFS (bucket específico)
app.get("/api/mision-images/:filename", (req, res) => {
  const filename = req.params.filename;
  const downloadStream = gfsMision.openDownloadStreamByName(filename);

  downloadStream.on("error", () => {
    res.status(404).json({ message: "Imagen de Misión no encontrada" });
  });

  downloadStream.pipe(res);
});

// Ruta para servir imágenes de Visión desde GridFS (bucket específico)
app.get("/api/vision-images/:filename", (req, res) => {
  const filename = req.params.filename;
  const downloadStream = gfsVision.openDownloadStreamByName(filename);

  downloadStream.on("error", () => {
    res.status(404).json({ message: "Imagen de Visión no encontrada" });
  });

  downloadStream.pipe(res);
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

// Exportar GridFS para usarlo en otras partes de la aplicación
module.exports = {
  gfs,
  gfsTeamMembers,
  gfsTeachersMembersPic,
  gfsMision,
  gfsVision,
};
