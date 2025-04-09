import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { collection, doc, getFirestore, setDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

const cartItemsContainer = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const checkoutButton = document.getElementById('checkout');

// Fetch cart items from localStorage
function fetchCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPrice = 0;

    cartItemsContainer.innerHTML = '';

    cart.forEach((item) => {
        totalPrice += item.price * item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <button data-id="${item.id}">Remove</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    totalPriceElement.innerText = totalPrice.toFixed(2);
}

// Remove cart item and update localStorage
cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const itemId = event.target.getAttribute('data-id');
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        fetchCartItems();
    }
});

// Prevent multiple redirects by disabling the checkout button after the first click
checkoutButton.addEventListener('click', async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Disable the checkout button to prevent multiple clicks
    checkoutButton.disabled = true;

    try {
        const loggedInUserId = localStorage.getItem('loggedInUserId') || 'guest_user'; // Replace with actual user ID
        const orderRef = doc(collection(db, 'orders'));

        // Save the cart items to Firestore
        await setDoc(orderRef, {
            userId: loggedInUserId,
            items: cart,
            total: parseFloat(totalPriceElement.innerText),
            orderDate: new Date().toISOString(),
            status: 'pending' // Mark order as pending until address is added
        });

        // Store the order ID for later use in address.js
        localStorage.setItem('currentOrderId', orderRef.id);

        // Clear the cart from localStorage
        localStorage.removeItem('cart');

        // Redirect to the address input page
        window.location.href = 'address.html';
    } catch (error) {
        console.error("Error saving order to Firestore:", error);
    }
});

// Initialize cart items on page load
fetchCartItems();

