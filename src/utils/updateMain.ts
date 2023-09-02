import { readConfig, writeConfig } from "@storybook/csf-tools";

import { CHROMATIC_ADDON_NAME } from "../constants";

export async function updateMain({
  projectId,
  projectToken,
  mainPath,
}: {
  projectId: string;
  projectToken: string;
  mainPath: string;
}) {
  const MainConfig = await readConfig(mainPath);

  const addonsConfig = MainConfig.getFieldValue(["addons"]);
  const updatedAddonsConfig = addonsConfig.map(
    (addonConfig: string | { name: string; options?: Record<string, string> }) => {
      const fullConfig = typeof addonConfig === "string" ? { name: addonConfig } : addonConfig;
      if (fullConfig.name === CHROMATIC_ADDON_NAME) {
        return {
          ...fullConfig,
          options: { projectId, projectToken, ...fullConfig.options },
        };
      }
      return addonConfig;
    }
  );

  MainConfig.setFieldValue(["addons"], updatedAddonsConfig);
  await writeConfig(MainConfig);
}
