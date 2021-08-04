const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0);

const mean = (numbers: number[]) => {
  return sum(numbers) / numbers.length;
};

const square = (number: number) => number * number;

type Coordinates = [number, number]; // x and y

/**
 * It take a list of coordinates and apply a Pearson correlation coefficient algorithm
 *
 * The computed result is a number between -1 and 1
 */
export const computeCorrelationCoef = (coords: Coordinates[]): number => {
  const xs = coords.map(([x]) => x);
  const ys = coords.map(([, y]) => y);

  const meanX = mean(xs);
  const meanY = mean(ys);

  const dividend = sum(coords.map(([x, y]) => (x - meanX) * (y - meanY)));
  const divisor = Math.sqrt(
    sum(coords.map(([x]) => square(x - meanX))) * sum(coords.map(([, y]) => square(y - meanY))),
  );

  // ! hack to prevent NaN value to be returned
  if (divisor === 0) {
    return 0;
  }

  return dividend / divisor;
};
