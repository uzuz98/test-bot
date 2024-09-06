/**
 * Evaluate the Lagrange interpolation polynomial at x = `at`
 * using x and y Arrays that are of the same length, with
 * corresponding elements constituting points on the polynomial.
 *
 * Based on https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L385
 */
export declare function lagrange(at: number, x: number[], y: number[]): number;
