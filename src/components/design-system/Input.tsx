import React, {
  ComponentProps,
  forwardRef,
  MutableRefObject,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TooltipMessage, WithTooltip } from "storybook/internal/components";
import { css, styled } from "storybook/internal/theming";

import { Icon } from "./Icon";
import { Link } from "./Link";
import { jiggle } from "./shared/animation";
import { color, spacing, typography } from "./shared/styles";

const Label = styled.label<Pick<PureInputProps, "appearance">>((props) => ({
  ...(props.appearance !== "code" && {
    fontWeight: typography.weight.bold,
  }),
  ...(props.appearance === "code"
    ? {
        fontFamily: typography.type.code,
        fontSize: `${typography.size.s1 - 1}px`,
        lineHeight: "16px",
      }
    : {
        fontSize: `${typography.size.s2}px`,
        lineHeight: "20px",
      }),
}));

const LabelWrapper = styled.div<Pick<PureInputProps, "hideLabel">>([
  {
    marginBottom: 8,
  },
  // @ts-expect-error — Emotion doesn't like !important
  (props) =>
    props.hideLabel && {
      border: "0px !important",
      clip: "rect(0 0 0 0) !important",
      WebkitClipPath: "inset(100%) !important",
      clipPath: "inset(100%) !important",
      height: "1px !important",
      overflow: "hidden !important",
      padding: "0px !important",
      position: "absolute !important",
      whiteSpace: "nowrap !important",
      width: "1px !important",
    },
]);

const InputEl = styled.input({
  "&::placeholder": {
    color: color.mediumdark,
  },

  appearance: "none",
  border: "none",
  boxSizing: "border-box",
  display: "block",
  outline: "none",
  width: "100%",
  margin: "0",

  "&[disabled]": {
    cursor: "not-allowed",
    opacity: 0.5,
  },

  "&:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 3em ${color.lightest} inset`,
  },
});

const getStackLevelStyling = (props: Pick<PureInputProps, "error" | "stackLevel">) => {
  const radius = 4;
  const stackLevelDefinedStyling = {
    position: "relative",
    ...(props.error && { zIndex: 1 }),

    "&:focus": {
      zIndex: 2,
    },
  };
  switch (props.stackLevel) {
    case "top":
      return {
        borderTopLeftRadius: `${radius}px`,
        borderTopRightRadius: `${radius}px`,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        ...stackLevelDefinedStyling,
      };
    case "middle":
      return {
        borderRadius: 0,
        marginTop: -1,
        ...stackLevelDefinedStyling,
      };
    case "bottom":
      return {
        borderBottomLeftRadius: `${radius}px`,
        borderBottomRightRadius: `${radius}px`,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        marginTop: -1,
        ...stackLevelDefinedStyling,
      };
    default:
      return {
        borderRadius: `${radius}px`,
      };
  }
};

type InputWrapperProps = Pick<
  PureInputProps,
  "error" | "stackLevel" | "appearance" | "startingType" | "icon"
>;

// @ts-expect-error — Emotion is doing something weird with `position` (at least)
const InputWrapper = styled.div<InputWrapperProps>((props) => ({
  display: "inline-block",
  position: "relative",
  verticalAlign: "top",
  width: "100%",

  ".sbds-input-el": {
    position: "relative",
    ...getStackLevelStyling(props),

    background: color.lightest,
    color: color.darkest,
    fontSize: `${typography.size.s2}px`,
    lineHeight: "20px",
    padding: "10px 15px", // 40px tall
    boxShadow: `${color.border} 0 0 0 1px inset`,

    "&:focus": {
      boxShadow: `${color.secondary} 0 0 0 1px inset`,
    },

    ...(props.appearance === "pill" && {
      fontSize: `${typography.size.s1}px`,
      lineHeight: "16px",
      padding: "6px 12px", // 28px tall
      borderRadius: "3em",
      background: "transparent",
    }),

    ...(props.appearance === "code" && {
      fontSize: `${typography.size.s1 - 1}px`,
      lineHeight: "16px",
      fontFamily: typography.type.code,
      borderRadius: `${spacing.borderRadius.small}px`,
      background: color.lightest,
      padding: "8px 10px",
    }),

    ...(props.startingType === "password" && {
      paddingRight: 52,
    }),

    ...(props.icon && {
      paddingLeft: 40,

      ...((props.appearance === "pill" || props.appearance === "code") && {
        paddingLeft: 30,
      }),

      "&:focus + svg path": {
        fill: color.darker,
      },
    }),

    ...(props.error && {
      boxShadow: `${color.red} 0 0 0 1px inset`,

      "&:focus": {
        boxShadow: `${color.red} 0 0 0 1px inset !important`,
      },
    }),
  },

  "> svg": {
    ...(props.icon && {
      transition: "all 150ms ease-out",
      position: "absolute",
      top: "50%",
      zIndex: 3,
      background: "transparent",

      ...(props.appearance === "pill" || props.appearance === "code"
        ? {
            fontSize: `${typography.size.s1}px`,
            height: 12,
            marginTop: -6,
            width: 12,
            left: 10,
          }
        : {
            fontSize: `${typography.size.s2}px`,
            height: 14,
            marginTop: -7,
            width: 14,
            left: props.appearance === "tertiary" ? 0 : 15,
          }),

      path: {
        transition: "all 150ms ease-out",
        fill: color.mediumdark,
      },
    }),

    ...(props.error && {
      animation: `${jiggle} 700ms ease-out`,

      path: {
        fill: color.red,
      },
    }),
  },
}));

