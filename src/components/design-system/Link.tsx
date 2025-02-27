import { darken } from 'polished';
import React, { ComponentProps, forwardRef } from 'react';
import { styled } from 'storybook/internal/theming';

import { Icon } from './Icon';
import { color } from './shared/styles';

const LinkInner = styled.span<{ withArrow: boolean }>(
  (props) =>
    props.withArrow && {
      '> svg:last-of-type': {
        height: '0.65em',
        width: '0.65em',
        marginRight: 0,
        marginLeft: '0.25em',
        bottom: 'auto',
        verticalAlign: 'inherit',
      },
    }
);

export interface StyledLinkProps {
  secondary?: boolean;
  tertiary?: boolean;
  nochrome?: boolean;
  inverse?: boolean;
}

const StyledLink = styled.a<StyledLinkProps>(
  {
    display: 'inline-block',
    transition: 'transform 150ms ease-out, color 150ms ease-out',
    textDecoration: 'none',
    color: color.secondary,

    '&:hover, &:focus-visible': {
      cursor: 'pointer',
      transform: 'translateY(-1px)',
      color: darken(0.07, color.secondary),
    },

    '&:active': {
      transform: 'translateY(0)',
      color: darken(0.1, color.secondary),
    },

    svg: {
      display: 'inline-block',
      height: '1em',
      width: '1em',
      verticalAlign: 'text-top',
      position: 'relative',
      bottom: '-0.125em',
      marginRight: '0.4em',
    },
  },
  (props) => ({
    ...(props.secondary && {
      color: props.theme.base === 'light' ? color.mediumdark : color.medium,

      '&:hover': {
        color: props.theme.base === 'light' ? color.dark : color.light,
      },

      '&:active': {
        color: props.theme.base === 'light' ? color.darker : color.lighter,
      },
    }),

    ...(props.tertiary && {
      color: color.dark,

      '&:hover': {
        color: color.darkest,
      },

      '&:active': {
        color: color.mediumdark,
      },
    }),

    ...(props.nochrome && {
      color: 'inherit',

      '&:hover, &:active': {
        color: 'inherit',
        textDecoration: 'underline',
      },
    }),

    ...(props.inverse && {
      color: color.lightest,

      '&:hover': {
        color: color.lighter,
      },

      '&:active': {
        color: color.light,
      },
    }),
  })
);

const UnstyledLink = styled.a({});

const LinkButton = styled.button({
  background: 'none',
  border: 'none',
  padding: '0',
  font: 'inherit',
  cursor: 'pointer',
});

/**
 * Links can contains text and/or icons. Be careful using only icons, you must provide a text alternative via aria-label for accessibility.
 */
export type LinkProps = React.ComponentProps<typeof StyledLink> & {
  withArrow?: boolean;
  isButton?: boolean;
  LinkWrapper?: React.ComponentType<any>;
};

// The main purpose of this component is to strip certain props that get passed
// down to the styled component, so that we don't end up passing them to a
// tag which would throw warnings for non-standard props.
const LinkComponentPicker = forwardRef<HTMLAnchorElement | HTMLButtonElement, LinkProps>(
  ({ inverse, isButton, LinkWrapper, nochrome, secondary, tertiary, ...rest }: LinkProps, ref) => {
    // Use the UnstyledLink here to avoid duplicating styles and creating
    // specificity conflicts by first rendering the StyledLink higher up the chain
    // and then re-rendering it through the 'as' prop.
    /* eslint no-else-return: ["error", { allowElseIf: true }] */
    if (isButton) {
      return <LinkButton {...(rest as any)} ref={ref as React.ForwardedRef<HTMLButtonElement>} />;
    } else if (LinkWrapper) {
      return <LinkWrapper {...rest} ref={ref} />;
    }

    return <UnstyledLink {...rest} ref={ref as React.ForwardedRef<HTMLAnchorElement>} />;
  }
);
LinkComponentPicker.displayName = 'LinkComponentPicker';

export const Link = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  LinkProps & ComponentProps<typeof StyledLink>
>(({ children, withArrow, ...rest }, ref) => {
  const content = (
    <>
      <LinkInner withArrow={!!withArrow}>
        {children}
        {withArrow && <Icon icon="arrowright" />}
      </LinkInner>
    </>
  );

  return (
    <StyledLink
      as={LinkComponentPicker}
      ref={ref as React.ForwardedRef<HTMLAnchorElement>}
      {...rest}
    >
      {content}
    </StyledLink>
  );
});
Link.displayName = 'Link';

Link.defaultProps = {
  withArrow: false,
  isButton: false,
  secondary: false,
  tertiary: false,
  nochrome: false,
  inverse: false,
};
