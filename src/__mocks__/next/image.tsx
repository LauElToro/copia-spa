/* eslint-disable @next/next/no-img-element */
import React from 'react';

type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  style?: React.CSSProperties;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'>;

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    { src, alt, width, height, fill, className, style, loading, priority, ...rest },
    ref,
  ) => {
    const computedStyle: React.CSSProperties = {
      objectFit: fill ? 'cover' : style?.objectFit,
      width: fill ? '100%' : width,
      height: fill ? '100%' : height,
      ...style,
    };

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={className}
        style={computedStyle}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={loading ?? (priority ? 'eager' : 'lazy')}
        data-testid="next-image-mock"
        {...rest}
      />
    );
  },
);

Image.displayName = 'NextImageMock';

export default Image;

