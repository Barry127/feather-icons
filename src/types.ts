import { AllHTMLAttributes, SVGProps } from 'react';

export interface IIcon {
  tag: keyof JSX.IntrinsicElements;
  attrs: SVGProps<Element> & AllHTMLAttributes<Element>;
  children?: this[];
}
