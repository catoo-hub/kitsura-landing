import fs from "node:fs/promises";
import path from "node:path";

const STATS_FILE = path.resolve("stats.json");

interface Stats {
  steamTopups: number;
}

// Start with a realistic number so it doesn't look empty
const DEFAULT_STATS: Stats = {
  steamTopups: 15423,
};

export async function getStats(): Promise<Stats> {
  try {
    const data = await fs.readFile(STATS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or error reading, return default
    // We don't await save here to avoid blocking read if write fails,
    // but we could try to initialize it.
    try {
      await fs.writeFile(STATS_FILE, JSON.stringify(DEFAULT_STATS, null, 2));
    } catch (e) {
      console.error("Failed to initialize stats file", e);
    }
    return DEFAULT_STATS;
  }
}

export async function saveStats(stats: Stats): Promise<void> {
  try {
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error("Failed to save stats", error);
  }
}

export async function incrementSteamTopups(): Promise<number> {
  const stats = await getStats();
  stats.steamTopups += 1;
  await saveStats(stats);
  return stats.steamTopups;
}
