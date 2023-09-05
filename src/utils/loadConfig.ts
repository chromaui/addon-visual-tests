import { cosmiconfig } from "cosmiconfig";
import { z } from "zod";

const configSchema = z
  .object({
    projectId: z.string(),
    projectToken: z.string(),
    buildScriptName: z.string(),
    zip: z.boolean(),
    debug: z.boolean(),
    onlyChanged: z.union([z.string(), z.boolean()]),
    externals: z.array(z.string()),
    untraced: z.array(z.string()),
  })
  .partial();

export type ChromaticConfig = z.infer<typeof configSchema>;

export async function loadConfig() {
  const result = await cosmiconfig("chromatic").search();
  if (!result) return {};
  const { config, filepath } = result;
  console.log(`Found config at '${filepath}'`);

  return parseConfig(config);
}

export function parseConfig(config: any) {
  return configSchema.parse(config);
}
