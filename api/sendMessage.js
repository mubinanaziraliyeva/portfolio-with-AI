// Vercel serverless function to forward contact form messages to Telegram bot
// Set environment variables in Vercel dashboard:
//   TELEGRAM_BOT_TOKEN=your_bot_token
//   TELEGRAM_CHAT_ID=your_chat_id_or_channel

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, email, message } = req.body || {};
  if (!name || !email) {
    res.status(400).json({ error: "Missing name or email" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ error: "Telegram configuration missing" });
    return;
  }

  const text = `📨 New contact from portfolio:\nName: ${name}\nEmail: ${email}\n\n${message || ""}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      },
    );

    const json = await tgRes.json();
    if (!tgRes.ok) {
      console.error("Telegram error", json);
      res.status(502).json({ error: "Telegram API error", details: json });
      return;
    }

    res.status(200).json({ ok: true, result: json });
  } catch (err) {
    console.error("Send message failed", err);
    res.status(500).json({ error: "Send failed", details: String(err) });
  }
}
