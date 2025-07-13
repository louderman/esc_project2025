import { type SVGProps } from 'react';
const Chevron = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlSpace='preserve'
    width={10}
    height={10}
    fill='gray'
    viewBox='0 0 407.436 407.436'
    {...props}
  >
    <path d='M112.814 0 91.566 21.178l181.946 182.54-181.946 182.54 21.248 21.178 203.055-203.718z' />
  </svg>
);
export default Chevron;
