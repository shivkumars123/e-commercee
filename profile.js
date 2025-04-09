import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { doc, getDoc, updateDoc, deleteDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCfqutVADVzueXjxEdxnOFouUFTy5jDy4o",
    authDomain: "login-form-ee988.firebaseapp.com",
    projectId: "login-form-ee988",
    storageBucket: "login-form-ee988.appspot.com",
    messagingSenderId: "810718956570",
    appId: "1:810718956570:web:fba54ec6ad3f6d6d7e15a3",
    measurementId: "G-EE1LXX8PLG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const updateProfileButton = document.getElementById('updateProfile');
const deleteAccountButton = document.getElementById('deleteAccount');

// Fetch user data on authentication state change
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        const docRef = doc(db, "users", userId);

        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    firstNameInput.value = userData.firstName;
                    lastNameInput.value = userData.lastName;
                    emailInput.value = userData.email;
                } else {
                    console.log("No user data found");
                }
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
            });

        // Update profile
        updateProfileButton.addEventListener('click', () => {
            const updatedData = {
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: emailInput.value
            };

            updateDoc(docRef, updatedData)
                .then(() => {
                    alert('Profile updated successfully');
                })
                .catch((error) => {
                    console.error('Error updating profile:', error);
                });
        });

        // Delete account
        deleteAccountButton.addEventListener('click', () => {
            const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
            if (confirmation) {
                deleteDoc(docRef)
                    .then(() => {
                        deleteUser(user)
                            .then(() => {
                                alert('Account deleted successfully');
                                window.location.href = 'index.html';
                            })
                            .catch((error) => {
                                console.error('Error deleting user:', error);
                            });
                    })
                    .catch((error) => {
                        console.error('Error deleting account:', error);
                    });
            }
        });
    } else {
        console.log("User is not signed in");
        window.location.href = 'index.html';
    }
});