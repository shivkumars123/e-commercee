import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { collection, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Reference to the product list container in the HTML
const productList = document.getElementById('product-list');

// Load products from Firestore
async function loadProducts() {
    const productsCollection = collection(db, 'products');
    try {
        const querySnapshot = await getDocs(productsCollection);
        if (querySnapshot.empty) {
            console.log("No products found.");
            productList.innerHTML = `<p>No products available at the moment.</p>`;
            return;
        }

        querySnapshot.forEach((docSnapshot) => {
            const product = docSnapshot.data();
            const productCard = createProductCard(product);
            productList.appendChild(productCard);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Create product card
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button>Add to Cart</button>
    `;
    productCard.querySelector('button').addEventListener('click', () => {
        addToCart(product);
    });
    return productCard;
}

// Add product to cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} has been added to your cart!`);
}

// Load products when the script is loaded
loadProducts();