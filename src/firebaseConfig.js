import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Replace this with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCprXgEVsCxDM3Fxwhh6_AZhS0gGRp04o8",
  authDomain: "transportagencyapp.firebaseapp.com",
  projectId: "transportagencyapp",
  storageBucket: "transportagencyapp.appspot.com",
  messagingSenderId: "229305383719",
  appId: "1:229305383719:web:282703f71df7771e78c702"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();