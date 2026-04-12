export const checkOutdated = (
  buildInfo?: {
    branch?: string;
    commit?: string;
    uncommittedHash?: string | null;
  },
  gitInfo?: {
    branch: string;
    commit: string;
    uncommittedHash?: string | null;
  }
) => {
  if (!buildInfo?.branch || !gitInfo?.branch) {
    return false;
  }
  return (
    buildInfo.branch.split(':').at(-1) !== gitInfo.branch ||
    buildInfo.commit !== gitInfo.commit ||
    buildInfo.uncommittedHash !== gitInfo.uncommittedHash
  );
};
