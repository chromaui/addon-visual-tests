export const getValue = `experimental_useAddonState_getValue`;
export type GetValuePayload = {
  key: string;
};

export const setValue = `experimental_useAddonState_setValue`;
export type SetValuePayload = {
  key: string;
  value: any;
};
