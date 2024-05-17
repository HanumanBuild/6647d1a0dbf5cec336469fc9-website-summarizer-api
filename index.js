const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.get('/', (req, res) => {
    res.send('Welcome to the Website Summarizer API');
});

// New endpoint for summarizing website content
app.post('/summarize', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Validate URL
        new URL(url);

        // Fetch website content
        const response = await axios.get(url);
        const html = response.data;

        // Parse HTML to extract text
        const $ = cheerio.load(html);
        const text = $('body').text().replace(/\s+/g, ' ').trim();

        // Send text to OpenAI for summarization
        const summaryResponse = await openai.Completion.create({
            engine: 'text-davinci-003',
            prompt: `Summarize the following text: ${text}`,
            max_tokens: 150,
            temperature: 0.5,
        });

        const summary = summaryResponse.choices[0].text.trim();
        res.json({ summary });
    } catch (error) {
        console.error(error);

        if (error instanceof TypeError) {
            // Invalid URL
            res.status(400).json({ error: 'Invalid URL' });
        } else if (error.response) {
            // Network error or non-200 response
            res.status(500).json({ error: 'Failed to fetch website content' });
        } else if (error instanceof OpenAI.APIError) {
            // OpenAI API error
            res.status(500).json({ error: 'Failed to summarize content using OpenAI' });
        } else {
            // General error
            res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});