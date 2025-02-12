const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('@langchain/openai');
require('dotenv').config();

const app = express();
const port = 3000;

const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    model: 'gpt-4.0-turbo',
});

// console.log(model);

// console.log(process.env.OPENAI_API_KEY);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST route to handle user questions
app.post('/ask', (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    // Simple logic to generate a response
    let answer;
    if (question.toLowerCase().includes('weather')) {
        answer = 'I am not a weather bot, but it seems sunny in here!';
    } else if (question.toLowerCase().includes('name')) {
        answer = 'My name is QuestionBot!';
    } else {
        answer = 'That is an interesting question! Let me think about it.';
    }

    // Respond with the answer
    res.json({ question, answer });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
