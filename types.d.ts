declare module '*.png' {
  const content: any;
  export default content;
}

declare module 'storybook/internal/components' {
  interface PopoverProviderProps {
    ariaLabel?: string;
  }
}
