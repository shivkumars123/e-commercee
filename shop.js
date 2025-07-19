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

        console.log(`Found ${querySnapshot.docs.length} products in Firebase`);
        
        // Clear the product list first
        productList.innerHTML = '';
        
        querySnapshot.forEach((docSnapshot) => {
            const product = docSnapshot.data();
            const productId = docSnapshot.id;
            console.log(`Processing product: ${productId}`);
            console.log(`Product data:`, {
                name: product.name,
                price: product.price,
                priceType: typeof product.price,
                imageUrl: product.imageUrl ? product.imageUrl.substring(0, 50) + '...' : 'No image URL',
                category: product.category,
                allFields: Object.keys(product)
            });
            
            // Add product ID to the product data
            product.id = productId;
            
            try {
                const productCard = createProductCard(product);
                productList.appendChild(productCard);
                console.log(`✅ Successfully added product card for: ${product.name}`);
            } catch (error) {
                console.error(`❌ Error creating product card for ${product.name}:`, error);
            }
        });
        
        // Update products count
        const productsCount = document.getElementById('productsCount');
        if (productsCount) {
            productsCount.textContent = querySnapshot.docs.length;
        }
        
        // Hide loading spinner
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
    } catch (error) {
        console.error("Error fetching products:", error);
        productList.innerHTML = `<p>Error loading products: ${error.message}</p>`;
    }
}

// Helper function to convert various image hosting links to direct URLs
function convertImageLink(url) {
    if (!url) {
        console.warn('No image URL provided');
        return url;
    }
    
    console.log('Original URL:', url);
    
    // Handle Google Drive links - Extract file ID more robustly
    if (url.includes('drive.google.com')) {
        let fileId = null;
        
        // Pattern 1: /file/d/{fileId}/
        let fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
        if (fileIdMatch) {
            fileId = fileIdMatch[1];
        } else {
            // Pattern 2: id={fileId}
            fileIdMatch = url.match(/id=([a-zA-Z0-9_-]{25,})/);
            if (fileIdMatch) {
                fileId = fileIdMatch[1];
            } else {
                // Pattern 3: Extract from sharing URL
                fileIdMatch = url.match(/[-\w]{25,}/);
                if (fileIdMatch) {
                    fileId = fileIdMatch[0];
                }
            }
        }
        
        if (fileId) {
            // Use the most reliable format that bypasses Google's viewer
            const convertedUrl = `https://lh3.googleusercontent.com/d/${fileId}=w800`;
            console.log(`Converted Google Drive link: ${url} -> ${convertedUrl}`);
            return convertedUrl;
        } else {
            console.error('Could not extract Google Drive file ID from:', url);
            return url;
        }
    }
    
    // Handle Imgur links
    if (url.includes('imgur.com') && !url.includes('.jpg') && !url.includes('.png') && !url.includes('.gif')) {
        const imgurId = url.split('/').pop();
        const convertedUrl = `https://i.imgur.com/${imgurId}.jpg`;
        console.log(`Converted Imgur link: ${url} -> ${convertedUrl}`);
        return convertedUrl;
    }
    
    console.log('Using URL as-is:', url);
    return url;
}

// Function to try alternative Google Drive formats
function tryAlternativeFormats(img, originalUrl) {
    if (!originalUrl.includes('drive.google.com')) return;
    
    // Extract file ID from various Google Drive URL patterns
    let fileId = null;
    
    // Pattern 1: /file/d/{fileId}/
    let fileIdMatch = originalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
        fileId = fileIdMatch[1];
    } else {
        // Pattern 2: id={fileId}
        fileIdMatch = originalUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch) {
            fileId = fileIdMatch[1];
        } else {
            // Pattern 3: Long ID in sharing URL
            fileIdMatch = originalUrl.match(/[-\w]{25,}/);
            if (fileIdMatch) {
                fileId = fileIdMatch[0];
            }
        }
    }
    
    if (!fileId) {
        console.error('Could not extract file ID from URL:', originalUrl);
        return;
    }
    
    const alternatives = [
        `https://lh3.googleusercontent.com/d/${fileId}=w800`,
        `https://lh3.googleusercontent.com/d/${fileId}=w600`,
        `https://lh3.googleusercontent.com/d/${fileId}=w400`,
        `https://lh3.googleusercontent.com/d/${fileId}`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        `https://drive.google.com/uc?id=${fileId}`
    ];
    
    let currentIndex = 0;
    
    function tryNext() {
        if (currentIndex >= alternatives.length) {
            console.error('All Google Drive formats failed for:', originalUrl);
            return;
        }
        
        const nextUrl = alternatives[currentIndex];
        console.log(`Trying alternative format ${currentIndex + 1}/${alternatives.length}:`, nextUrl);
        
        img.onerror = () => {
            currentIndex++;
            setTimeout(tryNext, 100); // Small delay between attempts
        };
        
        img.onload = () => {
            console.log('Successfully loaded with alternative format:', nextUrl);
        };
        
        img.src = nextUrl;
    }
    
    tryNext();
}

