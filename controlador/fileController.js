const File = require("../modelos/FileModel.js");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

// Obtener la conexión de Mongoose
const conn = mongoose.connection;

// Crear una instancia de GridFSBucket
let gfs;
conn.once("open", () => {
  gfs = new GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("GridFS configurado en el controlador");
});

// Subir archivo
exports.uploadFile = async (req, res) => {
  try {
    // Verifica si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo." });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const { etiqueta } = req.body; // Obtener la etiqueta desde el frontend

    // Verifica que la etiqueta esté presente
    if (!etiqueta) {
      return res.status(400).json({ error: "La etiqueta es requerida." });
    }

    // Subir el archivo a GridFS
    const writeStream = gfs.openUploadStream(originalname, {
      metadata: { mimetype }, // Opcional: agregar metadatos
    });

    writeStream.write(buffer);
    writeStream.end();

    writeStream.on("finish", async () => {
      // Guardar metadatos en la colección File
      const newFile = new File({
        filename: originalname,
        fileId: writeStream.id, // ID del archivo en GridFS
        etiqueta, // Guardar la etiqueta
        mimetype,
        size,
      });

      await newFile.save(); // Guarda el archivo en la base de datos

      res.status(201).json(newFile); // Devuelve el archivo creado
    });

    writeStream.on("error", (err) => {
      console.error("Error al subir el archivo:", err);
      res.status(500).json({ error: "Error al subir el archivo." });
    });
  } catch (error) {
    console.error("Error en la subida del archivo:", error);
    res.status(500).json({ error: "Error en la subida del archivo." });
  }
};

// Obtener archivos por etiqueta
exports.getFilesByTag = async (req, res) => {
  const { etiqueta } = req.params;

  try {
    const files = await File.find({ etiqueta });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener archivos por etiqueta." });
  }
};

// Eliminar archivo
exports.deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    // Buscar el archivo en la colección File
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "Archivo no encontrado." });
    }

    // Eliminar el archivo de GridFS
    await gfs.delete(new mongoose.Types.ObjectId(file.fileId)); // Corregido aquí

    // Eliminar el archivo de la colección File
    await File.findByIdAndDelete(fileId);

    res.json({ message: "Archivo eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el archivo:", error);
    res.status(500).json({ error: "Error al eliminar el archivo." });
  }
};

// Obtener todos los archivos
exports.getFiles = async (req, res) => {
  try {
    const files = await File.find(); // Obtener todos los archivos
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener archivos." });
  }
};

// Descargar archivo
exports.downloadFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    // Buscar el archivo en la colección File
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "Archivo no encontrado." });
    }

    // Crear un stream de lectura desde GridFS
    const downloadStream = gfs.openDownloadStream(
      new mongoose.Types.ObjectId(file.fileId)
    );

    // Configurar encabezados de la respuesta
    res.set("Content-Type", file.mimetype);
    res.set(
      "Content-Disposition",
      `attachment; filename="${file.filename}"` // Enviar el nombre original del archivo
    );

    // Enviar el archivo al cliente
    downloadStream.pipe(res);

    // Manejar errores
    downloadStream.on("error", (err) => {
      console.error("Error al descargar el archivo:", err);
      res.status(500).json({ error: "Error al descargar el archivo." });
    });
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
    res.status(500).json({ error: "Error al descargar el archivo." });
  }
};

// Obtener un archivo por su ID
exports.getFileById = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "Archivo no encontrado." });
    }

    res.json(file); // Devuelve los detalles del archivo, incluyendo el nombre original
  } catch (error) {
    console.error("Error al obtener el archivo:", error);
    res.status(500).json({ error: "Error al obtener el archivo." });
  }
};
