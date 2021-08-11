import firebase from "firebase/app";
// import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDbmkUhS3iKFFRKqr0iKfj4BeB1Xa5kSE",
  authDomain: "timekeeperdemo-ec3f9.firebaseapp.com",
  projectId: "timekeeperdemo-ec3f9",
  storageBucket: "timekeeperdemo-ec3f9.appspot.com",
  messagingSenderId: "531055487879",
  appId: "1:531055487879:web:52cca2ea87044f5e238122",
  measurementId: "G-5KHNPQ6ZZ5"
};

firebase.initializeApp(firebaseConfig);

export {firebase};
// export const firebaseAuth = firebase.auth();
export const firestore = firebase.firestore()

export const user = 'public';
export const udataId = `udata:${user}`;