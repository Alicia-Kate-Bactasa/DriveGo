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
    driveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const drive = {
            id: Date.now(),
            name: document.getElementById('driveName').value,
            description: document.getElementById('driveDesc').value,
            media: document.getElementById('driveMedia').value,
            photo: document.getElementById('drivePhoto').value,
            category: document.getElementById('driveCategory').value
        };
        
        let drives = JSON.parse(localStorage.getItem('drives') || '[]');
        drives.push(drive);
        localStorage.setItem('drives', JSON.stringify(drives));
        
        alert('Drive submitted successfully!');
        modal.style.display = 'none';
        driveForm.reset();
    });
}
