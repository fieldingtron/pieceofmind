import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, html } = req.body;

  if (!subject || !html) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const data = await resend.emails.send({
      from: "hello@fieldsmarshall.com", // Verified sender
      to: "yann@pieceofmindfab.com", // Fixed recipient
      subject,
      html,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
