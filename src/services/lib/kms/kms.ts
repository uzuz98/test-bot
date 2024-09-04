import {AWSRoutableResource} from '../../controllers/LocationRoutingController'

export interface KMS {
  identityRoute: AWSRoutableResource
  kmsRoute: AWSRoutableResource

  encrypt(plaintext: Uint8Array): Promise<Uint8Array>
  decrypt(cipher: Uint8Array): Promise<Uint8Array>
}

export interface DEKEncryptor {
  encrypt(plaintext: Uint8Array, dek: Uint8Array): string
  // will generate a new DEK for this operation and return it with the cipher
  encrypt(plaintext: Uint8Array): {cipher: string; dek: Uint8Array}
  decrypt(cipher: string, dek: Uint8Array): Uint8Array
}

export type PlaintextType = Buffer | Uint8Array | Blob | string

export const DEV_IDENTITY_POOL_ROUTE = {
  latitude: 37.926868,
  longitude: -78.024902,
  resourceUri: 'us-east-1:be836f82-4033-4212-b4c0-fe42c517d1d5',
  region: 'us-east-1'
}

export const IDENTITY_POOLS_ROUTES: AWSRoutableResource[] = [
  {
    latitude: 37.926868,
    longitude: -78.024902,
    resourceUri: 'us-east-1:662b2574-190f-4e2a-be17-1ae5ee8d88a4',
    region: 'us-east-1'
  }
]
