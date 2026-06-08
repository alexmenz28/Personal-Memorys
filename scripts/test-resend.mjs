import "dotenv/config";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const to = process.argv[2] ?? "alexander.mendoza.cholima2248@gmail.com";

if (!apiKey || apiKey === "re_...") {
  console.error("Falta RESEND_API_KEY en .env");
  process.exit(1);
}

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Personal Memories — prueba Resend",
  html: "<p>Si ves esto, <strong>Resend está configurado</strong> correctamente.</p>",
});

if (error) {
  console.error("Error al enviar:", error);
  process.exit(1);
}

console.log(`Email enviado a ${to} (id: ${data?.id})`);
