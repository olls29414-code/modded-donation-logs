import express from "express";
import { createCanvas, loadImage } from "canvas";
import FormData from "form-data";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/generate", async (req, res) => {
  const data = req.body;

  const canvas = createCanvas(1200, 400);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, 1200, 400);

  const left = await loadImage(data.donatorImage);
  const right = await loadImage(data.raiserImage);

  ctx.save();
  ctx.beginPath();
  ctx.arc(200, 200, 90, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(left, 110, 110, 180, 180);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(1000, 200, 90, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(right, 910, 110, 180, 180);
  ctx.restore();

  ctx.fillStyle = "#ff00ff";
  ctx.font = "bold 64px Arial";
  ctx.textAlign = "center";
  ctx.fillText(data.amount, 600, 170);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px Arial";
  ctx.fillText("donated to", 600, 230);

  const buffer = canvas.toBuffer("image/png");

  const form = new FormData();
  form.append("file", buffer, { filename: "donation.png" });

  form.append("payload_json", JSON.stringify({
    embeds: [{
      description: `💰 **@${data.donatorUsername} donated ⏣ ${data.amount} Robux to @${data.raiserUsername}**`,
      color: 0xff00ff,
      image: { url: "attachment://donation.png" }
    }]
  }));

  await fetch(process.env.WEBHOOK, { method: "POST", body: form });

  res.json({ ok: true });
});

app.listen(3000);
