import type { Configuration } from 'chromatic/node';
import { writeFile } from 'jsonfile';

export async function updateChromaticConfig(configFile: string, configuration: Configuration) {
  const formatted = Object.entries(configuration)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((acc, [key, val]) => (val === null ? acc : Object.assign(acc, { [key]: val })), {});
  await writeFile(configFile, formatted, { spaces: 2 });
}
