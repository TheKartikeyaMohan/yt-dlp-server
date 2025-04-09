import express from "express";
import cors from "cors";
import { execFile } from "child_process";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL" });
  }

  const ytDlpPath = "/Users/kartikeyamohan/miniconda3/bin/yt-dlp"; // full yt-dlp path
  const args = ["-f", "best[ext=mp4]", "--get-url", url];

  execFile(ytDlpPath, args, (error, stdout, stderr) => {
    if (error || !stdout) {
      return res.status(500).json({
        error: "Failed to get video URL",
        details: stderr || error.message,
      });
    }

    const directUrl = stdout.trim();

    if (!directUrl.startsWith("http")) {
      return res.status(500).json({
        error: "Invalid video URL",
        stdout,
        stderr,
      });
    }

    return res.json({
      success: true,
      downloadUrl: directUrl,
      format: "mp4",
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 yt-dlp server running locally at http://localhost:${PORT}`);
});
