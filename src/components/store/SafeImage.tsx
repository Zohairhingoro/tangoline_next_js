"use client";

/* eslint-disable @next/next/no-img-element */

type SafeImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError"> & {
  fallbackSrc?: string;
};

export function SafeImage({
  fallbackSrc = "/images/product-placeholder.svg",
  alt = "",
  ...props
}: SafeImageProps) {
  return (
    <img
      {...props}
      alt={alt}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
