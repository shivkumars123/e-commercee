import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { doc, getFirestore, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const db = getFirestore(app);

document.getElementById('address-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const address = {
        fullName: document.getElementById('full-name').value,
        addressLine1: document.getElementById('address-line-1').value,
        addressLine2: document.getElementById('address-line-2').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        postalCode: document.getElementById('postal-code').value,
        country: document.getElementById('country').value,
    };

    try {
        // Retrieve the current order ID from localStorage
        const orderId = localStorage.getItem('currentOrderId');
        if (!orderId) {
            throw new Error('No order ID found.');
        }

        const orderRef = doc(db, 'orders', orderId);

        // Update the order document with the shipping address
        await updateDoc(orderRef, {
            shippingAddress: address,
            status: 'confirmed' // Mark order as confirmed after address is added
        });

        // Clear the currentOrderId from localStorage
        localStorage.removeItem('currentOrderId');

        // Notify the user and redirect
        alert('Address saved successfully! Redirecting to order confirmation...');
        window.location.href = 'confirmation.html'; // Redirect to confirmation page
    } catch (error) {
        console.error("Error saving address to Firestore:", error);
    }
});
