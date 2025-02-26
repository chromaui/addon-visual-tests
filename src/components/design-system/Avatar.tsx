import React, { ComponentProps, FunctionComponent } from "react";
import { css, styled } from "storybook/internal/theming";

import { Icon } from "./Icon";
import { glow } from "./shared/animation";
import { color, typography } from "./shared/styles";

export const sizes = {
  large: 40,
  medium: 28,
  small: 20,
  tiny: 16,
};

export enum AvatarType {
  USER = "user",
  ORGANIZATION = "organization",
}

const Image = styled.div<Partial<Props>>(
  {
    background: "transparent",
    display: "inline-block",
    verticalAlign: "top",
    overflow: "hidden",
    textTransform: "uppercase",

    img: {
      width: "100%",
      height: "auto",
      display: "block",
    },
  },
  (props) => ({
    borderRadius: props.type === AvatarType.USER ? "50%" : 5,

    height: `${sizes[props.size || "medium"]}px`,
    width: `${sizes[props.size || "medium"]}px`,
    lineHeight: `${sizes[props.size || "medium"]}px`,

    ...(props.isLoading && {
      background: color.light,
      filter: "grayscale(1)",
    }),

    ...(!props.src &&
      !props.isLoading && {
        background: "#37D5D3",
      }),
  }),
);

interface LoadingIconProps {
  icon: string;
  type: AvatarType;
}

const LoadingIcon = styled(Icon)<LoadingIconProps & ComponentProps<typeof Icon>>(
  {
    position: "relative",
    margin: "0 auto",
    display: "block",
    verticalAlign: "top",

    path: {
      fill: color.medium,
      animation: `${glow} 1.5s ease-in-out infinite`,
    },
  },
  (props) => ({
    bottom: `${props.type === AvatarType.USER ? -2 : -4}px`,
    height: `${props.type === AvatarType.USER ? 100 : 70}%`,
    width: `${props.type === AvatarType.USER ? 100 : 70}%`,
  }),
);

const Initial = styled.div<Partial<Props>>(
  {
    color: color.lightest,
    textAlign: "center",
  },
  (props) =>
    ({
      tiny: {
        fontSize: `${typography.size.s1 - 2}px`,
        lineHeight: `${sizes.tiny}px`,
      },
      small: {
        fontSize: `${typography.size.s1}px`,
        lineHeight: `${sizes.small}px`,
      },
      medium: {
        fontSize: `${typography.size.s2}px`,
        lineHeight: `${sizes.medium}px`,
      },
      large: {
        fontSize: `${typography.size.s3}px`,
        lineHeight: `${sizes.large}px`,
      },
    })[props.size || "medium"],
);

/**
 * The `Avatar` component is where all your avatars come to play.
 */
export const Avatar: FunctionComponent<Props> = ({
  isLoading = false,
  username = "loading",
  src = undefined,
  size = "medium",
  type = AvatarType.USER,
  ...props
}: Props) => {
  let avatarFigure = (
    <LoadingIcon icon={type === AvatarType.USER ? "useralt" : "repository"} type={type} />
  );
  const a11yProps: ComponentProps<typeof Image> = {};

  if (isLoading) {
    a11yProps["aria-busy"] = true;
    a11yProps["aria-label"] = "Loading avatar ...";
  } else if (src) {
    avatarFigure = <img src={src} alt={username} />;
  } else {
    a11yProps["aria-label"] = username;
    avatarFigure = (
      <Initial size={size} aria-hidden="true">
        {username.substring(0, 1)}
      </Initial>
    );
  }

  return (
    <Image size={size} isLoading={isLoading} src={src} type={type} {...a11yProps} {...props}>
      {avatarFigure}
    </Image>
  );
};

interface Props {
  isLoading?: boolean;
  /** The name of the user (not the nice name) */
  username?: string;
  src?: string;
  /** Specify size */
  size?: keyof typeof sizes;
  type?: AvatarType;
}
