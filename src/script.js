const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', function() {
    mainNav.classList.toggle('active');
});

const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            mainNav.classList.remove('active');
        }
    });
});

document.addEventListener('click', function(e) {
    if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        mainNav.classList.remove('active');
    }
});

let scrollPos = 0;
const header = document.querySelector('.mainHeader');

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    scrollPos = currentScroll;
});

const modal = document.getElementById('submitModal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.querySelector('.closeModal');
const driveForm = document.getElementById('driveForm');

if (openModalBtn) {
    openModalBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.style.display = 'block';
        modal.classList.add('show');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
}

window.addEventListener('click', function(e) {
    if (modal.style.display === 'block' && !e.target.closest('.modalContent') && !e.target.closest('#openModal')) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
});

if (driveForm) {
    driveForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const drive = {
            name: document.getElementById('driveName').value,
            description: document.getElementById('driveDesc').value,
            media: document.getElementById('driveMedia').value,
            photo: document.getElementById('drivePhoto').value,
            category: document.getElementById('driveCategory').value
        };
        
        try {
            const response = await fetch('http://localhost:3000/api/drives', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(drive)
            });
            
            if (response.ok) {
                alert('Drive submitted successfully!');
                modal.style.display = 'none';
                driveForm.reset();
            } else {
                alert('Failed to submit drive. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting drive:', error);
            alert('Error submitting drive. Make sure the server is running.');
        }
    });
}
