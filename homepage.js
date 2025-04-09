import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { doc, getDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
   
        apiKey: "AIzaSyCfqutVADVzueXjxEdxnOFouUFTy5jDy4o",
        authDomain: "login-form-ee988.firebaseapp.com",
        projectId: "login-form-ee988",
        storageBucket: "login-form-ee988.appspot.com",
        messagingSenderId: "810718956570",
        appId: "1:810718956570:web:fba54ec6ad3f6d6d7e15a3",
        measurementId: "G-EE1LXX8PLG"
    
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('loggedUserFName').innerText = userData.firstName;
                    document.getElementById('loggedUserEmail').innerText = userData.email;
                    document.getElementById('loggedUserLName').innerText = userData.lastName;
                } else {
                    console.log("No document found matching ID");
                }
            })
            .catch((error) => {
                console.log("Error getting document", error);
            });
    } else {
        console.log("User ID not found in local storage");
    }
});

const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});