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

const promptFunc = async (input) => {
    try {
        const res = await model.invoke(input);
        return res;
    } catch (error) {
        console.error(error);
        throw(error);
    }
};


// console.log(process.env.OPENAI_API_KEY);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST route to handle user questions
app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Please provide a question' });
        }

        const result = await promptFunc(question);
        res.json({ result });
    } catch (error) {
        console.error("Error: ", error.message);
        res.status(500).json({ error: error.message });
    }

});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
