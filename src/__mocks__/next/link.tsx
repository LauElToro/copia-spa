import React from 'react';

type LinkProps = {
  href?: string | { pathname?: string; hash?: string };
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const extractHref = (href: LinkProps['href']): string => {
  if (typeof href === 'string') {
    return href;
  }
  if (href?.pathname || href?.hash) {
    return `${href.pathname ?? ''}${href.hash ?? ''}`;
  }
  return '#';
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href = '#', children, ...rest }, ref) => {
    return (
      <a ref={ref} href={extractHref(href)} {...rest}>
        {children}
      </a>
    );
  }
);

Link.displayName = 'NextLinkMock';

export default Link;

