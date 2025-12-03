const API_URL = 'http://localhost:3000/api';

async function loadDrives(category) {
    try {
        const response = await fetch(`${API_URL}/drives/${category}`);
        const categoryDrives = await response.json();
        const container = document.getElementById('drivesContainer');

        if (categoryDrives.length === 0) {
            container.innerHTML = '<p style="color: white;">No drives yet in this category.</p>';
            return;
        }

        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        container.style.gap = '1.5rem';

        categoryDrives.forEach(drive => {
            const card = document.createElement('div');
            card.className = 'driveCard';
            card.style.aspectRatio = '1';
            card.innerHTML = `
                <h3>${drive.name}</h3>
                <p>${drive.description.substring(0, 50)}${drive.description.length > 50 ? '...' : ''}</p>
                <button class="btnExpand" onclick="showExpanded(${drive.id})">View More</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading drives:', error);
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

async function showExpanded(id) {
    try {
        const response = await fetch(`${API_URL}/drives`);
        const drives = await response.json();
        const drive = drives.find(d => d.id === id);
        const modal = document.getElementById('expandedModal');
        const content = document.getElementById('expandedContent');
        
        content.innerHTML = `
            <span class="closeExpanded" onclick="closeExpanded()">&times;</span>
            <h2>${drive.name}</h2>
            <p><strong>Description:</strong> ${drive.description}</p>
            ${drive.media ? `<p><strong>Media Link:</strong> <a href="${drive.media}" target="_blank">${drive.media}</a></p>` : ''}
            ${drive.photo ? `<img src="${drive.photo}" alt="Drive photo">` : ''}
            <button class="btnExpandDelete" onclick="deleteDrive(${drive.id})">Delete Drive</button>
        `;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading drive details:', error);
    }
}

function closeExpanded() {
    document.getElementById('expandedModal').style.display = 'none';
}

window.addEventListener('click', function(e) {
    const modal = document.getElementById('expandedModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
