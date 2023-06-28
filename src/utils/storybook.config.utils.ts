import fs from "node:fs/promises";

const SUPPORTED_EXTENSIONS = ["js", "ts", "tsx", "jsx"] as const;

export const findConfig = async (prefix: string) => {
  const filenames = SUPPORTED_EXTENSIONS.map((ext) => `.storybook/${prefix}.${ext}`);
  const exists = await Promise.all(
    filenames.map(async (f) => {
      try {
        const stats = await fs.stat(f);
        return true;
      } catch (e) {
        return false;
      }
    })
  );

  const idx = exists.findIndex((e) => e);
  if (idx === -1) return filenames[0]; // create a JS file
  return filenames[idx];
};
