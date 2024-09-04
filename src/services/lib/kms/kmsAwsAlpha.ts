import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms'
import { fromCognitoIdentityPool, fromTemporaryCredentials } from '@aws-sdk/credential-providers'
import { User } from 'firebase/auth'
import { DEV_IDENTITY_POOL_ROUTE, IDENTITY_POOLS_ROUTES, KMS } from './kms'
import { isLive } from '../../constants'
import locationRoutingController, {
  AWSRoutableResource
} from '../../controllers/LocationRoutingController'

const KMS_ROUTES: AWSRoutableResource[] = [
  {
    latitude: 37.5665,
    longitude: 126.978,
    resourceUri: 'arn:aws:kms:ap-northeast-2:299151497192:alias/kek',
    region: 'ap-northeast-2'
  },
  {
    latitude: 41.3847,
    longitude: -81.7982,
    resourceUri: 'arn:aws:kms:us-east-2:299151497192:alias/kek',
    region: 'us-east-2'
  }
]

async function initializeKMSClient(
  idToken: string,
  firebaseUser: User,
  identityPoolRoute: AWSRoutableResource,
  kmsRoute: AWSRoutableResource
): Promise<[KMSClient, string]> {
  const credProvider = fromCognitoIdentityPool({
    identityPoolId: identityPoolRoute.resourceUri,
    logins: isLive()
      ? {
          'securetoken.google.com/ramper-prod': idToken
        }
      : {
          'securetoken.google.com/bright-zodiac-339920': idToken
        },
    clientConfig: { region: identityPoolRoute.region },
    userIdentifier: firebaseUser.uid
  })
  const cred = await credProvider()
  const pool = cred.identityId.charAt(cred.identityId.length - 1)

  const roleArn = 'arn:aws:iam::299151497192:role/cognito-pool-' + pool
  const stsCred = fromTemporaryCredentials({
    masterCredentials: credProvider,
    params: { RoleArn: roleArn, DurationSeconds: 900 },
    clientConfig: { region: kmsRoute.region }
  })
  return [new KMSClient({ region: kmsRoute.region, credentials: stsCred }), kmsRoute.resourceUri]
}

export class KMSAwsAlpha implements KMS {
  constructor(
    private firebaseUser: User,
    private idToken: string,
    public identityRoute: AWSRoutableResource,
    public kmsRoute: AWSRoutableResource
  ) {}

  async encrypt(Plaintext: Uint8Array): Promise<Uint8Array> {
    return initializeKMSClient(this.idToken, this.firebaseUser, this.identityRoute, this.kmsRoute)
      .then(x => {
        const command = new EncryptCommand({
          KeyId: x[1],
          Plaintext,
          EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
          EncryptionContext: {
            provider: this.firebaseUser.providerData[0].uid,
            ct: this.firebaseUser.metadata.creationTime || ''
          }
        })
        return x[0].send(command)
      })
      .then(res => res.CiphertextBlob!)
  }

  async decrypt(CiphertextBlob: Uint8Array): Promise<Uint8Array> {
    return initializeKMSClient(this.idToken, this.firebaseUser, this.identityRoute, this.kmsRoute)
      .then(x => {
        const command = new DecryptCommand({
          KeyId: x[1],
          CiphertextBlob,
          EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
          EncryptionContext: {
            provider: this.firebaseUser.providerData[0].uid,
            ct: this.firebaseUser.metadata.creationTime || ''
          }
        })
        return x[0].send(command)
      })
      .then(res => res.Plaintext!)
  }

  static async getIdentityPoolRoute(): Promise<AWSRoutableResource> {
    let identityPoolRoute = (await locationRoutingController.route(
      IDENTITY_POOLS_ROUTES,
      IDENTITY_POOLS_ROUTES[0]
    )) as AWSRoutableResource
    return isLive() ? identityPoolRoute : DEV_IDENTITY_POOL_ROUTE
  }

  static async getKMSRoute(): Promise<AWSRoutableResource> {
    return (await locationRoutingController.route(KMS_ROUTES, KMS_ROUTES[0])) as AWSRoutableResource
  }
}
