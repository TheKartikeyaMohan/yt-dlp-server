import fs from "fs";
import express from "express";
import cors from "cors";
import { execFile } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Read proxies from proxies.txt and store them in an array
const proxies = fs
  .readFileSync("proxies.txt", "utf8")
  .split("\n")
  .map((p) => p.trim())
  .filter(Boolean);

function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    console.log("❌ No URL provided in request body.");
    return res.status(400).json({ error: "Missing YouTube URL" });
  }

  const selectedProxy = getRandomProxy();
  const ytDlpPath = "yt-dlp";
  const args = [
    "--proxy", selectedProxy,   // Use the randomly selected proxy
    "-f", "best[ext=mp4]",
    "--no-check-certificate",   // Bypass SSL errors if needed
    "--get-url",
    url
  ];

  console.log(`📥 Request received for URL: ${url}`);
  console.log(`🌍 Using proxy: ${selectedProxy}`);
  console.log(`⚙️ Running command: ${ytDlpPath} ${args.join(" ")}`);

  execFile(ytDlpPath, args, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error executing yt-dlp:", error.message);
      console.error("stderr:", stderr);
      return res.status(500).json({
        error: "Failed to get video URL",
        details: stderr || error.message
      });
    }

    const directUrl = stdout.trim();
    console.log("✅ Direct download URL generated:", directUrl);

    if (!directUrl || !directUrl.startsWith("http")) {
      console.error("⚠️ Invalid URL returned:", directUrl);
      return res.status(500).json({
        error: "No valid download URL returned",
        stdout,
        stderr
      });
    }

    return res.json({
      success: true,
      downloadUrl: directUrl,
      format: "mp4",
      proxyUsed: selectedProxy
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 yt-dlp server running at http://localhost:${PORT}`);
});
