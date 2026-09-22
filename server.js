// Secure backend for AI Chibi Sticker Maker
const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const cors = require("cors");
const { toFile } = require("openai");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());

app.post("/api/generate", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No image uploaded.");
    }

    const caption = (req.body.caption || "My Happy Family").slice(0, 60);

    const prompt =
      `Create a cute illustrated chibi sticker from the supplied photo. ` +
      `Preserve the people and their recognizable clothing/features without adding people. ` +
      `Clean white background, vertical composition, thick white die-cut border, ` +
      `glossy cute anime-inspired eyes, soft shading, clean cartoon outlines. ` +
      `Add the exact caption "${caption}" in a cute handwritten style. ` +
      `Make it suitable as a messaging-app sticker.`;

    // Convert buffer to file object (correct way)
    const imageFile = await toFile(req.file.buffer, req.file.originalname || "photo.jpg", {
      type: req.file.mimetype || "image/jpeg"
    });

    const response = await client.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt: prompt
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("No image returned from OpenAI");
    }

    res.set("Content-Type", "image/png");
    res.send(Buffer.from(b64, "base64"));

  } catch (err) {
    console.error("Error details:", err);
    res.status(500).send("Generation failed: " + (err.message || "Unknown error"));
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Chibi backend running");
});
