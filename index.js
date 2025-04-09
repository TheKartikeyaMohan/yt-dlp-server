import fs from "fs";
import express from "express";
import cors from "cors";
import { execFile } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const proxyList = fs.readFileSync("proxies.txt", "utf8")
  .split("\n")
  .map(p => p.trim())
  .filter(Boolean);

function getRandomProxy() {
  return proxyList[Math.floor(Math.random() * proxyList.length)];
}

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL" });
  }

  const selectedProxy = getRandomProxy();
  const ytDlpPath = "yt-dlp";
  const args = [
    "--proxy", selectedProxy,
    "-f", "best[ext=mp4]",
    "--get-url",
    url
  ];

  console.log(`📥 Download request for: ${url}`);
  console.log(`🌐 Using proxy: ${selectedProxy}`);

  execFile(ytDlpPath, args, (error, stdout, stderr) => {
    if (error || !stdout.trim()) {
      console.error("❌ yt-dlp error:", stderr || error.message);
      return res.status(500).json({
        error: "Failed to get video URL",
        details: stderr || error.message
      });
    }

    const directUrl = stdout.trim();
    return res.json({
      success: true,
      downloadUrl: directUrl,
      proxyUsed: selectedProxy
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 yt-dlp server running on port ${PORT}`);
});
