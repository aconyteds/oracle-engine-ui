import { getAnalytics, logEvent } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyDd5q7xFN92_3nqqa7JNS1RI67VnDmjRng",
    authDomain: "oracle-engine-7dfa6.firebaseapp.com",
    projectId: "oracle-engine-7dfa6",
    storageBucket: "oracle-engine-7dfa6.appspot.com",
    messagingSenderId: "241629897043",
    appId: "1:241629897043:web:f30cbfd8481464b0d681a6",
    measurementId: "G-99G8T3W1R4",
};

const app = initializeApp(firebaseConfig);
// Initialize Firebase Analytics
const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;
// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

type AvailableEvents =
    | "load"
    | "error"
    | "waitlist_interest"
    | "create_asset"
    | "edit_asset"
    | "delete_asset";

export function LogEvent(
    eventName: AvailableEvents,
    params?: { [key: string]: string }
) {
    if (analytics) {
        logEvent(analytics, eventName, params);
    }
}
