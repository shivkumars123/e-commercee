document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUpButton');
    const signInButton = document.getElementById('signInButton');
    const signInSection = document.getElementById('signIn');
    const signUpSection = document.getElementById('signUp');
    const recoverPasswordLink = document.querySelector('.recover a');

    if (signUpButton && signInButton && signInSection && signUpSection && recoverPasswordLink) {
        signUpButton.addEventListener('click', () => {
            signInSection.style.display = 'none';
            signUpSection.style.display = 'block';
        });

        signInButton.addEventListener('click', () => {
            signUpSection.style.display = 'none';
            signInSection.style.display = 'block';
        });

        recoverPasswordLink.addEventListener('click', (event) => {
            event.preventDefault();
            const email = prompt('Enter your email address to reset your password:');
            if (email) {
                alert(`A password reset link has been sent to ${email}. Please check your inbox.`);
            } else {
                alert('Email address is required to reset your password.');
            }
        });
    } else {
        console.error('One or more elements not found.');
    }
});