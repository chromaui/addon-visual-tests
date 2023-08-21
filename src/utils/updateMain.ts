import { readConfig, writeConfig } from "@storybook/csf-tools";

import { CHROMATIC_ADDON_NAME } from "../constants";
import { findConfig } from "./storybook.config.utils";

export async function updateMain({
  projectId,
  projectToken,
}: {
  projectId: string;
  projectToken: string;
}) {
  const mainPath = await findConfig("main");
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
