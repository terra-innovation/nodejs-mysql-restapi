import EmailSender from "../src/utils/email/emailSender.js";
import TemplateManager from "../src/utils/email/TemplateManager.js";

const emailSender = new EmailSender();

const templateManager = new TemplateManager();

(async () => {
  try {
    /*const fechacrea = (() => {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.${String(
        now.getMilliseconds()
      ).padStart(3, "0")}`;
    })();
    const ejemploEmail = await templateManager.templateEjemplo({ name: "Juan", email: "juan@prueba.com", fechacrea: fechacrea });

    const mailOptions = {
      to: "jonycaleb@gmail.com",
      subject: ejemploEmail.subject,
      text: ejemploEmail.text,
      html: ejemploEmail.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);

*/

    const fechacrea = (() => {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.${String(
        now.getMilliseconds()
      ).padStart(3, "0")}`;
    })();
    const fecha_actual = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    const codigoverificacionEmail = await templateManager.templateCodigoVerificacion({ name: "Juan", codigo: "777777", fecha_actual: fecha_actual, duracion_minutos: 15, fechacrea: fechacrea });

    const mailOptions = {
      to: "jonycaleb@gmail.com",
      subject: codigoverificacionEmail.subject,
      text: codigoverificacionEmail.text,
      html: codigoverificacionEmail.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {}
})();
