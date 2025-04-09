import fs from "fs";
import express from "express";
import cors from "cors";
import { execFile } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Load proxies from proxies.txt (one proxy per line)
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

  // Select a random proxy from the list
  const selectedProxy = getRandomProxy();

  // Use "yt-dlp" from PATH (ensure it's installed and reachable)
  const ytDlpPath = "yt-dlp";

  // Define a custom User-Agent string that mimics a real browser.
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                    "AppleWebKit/537.36 (KHTML, like Gecko) " +
                    "Chrome/115.0.0.0 Safari/537.36";

  // Prepare command arguments with:
  // - The proxy
  // - No-check-certificate flag
  // - The custom user agent
  // - The video format and extraction method
  const args = [
    "--proxy", selectedProxy,
    "--no-check-certificate",
    "--user-agent", userAgent,
    "-f", "best[ext=mp4]",
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
      proxyUsed: selectedProxy,
      note: "Extracted URL using yt-dlp with custom user-agent and proxy rotation"
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 yt-dlp server running at http://localhost:${PORT}`);
});
