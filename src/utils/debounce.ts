const timeoutIds = new Map<string, number>();

export const debounce = (
  key: string,
  callback: (...args: any[]) => unknown,
  wait: number,
  leading = true
) => {
  const cancel = () => {
    window.clearTimeout(timeoutIds.get(key));
    timeoutIds.delete(key);
  };
  const debounced = (...args: any[]) => {
    if (timeoutIds.has(key)) cancel();
    else if (leading) callback(...args); // Leading edge call

    timeoutIds.set(
      key,
      window.setTimeout(() => timeoutIds.delete(key) && callback(...args), wait) // Trailing edge call
    );
  };
  debounced.cancel = cancel;
  return debounced;
};
