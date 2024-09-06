/**
 * Evaluate the given polinomial over GF(256) (with MAX_SHARES = 255)
 *
 * https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L364
 */
export declare function horner(x: number, coeffs: number[]): number;
