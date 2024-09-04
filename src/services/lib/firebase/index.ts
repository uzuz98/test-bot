import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app'

import { AUTH_HOST, isLive } from '../../constants'

// const config: FirebaseOptions = isLive()
//   ? {
//       apiKey: 'AIzaSyCsJq-bilsQp7GrVSX3LIUVX6EcAdCcuTs',
//       authDomain: AUTH_HOST.replace('https://', '').replace('http://', ''),
//       databaseURL: 'https://ramper-prod-default-rtdb.firebaseio.com',
//       projectId: 'ramper-prod',
//       storageBucket: 'ramper-prod.appspot.com',
//       messagingSenderId: '897776340259',
//       appId: '1:897776340259:web:9d8fab89bcccd20fcfd096',
//       measurementId: 'G-7NRREF51EB'
//     }
//   : {
//       apiKey: 'AIzaSyBZxnn54HJlqX74Q3mP29VDU1Bm8RlKux4',
//       // For local development, login testing doesn't work on Safari 16+ because
//       // of: https://github.com/firebase/firebase-js-sdk/issues/6716
//       // and firebase doesn't accept localhost as a valid authDomain.
//       // To test Safari 16+ login, deploy the app to a preview branch first.
//       authDomain: AUTH_HOST.startsWith('chrome-extension')
//         ? 'bright-zodiac-339920.firebaseapp.com'
//         : AUTH_HOST.replace('https://', ''),
//       databaseURL: 'https://bright-zodiac-339920-default-rtdb.firebaseio.com',
//       projectId: 'bright-zodiac-339920',
//       storageBucket: 'bright-zodiac-339920.appspot.com',
//       messagingSenderId: '114789873055',
//       appId: '1:114789873055:web:f507fae82ac5ac32c479aa',
//       measurementId: 'G-QDW3GW421L'
//     }

// for SuperApp, copy firebase here
const config: FirebaseOptions = {
  apiKey: 'AIzaSyBZxnn54HJlqX74Q3mP29VDU1Bm8RlKux4',
  // For local development, login testing doesn't work on Safari 16+ because
  // of: https://github.com/firebase/firebase-js-sdk/issues/6716
  // and firebase doesn't accept localhost as a valid authDomain.
  // To test Safari 16+ login, deploy the app to a preview branch first.
  authDomain: 'bright-zodiac-339920.firebaseapp.com',
  databaseURL: 'https://bright-zodiac-339920-default-rtdb.firebaseio.com',
  projectId: 'bright-zodiac-339920',
  storageBucket: 'bright-zodiac-339920.appspot.com',
  messagingSenderId: '114789873055',
  appId: '1:114789873055:web:f507fae82ac5ac32c479aa',
  measurementId: 'G-QDW3GW421L'
}

const findApp = () => {
  return initializeApp(config)
}

const app = findApp()

export const App = app
