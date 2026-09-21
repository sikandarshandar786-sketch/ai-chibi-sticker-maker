// Secure backend for AI Chibi Sticker Maker.
// IMPORTANT: keep OPENAI_API_KEY only on the server, never in index.html.
//
// Install:
//   npm install express multer openai cors
//
// Run:
//   OPENAI_API_KEY="YOUR_KEY" node server.js
//
// Put this backend behind HTTPS before public launch.

const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();
const upload = multer({storage: multer.memoryStorage(), limits:{fileSize: 10*1024*1024}});
const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.use(cors());
app.post("/api/generate", upload.single("image"), async (req,res)=>{
  try {
    if (!req.file) return res.status(400).send("No image uploaded.");

    // The image API expects an image input. The exact model/parameters can be
    // adjusted as OpenAI's image API evolves.
    const base64 = req.file.buffer.toString("base64");
    const mime = req.file.mimetype || "image/jpeg";
    const caption = (req.body.caption || "My Happy Family").slice(0,60);

    const prompt =
      `Create a cute illustrated chibi sticker from the supplied photo. ` +
      `Preserve the people and their recognizable clothing/features without adding people. ` +
      `Clean white background, vertical composition, thick white die-cut border, ` +
      `glossy cute anime-inspired eyes, soft shading, clean cartoon outlines. ` +
      `Add the exact caption "${caption}" in a cute handwritten style. ` +
      `Make it suitable as a messaging-app sticker.`;

    const response = await client.images.edit({
      model: "gpt-image-1",
      image: `data:${mime};base64,${base64}`,
      prompt
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned.");
    res.set("Content-Type","image/png");
    res.send(Buffer.from(b64,"base64"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Generation failed.");
  }
});

app.get("/health",(req,res)=>res.json({ok:true}));
app.listen(process.env.PORT || 3000, ()=>console.log("Chibi backend running"));
