import { initializeApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getAuth, Auth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} environment variable is missing`);
  return v;
}

const config: FirebaseOptions = {
  apiKey: getEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

let _app: FirebaseApp;
try {
  _app = initializeApp(config);
} catch (e) {
  _app = (global as any).__firebase_app || initializeApp(config);
  (global as any).__firebase_app = _app;
}
export const app = _app;

let _auth: Auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  }) as Auth;
} catch {
  _auth = getAuth(app);
}
export const auth = _auth;

export const db: Firestore = getFirestore(app);
