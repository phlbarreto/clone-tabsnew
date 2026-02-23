import nodemailer from "nodemailer";
import { ServiceError } from "./errors.js";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
  secure: false,
  // secure: process.env.NODE_ENV === "production" ? true : false, modificado momentaneamente
});

async function send(mailOpstios) {
  try {
    await transporter.sendMail(mailOpstios);
  } catch (error) {
    throw new ServiceError({
      message: "Não foi possivel enviar o email.",
      action: "Verifique se o serviço de email está disponível.",
      cause: error,
      context: mailOpstios,
    });
  }
}

const email = {
  send,
};

export default email;
