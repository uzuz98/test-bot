/**
 * Split a hex secrety into numShares, requiring threshold shares to recover.
 *
 * Note: No input validation at this point.
 * Based on https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L901
 */
export declare function splitHex(secret: string, numShares: number, threshold: number): Record<string, string>;
