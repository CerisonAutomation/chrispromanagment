/**
 * Simple file-based media manifest.
 *
 * Stores uploaded media metadata in public/uploads/.manifest.json so the
 * GET /api/media endpoint can list files without needing a database table.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MANIFEST_PATH = join(process.cwd(), "public", "uploads", ".manifest.json");

export interface MediaEntry {
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

async function ensureDir() {
  if (!existsSync(join(process.cwd(), "public", "uploads"))) {
    await mkdir(join(process.cwd(), "public", "uploads"), { recursive: true });
  }
}

async function read(): Promise<MediaEntry[]> {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(raw) as MediaEntry[];
  } catch {
    return [];
  }
}

async function write(entries: MediaEntry[]) {
  await ensureDir();
  await writeFile(MANIFEST_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

const mediaManifest = {
  /** Return all media entries, newest first. */
  async list(): Promise<MediaEntry[]> {
    const entries = await read();
    return entries.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  },

  /** Add a new entry. */
  async add(entry: Omit<MediaEntry, "uploadedAt">): Promise<MediaEntry> {
    const entries = await read();
    const full: MediaEntry = {
      ...entry,
      uploadedAt: new Date().toISOString(),
    };
    entries.push(full);
    await write(entries);
    return full;
  },

  /** Remove an entry by URL. */
  async remove(url: string): Promise<boolean> {
    const entries = await read();
    const idx = entries.findIndex((e) => e.url === url);
    if (idx === -1) return false;
    entries.splice(idx, 1);
    await write(entries);
    return true;
  },
};

export default mediaManifest;
