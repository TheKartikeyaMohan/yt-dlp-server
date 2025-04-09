import fs from "fs";
import express from "express";
import cors from "cors";
import { execFile } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const proxies = fs.readFileSync("proxies.txt", "utf8")
  .split("\n")
  .map(p => p.trim())
  .filter(Boolean);

function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL" });
  }

  const proxy = getRandomProxy();
  const ytDlpPath = "yt-dlp";
  const args = [
    "--proxy", proxy,
    "-f", "best[ext=mp4]",
    "--get-url",
    url
  ];

  console.log(`📥 Download for: ${url}`);
  console.log(`🌍 Proxy used: ${proxy}`);

  execFile(ytDlpPath, args, (err, stdout, stderr) => {
    if (err || !stdout.trim()) {
      console.error("❌ yt-dlp error:", stderr || err.message);
      return res.status(500).json({
        error: "Failed to get video URL",
        details: stderr || err.message
      });
    }

    res.json({
      success: true,
      downloadUrl: stdout.trim(),
      usedProxy: proxy
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 yt-dlp server running on port ${PORT}`);
});
