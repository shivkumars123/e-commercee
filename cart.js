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

// Global function to handle image errors
window.handleImageError = function(img, originalUrl) {
    console.error('Image error handler called for:', originalUrl);
    if (originalUrl && originalUrl.includes('drive.google.com')) {
        tryAlternativeFormats(img, originalUrl);
    } else {
        // Show placeholder for non-Google Drive images
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('item-placeholder')) {
            placeholder.style.display = 'flex';
        }
    }
};

// Helper function to convert Google Drive links (enhanced version)
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
    if (!originalUrl.includes('drive.google.com')) {
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('item-placeholder')) {
            placeholder.style.display = 'flex';
        }
        return;
    }
    
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
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('item-placeholder')) {
            placeholder.style.display = 'flex';
        }
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
            img.style.display = 'none';
            const placeholder = img.nextElementSibling;
            if (placeholder && placeholder.classList.contains('item-placeholder')) {
                placeholder.style.display = 'flex';
            }
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

// Fetch cart items from localStorage
function fetchCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPrice = 0;

    cartItemsContainer.innerHTML = '';
    
    console.log('📝 Cart Debug Info:');
    console.log('Cart items:', cart.length);
    cart.forEach((item, idx) => {
        console.log(`Item ${idx + 1}:`, {
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity
        });
    });

    if (cart.length === 0) {
        document.getElementById('empty-cart').classList.remove('hidden');
        return;
    }

    document.getElementById('empty-cart').classList.add('hidden');

    cart.forEach((item, index) => {
        totalPrice += item.price * item.quantity;
        const convertedImageUrl = convertImageLink(item.imageUrl);
        
        console.log(`🖼️  Processing cart image for ${item.name}:`);
        console.log('Original URL:', item.imageUrl);
        console.log('Converted URL:', convertedImageUrl);

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${convertedImageUrl}" alt="${item.name}" 
                     onload="console.log('✅ Cart image loaded:', '${item.name}')"
                     onerror="console.error('❌ Cart image failed:', '${item.name}'); handleImageError(this, '${item.imageUrl}')">
                <div class="item-placeholder" style="display:none;">
                    <i class="fas fa-image"></i>
                    <p style="font-size: 0.8em; color: #666; margin: 4px 0;">No image</p>
                </div>
            </div>
            <div class="item-details">
                <h3 class="item-title">${item.name}</h3>
                <div class="item-category">${item.category || 'Product'}</div>
                <div class="item-price">₹${item.price.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="1" data-index="${index}" readonly>
                    <button class="quantity-btn increase-btn" data-index="${index}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="item-actions">
                <div class="item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        
        // Apply alternative format handling to the image - use original URL for fallback testing
        const imgElement = itemElement.querySelector('img');
        if (item.imageUrl && item.imageUrl.includes('drive.google.com')) {
            console.log(`🔄 Setting up Google Drive fallbacks for ${item.name}`);
            // Set up enhanced error handling for Google Drive images
            imgElement.onerror = function() {
                console.error(`❌ Cart image failed to load for ${item.name}:`, convertedImageUrl);
                console.error('Original URL:', item.imageUrl);
                tryAlternativeFormats(this, item.imageUrl);
            };
        }
    });

    // Update totals using the new function
    console.log('💰 Calculating totals:');
    console.log('Total Price (subtotal):', totalPrice);
    
    // Check if custom shipping is selected
    const selectedShippingOption = document.querySelector('input[name="shipping"]:checked');
    const customShipping = selectedShippingOption ? parseFloat(selectedShippingOption.value) : null;
    
    updateCartTotals(cart, customShipping);
}

// Handle cart item interactions
cartItemsContainer.addEventListener('click', (event) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (event.target.closest('.remove-item')) {
        const index = parseInt(event.target.closest('.remove-item').getAttribute('data-index'));
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        fetchCartItems();
        return;
    }
    
    if (event.target.closest('.increase-btn')) {
        const index = parseInt(event.target.closest('.increase-btn').getAttribute('data-index'));
        cart[index].quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        fetchCartItems();
        return;
    }
    
    if (event.target.closest('.decrease-btn')) {
        const index = parseInt(event.target.closest('.decrease-btn').getAttribute('data-index'));
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            localStorage.setItem('cart', JSON.stringify(cart));
            fetchCartItems();
        }
        return;
    }
});

// Clear cart functionality
document.getElementById('clear-cart').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        localStorage.removeItem('cart');
        fetchCartItems();
    }
});

// Handle checkout process
document.getElementById('checkout').addEventListener('click', async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    try {
        const loggedInUserId = localStorage.getItem('loggedInUserId') || 'guest_user';
        const orderRef = doc(collection(db, 'orders'));
        
        // Calculate totals (use selected shipping option)
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Get selected shipping option
        const selectedShippingOption = document.querySelector('input[name="shipping"]:checked');
        const shipping = selectedShippingOption ? parseFloat(selectedShippingOption.value) : 
                        (subtotal > 1000 ? 0 : 50); // Fallback to standard logic
        
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + shipping + tax;

        await setDoc(orderRef, {
            userId: loggedInUserId,
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total,
            orderDate: new Date().toISOString(),
            status: 'pending'
        });

        localStorage.setItem('currentOrderId', orderRef.id);
        localStorage.removeItem('cart');

        alert('Order placed successfully! Redirecting to address page...');
        window.location.href = 'address.html';
    } catch (error) {
        console.error("Error saving order to Firestore:", error);
        alert('Error placing order. Please try again.');
    }
});

// Initialize cart items on page load
fetchCartItems();

// Handle shipping option changes
document.addEventListener('change', function(event) {
    if (event.target.name === 'shipping') {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) {
            // Recalculate totals with new shipping cost
            const selectedShipping = parseFloat(event.target.value);
            updateCartTotals(cart, selectedShipping);
        }
    }
});

// Function to update cart totals with custom shipping
function updateCartTotals(cart, customShipping = null) {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Use custom shipping if provided, otherwise use standard logic
    const shipping = customShipping !== null ? customShipping : (subtotal > 1000 ? 0 : 50);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    
    // Update display
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping-cost');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total-price');
    
    if (subtotalElement) subtotalElement.innerText = `₹${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.innerText = shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`;
    if (taxElement) taxElement.innerText = `₹${tax.toFixed(2)}`;
    if (totalElement) totalElement.innerText = `₹${total.toFixed(2)}`;
    
    console.log('💰 Updated totals - Subtotal:', subtotal, 'Shipping:', shipping, 'Tax:', tax, 'Total:', total);
}
