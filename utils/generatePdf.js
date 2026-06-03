const PDFDocument = require("pdfkit");

// Colores institucionales
const VERDE = "#1a6e37";
const AZUL  = "#17174A";
const GRIS  = "#555555";
const VERDE_CLARO = "#9CC066";

/**
 * Genera un PDF de indicaciones de matrícula y lo devuelve como Buffer.
 * @param {object} datos  - datos básicos de la solicitud aprobada
 */
const generarPdfMatricula = (datos = {}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width - 110; // ancho útil

    // ── Encabezado ────────────────────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 110)
      .fill(AZUL);

    doc
      .fillColor("#ffffff")
      .fontSize(17)
      .font("Helvetica-Bold")
      .text("ESCUELA DE EDUCACIÓN BÁSICA FISCOMISIONAL", 55, 28, {
        width: W,
        align: "center",
      });

    doc
      .fillColor(VERDE_CLARO)
      .fontSize(22)
      .text("ALIÑAMBI", { align: "center" });

    doc
      .fillColor("#d0e8ff")
      .fontSize(11)
      .font("Helvetica")
      .text("Sistema de Admisiones — Indicaciones de Matrícula", {
        align: "center",
      });

    doc.moveDown(2.5);

    // ── Título del documento ──────────────────────────────────────────────────
    doc
      .fillColor(AZUL)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("INDICACIONES PARA EL PROCESO DE MATRÍCULA FORMAL", {
        align: "center",
      })
      .moveDown(0.3);

    doc
      .moveTo(55, doc.y)
      .lineTo(55 + W, doc.y)
      .strokeColor(VERDE_CLARO)
      .lineWidth(2)
      .stroke()
      .moveDown(0.8);

    // ── Datos de la solicitud ─────────────────────────────────────────────────
    if (datos.codigo) {
      doc
        .rect(55, doc.y, W, 60)
        .fillAndStroke("#f1f8e9", VERDE_CLARO);

      doc
        .fillColor(AZUL)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("DATOS DE LA SOLICITUD APROBADA", 75, doc.y - 50, {
          width: W - 40,
        });

      doc
        .fillColor(GRIS)
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Código: ${datos.codigo}   |   Estudiante: ${datos.nombres || ""} ${datos.apellidos || ""}   |   Nivel: ${datos.nivel || ""}   |   Año: ${datos.anoLectivo || ""}`,
          75,
          doc.y + 4,
          { width: W - 40 }
        );

      doc.moveDown(2.5);
    }

    // ── Sección: Documentos Requeridos ────────────────────────────────────────
    seccionTitulo(doc, "1.  DOCUMENTOS REQUERIDOS", W);

    const documentos = [
      "Copia de cédula de identidad del estudiante (o acta de nacimiento para menores de 5 años).",
      "Copia de cédula de identidad del representante legal (vigente).",
      "2 fotografías tamaño carnet (fondo blanco, recientes, a color).",
      "Carnet de vacunación actualizado del Ministerio de Salud Pública.",
      "Certificado de haber aprobado el año anterior (para estudiantes de traslado).",
      "Ficha médica firmada por el médico tratante (si el estudiante tiene condición especial).",
      "Certificado de discapacidad del CONADIS (si aplica).",
      "Comprobante de pago de matrícula original.",
    ];

    listaItems(doc, documentos, W, VERDE);
    doc.moveDown(0.8);

    // ── Sección: Costos ───────────────────────────────────────────────────────
    seccionTitulo(doc, "2.  COSTOS Y FORMA DE PAGO", W);

    doc
      .fillColor(GRIS)
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Los valores de matrícula y pensión mensual son definidos por el Ministerio de Educación " +
          "y podrán ser consultados en la secretaría de la institución o en la sección de Matrícula " +
          "del sitio web oficial.",
        55,
        doc.y,
        { width: W }
      )
      .moveDown(0.6);

    const pagos = [
      "El pago de matrícula debe realizarse en efectivo en la secretaría de la institución.",
      "El pago debe efectuarse dentro de los 15 días calendario siguientes a la recepción de este documento.",
      "Solicitar siempre el recibo oficial sellado y firmado por la institución.",
      "Las pensiones mensuales se cancelan del 1 al 10 de cada mes.",
    ];

    listaItems(doc, pagos, W, VERDE);
    doc.moveDown(0.8);

    // ── Sección: Fechas ───────────────────────────────────────────────────────
    seccionTitulo(doc, "3.  FECHAS IMPORTANTES", W);

    const fechas = [
      "Plazo máximo para completar matrícula: 15 días desde la notificación de aprobación.",
      "Inicio de clases: según el calendario académico del Ministerio de Educación vigente.",
      "Período de inducción para nuevos estudiantes: primera semana de clases.",
      "Entrega de horarios y listados: secretaría, primer día de clases.",
    ];

    listaItems(doc, fechas, W, "#1565c0");
    doc.moveDown(0.8);

    // ── Sección: Uniforme ─────────────────────────────────────────────────────
    seccionTitulo(doc, "4.  UNIFORME ESCOLAR", W);

    const uniforme = [
      "Camisa o blusa de color blanco con el escudo de la institución.",
      "Pantalón o falda de color azul marino (según corresponda).",
      "Zapatos de color negro de cuero.",
      "Chompas o buzos únicamente con el logo oficial de la institución.",
      "Uniforme de educación física: pantalón de buzo azul marino y camiseta verde institucional.",
    ];

    listaItems(doc, uniforme, W, VERDE);
    doc.moveDown(0.8);

    // ── Sección: Contacto ─────────────────────────────────────────────────────
    seccionTitulo(doc, "5.  INFORMACIÓN DE CONTACTO", W);

    doc
      .fillColor(GRIS)
      .fontSize(10)
      .font("Helvetica")
      .text("Para consultas o información adicional, comuníquese con la secretaría:", 55, doc.y, {
        width: W,
      })
      .moveDown(0.4);

    const contacto = [
      "WhatsApp / Teléfono: +593 99 542 1432",
      "Sitio web: https://eebfalinambi.vercel.app",
      "Dirección: Secretaría de la Institución — Aliñambi",
      "Horario de atención: lunes a viernes de 07:30 a 13:00",
    ];

    listaItems(doc, contacto, W, AZUL);
    doc.moveDown(1.5);

    // ── Nota importante ───────────────────────────────────────────────────────
    doc
      .rect(55, doc.y, W, 55)
      .fillAndStroke("#fff3cd", "#f0ad4e");

    doc
      .fillColor("#856404")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("⚠️  NOTA IMPORTANTE:", 70, doc.y - 44)
      .font("Helvetica")
      .text(
        "Si no se completa el proceso de matrícula dentro del plazo establecido, " +
          "el cupo asignado será liberado y podrá ser otorgado a otro estudiante. " +
          "La institución no garantiza la disponibilidad del cupo fuera del plazo indicado.",
        70,
        doc.y + 4,
        { width: W - 30 }
      );

    doc.moveDown(3);

    // ── Pie de página ─────────────────────────────────────────────────────────
    doc
      .moveTo(55, doc.y)
      .lineTo(55 + W, doc.y)
      .strokeColor("#dddddd")
      .lineWidth(1)
      .stroke()
      .moveDown(0.5);

    doc
      .fillColor("#999999")
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Documento generado automáticamente por el Sistema de Admisiones — EEBF Aliñambi • ${new Date().toLocaleDateString("es-EC")}`,
        { align: "center" }
      );

    doc.end();
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function seccionTitulo(doc, texto, W) {
  doc
    .rect(55, doc.y, W, 22)
    .fill(AZUL);

  doc
    .fillColor("#ffffff")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(texto, 65, doc.y - 16, { width: W - 20 });

  doc.moveDown(0.8);
}

function listaItems(doc, items, W, colorBullet = VERDE) {
  items.forEach((item) => {
    const startY = doc.y;
    doc
      .fillColor(colorBullet)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("•", 60, startY, { width: 14, continued: false });

    doc
      .fillColor(GRIS)
      .fontSize(10)
      .font("Helvetica")
      .text(item, 78, startY, { width: W - 28 });

    doc.moveDown(0.4);
  });
}

module.exports = { generarPdfMatricula };
