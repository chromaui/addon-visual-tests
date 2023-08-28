import fs from "node:fs/promises";
import { join } from "node:path";

const SUPPORTED_EXTENSIONS = ["js", "ts", "tsx", "jsx"] as const;

const pathExists = (f: string) =>
  fs.stat(f).then(
    () => true,
    () => false
  );

export const findConfig = async (configDir: string, prefix: string) => {
  const filenames = SUPPORTED_EXTENSIONS.map((ext) => join(configDir, `${prefix}.${ext}`));
  const exists = await Promise.all(filenames.map(pathExists));

  const idx = exists.findIndex((e) => e);
  if (idx === -1) return filenames[0]; // create a JS file
  return filenames[idx];
};
