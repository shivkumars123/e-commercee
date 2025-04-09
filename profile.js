import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { deleteDoc, doc, getDoc, getFirestore, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    // YOUR COPIED FIREBASE CONFIGURATION HERE
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const updateProfileButton = document.getElementById('updateProfile');
const deleteAccountButton = document.getElementById('deleteAccount');

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
                console.log("Error fetching user data:", error);
            });

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

        deleteAccountButton.addEventListener('click', () => {
            const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
            if (confirmation) {
                deleteDoc(docRef)
                    .then(() => {
                        alert('Account deleted successfully');
                        // Optionally, sign out the user
                        auth.signOut()
                            .then(() => {
                                window.location.href = 'index.html';
                            })
                            .catch((error) => {
                                console.error('Error signing out:', error);
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