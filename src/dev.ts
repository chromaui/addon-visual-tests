import config from "./index";

export default {
  ...config,
  managerEntries: [require.resolve("./manager.tsx")],
};
