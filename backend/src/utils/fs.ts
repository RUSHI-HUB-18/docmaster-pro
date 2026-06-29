import fs from 'fs/promises';

/**
 * Checks whether a path exists using async fs.
 */
export async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
