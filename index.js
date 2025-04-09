import express from "express";
import cors from "cors";
import { execFile } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// 🌐 Add a list of proxies (rotate between them)
const proxyList = [
  "http://188.68.52.244:80",  // Germany – High uptime
  "http://137.66.45.239:80",  // US
  "http://179.61.174.4:80",   // Belgium
  "http://51.8.245.208:3128", // US
  "http://152.53.228.157:3128" // Austria
];

// 🔁 Randomly pick a proxy for each request
function getRandomProxy() {
  const index = Math.floor(Math.random() * proxyList.length);
  return proxyList[index];
}

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    console.log("❌ No URL provided.");
    return res.status(400).json({ error: "Missing YouTube URL" });
  }

  const selectedProxy = getRandomProxy();
  console.log(`📥 Request received for URL: ${url}`);
  console.log(`🌐 Using proxy: ${selectedProxy}`);

  const ytDlpPath = "yt-dlp"; // assumes it's installed globally
  const args = [
    "--proxy", selectedProxy,
    "--no-check-certificate",
    "-f", "best[ext=mp4]",
    "--get-url",
    url
  ];

  execFile(ytDlpPath, args, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ yt-dlp error:", error.message);
      console.error("stderr:", stderr);
      return res.status(500).json({
        error: "Failed to get video URL",
        details: stderr || error.message
      });
    }

    const directUrl = stdout.trim();
    console.log("✅ Direct download URL:", directUrl);

    if (!directUrl || !directUrl.startsWith("http")) {
      return res.status(500).json({
        error: "Invalid or empty URL returned",
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
