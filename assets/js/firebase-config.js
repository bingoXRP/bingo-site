const firebaseConfig = {
  apiKey: "AIzaSyCmwT7N3F2bh8bGq5dMK4XbMMSLaQx-8Wc",
  authDomain: "bingo-roller-1dcb0.firebaseapp.com",
  databaseURL: "https://bingo-roller-1dcb0-default-rtdb.firebaseio.com",
  projectId: "bingo-roller-1dcb0",
  storageBucket: "bingo-roller-1dcb0.firebasestorage.app",
  messagingSenderId: "10627009607",
  appId: "1:10627009607:web:2c6e2ce5aa13cff7f30c09",
  measurementId: "G-H99K0B4L10"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
const analytics = firebase.analytics();
