import weakMemoize from "@emotion/weak-memoize";
import { css, styled } from "@storybook/theming";
import React, { ComponentProps, ReactNode } from "react";

import { inlineGlow } from "../shared/animation";
import { background, color, typography } from "../shared/styles";

const Left = styled.span({});
const Title = styled.span({
  fontWeight: typography.weight.bold,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});
const Center = styled.span({});
const Right = styled.span({});

const ItemWrapper = styled.li(({ theme }) => ({
  listStyle: "none",

  "&:not(:first-child)": {
    borderTop: `1px solid ${theme.base === "light" ? theme.color.border : theme.color.darker}`,
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

const linkStyles = (props: LinkStyleProps) => css`
  font-size: ${typography.size.s1}px;
  transition: all 150ms ease-out;
  color: ${color.mediumdark};
  text-decoration: none;
  display: block;

  /* Styling */
  .sbds-list-item-title {
    color: ${color.darker};

    // TODO use theme instead
    //color: theme.base === "light" ? theme.color.darker : theme.//color.lighter,
  }

  .sbds-list-item-right svg {
    transition: all 200ms ease-out;
    opacity: 0;
    height: 12px;
    width: 12px;
    margin: 3px 0;
    vertical-align: top;

    path {
      fill: ${color.mediumdark};
    }
  }

  &:hover {
    background: ${background.calmBlue};
    cursor: pointer;

    .sbds-list-item-right svg {
      opacity: 1;
    }
  }

  ${props.active &&
  css`
    .sbds-list-item-title {
      font-weight: ${typography.weight.bold};
    }
    .sbds-list-item-title,
    .sbds-list-item-center {
      color: ${props.activeColor};
    }

    .sbds-list-item-right svg {
      opacity: 1;
      path {
        fill: ${props.activeColor};
      }
    }
  `};

  ${props.isLoading &&
  css`
    .sbds-list-item-title {
      ${inlineGlow};
      flex: 0 1 auto;
      display: inline-block;
    }
  `};

  ${props.disabled &&
  css`
    cursor: not-allowed !important;
    .sbds-list-item-title,
    .sbds-list-item-center {
      color: ${color.mediumdark};
    }
  `};
`;

const Item = styled(
  ({
    active,
    activeColor,
    isLoading,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkStyleProps) => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a {...rest} />;
  }
)`
  ${linkStyles}
`;

// `LinkWrapper` is an input prop that gets internally wrapped with this function here
// `weakMemoize` ensures that for any given `LinkWrapper` we always createa single "WrappedLinkWrapper"
// without this memoization the `LinkWrapper` gets *remounted* each render
// this happens because React can't reconcile it correctly, given that the component's type (a styled component) is recreated each render
const buildStyledLinkWrapper = weakMemoize(
  (LinkWrapper: LinkWrapperType) => styled(
    ({
      active,
      isLoading,
      activeColor,
      ...linkWrapperRest
    }: ComponentProps<LinkWrapperType> & LinkStyleProps) => <LinkWrapper {...linkWrapperRest} />
  )`
    ${linkStyles}
  `
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
}

export const ListItem = ({
  appearance = "primary",
  left,
  title = <span>Loading</span>,
  center,
  right,
  onClick,
  LinkWrapper,
  ...rest
}: ListItemProps & Omit<StyledLinkWrapperProps, "activeColor">) => {
  const listItemActiveColor = color[appearance];
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
