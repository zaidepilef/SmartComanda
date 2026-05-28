document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Log data (in a real app, this would be sent to a backend)
            console.log('Form submitted:', data);
            
            // Show success message
            const originalContent = form.innerHTML;
            form.innerHTML = `
                <div class="success-message">
                    <h3>¡Gracias por registrarte!</h3>
                    <p>Hemos recibido tu información. Te contactaremos pronto para completar tu configuración.</p>
                </div>
            `;
            
            // Optional: Reset form after a delay
            setTimeout(() => {
                form.innerHTML = originalContent;
                // Re-attach event listener if needed
                const newForm = document.getElementById('signupForm');
                if (newForm) {
                    newForm.addEventListener('submit', arguments.callee);
                }
            }, 5000);
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});