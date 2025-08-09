import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyAZBQTYJI6wVIh8xiBtdfxBPtzDTxxlk4c',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'your-5932b.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-5932b',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'your-5932b.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1007615852085',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:1007615852085:web:78e6e0af8bd37dba0efb7c'
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
