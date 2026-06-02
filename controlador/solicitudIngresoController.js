const SolicitudIngreso = require("../modelos/solicitudIngresoModel.js");

// Crear nueva solicitud (ruta pública)
exports.createSolicitud = async (req, res) => {
  try {
    const solicitud = new SolicitudIngreso(req.body);
    await solicitud.save();
    res.status(201).json({
      message: "Solicitud enviada correctamente.",
      codigo: solicitud.codigoSolicitud,
      id: solicitud._id,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
};

// Obtener todas las solicitudes (admin)
exports.getAllSolicitudes = async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = estado ? { estado } : {};
    const solicitudes = await SolicitudIngreso.find(filtro).sort({
      fechaSolicitud: -1,
    });
    res.json(solicitudes);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ error: "Error al obtener solicitudes." });
  }
};

// Obtener una solicitud por ID (admin)
exports.getSolicitudById = async (req, res) => {
  try {
    const solicitud = await SolicitudIngreso.findById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada." });
    }
    res.json(solicitud);
  } catch (error) {
    console.error("Error al obtener solicitud:", error);
    res.status(500).json({ error: "Error al obtener solicitud." });
  }
};

// Actualizar estado y observaciones (admin)
exports.updateEstado = async (req, res) => {
  try {
    const { estado, observaciones } = req.body;
    const solicitud = await SolicitudIngreso.findByIdAndUpdate(
      req.params.id,
      { estado, observaciones },
      { new: true, runValidators: true }
    );
    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada." });
    }
    res.json(solicitud);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar la solicitud." });
  }
};

// Eliminar solicitud (admin)
exports.deleteSolicitud = async (req, res) => {
  try {
    const solicitud = await SolicitudIngreso.findByIdAndDelete(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada." });
    }
    res.json({ message: "Solicitud eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);
    res.status(500).json({ error: "Error al eliminar la solicitud." });
  }
};

// Estadísticas rápidas (admin)
exports.getEstadisticas = async (req, res) => {
  try {
    const [total, pendientes, en_revision, aceptados, rechazados] =
      await Promise.all([
        SolicitudIngreso.countDocuments(),
        SolicitudIngreso.countDocuments({ estado: "pendiente" }),
        SolicitudIngreso.countDocuments({ estado: "en_revision" }),
        SolicitudIngreso.countDocuments({ estado: "aceptado" }),
        SolicitudIngreso.countDocuments({ estado: "rechazado" }),
      ]);
    res.json({ total, pendientes, en_revision, aceptados, rechazados });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas." });
  }
};
