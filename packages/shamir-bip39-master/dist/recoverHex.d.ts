/**
 * Recovers a hex secret from the given shares.
 *
 * Based on https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L549
 */
export declare function recoverHex(shares: Record<string, string>): string;
