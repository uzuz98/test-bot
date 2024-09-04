import {DecryptCommand, EncryptCommand, KMSClient} from '@aws-sdk/client-kms';
import {
  fromCognitoIdentityPool,
  fromTemporaryCredentials,
} from '@aws-sdk/credential-providers';
import {DEV_IDENTITY_POOL_ROUTE, IDENTITY_POOLS_ROUTES, KMS} from './kms';
import {isLive} from '../../constants';
import locationRoutingController, {
  AWSRoutableResource,
} from '../../controllers/LocationRoutingController';

const LEGACY_KMS_ROUTE = {
  latitude: 37.926868,
  longitude: -78.024902,
  resourceUri: 'arn:aws:kms:us-east-1:299151497192:alias/kek00',
  region: 'us-east-1',
};

const KMS_ROUTES: AWSRoutableResource[] = [
  {
    latitude: 37.5665,
    longitude: 126.978,
    resourceUri: 'arn:aws:kms:ap-northeast-2:299151497192:alias/mkek00',
    region: 'ap-northeast-2',
  },
];

async function initializeKMSClient(
  idToken: string,
  firebaseUuid: string,
  identityPoolRoute: AWSRoutableResource,
  kmsRoute: AWSRoutableResource,
): Promise<[KMSClient, string]> {
  const credProvider = fromCognitoIdentityPool({
    identityPoolId: identityPoolRoute.resourceUri,
    logins: {
      'securetoken.google.com/coin98-b7f98': idToken, //securetoken.google.com/#firebaseID
    },
    clientConfig: {region: identityPoolRoute.region},
    userIdentifier: firebaseUuid,
  });
  const cred = await credProvider();
  const pool = cred.identityId.charAt(cred.identityId.length - 1);

  const roleArn = 'arn:aws:iam::299151497192:role/cognito-pool-' + pool;
  const stsCred = fromTemporaryCredentials({
    masterCredentials: credProvider,
    params: {RoleArn: roleArn, DurationSeconds: 900},
    clientConfig: {region: kmsRoute.region},
  });
  return [
    new KMSClient({region: kmsRoute.region, credentials: stsCred}),
    kmsRoute.resourceUri + pool,
  ];
}

export class KMSAwsV1 implements KMS {
  constructor(
    private firebaseUserUid: string,
    private idToken: string,
    public identityRoute: AWSRoutableResource,
    public kmsRoute: AWSRoutableResource,
  ) {}

  async encrypt(Plaintext: Uint8Array): Promise<Uint8Array> {
    return initializeKMSClient(
      this.idToken,
      this.firebaseUserUid,
      this.identityRoute,
      this.kmsRoute,
    )
      .then(x => {
        const command = new EncryptCommand({
          KeyId: x[1],
          Plaintext,
          EncryptionAlgorithm: 'RSAES_OAEP_SHA_256',
        });
        return x[0].send(command);
      })
      .then(res => res.CiphertextBlob!);
  }

  async decrypt(CiphertextBlob: Uint8Array): Promise<Uint8Array> {
    return initializeKMSClient(
      this.idToken,
      this.firebaseUserUid,
      this.identityRoute,
      this.kmsRoute,
    )
      .then(x => {
        const command = new DecryptCommand({
          KeyId: x[1],
          CiphertextBlob,
          EncryptionAlgorithm: 'RSAES_OAEP_SHA_256',
        });
        return x[0].send(command);
      })
      .then(res => res.Plaintext!);
  }

  static findResourceByFiUri(resourceUri: string) {
    return [DEV_IDENTITY_POOL_ROUTE, ...IDENTITY_POOLS_ROUTES].find(
      route => route.resourceUri === resourceUri,
    );
  }

  static async getIdentityPoolRoute(
    isMultiregion: boolean,
  ): Promise<AWSRoutableResource> {
    let identityPoolRoute = IDENTITY_POOLS_ROUTES[0];
    if (isMultiregion) {
      identityPoolRoute = (await locationRoutingController.route(
        IDENTITY_POOLS_ROUTES,
        IDENTITY_POOLS_ROUTES[0],
      )) as AWSRoutableResource;
    }
    return isLive() ? identityPoolRoute : DEV_IDENTITY_POOL_ROUTE;
  }

  static async getKMSRoute(
    isMultiregion: boolean,
  ): Promise<AWSRoutableResource> {
    let kmsRoute = LEGACY_KMS_ROUTE;
    if (isMultiregion) {
      kmsRoute = (await locationRoutingController.route(
        KMS_ROUTES,
        KMS_ROUTES[0],
      )) as AWSRoutableResource;
    }
    return kmsRoute;
  }
}
