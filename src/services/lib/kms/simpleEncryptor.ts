import * as crypto from 'crypto-js'
import { DEKEncryptor } from './kms'

const KEY_SIZE = 256

export const ITERATIONS_SINGLE = 1
export const ITERATIONS_WEAK = 100
export const ITERATIONS_LITE = 1000
export const ITERATIONS_SECURE = 10000

export function encrypt(msg: string, pass: string, iterations = ITERATIONS_SECURE) {
  const salt = crypto.lib.WordArray.random(128 / 8)

  const key = crypto.PBKDF2(pass, salt, {
    keySize: KEY_SIZE / 32,
    iterations
  })

  const iv = crypto.lib.WordArray.random(128 / 8)

  const encrypted = crypto.AES.encrypt(msg, key, {
    iv: iv,
    padding: crypto.pad.Pkcs7,
    mode: crypto.mode.CBC
  })

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use in decryption
  const transitmessage = salt.toString() + iv.toString() + encrypted.toString()
  return transitmessage
}

export function decrypt(transitmessage: string, pass: string, iterations = ITERATIONS_SECURE) {
  const salt = crypto.enc.Hex.parse(transitmessage.substr(0, 32))
  const iv = crypto.enc.Hex.parse(transitmessage.substr(32, 32))
  const encrypted = transitmessage.substring(64)

  const key = crypto.PBKDF2(pass, salt, {
    keySize: KEY_SIZE / 32,
    iterations
  })

  const decrypted = crypto.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: crypto.pad.Pkcs7,
    mode: crypto.mode.CBC
  })
  return decrypted.toString(crypto.enc.Utf8)
}

// idea from https://github.com/anthonykirby/lora-packet/blob/master/src/lib/crypto.ts
const DEFAULTIV = crypto.enc.Hex.parse('00000000000000000000000000000000')

function generateCipher(plaintext: Uint8Array, dek: Uint8Array): string {
  const keyToPass = crypto.enc.Hex.parse(new TextDecoder().decode(dek))
  const textToPass = Buffer.from(plaintext).toString('hex')

  const encrypted = crypto.AES.encrypt(textToPass, keyToPass, {
    iv: DEFAULTIV,
    padding: crypto.pad.Pkcs7,
    mode: crypto.mode.CBC
  })
  // console.log(Uint8Array.from(Buffer.from(crypto.enc.Utf8.stringify(test1), 'hex')))

  return crypto.enc.Base64.stringify(encrypted.ciphertext)
}

export class SimpleEncryptor implements DEKEncryptor {
  encrypt(plaintext: Uint8Array, dek: Uint8Array): string
  encrypt(plaintext: Uint8Array): { cipher: string; dek: Uint8Array }
  encrypt(plaintext: Uint8Array, dek?: any): string | { cipher: string; dek: Uint8Array } {
    if (!dek) {
      const key256bit = crypto.PBKDF2(
        crypto.lib.WordArray.random(128),
        crypto.lib.WordArray.random(128 / 8),
        {
          keySize: 8,
          iterations: ITERATIONS_SECURE
        }
      )
      const newKey = new TextEncoder().encode(crypto.enc.Hex.stringify(key256bit))
      return { cipher: generateCipher(plaintext, newKey), dek: newKey }
    } else {
      return generateCipher(plaintext, dek)
    }
  }
  decrypt(cipher: string, dek: Uint8Array): Uint8Array {
    const keyToPass = crypto.enc.Hex.parse(new TextDecoder().decode(dek))

    const plaintext = crypto.AES.decrypt(cipher, keyToPass, {
      iv: DEFAULTIV,
      padding: crypto.pad.Pkcs7,
      mode: crypto.mode.CBC
    })
    // console.log(plaintext)
    return Uint8Array.from(Buffer.from(crypto.enc.Utf8.stringify(plaintext), 'hex'))
  }
}
