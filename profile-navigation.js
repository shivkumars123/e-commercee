// Profile page navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle profile section navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sectionContents = document.querySelectorAll('.section-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionName = this.dataset.section;
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sectionContents.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding section
            this.classList.add('active');
            const targetSection = document.getElementById(`${sectionName}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Handle avatar change button (placeholder)
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            // This would typically open a file picker or image upload modal
            console.log('Avatar change clicked - implement file upload here');
        });
    }
    
    // Handle add address button (placeholder)
    const addAddressBtn = document.querySelector('.add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            // This would typically open an address form modal
            console.log('Add address clicked - implement address form here');
        });
    }
    
    // Handle notification and theme preferences
    const preferenceInputs = document.querySelectorAll('.preference-option input, .theme-option input');
    preferenceInputs.forEach(input => {
        input.addEventListener('change', function() {
            console.log(`Preference changed: ${this.name || 'notification'} = ${this.checked || this.value}`);
            // Save preferences to localStorage or send to server
        });
    });
    
    // Handle security settings buttons
    const securityBtns = document.querySelectorAll('.security-cards .btn');
    securityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log(`Security action: ${this.textContent.trim()}`);
            // Implement security features like password change, 2FA setup
        });
    });
});

// Export for use in existing profile.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initProfileNavigation: () => {
            // This function can be called from profile.js if needed
        }
    };
}
