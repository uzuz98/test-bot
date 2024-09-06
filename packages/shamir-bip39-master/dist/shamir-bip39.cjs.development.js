'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var bip39 = require('bip39');
var randomBytes = _interopDefault(require('randombytes'));

/**
 * Pads a string with the given padString on the left until the specified length is achieved
 * @param str The string to pad
 * @param padString The string to add
 * @param length The desired length of the result
 */
function leftPad(str, padString, length) {
  while (str.length < length) {
    str = padString + str;
  }
  return str;
}

function isHex(hex) {
  return !!hex.match(/^[0-9a-fA-F]+$/);
}
/**
 * Given a hex string, return a vector of numbers, where
 * each number belongs to GF(256)
 */
function hexToIntVector(hex) {
  /* istanbul ignore if */
  if (!isHex(hex)) {
    throw new Error("Expected a hex string, but got " + hex);
  }
  /**
   * Any two digit hex number belongs to GF(256), so we will split the given
   * hex string into an array of two digit hex strings and then convert to
   * numbers.
   */
  // If we have an odd number of digits, padd a 0 to the front to preserve the
  // full number.
  // Note, this will never occur with a valid BIP39 entropy
  var paddedSecret = leftPad(hex, '0', hex.length + hex.length % 2);
  // Split the string into an array of strings with two hex characters each.
  var splitSecret = paddedSecret.match(/.{1,2}/g);
  // Convert the hex strings to integers.
  return splitSecret.map(function (value) {
    return parseInt(value, 16);
  });
}

var PRIMITIVE_POLYNOMIAL = 29;
var BIT_COUNT = 8;
var BIT_SIZE = /*#__PURE__*/Math.pow(2, BIT_COUNT);
var MAX_SHARES = BIT_SIZE - 1;

var logs = [];
var exps = [];
for (var i = 0, x = 1; i < BIT_SIZE; ++i) {
  exps[i] = x;
  logs[x] = i;
  x = x << 1;
  if (x >= BIT_SIZE) {
    x = x ^ PRIMITIVE_POLYNOMIAL;
    x = x & MAX_SHARES;
  }
}

/**
 * Evaluate the Lagrange interpolation polynomial at x = `at`
 * using x and y Arrays that are of the same length, with
 * corresponding elements constituting points on the polynomial.
 *
 * Based on https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L385
 */
function lagrange(at, x, y) {
  var sum = 0;
  var product;
  for (var i = 0; i < x.length; i++) {
    if (y[i]) {
      product = logs[y[i]];
      for (var j = 0; j < x.length; j++) {
        if (i !== j) {
          /* istanbul ignore if */
          if (at === x[j]) {
            // happens when computing a share that is in the list of shares used to compute it
            product = -1; // fix for a zero product term, after which the sum should be sum^0 = sum, not sum^1
            break;
          }
          product = (product + logs[at ^ x[j]] - logs[x[i] ^ x[j]] + MAX_SHARES) % MAX_SHARES; // to make sure it's not negative
        }
      }
      // though exps[-1] === undefined and undefined ^ anything = anything in
      // chrome, this behavior may not hold everywhere, so do the check
      /* istanbul ignore next */
      sum = product === -1 ? sum : sum ^ exps[product];
    }
  }
  return sum;
}

/**
 * Recovers a hex secret from the given shares.
 *
 * Based on https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L549
 */
function recoverHex(shares) {
  var x = [];
  var y = [];
  // Split each share's hex data into an Array of Integers,
  // then 'rotate' those arrays where the first element of each row is converted to
  // its own array, the second element of each to its own Array, and so on for all of the rest.
  // Essentially zipping all of the shares together.
  //
  // e.g.
  //   [ 193, 186, 29, 150, 5, 120, 44, 46, 49, 59, 6, 1, 102, 98, 177, 196 ]
  //   [ 53, 105, 139, 49, 187, 240, 91, 92, 98, 118, 12, 2, 204, 196, 127, 149 ]
  //   [ 146, 211, 249, 167, 209, 136, 118, 114, 83, 77, 10, 3, 170, 166, 206, 81 ]
  //
  // becomes:
  //
  // [ [ 193, 53, 146 ],
  //   [ 186, 105, 211 ],
  //   [ 29, 139, 249 ],
  //   [ 150, 49, 167 ],
  //   [ 5, 187, 209 ],
  //   [ 120, 240, 136 ],
  //   [ 44, 91, 118 ],
  //   [ 46, 92, 114 ],
  //   [ 49, 98, 83 ],
  //   [ 59, 118, 77 ],
  //   [ 6, 12, 10 ],
  //   [ 1, 2, 3 ],
  //   [ 102, 204, 170 ],
  //   [ 98, 196, 166 ],
  //   [ 177, 127, 206 ],
  //   [ 196, 149, 81 ] ]
  //
  Object.keys(shares).forEach(function (shareId) {
    var share = hexToIntVector(shares[shareId]);
    x.push(parseInt(shareId, 10));
    for (var j = 0; j < share.length; j++) {
      y[j] = y[j] || [];
      y[j][x.length - 1] = share[j];
    }
  });
  return y.map(function (part) {
    return lagrange(0, x, part);
  }).reduce(function (accum, part) {
    var partHex = leftPad(part.toString(16), '0', 2);
    return accum + partHex;
  }, '');
}

