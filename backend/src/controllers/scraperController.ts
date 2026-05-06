import { Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";

export const runScraper = async (req: Request, res: Response) => {
    try {
        const brand =
            typeof req.body.brand === "string" && req.body.brand.trim()
                ? req.body.brand.trim().toLowerCase()
                : undefined;

        const limit =
            Number.isFinite(Number(req.body.limit)) && Number(req.body.limit) > 0
                ? Number(req.body.limit)
                : 10;

        const maxPages =
            Number.isFinite(Number(req.body.maxPages)) && Number(req.body.maxPages) > 0
                ? Number(req.body.maxPages)
                : 3;

        const poolMult =
            Number.isFinite(Number(req.body.poolMult)) && Number(req.body.poolMult) > 0
                ? Number(req.body.poolMult)
                : 5;

        const args = [
            "-m",
            "src.scraper.gsmarena_scraper",
            "--limit",
            String(limit),
            "--max-pages",
            String(maxPages),
            "--pool-mult",
            String(poolMult),
        ];

        if (brand) {
            args.push("--brand", brand);
        }

        const pythonCmd = process.platform === "win32" ? "py" : "python3";

        const child = spawn(pythonCmd, args, {
            cwd: path.resolve(__dirname, "../../"),
            env: process.env,
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("close", (code) => {
            const totalInsertedMatch = stdout.match(/Total inserted=(\d+)/);
            const totalInserted = totalInsertedMatch ? Number(totalInsertedMatch[1]) : 0;

            if (code === 0) {
                return res.status(200).json({
                    success: true,
                    message: "Scraper completed successfully.",
                    totalInserted,
                    output: stdout,
                });
            }

            return res.status(500).json({
                success: false,
                message: "Scraper failed.",
                error: stderr || stdout || `Process exited with code ${code}`,
            });
        });
    } catch (error: any) {
        console.error("runScraper error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while starting scraper.",
            error: error.message,
        });
    }
};