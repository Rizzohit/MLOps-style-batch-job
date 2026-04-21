import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to get file contents for the UI
  app.get("/api/files", (req, res) => {
    const files = ["run.py", "config.yaml", "data.csv", "Dockerfile", "README.md", "requirements.txt"];
    const fileContents = files.map(file => ({
      name: file,
      content: fs.existsSync(path.join(process.cwd(), file)) 
        ? fs.readFileSync(path.join(process.cwd(), file), "utf-8")
        : ""
    }));
    res.json(fileContents);
  });

  // API to simulate running the job
  app.post("/api/run-job", (req, res) => {
    // Simulate a delay
    setTimeout(() => {
      const metrics = {
        "version": "v1",
        "rows_processed": 10000,
        "metric": "signal_rate",
        "value": 0.4990,
        "latency_ms": 127 + Math.floor(Math.random() * 50),
        "seed": 42,
        "status": "success"
      };
      
      const logContent = `2026-04-21 10:33:00 - INFO - Job started
2026-04-21 10:33:00 - INFO - Config loaded and validated: version=v1, seed=42, window=5
2026-04-21 10:33:01 - INFO - Rows loaded: 10000
2026-04-21 10:33:01 - INFO - Starting processing: rolling mean and signal generation
2026-04-21 10:33:02 - INFO - Metrics summary: ${JSON.stringify(metrics)}
2026-04-21 10:33:02 - INFO - Job ended with status: success`;

      // In a real environment we would write to disk
      // fs.writeFileSync("metrics.json", JSON.stringify(metrics, null, 2));
      // fs.writeFileSync("run.log", logContent);

      res.json({ metrics, logs: logContent });
    }, 2000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