function recoverMnemonic(shares) {
  var hexShares = Object.keys(shares).reduce(function (accum, id) {
    var hexShare = bip39.mnemonicToEntropy(shares[id]);
    accum[id] = hexShare;
    return accum;
  }, {});
  var entropy = recoverHex(hexShares);
  return bip39.entropyToMnemonic(entropy);
}

/**
 * Evaluate the given polinomial over GF(256) (with MAX_SHARES = 255)
 *
 * https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L364
 */
function horner(x, coeffs) {
  var fx = 0;
  for (var i = coeffs.length - 1; i >= 0; --i) {
    if (fx !== 0) {
      fx = exps[(logs[x] + logs[fx]) % MAX_SHARES] ^ coeffs[i];
    } else {
      fx = coeffs[i];
    }
  }
  return fx;
}

/**
 * Split a hex secrety into numShares, requiring threshold shares to recover.
 *
 * Note: No input validation at this point.
 * Based on https://github.com/grempe/secrets.js/blob/14a4b682a28242b1dbe5506674b5d5f476b78dbf/secrets.js#L901
 */
function splitHex(secret, numShares, threshold) {
  return hexToIntVector(secret).map(function (s) {
    var randomValues = Array(threshold - 1).fill(0).map(function () {
      return randomBytes(1);
    }).map(function (buf) {
      return buf.toString('hex');
    }).map(function (v) {
      return parseInt(v, 16);
    });
    var coeffs = [s].concat(randomValues);
    return Array(numShares).fill(0).map(function (_, i) {
      var x = i + 1;
      return {
        x: x,
        y: horner(x, coeffs)
      };
    });
  }).map(function (current) {
    return current.map(function (share) {
      var hexY = leftPad(share.y.toString(16), '0', 2);
      return {
        x: share.x.toString(),
        y: hexY
      };
    });
  }).reduce(function (accum, current) {
    current.forEach(function (share) {
      if (!accum[share.x]) {
        accum[share.x] = share.y;
      } else {
        accum[share.x] += share.y;
      }
    });
    return accum;
  }, {});
}

function splitMnemonic(mnemonic, numShares, threshold) {
  var entropy = bip39.mnemonicToEntropy(mnemonic);
  var hexShares = splitHex(entropy, numShares, threshold);
  return Object.keys(hexShares).reduce(function (accum, id) {
    var mnemonicShare = bip39.entropyToMnemonic(hexShares[id]);
    accum[id] = mnemonicShare;
    return accum;
  }, {});
}

function deriveHex(shares, at) {
  var x = [];
  var y = [];
  Object.keys(shares).forEach(function (shareId) {
    var share = hexToIntVector(shares[shareId]);
    x.push(parseInt(shareId, 10));
    for (var j = 0; j < share.length; j++) {
      y[j] = y[j] || [];
      y[j][x.length - 1] = share[j];
    }
  });
  return y.map(function (part) {
    return lagrange(at, x, part);
  }).reduce(function (accum, part) {
    var partHex = leftPad(part.toString(16), '0', 2);
    return accum + partHex;
  }, '');
}

function deriveShare(shares, at) {
  var hexShares = Object.keys(shares).reduce(function (accum, id) {
    var hexShare = bip39.mnemonicToEntropy(shares[id]);
    accum[id] = hexShare;
    return accum;
  }, {});
  var entropy = deriveHex(hexShares, at);
  var derivedShare = {};
  derivedShare[at.toString()] = bip39.entropyToMnemonic(entropy);
  return derivedShare;
}

exports.deriveShare = deriveShare;
exports.recoverMnemonic = recoverMnemonic;
exports.splitMnemonic = splitMnemonic;
//# sourceMappingURL=shamir-bip39.cjs.development.js.map
