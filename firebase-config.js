export const FIREBASE_BACKEND_MODE = "firebase";

// Firebase web config is public by design. Security comes from Firebase Auth
// and Firestore/Realtime Database rules, not from hiding these values.
const CHECKED_IN_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCWV_kTOOvCyuHe81TYPC0GVk3jdU82ypM",
  authDomain: "infernodrift4-online.firebaseapp.com",
  projectId: "infernodrift4-online",
  storageBucket: "infernodrift4-online.firebasestorage.app",
  messagingSenderId: "1065349904500",
  appId: "1:1065349904500:web:e32b781db0c0183312b921",
  databaseURL: "",
};

export function getFirebaseConfig() {
  const runtimeConfig =
    typeof window !== "undefined" && window.INFERNO_FIREBASE_CONFIG
      ? window.INFERNO_FIREBASE_CONFIG
      : {};
  return {
    ...CHECKED_IN_FIREBASE_CONFIG,
    ...runtimeConfig,
  };
}

export function getFirebaseConfigStatus(config = getFirebaseConfig()) {
  const projectId = String(config?.projectId || "").trim();
  const apiKey = String(config?.apiKey || "").trim();
  const authDomain = String(config?.authDomain || "").trim();
  return {
    configured: Boolean(projectId && apiKey && authDomain),
    projectId: projectId || "not-configured",
    hasDatabaseUrl: Boolean(String(config?.databaseURL || "").trim()),
  };
}
