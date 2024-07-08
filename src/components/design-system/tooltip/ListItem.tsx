import weakMemoize from "@emotion/weak-memoize";
import React, { ComponentProps, ReactNode } from "react";
import { styled, type Theme, useTheme } from "storybook/internal/theming";

import { inlineGlow } from "../shared/animation";

const Left = styled.span({});
const Title = styled.span(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));
const Center = styled.span({});
const Right = styled.span({});

const ItemWrapper = styled.li(({ theme }) => ({
  listStyle: "none",

  "&:not(:first-of-type)": {
    borderTop: `1px solid ${theme.appBorderColor}`,
  },
}));

const ItemInner = styled.span({
  lineHeight: "18px",
  padding: "7px 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  ".sbds-list-item-title": {
    display: "block",
    flex: "0 1 auto",
    marginRight: "auto",
  },

  ".sbds-list-item-left, .sbds-list-item-center, .sbds-list-item-right": {
    display: "inline-flex",
  },

  ".sbds-list-item-center": {
    flex: "0 1 auto",
    marginLeft: "auto",
    marginRight: "auto",
  },

  ".sbds-list-item-left, .sbds-list-item-right": { flex: "0 1 auto" },

  ".sbds-list-item-right": {
    flex: "none",
    textAlign: "right",
    marginLeft: 10,
  },
});

interface LinkStyleProps {
  activeColor: string;
  active?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

const linkStyles = ({
  active,
  activeColor,
  disabled,
  isLoading,
  theme,
}: LinkStyleProps & { theme: Theme }) => ({
  fontSize: `${theme.typography.size.s1}px`,
  transition: "all 150ms ease-out",
  color: theme.color.mediumdark,
  textDecoration: "none",
  display: "block",

  /* Styling */
  ".sbds-list-item-title": {
    color: theme.base === "light" ? theme.color.darker : theme.color.lighter,
  },

  ".sbds-list-item-right svg": {
    transition: "all 200ms ease-out",
    opacity: 0,
    height: 12,
    width: 12,
    margin: "3px 0",
    verticalAlign: "top",

    path: {
      fill: theme.color.mediumdark,
    },
  },

  "&:hover": {
    background: theme.background.hoverable,
    cursor: "pointer",

    ".sbds-list-item-right svg": {
      opacity: 1,
    },
  },

  ...(active && {
    ".sbds-list-item-title": {
      fontWeight: theme.typography.weight.bold,
    },
    ".sbds-list-item-title, .sbds-list-item-center": {
      color: activeColor,
    },
    ".sbds-list-item-right svg": {
      opacity: 1,
      path: {
        fill: activeColor,
      },
    },
  }),

  ...(isLoading && {
    ".sbds-list-item-title": {
      ...inlineGlow,
      flex: "0 1 auto",
      display: "inline-block",
    },
  }),

  ...(disabled && {
    cursor: "not-allowed !important",
    ".sbds-list-item-title, .sbds-list-item-center": {
      color: theme.color.mediumdark,
    },
  }),
});

const LinkItem = styled(
  ({
    active,
    activeColor,
    isLoading,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkStyleProps) => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a {...rest} />;
  }
)(linkStyles);

const NormalItem = styled.span(linkStyles);

// `LinkWrapper` is an input prop that gets internally wrapped with this function here
// `weakMemoize` ensures that for any given `LinkWrapper` we always createa single "WrappedLinkWrapper"
// without this memoization the `LinkWrapper` gets *remounted* each render
// this happens because React can't reconcile it correctly, given that the component's type (a styled component) is recreated each render
const buildStyledLinkWrapper = weakMemoize((LinkWrapper: LinkWrapperType) =>
  styled(
    ({
      active,
      isLoading,
      activeColor,
      ...linkWrapperRest
    }: ComponentProps<LinkWrapperType> & LinkStyleProps) => <LinkWrapper {...linkWrapperRest} />
  )(linkStyles)
);

type StyledLinkWrapperProps = ComponentProps<ReturnType<typeof buildStyledLinkWrapper>>;

interface ListItemProps {
  appearance?: "primary" | "secondary";
  isLoading?: boolean;
  left?: ReactNode;
  title?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  LinkWrapper?: LinkWrapperType | null;
  onClick?: ComponentProps<typeof ItemInner>["onClick"];
  isLink?: boolean;
}

export const ListItem = ({
  appearance = "primary",
  left,
  title = <span>Loading</span>,
  center,
  right,
  onClick,
  LinkWrapper,
  isLink = true,
  ...rest
}: ListItemProps & Omit<StyledLinkWrapperProps, "activeColor">) => {
  const theme = useTheme();
  const listItemActiveColor = theme.color[appearance];
  const linkInner = (
    <ItemInner onClick={onClick} role="presentation">
      {left && <Left className="sbds-list-item-left">{left}</Left>}
      {title && <Title className="sbds-list-item-title">{title}</Title>}
      {center && <Center className="sbds-list-item-center">{center}</Center>}
      {right && <Right className="sbds-list-item-right">{right}</Right>}
    </ItemInner>
  );

  if (LinkWrapper) {
    const StyledLinkWrapper = buildStyledLinkWrapper(LinkWrapper);

    return (
      <ItemWrapper>
        <StyledLinkWrapper activeColor={listItemActiveColor} {...rest}>
          {linkInner}
        </StyledLinkWrapper>
      </ItemWrapper>
    );
  }

  const Item = isLink ? LinkItem : NormalItem;

  return (
    <ItemWrapper>
      <Item activeColor={listItemActiveColor} {...rest}>
        {linkInner}
      </Item>
    </ItemWrapper>
  );
};

type AnyProps = Record<string, any>;
type LinkWrapperType = (props: AnyProps) => React.ReactElement<any, any>;
