/* eslint-disable no-undef */

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAPFJAG00vtnPvKOpa1QW2qFtigZMPbipY",
  authDomain: "salon-e5ed8.firebaseapp.com",
  projectId: "salon-e5ed8",
  storageBucket: "salon-e5ed8.firebasestorage.app",
  messagingSenderId: "464248896179",
  appId: "1:464248896179:web:e318cdcd075414f10d8ec6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  const title = payload.data?.title || "Appointment Update";

  const options = {
    body: payload.data?.body || "Your appointment has been updated.",
    data: {
      url: payload.data?.url || "/pages/bookingHistory",
    },
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/pages/bookingHistory";

  event.waitUntil(
    clients.openWindow(url)
  );
});