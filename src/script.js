// I get references to the menu elements for my mobile navigation
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

// When someone clicks the hamburger menu, I toggle the navigation open/closed
menuToggle.addEventListener('click', function() {
    mainNav.classList.toggle('active'); // Add or remove the 'active' class
});

// I set up smooth scrolling for all internal links (like #about, #categories)
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent the default jump behavior
        const targetId = this.getAttribute('href'); // Get the section ID
        const targetSection = document.querySelector(targetId); // Find the section
        
        if (targetSection) {
            // I smoothly scroll to the target section instead of jumping
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            mainNav.classList.remove('active'); // Close mobile menu after clicking
        }
    });
});

// I close the mobile menu when someone clicks outside of it
document.addEventListener('click', function(e) {
    if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        mainNav.classList.remove('active');
    }
});

// I add a shadow effect to the header when scrolling down the page
let scrollPos = 0;
const header = document.querySelector('.mainHeader');

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    // When scrolled past 100px, I add a stronger shadow for depth
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    scrollPos = currentScroll;
});

// I set up the modal for submitting new donation drives
const modal = document.getElementById('submitModal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.querySelector('.closeModal');
const driveForm = document.getElementById('driveForm');

// When someone clicks "Submit a Drive", I open the modal form
if (openModalBtn) {
    openModalBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        modal.style.display = 'block';
        modal.classList.add('show'); // Trigger fade-in animation
    });
}

// When someone clicks the X button, I close the modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
}

// I also close the modal when someone clicks outside the form
window.addEventListener('click', function(e) {
    if (modal.style.display === 'block' && !e.target.closest('.modalContent') && !e.target.closest('#openModal')) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
});

// This handles the form submission when someone creates a new donation drive
if (driveForm) {
    driveForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent page reload on submit
        
        // I collect all the form data into an object
        const drive = {
            name: document.getElementById('driveName').value,
            description: document.getElementById('driveDesc').value,
            media: document.getElementById('driveMedia').value,
            photo: document.getElementById('drivePhoto').value,
            category: document.getElementById('driveCategory').value
        };
        
        try {
            // I send the drive data to my server to save it
            const response = await fetch('http://localhost:3000/api/drives', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Tell server I'm sending JSON
                },
                body: JSON.stringify(drive) // Convert JavaScript object to JSON string
            });
            
            if (response.ok) {
                alert('Drive submitted successfully!');
                modal.style.display = 'none'; // Close the modal
                driveForm.reset(); // Clear the form
            } else {
                alert('Failed to submit drive. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting drive:', error);
            alert('Error submitting drive. Make sure the server is running.');
        }
    });
}
