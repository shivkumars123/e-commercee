// Test script to check cart contents
console.log('Cart contents:', localStorage.getItem('cart'));
const cart = JSON.parse(localStorage.getItem('cart')) || [];
console.log('Parsed cart:', cart);
console.log('Number of items:', cart.length);

cart.forEach((item, index) => {
    console.log(`Item ${index + 1}:`, {
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity
    });
});
