const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'drives.json');

app.use(cors());
app.use(express.json());
app.use(express.static('src'));
app.use('/media', express.static('media'));


async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, '[]');
    }
}

// GET all drives
app.get('/api/drives', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read drives' });
    }
});

// GET drives by category
app.get('/api/drives/:category', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const drives = JSON.parse(data);
        const filtered = drives.filter(d => d.category === req.params.category);
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read drives' });
    }
});

// POST new drive
app.post('/api/drives', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const drives = JSON.parse(data);
        const newDrive = { ...req.body, id: Date.now() };
        drives.push(newDrive);
        await fs.writeFile(DATA_FILE, JSON.stringify(drives, null, 2));
        res.status(201).json(newDrive);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create drive' });
    }
});

// DELETE drive
app.delete('/api/drives/:id', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        let drives = JSON.parse(data);
        drives = drives.filter(d => d.id !== parseInt(req.params.id));
        await fs.writeFile(DATA_FILE, JSON.stringify(drives, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete drive' });
    }
});

initDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
