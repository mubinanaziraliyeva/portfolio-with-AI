export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, email, message } = req.body || {};

  if (!name || !email) {
    res.status(400).json({ error: "Ism va email majburiy!" });
    return;
  }

  // Ma'lumotlaringiz
  const token = "8706411745:AAGogLw2wKHr7Ol7Kx8VO2thKhsOboG5R0c";
  const chatId = "623181901";

  // Xabar matni (HTML formatida chiroyliroq ko'rinishi uchun)
  const telegramMessage = `
<b>New Portfolio Message</b>
👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
📝 <b>Message:</b> ${message || "No message provided"}
  `;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: "HTML", // Matnni qalin (bold) qilish imkonini beradi
        }),
      },
    );

    const json = await tgRes.json();

    if (tgRes.ok) {
      res.status(200).json({ ok: true, result: json });
    } else {
      res.status(502).json({ error: "Telegram error", details: json });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
}