const InputContainer = styled.div<Pick<PureInputProps, "orientation">>(
  (props) =>
    props.orientation === "horizontal" && {
      display: "table-row",

      ".sbds-input-label-wrapper, .sbds-input-input-wrapper": {
        display: "table-cell",
      },

      ".sbds-input-label-wrapper": {
        width: 1,
        paddingRight: 20,
        verticalAlign: "middle",
      },

      ".sbds-input-input-wrapper": {
        width: "auto",
      },
    },
);

const ErrorTooltip = styled(WithTooltip)({
  width: "100%",
});

const ErrorTooltipMessage = styled(TooltipMessage)({
  width: 170,
});

const Action = styled.div({
  position: "absolute",
  right: "0",
  minWidth: 45,
  top: "50%",
  transform: "translateY(-50%)",
  fontWeight: "bold",
  fontSize: 11,
  zIndex: 2,
});

const getErrorMessage = ({
  error,
  value,
  lastErrorValue,
}: Pick<PureInputProps, "error" | "value" | "lastErrorValue">) => {
  let errorMessage = typeof error === "function" ? error(value) : error;
  if (lastErrorValue) {
    if (value !== lastErrorValue) {
      errorMessage = null;
    }
  }
  return errorMessage;
};

interface PureInputProps {
  id: string;
  value?: string;
  appearance?: "default" | "pill" | "code" | "tertiary";
  errorTooltipPlacement?: ComponentProps<typeof WithTooltip>["placement"];
  stackLevel?: "top" | "middle" | "bottom";
  label: string;
  hideLabel?: boolean;
  orientation?: "vertical" | "horizontal";
  icon?: ComponentProps<typeof Icon>["icon"];
  error?: ReactNode | ((value: PureInputProps["value"]) => ReactNode);
  suppressErrorMessage?: boolean;
  className?: string;
  lastErrorValue?: string;
  startingType?: string;
  type?: string;
  onActionClick?: (ev: React.MouseEvent<HTMLElement>) => void;
  startFocused?: boolean;
}

export const PureInput = forwardRef<
  HTMLInputElement,
  PureInputProps & ComponentProps<typeof InputEl>
>(
  (
    {
      id,
      appearance = "default",
      className = undefined,
      error = null,
      errorTooltipPlacement = "right",
      hideLabel = false,
      icon = undefined,
      label,
      lastErrorValue = undefined,
      onActionClick = undefined,
      orientation = "vertical",
      stackLevel = undefined,
      startingType = "text",
      suppressErrorMessage = false,
      type = "text",
      value = "",
      ...props
    },
    ref,
  ) => {
    const [errorMessage, setErrorMessage] = useState(
      getErrorMessage({ error, value, lastErrorValue }),
    );
    const errorId = `${id}-error`;

    useEffect(() => {
      setErrorMessage(getErrorMessage({ error, value, lastErrorValue }));
    }, [value, error, lastErrorValue]);

    const inputEl = (
      <InputEl
        className="sbds-input-el"
        id={id}
        // Pass the ref to the actual input element so it can be controlled
        // externally.
        ref={ref}
        value={value}
        type={type}
        aria-describedby={errorId}
        aria-invalid={!!error}
        {...props}
      />
    );

    return (
      <InputContainer orientation={orientation} className={className}>
        <LabelWrapper className="sbds-input-label-wrapper" hideLabel={hideLabel}>
          <Label htmlFor={id} appearance={appearance}>
            {label}
          </Label>
        </LabelWrapper>

        <InputWrapper
          className="sbds-input-input-wrapper"
          error={errorMessage}
          data-error={errorMessage}
          icon={icon}
          appearance={appearance}
          stackLevel={stackLevel}
          startingType={startingType}
        >
          {icon && <Icon icon={icon} aria-hidden />}
          {/**
            The tooltip is rendered regardless of the presence of an error.
            This is done to preserve the focus state of the Input when it is
            used inside of a form that can choose when to show/hide error
            states based on various factors.
          */}
          <ErrorTooltip
            tabIndex={-1}
            placement={errorTooltipPlacement}
            startOpen
            hasChrome={!!errorMessage && !suppressErrorMessage}
            tooltip={
              errorMessage && !suppressErrorMessage && <ErrorTooltipMessage desc={errorMessage} />
            }
            role="none"
          >
            {inputEl}
          </ErrorTooltip>

          {startingType === "password" && (
            <Action>
              <Link isButton tertiary onClick={onActionClick} type="button">
                {type === "password" ? "Show" : "Hide"}
              </Link>
            </Action>
          )}
        </InputWrapper>
      </InputContainer>
    );
  },
);
PureInput.displayName = "PureInput";

export const Input = forwardRef<HTMLInputElement, ComponentProps<typeof PureInput>>(
  ({ type: startingType, startFocused, ...rest }, ref) => {
    const [type, setType] = useState(startingType);
    const togglePasswordType = useCallback(
      (event: SyntheticEvent) => {
        // Make sure this does not submit a form
        event.preventDefault();
        event.stopPropagation();
        if (type === "password") {
          setType("text");
          return;
        }
        setType("password");
      },
      [type, setType],
    );

    // Outside refs take precedence
    const selfRef = useRef();
    const inputRef = (ref as MutableRefObject<HTMLInputElement>) || selfRef;
    const didFocusOnStart = useRef(false);

    useEffect(() => {
      if (inputRef.current && startFocused && !didFocusOnStart.current) {
        inputRef.current.focus();
        didFocusOnStart.current = true;
      }
    }, [inputRef, startFocused, didFocusOnStart]);

    return (
      <PureInput
        ref={inputRef}
        startingType={startingType}
        type={type}
        onActionClick={togglePasswordType}
        {...rest}
      />
    );
  },
);
Input.displayName = "Input";
