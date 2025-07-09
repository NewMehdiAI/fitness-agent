# 🏋️‍♂️ AI Fitness Agent - مشاور ورزشی هوشمند

یک ایجنت ساده با Node.js و OpenAI برای ارائه مشاوره ورزشی، ذخیره هدف و تاریخچه کاربر، همراه با داشبورد ساده.

## ✨ امکانات

- پاسخ خودکار هوش مصنوعی با مدل GPT
- دریافت و ذخیره نام و هدف کاربر
- ذخیره تاریخچه گفتگوها در فایل محلی
- داشبورد ساده HTML برای نمایش اطلاعات

## ⚙️ نحوه اجرا

```bash
npm install
node index.js
پروژه در http://localhost:3000 اجرا می‌شود.
🧪 تست با Postman
ارسال درخواست POST به /chat:

json
Copy
Edit
{
  "message": "سلام، من مهدی هستم. می‌خوام وزن کم کنم."
}
📁 ساختار پروژه
index.js — سرور اصلی

userData.json — اطلاعات کاربران

chatHistory.json — تاریخچه گفتگو

public/index.html — داشبورد ساده

🧠 Tech Stack
Node.js

Express

OpenAI API

HTML / CSS ساده