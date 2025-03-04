const TeachersMember = require("../modelos/docentesPicModel.js");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gfsTeachersMembers;

const conn = mongoose.connection;
conn.once("open", () => {
  gfsTeachersMembers = new GridFSBucket(conn.db, {
    bucketName: "uploads.teachersMembers",
  });
  console.log(
    "GridFS configurado en el controlador (solo para imágenes de docentes)"
  );
});

exports.createTeachersMembersPic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo." });
    }

    const { description } = req.body;

    const writeStream = gfsTeachersMembers.openUploadStream(
      req.file.originalname,
      {
        metadata: { mimetype: req.file.mimetype },
      }
    );

    writeStream.write(req.file.buffer);
    writeStream.end();

    writeStream.on("finish", async () => {
      const newTeachersMember = new TeachersMember({
        description,
        imageId: writeStream.id,
        filename: req.file.originalname,
      });

      await newTeachersMember.save();
      res.status(201).json(newTeachersMember);
    });

    writeStream.on("error", (err) => {
      console.error("Error al subir la imagen:", err);
      res.status(500).json({ error: "Error al subir la imagen." });
    });
  } catch (error) {
    console.error("Error al crear la imagen:", error);
    res.status(500).json({ error: "Error al crear la imagen." });
  }
};

exports.getTeachersMembersPic = async (req, res) => {
  try {
    const teachersMembers = await TeachersMember.find();
    res.json(teachersMembers);
  } catch (error) {
    console.error("Error al obtener la imagen de los docentes:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la imagen de los docentes." });
  }
};

exports.editTeachersMemberPic = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    // Buscar la imagen actual en la BD
    const teachersMember = await TeachersMember.findById(id);
    if (!teachersMember) {
      return res
        .status(404)
        .json({ error: "Imagen de docente no encontrada." });
    }

    // Si hay una nueva imagen, eliminar la anterior de GridFS
    if (req.file) {
      if (
        teachersMember.imageId &&
        mongoose.Types.ObjectId.isValid(teachersMember.imageId)
      ) {
        const fileExists = await gfsTeachersMembers
          .find({ _id: new mongoose.Types.ObjectId(teachersMember.imageId) })
          .toArray();
        if (fileExists.length > 0) {
          await gfsTeachersMembers.delete(
            new mongoose.Types.ObjectId(teachersMember.imageId)
          );
        }
      }

      // Subir la nueva imagen a GridFS
      const writeStream = gfsTeachersMembers.openUploadStream(
        req.file.originalname,
        {
          metadata: { mimetype: req.file.mimetype },
        }
      );

      writeStream.write(req.file.buffer);
      writeStream.end();

      writeStream.on("finish", async () => {
        teachersMember.description = description;
        teachersMember.imageId = writeStream.id;
        teachersMember.filename = req.file.originalname;

        await teachersMember.save();
        res.json(teachersMember);
      });

      writeStream.on("error", (err) => {
        console.error("Error al subir la nueva imagen:", err);
        res.status(500).json({ error: "Error al subir la nueva imagen." });
      });
    } else {
      // Solo actualizar la descripción si no se envió una nueva imagen
      teachersMember.description = description;
      await teachersMember.save();
      res.json(teachersMember);
    }
  } catch (error) {
    console.error("Error al editar la imagen del docente:", error);
    res.status(500).json({ error: "Error al editar la imagen del docente." });
  }
};

exports.deleteTeachersMemberPic = async (req, res) => {
  try {
    const { id } = req.params;

    const teachersMember = await TeachersMember.findById(id);
    if (!teachersMember) {
      return res
        .status(404)
        .json({ error: "Imagen de docentes no encontrado." });
    }

    if (
      !teachersMember.imageId ||
      !mongoose.Types.ObjectId.isValid(teachersMember.imageId)
    ) {
      console.error("imageId no válido o no definido:", teachersMember.imageId);
      return res
        .status(400)
        .json({ error: "El ID de la imagen no es válido." });
    }

    const fileExists = await gfsTeachersMembers
      .find({ _id: new mongoose.Types.ObjectId(teachersMember.imageId) })
      .toArray();
    if (fileExists.length === 0) {
      console.error("La imagen no existe en GridFS:", teachersMember.imageId);
      return res.status(404).json({ error: "La imagen no existe en GridFS." });
    }

    await gfsTeachersMembers.delete(
      new mongoose.Types.ObjectId(teachersMember.imageId)
    );

    await TeachersMember.findByIdAndDelete(id);

    res.json({ message: "Imagen de docentes eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar la imagen de docentes:", error);
    res.status(500).json({ error: "Error al eliminar la imagen de docentes." });
  }
};
