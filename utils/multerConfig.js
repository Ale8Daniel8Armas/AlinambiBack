const multer = require("multer");
const path = require("path");

// Configurar Multer para almacenar archivos en memoria
const storage = multer.memoryStorage();

// Configurar el nombre del archivo usando el regex existente
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Aplicar el regex al nombre del archivo
    const originalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, "_");
    const extension = path.extname(file.originalname);
    const finalFileName = originalName + extension;

    // Asignar el nombre limpio al archivo
    file.originalname = finalFileName;

    // Aceptar el archivo
    cb(null, true);
  },
});

module.exports = { upload };
