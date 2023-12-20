import { writeFile } from "fs/promises";
import v8toIstanbul from "v8-to-istanbul";
import type { TestRunnerConfig } from "@storybook/test-runner";

const config: TestRunnerConfig = {
  /* Hook to execute before a story is initially visited before being rendered in the browser.
   * The page argument is the Playwright's page object for the story.
   * The context argument is a Storybook object containing the story's id, title, and name.
   */
  async preVisit(page, context) {
    page.coverage.startJSCoverage();
  },
  /* Hook to execute after a story is visited and fully rendered.
   * The page argument is the Playwright's page object for the story
   * The context argument is a Storybook object containing the story's id, title, and name.
   */
  async postVisit(page, context) {
    const coverage = await page.coverage.stopJSCoverage();
    for (const entry of coverage) {
      // console.log(entry.source);

      const converter = v8toIstanbul("", 0, { source: entry.source });
      await converter.load();

      // console.log(entry.functions);

      converter.applyCoverage(entry.functions);
      // console.log(JSON.stringify(converter.toIstanbul()));
    }
    await writeFile(`test-results/coverage/${context.id}.json`, JSON.stringify(coverage));
  },
};

export default config;
