import { useEffect } from "react";

export function PulsatingEffect({ targetSelector }: { targetSelector: string }): JSX.Element {
  useEffect(() => {
    const element = document.querySelector<HTMLElement>(targetSelector);

    if (element) {
      element.style.animation = "pulsate 3s infinite";
      element.style.transformOrigin = "center";
      element.style.animationTimingFunction = "ease-in-out";

      const keyframes = `
        @keyframes pulsate {
          0% {
            box-shadow: 0 0 0 0 rgba(2, 156, 253, 0.7), 0 0 0 0 rgba(2, 156, 253, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(2, 156, 253, 0), 0 0 0 40px rgba(2, 156, 253, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(2, 156, 253, 0), 0 0 0 0 rgba(2, 156, 253, 0);
          }
        }
      `;
      const style = document.createElement("style");
      style.id = "sb-onboarding-pulsating-effect";
      style.innerHTML = keyframes;
      document.head.appendChild(style);
    }

    return () => {
      const styleElement = document.querySelector("#sb-onboarding-pulsating-effect");

      if (styleElement) {
        styleElement.remove();
      }

      if (element) {
        element.style.animation = "auto";
      }
    };
  }, [targetSelector]);

  return null;
}
