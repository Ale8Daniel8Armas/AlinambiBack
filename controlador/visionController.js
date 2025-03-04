const VisionModel = require("../modelos/visionModel.js");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gfsVision;

const conn = mongoose.connection;
conn.once("open", () => {
  gfsVision = new GridFSBucket(conn.db, {
    bucketName: "uploads.vision",
  });
  console.log("GridFS configurado para Visión");
});

// Crear o actualizar Visión
exports.createOrUpdateVision = async (req, res) => {
  try {
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo." });
    }

    // Verificar si ya existe un registro para la Visión
    const existingVision = await VisionModel.findOne();

    if (existingVision) {
      // Eliminar la imagen anterior de GridFS
      await gfsVision.delete(
        new mongoose.Types.ObjectId(existingVision.imageId)
      );
    }

    // Subir la nueva imagen a GridFS
    const writeStream = gfsVision.openUploadStream(req.file.originalname, {
      metadata: { mimetype: req.file.mimetype },
    });

    writeStream.write(req.file.buffer);
    writeStream.end();

    writeStream.on("finish", async () => {
      const newVision = existingVision
        ? await VisionModel.findByIdAndUpdate(
            existingVision._id,
            {
              description,
              imageId: writeStream.id,
              filename: req.file.originalname,
            },
            { new: true }
          )
        : await VisionModel.create({
            description,
            imageId: writeStream.id,
            filename: req.file.originalname,
          });

      res.status(201).json(newVision);
    });

    writeStream.on("error", (err) => {
      console.error("Error al subir la imagen:", err);
      res.status(500).json({ error: "Error al subir la imagen." });
    });
  } catch (error) {
    console.error("Error al crear/actualizar Visión:", error);
    res.status(500).json({ error: "Error al crear/actualizar Visión." });
  }
};

// Obtener Visión
exports.getVision = async (req, res) => {
  try {
    const vision = await VisionModel.findOne();
    if (!vision) {
      return res.status(404).json({ error: "Visión no encontrada." });
    }
    res.json(vision);
  } catch (error) {
    console.error("Error al obtener Visión:", error);
    res.status(500).json({ error: "Error al obtener Visión." });
  }
};

// Eliminar Visión
exports.deleteVision = async (req, res) => {
  try {
    const vision = await VisionModel.findOne();
    if (!vision) {
      return res.status(404).json({ error: "Visión no encontrada." });
    }

    // Eliminar la imagen de GridFS
    await gfsVision.delete(new mongoose.Types.ObjectId(vision.imageId));

    // Eliminar el registro de la base de datos
    await VisionModel.findByIdAndDelete(vision._id);

    res.json({ message: "Visión eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar Visión:", error);
    res.status(500).json({ error: "Error al eliminar Visión." });
  }
};
