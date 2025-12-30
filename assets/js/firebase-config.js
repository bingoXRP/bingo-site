const firebaseConfig = {
  apiKey: "AIzaSyDFX2YygpK6ELMXwJZwZ3tnmT-DfLge2Sc",
  authDomain: "bingoxrpl.firebaseapp.com",
  databaseURL: "https://bingoxrpl-default-rtdb.firebaseio.com",
  projectId: "bingoxrpl",  // ← CORRECT PROJECT
  storageBucket: "bingoxrpl.firebasestorage.app",
  messagingSenderId: "1032944729350",
  appId: "1:1032944729350:web:77c0cc92c59dce214d3287",
  measurementId: "G-H99K0B4L10"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
const analytics = firebase.analytics();
