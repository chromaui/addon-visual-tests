import { useContext } from "react";

export const useRequiredContext = <T>(context: React.Context<T>, name: string) => {
  const value = useContext(context);
  if (value === null || value === undefined) throw new Error(`Missing context value for ${name}`);
  return value as NonNullable<T>;
};
