function loadDrives(category) {
    const drives = JSON.parse(localStorage.getItem('drives') || '[]');
    const categoryDrives = drives.filter(d => d.category === category);
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
}

function deleteDrive(id) {
    if (confirm('Are you sure you want to delete this drive?')) {
        let drives = JSON.parse(localStorage.getItem('drives') || '[]');
        drives = drives.filter(d => d.id !== id);
        localStorage.setItem('drives', JSON.stringify(drives));
        location.reload();
    }
}

function showExpanded(id) {
    const drives = JSON.parse(localStorage.getItem('drives') || '[]');
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
