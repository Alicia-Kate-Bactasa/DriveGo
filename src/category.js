const API_URL = 'http://localhost:3000/api';
let currentCategory = '';

async function loadDrives(category) {
    currentCategory = category;
    try {
        const response = await fetch(`${API_URL}/drives/${category}`);
        const categoryDrives = await response.json();
        const container = document.getElementById('drivesContainer');

        if (categoryDrives.length === 0) {
            container.innerHTML = '<p style="color: white;">No drives yet in this category.</p>';
            return;
        }

        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        container.style.gap = '1.5rem';

        categoryDrives.forEach(drive => {
            const card = document.createElement('div');
            card.className = 'driveCard';
            card.id = `card-${drive.id}`;
            
            const photoUrl = drive.photo || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800';
            const truncatedName = drive.name.length > 24 ? drive.name.substring(0, 24) + '...' : drive.name;
            
            card.innerHTML = `
                <div class="cardHeader" id="header-${drive.id}">
                    <img src="${photoUrl}" alt="${drive.name}" class="cardImage">
                </div>
                <div class="cardBody">
                    <h3 class="cardTitle" title="${drive.name}">${truncatedName}</h3>
                    <p class="cardSubtitle">${category}</p>
                    <p class="cardDescription" id="desc-${drive.id}">${drive.description}</p>
                    ${drive.media ? `<p class="mediaLinkWrapper">Check out the original source: <a href="${drive.media}" target="_blank" class="mediaLink" id="media-${drive.id}">View Media Link</a></p>` : ''}
                    <div class="cardFooter">
                        <button class="deleteBtn" id="delete-${drive.id}" onclick="deleteDrive(${drive.id})">Delete Drive</button>
                        <button class="expandBtn" onclick="toggleExpand(${drive.id})" id="expand-${drive.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M14 13.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1 0-1h4.793L2.146 2.854a.5.5 0 1 1 .708-.708L13 12.293V7.5a.5.5 0 0 1 1 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading drives:', error);
    }
}

function getCategoryTag(category) {
    const tags = {
        'disasters': 'Typhoon Help',
        'food': 'Food Drive',
        'clothing': 'Clothing Drive',
        'education': 'School Supplies',
        'healthcare': 'Medical Aid',
        'furniture': 'Furniture',
        'hygiene': 'Hygiene Kits',
        'toys': 'Toy Drive',
        'monetary': 'Donations',
        'miscellaneous': 'General Aid'
    };
    return tags[category] || 'Drive';
}

function toggleExpand(id) {
    const modal = document.getElementById('expandedModal');
    
    if (!modal) {
        alert('Modal not found! Please refresh the page.');
        return;
    }
    
    const isOpen = modal.style.display === 'block';
    
    if (isOpen && modal.dataset.currentId === id.toString()) {
        // Close modal
        modal.style.display = 'none';
        modal.dataset.currentId = '';
        document.body.style.overflow = '';
    } else {
        // Open modal with drive details
        showExpandedModal(id);
    }
}

async function showExpandedModal(id) {
    try {
        const response = await fetch(`${API_URL}/drives/${currentCategory}`);
        const drives = await response.json();
        const drive = drives.find(d => d.id === id);
        
        if (!drive) {
            alert('Drive not found! ID: ' + id);
            return;
        }
        
        const modal = document.getElementById('expandedModal');
        const content = document.getElementById('expandedContent');
        
        const photoUrl = drive.photo || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800';
        
        content.innerHTML = `
            <div class="modalCard">
                <img src="${photoUrl}" alt="${drive.name}" class="modalImage">
                <div class="modalBody">
                    <h2>${drive.name}</h2>
                    <p class="modalSubtitle">${currentCategory}</p>
                    <p class="modalDescription">${drive.description}</p>
                    ${drive.media ? `<p class="mediaLinkWrapper">Check out the original source: <a href="${drive.media}" target="_blank" class="mediaLink">View Media Link</a></p>` : ''}
                    <div class="modalFooter">
                        <button class="deleteBtn" onclick="deleteDrive(${drive.id})">Delete Drive</button>
                        <button class="expandBtn" onclick="toggleExpand(${drive.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M2 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H3.707l10.147 10.146a.5.5 0 0 1-.708.708L3 3.707V8.5a.5.5 0 0 1-1 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        modal.dataset.currentId = id.toString();
        document.body.style.overflow = 'hidden';
    } catch (error) {
        alert('Error loading drive: ' + error.message);
    }
}

async function deleteDrive(id) {
    if (confirm('Are you sure you want to delete this drive?')) {
        try {
            await fetch(`${API_URL}/drives/${id}`, { method: 'DELETE' });
            location.reload();
        } catch (error) {
            console.error('Error deleting drive:', error);
        }
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('expandedModal');
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.dataset.currentId = '';
        document.body.style.overflow = '';
    }
});
