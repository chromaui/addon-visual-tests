import type { Configuration } from "chromatic/node";
import { writeFile } from "jsonfile";

export async function updateChromaticConfig(configFile: string, configuration: Configuration) {
  await writeFile(configFile, configuration, { spaces: 2 });
}
