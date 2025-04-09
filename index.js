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
    return res.status(400).json({ error: "Missing YouTube URL" });
  }

  const ytDlpPath = "yt-dlp";
  const args = ["-f", "best[ext=mp4]", "--get-url", url];

  execFile(ytDlpPath, args, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: "Failed to get video URL",
        details: stderr || error.message
      });
    }

    const directUrl = stdout.trim();
    if (!directUrl || !directUrl.startsWith("http")) {
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
      note: "Successfully extracted URL using yt-dlp"
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 yt-dlp server running at http://localhost:${PORT}`);
});

