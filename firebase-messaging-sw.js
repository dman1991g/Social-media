importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCNU5uJ9YkR3F3BtghpRwIJ3TR6FaUFxTM',
  authDomain: 'real-time-chat-app-b5633.firebaseapp.com',
  projectId: 'real-time-chat-app-b5633',
  messagingSenderId: '598824406460',
  appId: '1:598824406460:web:69dd525b78ada125be2fb9',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png', // Customize icon path if needed
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
