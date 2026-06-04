const SolicitudIngreso = require("../modelos/solicitudIngresoModel.js");
const {
  correoPendiente,
  correoRechazado,
  correoAprobado,
  enviarEmail,
} = require("../utils/emailService.js");
const { generarPdfMatricula } = require("../utils/generatePdf.js");

const NIVEL_LABELS = {
  inicial_1: "Inicial 1 (2-3 años)",
  inicial_2: "Inicial 2 (3-4 años)",
  preparatoria: "Preparatoria (1ro EGB)",
  basica_1: "2do Año EGB",
  basica_2: "3ro Año EGB",
  basica_3: "4to Año EGB",
  basica_4: "5to Año EGB",
  basica_5: "6to Año EGB",
  basica_6: "7mo Año EGB",
  basica_7: "8vo Año EGB",
};

const URL_MATRICULA =
  process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/formulario-matricula`
    : "https://eebfalinambi.vercel.app/formulario-matricula";

// ── Crear nueva solicitud (ruta pública) ─────────────────────────────────────
exports.createSolicitud = async (req, res) => {
  try {
    const solicitud = new SolicitudIngreso(req.body);
    await solicitud.save();

    // Email de confirmación — no bloquea la respuesta si falla
    const nivel = NIVEL_LABELS[solicitud.nivelSolicitado] || solicitud.nivelSolicitado;
    const { asunto, html } = correoPendiente({
      nombres: solicitud.nombres,
      apellidos: solicitud.apellidos,
      codigo: solicitud.codigoSolicitud,
      nivel,
      anoLectivo: solicitud.anoLectivo,
    });

    enviarEmail({
      destinatario: solicitud.emailRepresentante,
      asunto,
      html,
    }).catch((err) =>
      console.error("Email pendiente no enviado:", err.message)
    );

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

// ── Obtener todas las solicitudes (admin) ────────────────────────────────────
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

// ── Obtener una solicitud por ID (admin) ─────────────────────────────────────
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

// ── Actualizar estado y observaciones (admin) ────────────────────────────────
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

    const nivel =
      NIVEL_LABELS[solicitud.nivelSolicitado] || solicitud.nivelSolicitado;
    const datosBase = {
      nombres: solicitud.nombres,
      apellidos: solicitud.apellidos,
      codigo: solicitud.codigoSolicitud,
      nivel,
      anoLectivo: solicitud.anoLectivo,
      observaciones: solicitud.observaciones,
    };

    // Disparar el email correspondiente según el nuevo estado
    if (estado === "rechazado") {
      const { asunto, html } = correoRechazado(datosBase);
      enviarEmail({
        destinatario: solicitud.emailRepresentante,
        asunto,
        html,
      }).catch((err) =>
        console.error("Email rechazo no enviado:", err.message)
      );
    }

    if (estado === "aceptado") {
      try {
        // Generar PDF de indicaciones de matrícula
        const pdfBuffer = await generarPdfMatricula({
          ...datosBase,
          urlFormularioMatricula: URL_MATRICULA,
        });

        const { asunto, html } = correoAprobado({
          ...datosBase,
          urlFormularioMatricula: URL_MATRICULA,
        });

        await enviarEmail({
          destinatario: solicitud.emailRepresentante,
          asunto,
          html,
          adjuntos: [
            {
              filename: `Indicaciones_Matricula_${solicitud.codigoSolicitud}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (emailErr) {
        // El email de aprobación es importante; se loguea pero no bloquea la respuesta
        console.error("Email aprobación no enviado:", emailErr.message);
      }
    }

    res.json(solicitud);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar la solicitud." });
  }
};

// ── Verificar código (público) — devuelve solo datos mínimos para pre-llenar ─
exports.verificarCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const solicitud = await SolicitudIngreso.findOne({
      codigoSolicitud: codigo.toUpperCase(),
      estado: "aceptado",
      esFormularioMatricula: { $ne: true },
    }).select(
      "codigoSolicitud nombres apellidos cedula fechaNacimiento genero " +
      "nivelSolicitado anoLectivo nombresRepresentante apellidosRepresentante " +
      "cedulaRepresentante celularRepresentante emailRepresentante " +
      "parentescoRepresentante nombreEmergencia parentescoEmergencia telefonoEmergencia"
    );
    if (!solicitud) {
      return res.status(404).json({
        error: "Código no encontrado o la solicitud no está aprobada.",
      });
    }
    res.json(solicitud);
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({ error: "Error al verificar el código." });
  }
};

// ── Eliminar solicitud (admin) ───────────────────────────────────────────────
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

// ── Estadísticas rápidas (admin) ─────────────────────────────────────────────
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
