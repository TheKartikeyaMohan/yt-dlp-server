import express from "express";
import cors from "cors";
import { execFile } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    console.log("❌ No URL provided in request body.");
    return res.status(400).json({ error: "Missing YouTube URL" });
  }

  console.log(`📥 Request received for URL: ${url}`);

  // Full path if needed; otherwise, "yt-dlp" might work if it's in your PATH.
  const ytDlpPath = "yt-dlp";
  // Added --no-check-certificate to bypass SSL verification errors.
  const args = [
    "-f", "best[ext=mp4]",
    "--no-check-certificate",
    "--get-url",
    url
  ];

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
      note: "Successfully extracted URL using yt-dlp with no-check-certificate"
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 yt-dlp server running at http://localhost:${PORT}`);
});
