// I set up the API URL to connect to my backend server
const API_URL = 'http://localhost:3000/api';
let currentCategory = ''; // This stores which category page we're on (healthcare, food, etc.)

// This function loads all the donation drives for a specific category
// I call this when the page loads to show all the drives
async function loadDrives(category) {
    currentCategory = category; // Remember which category we're viewing
    try {
        // I fetch the drives from my server for this specific category
        const response = await fetch(`${API_URL}/drives/${category}`);
        const categoryDrives = await response.json(); // Convert response to JavaScript object
        const container = document.getElementById('drivesContainer'); // Get the container where I'll put the cards

        // If there are no drives yet, I show a friendly message
        if (categoryDrives.length === 0) {
            container.innerHTML = '<p style="color: white;">No drives yet in this category.</p>';
            return;
        }

        // I set up a responsive grid layout for the drive cards
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        container.style.gap = '1.5rem';

        // I loop through each drive and create a card for it
        categoryDrives.forEach(drive => {
            const card = document.createElement('div'); // Create the card container
            card.className = 'driveCard';
            card.id = `card-${drive.id}`; // Give each card a unique ID
            
            // If there's no photo, I use a default image from Unsplash
            const photoUrl = drive.photo || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800';
            // I truncate the title to 24 characters so all cards look uniform
            const truncatedName = drive.name.length > 24 ? drive.name.substring(0, 24) + '...' : drive.name;
            
            // I build the HTML for the card with all the drive information
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
            container.appendChild(card); // Add the card to the page
        });
    } catch (error) {
        console.error('Error loading drives:', error);
    }
}

// This function provides readable names for each category
// I use this to show nice labels instead of just "healthcare" or "food"
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

// This function handles expanding and collapsing the modal
// When someone clicks the expand button, I open the modal with full details
function toggleExpand(id) {
    const modal = document.getElementById('expandedModal');
    
    // I check if the modal exists on the page (safety check)
    if (!modal) {
        alert('Modal not found! Please refresh the page.');
        return;
    }
    
    const isOpen = modal.style.display === 'block'; // Check if modal is already open
    
    // If the modal is open and showing this same drive, I close it
    if (isOpen && modal.dataset.currentId === id.toString()) {
        modal.style.display = 'none';
        modal.dataset.currentId = '';
        document.body.style.overflow = ''; // Allow page scrolling again
    } else {
        // Otherwise, I open the modal and show this drive's details
        showExpandedModal(id);
    }
}

// This function fetches the drive data and displays it in a modal popup
// I use this to show the full information without leaving the page
async function showExpandedModal(id) {
    try {
        // I fetch all drives in this category from the server
        const response = await fetch(`${API_URL}/drives/${currentCategory}`);
        const drives = await response.json();
        const drive = drives.find(d => d.id === id); // Find the specific drive we want
        
        // If the drive doesn't exist, show an error
        if (!drive) {
            alert('Drive not found! ID: ' + id);
            return;
        }
        
        const modal = document.getElementById('expandedModal');
        const content = document.getElementById('expandedContent');
        
        const photoUrl = drive.photo || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800';
        
        // I build the modal content with the full drive details
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
        
        // I show the modal and prevent background scrolling
        modal.style.display = 'block';
        modal.dataset.currentId = id.toString(); // Remember which drive is being shown
        document.body.style.overflow = 'hidden'; // Lock background scrolling
    } catch (error) {
        alert('Error loading drive: ' + error.message);
    }
}

// This function deletes a drive after confirming with the user
// I call my server's DELETE endpoint to remove it from the database
async function deleteDrive(id) {
    if (confirm('Are you sure you want to delete this drive?')) {
        try {
            await fetch(`${API_URL}/drives/${id}`, { method: 'DELETE' });
            location.reload(); // Refresh the page to show the updated list
        } catch (error) {
            console.error('Error deleting drive:', error);
        }
    }
}

// I set up a click listener to close the modal when clicking outside of it
// This makes the user experience more intuitive
window.addEventListener('click', function(e) {
    const modal = document.getElementById('expandedModal');
    if (e.target === modal) { // If they clicked the dark background
        modal.style.display = 'none';
        modal.dataset.currentId = '';
        document.body.style.overflow = ''; // Allow scrolling again
    }
});
