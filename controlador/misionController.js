const MisionModel = require("../modelos/misionModel.js");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gfsMision;

const conn = mongoose.connection;
conn.once("open", () => {
  gfsMision = new GridFSBucket(conn.db, {
    bucketName: "uploads.mision",
  });
  console.log("GridFS configurado para Misión");
});

// Crear o actualizar Misión
exports.createOrUpdateMision = async (req, res) => {
  try {
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo." });
    }

    // Verificar si ya existe un registro para la Misión
    const existingMision = await MisionModel.findOne();

    if (existingMision) {
      // Eliminar la imagen anterior de GridFS
      await gfsMision.delete(
        new mongoose.Types.ObjectId(existingMision.imageId)
      );
    }

    // Subir la nueva imagen a GridFS
    const writeStream = gfsMision.openUploadStream(req.file.originalname, {
      metadata: { mimetype: req.file.mimetype },
    });

    writeStream.write(req.file.buffer);
    writeStream.end();

    writeStream.on("finish", async () => {
      const newMision = existingMision
        ? await MisionModel.findByIdAndUpdate(
            existingMision._id,
            {
              description,
              imageId: writeStream.id,
              filename: req.file.originalname,
            },
            { new: true }
          )
        : await MisionModel.create({
            description,
            imageId: writeStream.id,
            filename: req.file.originalname,
          });

      res.status(201).json(newMision);
    });

    writeStream.on("error", (err) => {
      console.error("Error al subir la imagen:", err);
      res.status(500).json({ error: "Error al subir la imagen." });
    });
  } catch (error) {
    console.error("Error al crear/actualizar Misión:", error);
    res.status(500).json({ error: "Error al crear/actualizar Misión." });
  }
};

// Obtener Misión
exports.getMision = async (req, res) => {
  try {
    const mision = await MisionModel.findOne();
    if (!mision) {
      return res.status(404).json({ error: "Misión no encontrada." });
    }
    res.json(mision);
  } catch (error) {
    console.error("Error al obtener Misión:", error);
    res.status(500).json({ error: "Error al obtener Misión." });
  }
};

// Eliminar Misión
exports.deleteMision = async (req, res) => {
  try {
    const mision = await MisionModel.findOne();
    if (!mision) {
      return res.status(404).json({ error: "Misión no encontrada." });
    }

    // Eliminar la imagen de GridFS
    await gfsMision.delete(new mongoose.Types.ObjectId(mision.imageId));

    // Eliminar el registro de la base de datos
    await MisionModel.findByIdAndDelete(mision._id);

    res.json({ message: "Misión eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar Misión:", error);
    res.status(500).json({ error: "Error al eliminar Misión." });
  }
};
