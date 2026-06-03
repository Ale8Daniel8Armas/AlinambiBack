// Render bloquea SMTP saliente (465 y 587) — se usa la API HTTP de Brevo
// Variables de entorno requeridas: EMAIL_USER (remitente) y BREVO_API_KEY

// ── Plantilla base HTML ──────────────────────────────────────────────────────
const plantillaBase = (contenido) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f7f6; font-family:'Segoe UI',Arial,sans-serif; }
    .wrapper { max-width:600px; margin:30px auto; background:#ffffff;
               border-radius:12px; overflow:hidden;
               box-shadow:0 4px 20px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#17174A 0%,#1a6e37 100%);
              padding:32px 40px; text-align:center; }
    .header img { height:60px; margin-bottom:12px; }
    .header h1 { color:#9CC066; margin:0; font-size:22px; font-weight:800;
                 letter-spacing:0.5px; }
    .header p  { color:#d0e8ff; margin:4px 0 0; font-size:13px; }
    .body  { padding:36px 40px; }
    .badge { display:inline-block; padding:6px 18px; border-radius:20px;
             font-weight:700; font-size:13px; margin-bottom:20px; }
    .badge-pending  { background:#fff3cd; color:#856404; }
    .badge-rejected { background:#f8d7da; color:#721c24; }
    .badge-approved { background:#d4edda; color:#155724; }
    .codigo { background:#f1f8e9; border:2px dashed #9CC066; border-radius:10px;
              padding:14px 20px; text-align:center; margin:20px 0; }
    .codigo span { display:block; font-size:11px; color:#777; margin-bottom:4px; }
    .codigo strong { font-size:22px; color:#9CC066; letter-spacing:3px; font-weight:900; }
    .info-box { background:#f8f9fa; border-left:4px solid #17174A;
                border-radius:4px; padding:14px 18px; margin:18px 0; }
    .info-box p { margin:0; color:#444; font-size:14px; line-height:1.7; }
    .btn { display:inline-block; background:#9CC066; color:#fff !important;
           text-decoration:none; padding:14px 32px; border-radius:30px;
           font-weight:700; font-size:15px; margin:20px 0; letter-spacing:0.3px; }
    .pasos { margin:20px 0; padding:0; list-style:none; }
    .pasos li { padding:10px 0; border-bottom:1px solid #f0f0f0;
                color:#444; font-size:14px; }
    .pasos li:last-child { border-bottom:none; }
    .pasos li::before { content:'✓ '; color:#9CC066; font-weight:700; }
    .footer { background:#f8f9fa; padding:20px 40px; text-align:center;
              border-top:1px solid #eee; }
    .footer p { margin:4px 0; color:#999; font-size:12px; }
    .footer a { color:#9CC066; text-decoration:none; }
    h2 { color:#17174A; font-size:20px; margin-top:0; }
    p  { color:#444; font-size:14px; line-height:1.7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Escuela de Educación Básica Fiscomisional</h1>
      <p>Aliñambi — Sistema de Admisiones</p>
    </div>
    <div class="body">
      ${contenido}
    </div>
    <div class="footer">
      <p>Escuela de Educación Básica Fiscomisional Aliñambi</p>
      <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
      <p>¿Necesitas ayuda? <a href="https://wa.me/+593995421432">Contáctanos por WhatsApp</a></p>
    </div>
  </div>
</body>
</html>`;

// ── Email 1: Solicitud recibida (pendiente) ──────────────────────────────────
const correoPendiente = ({ nombres, apellidos, codigo, nivel, anoLectivo }) => ({
  asunto: `✅ Solicitud de Ingreso Recibida — ${codigo}`,
  html: plantillaBase(`
    <span class="badge badge-pending">⏳ Estado: Pendiente de Revisión</span>
    <h2>¡Hemos recibido tu solicitud!</h2>
    <p>Estimado/a representante,</p>
    <p>Te informamos que la <strong>solicitud de ingreso</strong> para el/la estudiante
       <strong>${nombres} ${apellidos}</strong> ha sido recibida correctamente en nuestro sistema.</p>

    <div class="codigo">
      <span>Tu código de seguimiento</span>
      <strong>${codigo}</strong>
    </div>

    <div class="info-box">
      <p>
        <strong>Nivel solicitado:</strong> ${nivel}<br/>
        <strong>Año lectivo:</strong> ${anoLectivo}
      </p>
    </div>

    <h2>¿Qué sigue ahora?</h2>
    <ul class="pasos">
      <li>Nuestro equipo de admisiones revisará tu solicitud.</li>
      <li>El proceso toma <strong>máximo 7 días hábiles</strong> desde la fecha de envío.</li>
      <li>Recibirás un correo electrónico con la resolución (aprobado o rechazado).</li>
      <li>Guarda tu código de seguimiento para cualquier consulta.</li>
    </ul>

    <p>Si tienes alguna duda o deseas consultar el estado de tu solicitud, puedes
       contactarnos directamente por WhatsApp o acercarte a la secretaría de la institución.</p>

    <p>Gracias por confiar en la <strong>Escuela Aliñambi</strong>.</p>
  `),
});

// ── Email 2: Solicitud rechazada ─────────────────────────────────────────────
const correoRechazado = ({ nombres, apellidos, codigo, nivel, observaciones }) => ({
  asunto: `❌ Solicitud de Ingreso No Aprobada — ${codigo}`,
  html: plantillaBase(`
    <span class="badge badge-rejected">❌ Estado: Solicitud No Aprobada</span>
    <h2>Resultado de tu solicitud de ingreso</h2>
    <p>Estimado/a representante,</p>
    <p>Lamentamos informarte que la solicitud de ingreso para el/la estudiante
       <strong>${nombres} ${apellidos}</strong> (nivel: <strong>${nivel}</strong>)
       <strong>no ha podido ser aprobada</strong> en este período.</p>

    <div class="codigo">
      <span>Código de solicitud</span>
      <strong>${codigo}</strong>
    </div>

    <div class="info-box">
      <p><strong>Motivo / Observaciones:</strong><br/>
      ${observaciones || "Sin observaciones adicionales registradas. Te invitamos a comunicarte con la institución para más información."}</p>
    </div>

    <h2>¿Qué puedes hacer?</h2>
    <ul class="pasos">
      <li>Comunícate con la secretaría para conocer más detalles.</li>
      <li>Puedes presentar una nueva solicitud en el próximo período de admisiones.</li>
      <li>Estamos disponibles para orientarte en el proceso.</li>
    </ul>

    <p>Agradecemos tu interés en nuestra institución. Esperamos poder acompañarte en
       un futuro proceso de admisión.</p>
  `),
});

// ── Email 3: Solicitud aprobada ──────────────────────────────────────────────
const correoAprobado = ({
  nombres,
  apellidos,
  codigo,
  nivel,
  anoLectivo,
  urlFormularioMatricula,
}) => ({
  asunto: `🎉 ¡Solicitud Aprobada! Próximos pasos para la Matrícula — ${codigo}`,
  html: plantillaBase(`
    <span class="badge badge-approved">🎉 Estado: Solicitud Aprobada</span>
    <h2>¡Felicitaciones! Tu solicitud ha sido aprobada</h2>
    <p>Estimado/a representante,</p>
    <p>Nos complace informarte que la solicitud de ingreso del/la estudiante
       <strong>${nombres} ${apellidos}</strong> para el nivel
       <strong>${nivel}</strong>, año lectivo <strong>${anoLectivo}</strong>,
       ha sido <strong>APROBADA</strong>.</p>

    <div class="codigo">
      <span>Código de solicitud</span>
      <strong>${codigo}</strong>
    </div>

    <h2>Pasos para completar la matrícula</h2>
    <ul class="pasos">
      <li>Descarga y revisa el documento adjunto con las <strong>indicaciones de matrícula</strong>.</li>
      <li>Reúne todos los documentos requeridos listados en el PDF adjunto.</li>
      <li>Completa el <strong>formulario oficial de matrícula</strong> haciendo clic en el botón de abajo.</li>
      <li>Acércate a la secretaría de la institución con los documentos originales para finalizar el proceso.</li>
      <li>Realiza el pago de matrícula según las instrucciones del PDF.</li>
    </ul>

    <div class="info-box">
      <p>⚠️ <strong>Importante:</strong> Debes completar la matrícula formal dentro de los
         <strong>15 días calendario</strong> siguientes a la recepción de este correo.
         De lo contrario, el cupo podría ser asignado a otro estudiante.</p>
    </div>

    <div style="text-align:center;">
      <a href="${urlFormularioMatricula}" class="btn">
        📋 Completar Formulario de Matrícula
      </a>
    </div>

    <p>El documento PDF adjunto contiene todas las instrucciones detalladas del proceso.
       Si tienes alguna pregunta, no dudes en contactarnos.</p>

    <p>¡Bienvenido/a a la familia Aliñambi! 🌱</p>
  `),
});

// ── Función principal para enviar email vía API HTTP de Brevo ────────────────
// Usa fetch nativo (Node 18+) — no requiere paquetes adicionales
const enviarEmail = async ({ destinatario, asunto, html, adjuntos = [] }) => {
  const body = {
    sender: {
      name: "Admisiones EEBF Aliñambi",
      email: process.env.EMAIL_USER,
    },
    to: [{ email: destinatario }],
    subject: asunto,
    htmlContent: html,
  };

  // Adjuntos: Brevo los espera en base64
  if (adjuntos.length > 0) {
    body.attachment = adjuntos.map((adj) => ({
      name: adj.filename,
      content: Buffer.isBuffer(adj.content)
        ? adj.content.toString("base64")
        : Buffer.from(adj.content).toString("base64"),
    }));
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Brevo ${res.status}: ${detalle}`);
  }

  return res.json();
};

module.exports = {
  correoPendiente,
  correoRechazado,
  correoAprobado,
  enviarEmail,
};
