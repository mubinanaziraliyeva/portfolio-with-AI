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

  // Use environment variables (set these in Vercel or your host)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Still accept and attempt to save to DB if configured
    console.warn(
      "Telegram token or chat id not configured. Skipping Telegram send.",
    );
  }

  const telegramMessage = `
<b>New Portfolio Message</b>\n
👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
📝 <b>Message:</b> ${message || "No message provided"}
`;

  let tgResult = null;
  try {
    if (token && chatId) {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
            parse_mode: "HTML",
          }),
        },
      );
      tgResult = await tgRes.json();
      if (!tgRes.ok) {
        console.warn("Telegram send failed", tgResult);
      }
    }
  } catch (err) {
    console.warn("Telegram send error", String(err));
  }

  // Optional: save to Supabase (if SUPABASE_URL and SUPABASE_KEY are set)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY; // service role key recommended
  let sbResult = null;
  if (supabaseUrl && supabaseKey) {
    try {
      // Insert into 'contacts' table. Create this table in Supabase with columns: name, email, message, created_at
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify([
          { name, email, message, created_at: new Date().toISOString() },
        ]),
      });
      sbResult = await insertRes.json();
      if (!insertRes.ok) {
        console.warn("Supabase insert failed", sbResult);
      }
    } catch (err) {
      console.warn("Supabase error", String(err));
    }
  }

  // Return best-effort result
  res.status(200).json({ ok: true, telegram: tgResult, supabase: sbResult });
}
