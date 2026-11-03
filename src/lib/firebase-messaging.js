import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export async function getFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token || null;
  } catch (err) {
    return null;
  }
}
