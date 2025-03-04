const TeamMember = require("../modelos/teamMemberModel.js");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

// Configuración de GridFS para imágenes de miembros
let gfsTeamMembers; // Bucket específico para imágenes de miembros

const conn = mongoose.connection;
conn.once("open", () => {
  gfsTeamMembers = new GridFSBucket(conn.db, {
    bucketName: "uploads.imagesMembers",
  }); // Solo el bucket de imágenes de miembros
  console.log(
    "GridFS configurado en el controlador (solo para imágenes de miembros)"
  );
});

// Crear un nuevo miembro
exports.createTeamMember = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo." });
    }

    const { name, role, description } = req.body;

    // Subir la imagen al bucket de imágenes de miembros
    const writeStream = gfsTeamMembers.openUploadStream(req.file.originalname, {
      metadata: { mimetype: req.file.mimetype },
    });

    writeStream.write(req.file.buffer);
    writeStream.end();

    writeStream.on("finish", async () => {
      // Guardar los datos del miembro en la base de datos
      const newTeamMember = new TeamMember({
        name,
        role,
        description,
        imageId: writeStream.id, // ID de la imagen en GridFS
        filename: req.file.originalname, // Nombre del archivo
      });

      await newTeamMember.save();
      res.status(201).json(newTeamMember);
    });

    writeStream.on("error", (err) => {
      console.error("Error al subir la imagen:", err);
      res.status(500).json({ error: "Error al subir la imagen." });
    });
  } catch (error) {
    console.error("Error al crear el miembro:", error);
    res.status(500).json({ error: "Error al crear el miembro." });
  }
};

// Obtener todos los miembros
exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    res.json(teamMembers);
  } catch (error) {
    console.error("Error al obtener los miembros:", error);
    res.status(500).json({ error: "Error al obtener los miembros." });
  }
};

// Editar un miembro
exports.editTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, description } = req.body;

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      id,
      { name, role, description },
      { new: true }
    );

    if (!updatedTeamMember) {
      return res.status(404).json({ error: "Miembro no encontrado." });
    }

    res.json(updatedTeamMember);
  } catch (error) {
    console.error("Error al editar el miembro:", error);
    res.status(500).json({ error: "Error al editar el miembro." });
  }
};

// Eliminar un miembro
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);
    if (!teamMember) {
      return res.status(404).json({ error: "Miembro no encontrado." });
    }

    // Verifica que imageId sea un ObjectId válido
    if (
      !teamMember.imageId ||
      !mongoose.Types.ObjectId.isValid(teamMember.imageId)
    ) {
      console.error("imageId no válido o no definido:", teamMember.imageId);
      return res
        .status(400)
        .json({ error: "El ID de la imagen no es válido." });
    }

    // Verifica si la imagen existe en GridFS
    const fileExists = await gfsTeamMembers
      .find({ _id: new mongoose.Types.ObjectId(teamMember.imageId) })
      .toArray();
    if (fileExists.length === 0) {
      console.error("La imagen no existe en GridFS:", teamMember.imageId);
      return res.status(404).json({ error: "La imagen no existe en GridFS." });
    }

    // Eliminar la imagen de GridFS
    await gfsTeamMembers.delete(
      new mongoose.Types.ObjectId(teamMember.imageId)
    );

    // Eliminar el miembro de la base de datos
    await TeamMember.findByIdAndDelete(id);

    res.json({ message: "Miembro eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el miembro:", error);
    res.status(500).json({ error: "Error al eliminar el miembro." });
  }
};
