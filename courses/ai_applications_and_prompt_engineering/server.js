const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('@langchain/openai');
const { PromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");
require('dotenv').config();

const app = express();
const port = 3000;

const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    model: 'gpt-4.0-turbo',
});

const parser = StructuredOutputParser.fromNamesAndDescriptions({
    code: "JavaScript code that answers the user's question",
    explanation: "detailed explanation of the code provided",
});

const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
    template: "You are a programming expert and will answer the user's coding questions as thoroughly as possible using JavaScript. If the question is unrelated to coding, do not answer.\n{format_instructions}\n{question}",
    inputVariables: ["question"],
    partialVariables: { format_instructions: formatInstructions },
});

// console.log(model);

const promptFunc = async (input) => {
    try {
        // Format prompt with user input
        const promptInput = await prompt.format({ question: input });

        // Invoke the model with the formatted prompt
        const res = await model.invoke(promptInput);

        try {
            const parsedResult = await parser.parse(res);
            return parsedResult;
        } catch (e) {
            console.error(e);
            return res;
        }
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
