import { getFirestore } from 'firebase/firestore'
import { App } from '.'

export const firestore = getFirestore(App)