// Create product card
function createProductCard(product) {
    // Validate and fix product data
    if (!product.name) {
        console.error('Product missing name:', product);
        product.name = 'Unnamed Product';
    }
    
    // Handle price conversion and validation - MORE LENIENT
    let price = product.price;
    console.log(`Raw price from database for ${product.name}:`, price, typeof price);
    
    // Check if price field exists at all
    if (!product.hasOwnProperty('price') || price === null || price === undefined || price === '') {
        console.warn(`Product "${product.name}" missing price field. Setting to ₹0.00`);
        price = 0;
    } else if (typeof price === 'string') {
        // Convert string to number
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            console.warn(`Invalid price format for product "${product.name}": "${product.price}". Setting to ₹0.00`);
            price = 0;
        } else {
            price = parsedPrice;
        }
    } else if (typeof price !== 'number') {
        console.warn(`Price is not a valid type for product "${product.name}". Type: ${typeof price}, Value: ${price}. Setting to $0.00`);
        price = 0;
    }
    
    // Ensure price is not negative
    if (price < 0) {
        console.warn(`Negative price detected for product "${product.name}": ${price}. Setting to $0.00`);
        price = 0;
    }
    
    product.price = price; // Update the product object with cleaned price
    console.log(`✅ Final processed price for ${product.name}: ₹${price.toFixed(2)}`);
    
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    // Convert image link if needed (supports Google Drive, Imgur, etc.)
    const imageUrl = convertImageLink(product.imageUrl);
    console.log(`Creating product card for: ${product.name} with image: ${imageUrl}`);
    
    // Create the image element
    const img = document.createElement('img');
    img.src = imageUrl || '';
    img.alt = product.name;
    img.loading = 'lazy';
    
    // Handle image load success
    img.onload = function() {
        console.log(`✅ Image loaded successfully for ${product.name}:`, imageUrl);
    };
    
    // Handle image load failure
    img.onerror = function() {
        console.error(`❌ Failed to load image for ${product.name}:`, imageUrl);
        tryAlternativeFormats(this, imageUrl);
        
        // Show placeholder after 2 seconds if still failed
        setTimeout(() => {
            if (!this.complete || this.naturalWidth === 0) {
                console.log(`Showing placeholder for ${product.name}`);
                this.style.display = 'none';
                this.nextElementSibling.style.display = 'flex';
            }
        }, 2000);
    };
    
    // Add visual indicator if price is missing
    const priceDisplay = price === 0 ? 
        `<div class="product-price" style="color: #f59e0b;">Price not set</div>` : 
        `<div class="product-price">₹${price.toFixed(2)}</div>`;
    
    productCard.innerHTML = `
        <div class="product-image">
            <div class="product-placeholder" style="display:none; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 16px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--warning-color, #f59e0b); margin-bottom: 8px;"></i>
                <p style="margin: 0; font-size: 0.8rem; color: var(--gray-600); font-weight: 500;">Image not loading</p>
                <p style="margin: 4px 0 0 0; font-size: 0.7rem; color: var(--gray-400);">${product.name}</p>
                <div style="margin-top: 8px; font-size: 0.65rem; color: var(--gray-500); line-height: 1.2;">
                    Google Drive files must be shared as<br>"Anyone with the link"
                </div>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            ${priceDisplay}
            <button class="btn btn-primary add-to-cart-btn" ${price === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                <i class="fas fa-shopping-cart"></i>
                ${price === 0 ? 'Price Required' : 'Add to Cart'}
            </button>
        </div>
    `;
    
    // Insert the image element
    const imageContainer = productCard.querySelector('.product-image');
    imageContainer.insertBefore(img, imageContainer.firstChild);
    
    // Only add click handler if price is set
    if (price > 0) {
        productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            addToCart(product);
        });
    }
    
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