import { take, drop } from 'ramda';

export const rotateRight = <T>(xs: T[], n: number): T[] => {
  if (!n) {
    return xs;
  }
  return [...drop(n, xs), ...take(n, xs)];
};

export const rotateLeft = <T>(xs: T[], n: number): T[] => {
  if (!n) {
    return xs;
  }
  return [...drop(xs.length - n, xs), ...take(xs.length - n, xs)];
};
