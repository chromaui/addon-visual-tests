# v0.0.34 (Wed Aug 23 2023)

#### 🐛 Bug Fix

- add story for baselineImageVisible: true on SnapshotComparison [#47](https://github.com/chromaui/addon-visual-tests/pull/47) ([@weeksling](https://github.com/weeksling))

#### Authors: 1

- Matthew Weeks ([@weeksling](https://github.com/weeksling))

---

# v0.0.33 (Wed Aug 23 2023)

#### 🐛 Bug Fix

- Add toggle to show baseline snapshot image [#38](https://github.com/chromaui/addon-visual-tests/pull/38) ([@weeksling](https://github.com/weeksling))

#### Authors: 1

- Matthew Weeks ([@weeksling](https://github.com/weeksling))

---

# v0.0.32 (Wed Aug 23 2023)

#### 🐛 Bug Fix

- Refactor `SnapshotImage` to handle overlay images and scaling [#40](https://github.com/chromaui/addon-visual-tests/pull/40) ([@ghengeveld](https://github.com/ghengeveld))

#### Authors: 1

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))

---

# v0.0.31 (Wed Aug 23 2023)

#### 🐛 Bug Fix

- Fix bug that hid the last project in the list [#27](https://github.com/chromaui/addon-visual-tests/pull/27) ([@weeksling](https://github.com/weeksling))

#### Authors: 1

- Matthew Weeks ([@weeksling](https://github.com/weeksling))

---

# v0.0.30 (Tue Aug 22 2023)

#### 🐛 Bug Fix

- Implement UI for 'project linked' screen [#42](https://github.com/chromaui/addon-visual-tests/pull/42) ([@ghengeveld](https://github.com/ghengeveld))

#### Authors: 1

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))

---

# v0.0.29 (Tue Aug 22 2023)

#### 🐛 Bug Fix

- Query `testsForStory` and `testsForStatus` separately to avoid pagination [#37](https://github.com/chromaui/addon-visual-tests/pull/37) ([@ghengeveld](https://github.com/ghengeveld))

#### Authors: 1

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))

---

# v0.0.28 (Tue Aug 22 2023)

#### 🐛 Bug Fix

- Remove/hide render settings and warnings screens for now [#43](https://github.com/chromaui/addon-visual-tests/pull/43) ([@ghengeveld](https://github.com/ghengeveld))

#### Authors: 1

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))

---

# v0.0.27 (Tue Aug 22 2023)

#### 🐛 Bug Fix

- Mark all builds from the addon as local [#25](https://github.com/chromaui/addon-visual-tests/pull/25) ([@tmeasday](https://github.com/tmeasday))
- Filter `Project.lastBuild` query by `localBuilds: { localBuildEmailHash }` so we don't see others' local builds [#26](https://github.com/chromaui/addon-visual-tests/pull/26) ([@ndelangen](https://github.com/ndelangen) [@tmeasday](https://github.com/tmeasday) [@ghengeveld](https://github.com/ghengeveld))

#### Authors: 3

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))
- Norbert de Langen ([@ndelangen](https://github.com/ndelangen))
- Tom Coleman ([@tmeasday](https://github.com/tmeasday))

---

# v0.0.26 (Tue Aug 22 2023)

#### 🐛 Bug Fix

- Don't show the `SnapshotComparison` for skipped stories [#33](https://github.com/chromaui/addon-visual-tests/pull/33) ([@tmeasday](https://github.com/tmeasday))

#### Authors: 1

- Tom Coleman ([@tmeasday](https://github.com/tmeasday))

---

# v0.0.25 (Mon Aug 21 2023)

#### 🐛 Bug Fix

- Refactor `BuildInfo` -> `StoryInfo` [#36](https://github.com/chromaui/addon-visual-tests/pull/36) ([@tmeasday](https://github.com/tmeasday))

#### Authors: 1

- Tom Coleman ([@tmeasday](https://github.com/tmeasday))

---

# v0.0.24 (Fri Aug 18 2023)

#### 🐛 Bug Fix

- Send a sessionId on graphql requests [#22](https://github.com/chromaui/addon-visual-tests/pull/22) ([@tmeasday](https://github.com/tmeasday))

#### Authors: 1

- Tom Coleman ([@tmeasday](https://github.com/tmeasday))

---

# v0.0.23 (Thu Aug 17 2023)

#### 🐛 Bug Fix

- Ensure we actually typecheck [#35](https://github.com/chromaui/addon-visual-tests/pull/35) ([@tmeasday](https://github.com/tmeasday))

#### Authors: 1

- Tom Coleman ([@tmeasday](https://github.com/tmeasday))

---

# v0.0.22 (Wed Aug 16 2023)

#### 🐛 Bug Fix

- Poll for Git repository hash and set `isOutdated` when it changes [#31](https://github.com/chromaui/addon-visual-tests/pull/31) ([@ghengeveld](https://github.com/ghengeveld))

#### Authors: 1

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))

---

# v0.0.21 (Wed Aug 16 2023)

#### 🐛 Bug Fix

- Upgrade to SB7.3 [#32](https://github.com/chromaui/addon-visual-tests/pull/32) ([@tmeasday](https://github.com/tmeasday))

#### Authors: 1

- Tom Coleman ([@tmeasday](https://github.com/tmeasday))

---

# v0.0.20 (Mon Aug 14 2023)

#### 🐛 Bug Fix

- Add footer menu to link project screen [#29](https://github.com/chromaui/addon-visual-tests/pull/29) ([@ghengeveld](https://github.com/ghengeveld))

#### Authors: 1

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))

---

# v0.0.19 (Thu Aug 10 2023)

#### 🐛 Bug Fix

- Realtime git info [#24](https://github.com/chromaui/addon-visual-tests/pull/24) ([@ndelangen](https://github.com/ndelangen))

#### Authors: 1

- Norbert de Langen ([@ndelangen](https://github.com/ndelangen))

---

# v0.0.18 (Wed Aug 09 2023)

#### 🐛 Bug Fix

- Update OAuth Client ID [#28](https://github.com/chromaui/addon-visual-tests/pull/28) ([@ghengeveld](https://github.com/ghengeveld))

#### Authors: 1

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))

---

# v0.0.17 (Mon Aug 07 2023)

#### 🐛 Bug Fix

- upgrade storybook [#23](https://github.com/chromaui/addon-visual-tests/pull/23) ([@ndelangen](https://github.com/ndelangen))

#### Authors: 1

- Norbert de Langen ([@ndelangen](https://github.com/ndelangen))

---

# v0.0.16 (Tue Aug 01 2023)

#### 🐛 Bug Fix

- Show reviewing errors in browser console and improve dev setup [#21](https://github.com/chromaui/addon-visual-tests/pull/21) ([@tmeasday](https://github.com/tmeasday))

#### Authors: 1

- Tom Coleman ([@tmeasday](https://github.com/tmeasday))

---

# v0.0.15 (Thu Jul 27 2023)

#### 🐛 Bug Fix

- Use GH_TOKEN for releases [#20](https://github.com/chromaui/addon-visual-tests/pull/20) ([@tmeasday](https://github.com/tmeasday))
- Don't force node@18 for package consumers [#19](https://github.com/chromaui/addon-visual-tests/pull/19) ([@tmeasday](https://github.com/tmeasday))
- Refactor `VisualTests` to allow selecting viewport + browser. [#18](https://github.com/chromaui/addon-visual-tests/pull/18) ([@tmeasday](https://github.com/tmeasday))
- Set sidebar status from build result [#11](https://github.com/chromaui/addon-visual-tests/pull/11) ([@tmeasday](https://github.com/tmeasday))
- Allow rerunning builds for the same commit [#17](https://github.com/chromaui/addon-visual-tests/pull/17) ([@tmeasday](https://github.com/tmeasday))
- Revert to yarn 1 [#13](https://github.com/chromaui/addon-visual-tests/pull/13) ([@tmeasday](https://github.com/tmeasday))
- Implement accept and batch accept actions using `reviewTest` mutation [#16](https://github.com/chromaui/addon-visual-tests/pull/16) ([@ghengeveld](https://github.com/ghengeveld))
- Show project picker when no project id is in `main.js` [#10](https://github.com/chromaui/addon-visual-tests/pull/10) ([@weeksling](https://github.com/weeksling) [@tmeasday](https://github.com/tmeasday) [@ghengeveld](https://github.com/ghengeveld) [@ndelangen](https://github.com/ndelangen))
- Do "typecasting" the way graphql-codegen intends [#14](https://github.com/chromaui/addon-visual-tests/pull/14) ([@tmeasday](https://github.com/tmeasday))
- Add very basic install instructions with details on how to work around jackspeak issue [#12](https://github.com/chromaui/addon-visual-tests/pull/12) ([@tmeasday](https://github.com/tmeasday))
- Implement test screen UI [#7](https://github.com/chromaui/addon-visual-tests/pull/7) ([@ghengeveld](https://github.com/ghengeveld))
- Stricter linting and improved DX [#9](https://github.com/chromaui/addon-visual-tests/pull/9) ([@ghengeveld](https://github.com/ghengeveld))
- Add chromatic, linting, TS checks [#8](https://github.com/chromaui/addon-visual-tests/pull/8) ([@tmeasday](https://github.com/tmeasday) [@thafryer](https://github.com/thafryer) [@ghengeveld](https://github.com/ghengeveld))
- Setup Storybook with light and dark theme and multiple viewports [#6](https://github.com/chromaui/addon-visual-tests/pull/6) ([@ghengeveld](https://github.com/ghengeveld))
- Build: Switch to use pnpm [#5](https://github.com/chromaui/addon-visual-tests/pull/5) ([@ndelangen](https://github.com/ndelangen) [@ghengeveld](https://github.com/ghengeveld) [@weeksling](https://github.com/weeksling))
- Onboarding UI AP-3252 [#2](https://github.com/chromaui/addon-visual-tests/pull/2) ([@ghengeveld](https://github.com/ghengeveld) [@weeksling](https://github.com/weeksling))
- Switch to use node API defined in CLI [#1](https://github.com/chromaui/addon-visual-tests/pull/1) ([@tmeasday](https://github.com/tmeasday))
- Change addon name to `@chromaui/addon-visual-tests` [#4](https://github.com/chromaui/addon-visual-tests/pull/4) ([@tmeasday](https://github.com/tmeasday))

#### ⚠️ Pushed to `main`

- Ensure we checkout with the right token ([@tmeasday](https://github.com/tmeasday))
- empty commit for testing ([@tmeasday](https://github.com/tmeasday))
- Make button say "run tests" ([@tmeasday](https://github.com/tmeasday))
- Very basic first POC ([@tmeasday](https://github.com/tmeasday))
- project setup ([@tmeasday](https://github.com/tmeasday))
- Initial commit ([@tmeasday](https://github.com/tmeasday))

#### Authors: 5

- Gert Hengeveld ([@ghengeveld](https://github.com/ghengeveld))
- Jarel Fryer ([@thafryer](https://github.com/thafryer))
- Matthew Weeks ([@weeksling](https://github.com/weeksling))
- Norbert de Langen ([@ndelangen](https://github.com/ndelangen))
- Tom Coleman ([@tmeasday](https://github.com/tmeasday))
