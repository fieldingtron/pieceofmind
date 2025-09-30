import { Resend } from "resend";

console.log(
  "[Resend] ENV KEY:",
  process.env.RESEND_API_KEY ? "Present" : "Missing"
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  console.log("[Resend] Handler called");
  if (req.method !== "POST") {
    console.log("[Resend] Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, html } = req.body;
  console.log("[Resend] Request body:", req.body);

  if (!subject || !html) {
    console.log("[Resend] Missing required fields", { subject, html });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("[Resend] Sending email", {
      from: "hello@fieldsmarshall.com",
      to: "yann@pieceofmindfab.com",
      subject,
      html,
    });
    const data = await resend.emails.send({
      from: "hello@fieldsmarshall.com", // Verified sender
      to: "yann@pieceofmindfab.com", // Fixed recipient
      subject,
      html,
    });
    console.log("[Resend] Email send response:", data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[Resend] Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
}
