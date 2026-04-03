export interface RunScraperPayload {
    brand?: string;
    limit?: number;
    maxPages?: number;
    poolMult?: number;
}

export interface RunScraperResponse {
    success: boolean;
    message: string;
    totalInserted?: number;
    output?: string;
    error?: string;
}

export async function runScraper(
    payload: RunScraperPayload
): Promise<RunScraperResponse> {
    const response = await fetch("http://localhost:5001/api/scraper/run", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to run scraper");
    }

    return data;
}