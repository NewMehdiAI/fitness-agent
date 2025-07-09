require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.gapgpt.app/v1",
});

app.use(bodyParser.json());

const filePath = path.join(__dirname, "userData.json");
const chatHistoryPath = path.join(__dirname, "chatHistory.json");

function saveChatHistory(user, userMsg, botMsg) {
  let history = [];

  if (fs.existsSync(chatHistoryPath)) {
    const raw = fs.readFileSync(chatHistoryPath, "utf8").trim();
    if (raw) {
      try {
        history = JSON.parse(raw);
      } catch (err) {
        console.error("⚠️ خطا در خواندن تاریخچه:", err.message);
      }
    }
  }

  history.push({
    user,
    messages: [
      { role: "user", message: userMsg, timestamp: new Date().toISOString() },
      { role: "assistant", message: botMsg, timestamp: new Date().toISOString() },
    ],
  });

  try {
    fs.writeFileSync(chatHistoryPath, JSON.stringify(history, null, 2), "utf8");
    console.log(`📝 تاریخچه گفتگو با ${user} ذخیره شد.`);
  } catch (err) {
    console.error("❌ خطا در ذخیره تاریخچه:", err.message);
  }
}

// استخراج اطلاعات از پیام ساده
function extractUserInfo(message) {
  const nameMatch = message.match(/(من\s+)?(?<name>\S+)\s+(هستم|ام)/);
  const goalMatch = message.match(/هدفم\s+(?<goal>.+?)(\.|$)/);
  const name = nameMatch?.groups?.name || "کاربر";
  const goal = goalMatch?.groups?.goal || message;
  return { name, goal };
}

// ذخیره اطلاعات کاربر
function saveUserData(user, goal) {
  let data = {};
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8").trim();
      if (raw) data = JSON.parse(raw);
    }
  } catch (err) {
    console.error("⚠️ خطا در خواندن فایل JSON:", err.message);
  }

  data[user] = {
    goal,
    timestamp: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ اطلاعات کاربر «${user}» با هدف «${goal}» ذخیره شد.`);
  } catch (err) {
    console.error("❌ خطا در ذخیره اطلاعات:", err.message);
  }
}

// 🎯 روت اصلی چت
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "لطفاً پیام ارسال کنید." });
  }

  const { name, goal } = extractUserInfo(message);
  saveUserData(name, goal);

  const messages = [
    { role: "system", content: "تو یک مشاور ورزشی حرفه‌ای هستی. به فارسی پاسخ بده." },
    { role: "user", content: message },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    const reply = completion.choices[0].message.content;
    saveChatHistory(name, message, reply);

    res.json({ reply });
  } catch (error) {
    console.error("❌ خطا در پاسخ هوش مصنوعی:", error.message);
    res.status(500).json({ error: "خطا در ارتباط با هوش مصنوعی." });
  }
});

// 📆 روت دریافت برنامه تمرینی هفتگی
app.post("/weekly-plan", async (req, res) => {
  const { user, goal } = req.body;

  if (!user || !goal) {
    return res.status(400).json({ error: "لطفاً نام و هدف را وارد کنید." });
  }

  const messages = [
    {
      role: "system",
      content:
        "تو یک مربی ورزشی حرفه‌ای هستی. بر اساس هدف کاربر، یک برنامه تمرینی دقیق برای ۷ روز هفته پیشنهاد بده. برنامه باید برای فارسی‌زبانان ساده و کاربردی باشه.",
    },
    {
      role: "user",
      content: `نام من ${user} است و هدفم این است: ${goal}. لطفاً یک برنامه تمرینی هفتگی برایم طراحی کن.`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    const reply = completion.choices[0].message.content;
    res.json({ weeklyPlan: reply });
  } catch (error) {
    console.error("❌ خطا در پردازش برنامه تمرینی:", error);
    res.status(500).json({ error: "خطا در دریافت برنامه تمرینی." });
  }
});
//روتتاریخچه گفتگو رو از فایل chatHistory.json برمی‌داره:
app.get("/history", (req, res) => {
  try {
    const rawData = fs.readFileSync(chatHistoryPath, "utf8");
    const history = rawData ? JSON.parse(rawData) : [];
    res.json(history);
  } catch (err) {
    console.error("❌ خطا در خواندن تاریخچه:", err.message);
    res.status(500).json({ error: "خطا در خواندن تاریخچه." });
  }
});

app.listen(port, () => {
  console.log(`🚀 سرور فعال است در http://localhost:${port}`);
});
