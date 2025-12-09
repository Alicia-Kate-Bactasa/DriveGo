// I'm importing the libraries I need for my server
const express = require('express'); // This helps me create the web server
const cors = require('cors'); // This lets my frontend talk to my backend without security issues
const fs = require('fs').promises; // This lets me read and write files on my computer
const path = require('path'); // This helps me work with file paths correctly

// I'm setting up my Express application
const app = express();
const PORT = 3000; // My server will run on port 3000 (localhost:3000)
const DATA_FILE = path.join(__dirname, 'drives.json'); // This is where I store all the donation drives

// I'm configuring middleware - these run before my routes
app.use(cors()); // Allow requests from my frontend
app.use(express.json()); // Let me receive JSON data in requests
app.use(express.static('src')); // Serve my HTML/CSS/JS files from the src folder
app.use('/media', express.static('media')); // Serve images from the media folder



// I created this function to make sure my data file exists when the server starts
// If it doesn't exist, I create an empty array file
async function initDataFile() {
    try {
        await fs.access(DATA_FILE); // Check if the file exists
    } catch {
        // If file doesn't exist, create it with an empty array
        await fs.writeFile(DATA_FILE, '[]');
    }
}

// ROUTE 1: Get all drives from every category
// When someone visits /api/drives, I send them all the donation drives
app.get('/api/drives', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8'); // Read the file
        res.json(JSON.parse(data)); // Send it back as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to read drives' }); // If something goes wrong, send error
    }
});

// ROUTE 2: Get drives filtered by category (like only healthcare or only food)
// When someone visits /api/drives/healthcare, I only send healthcare drives
app.get('/api/drives/:category', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8'); // Read all drives
        const drives = JSON.parse(data);
        // I filter to only get drives that match the requested category
        const filtered = drives.filter(d => d.category === req.params.category);
        res.json(filtered); // Send back only the matching drives
    } catch (error) {
        res.status(500).json({ error: 'Failed to read drives' });
    }
});

// ROUTE 3: Create a new drive
// When someone submits the form on my homepage, this saves it to my file
app.post('/api/drives', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8'); // Read existing drives
        const drives = JSON.parse(data);
        // I create a new drive with the form data and give it a unique ID using timestamp
        const newDrive = { ...req.body, id: Date.now() };
        drives.push(newDrive); // Add it to my array
        await fs.writeFile(DATA_FILE, JSON.stringify(drives, null, 2)); // Save everything back to the file
        res.status(201).json(newDrive); // Send back the new drive
    } catch (error) {
        res.status(500).json({ error: 'Failed to create drive' });
    }
});

// ROUTE 4: Delete a drive
// When someone clicks the delete button, this removes it from the file
app.delete('/api/drives/:id', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8'); // Read all drives
        let drives = JSON.parse(data);
        // I filter out the drive with the matching ID (removing it)
        drives = drives.filter(d => d.id !== parseInt(req.params.id));
        await fs.writeFile(DATA_FILE, JSON.stringify(drives, null, 2)); // Save the updated list
        res.json({ success: true }); // Confirm it worked
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete drive' });
    }
});

// Finally, I start my server after making sure the data file exists
initDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
