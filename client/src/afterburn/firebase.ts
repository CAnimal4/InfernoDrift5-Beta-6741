import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { sanitizeSave, type SaveV1 } from "../../../packages/afterburn-core/src/index";

const CHECKED_IN_CONFIG: FirebaseOptions = {
  apiKey: "",
  authDomain: "infernodrift5-beta-6741.firebaseapp.com",
  projectId: "infernodrift5-beta-6741",
  storageBucket: "infernodrift5-beta-6741.firebasestorage.app",
  messagingSenderId: "",
  appId: "",
};

function firebaseConfig(): FirebaseOptions {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || CHECKED_IN_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || CHECKED_IN_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || CHECKED_IN_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || CHECKED_IN_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || CHECKED_IN_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || CHECKED_IN_CONFIG.appId,
  };
}

function getAfterburnApp(): FirebaseApp | null {
  const config = firebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId) return null;
  return getApps().length ? getApp() : initializeApp(config);
}

export interface FirebaseSession {
  uid: string;
  user: User;
}

export async function openFirebaseSession(): Promise<FirebaseSession | null> {
  const app = getAfterburnApp();
  if (!app) return null;
  const auth = getAuth(app);
  if (!auth.currentUser) {
    await signInAnonymously(auth);
    await new Promise<void>((resolve) => {
      const stop = onAuthStateChanged(auth, () => {
        stop();
        resolve();
      });
    });
  }
  return auth.currentUser ? { uid: auth.currentUser.uid, user: auth.currentUser } : null;
}

export async function loadCloudProfile(session: FirebaseSession): Promise<SaveV1 | null> {
  const app = getAfterburnApp();
  if (!app) return null;
  const snapshot = await getDoc(doc(getFirestore(app), "afterburnProfiles", session.uid));
  if (!snapshot.exists()) return null;
  return sanitizeSave(snapshot.data().save);
}

export async function saveCloudProfile(session: FirebaseSession, save: SaveV1): Promise<void> {
  const app = getAfterburnApp();
  if (!app) return;
  await setDoc(
    doc(getFirestore(app), "afterburnProfiles", session.uid),
    {
      uid: session.uid,
      schemaVersion: 1,
      save: sanitizeSave(save),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function firebaseConfigured(): boolean {
  return getAfterburnApp() !== null;
}
