import express from "express";
import { createCanvas, loadImage } from "canvas";
import FormData from "form-data";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// simple homepage so Railway doesn't show Not Found
app.get("/", (req, res) => {
  res.send("Donation image generator is running");
});

app.post("/generate", async (req, res) => {
  try {
    const data = req.body;

    const canvas = createCanvas(1200, 400);
    const ctx = canvas.getContext("2d");

    // background
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(0, 0, 1200, 400);

    // avatars
    const left = await loadImage(data.donatorImage);
    const right = await loadImage(data.raiserImage);

    // left avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 200, 90, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(left, 110, 110, 180, 180);
    ctx.restore();

    // right avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(1000, 200, 90, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(right, 910, 110, 180, 180);
    ctx.restore();

    // amount
    ctx.fillStyle = "#ff00ff";
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`⏣ ${data.amount}`, 600, 170);

    // text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px Arial";
    ctx.fillText("donated to", 600, 230);

    const buffer = canvas.toBuffer("image/png");

    // discord webhook
    const form = new FormData();
    form.append("file", buffer, { filename: "donation.png" });

    form.append(
      "payload_json",
      JSON.stringify({
        embeds: [
          {
            description: `💰 **@${data.donatorUsername} donated ⏣ ${data.amount} Robux to @${data.raiserUsername}**`,
            color: 0xff00ff,
            image: { url: "attachment://donation.png" }
          }
        ]
      })
    );

    await fetch(process.env.WEBHOOK, {
      method: "POST",
      body: form
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// IMPORTANT: Railway port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


