import type { ImgHTMLAttributes } from 'react';

import LogoImage from '@documenso/assets/logo.png';

export type LogoProps = ImgHTMLAttributes<HTMLImageElement>;

export const BrandingLogo = ({ alt = 'LIUX Logo', ...props }: LogoProps) => {
  return <img src={LogoImage} alt={alt} {...props} />;
};
