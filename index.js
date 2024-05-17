const express = require('express');
const app = express();
const PORT = 3000;

// Import MongoDB connection
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Website Summarizer API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});