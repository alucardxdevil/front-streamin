import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBzjCjgfXf6nGE0H9popoGvhEZsQMd4JIE",
  authDomain: "stream-inbeta-a37dd.firebaseapp.com",
  projectId: "stream-inbeta-a37dd",
  storageBucket: "stream-inbeta-a37dd.firebasestorage.app",
  messagingSenderId: "167856919358",
  appId: "1:167856919358:web:b8858d2940f97a6ea0926f",
  measurementId: "G-V7X06W8ZCZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export default app
