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
    model: 'gpt-3.5-turbo',
});

// Step 1: General-purpose parser to detect the action
const actionDetectionParser = StructuredOutputParser.fromNamesAndDescriptions({
    action: "Action to perform on a list which semantically translate to - 'add', 'get', or 'reset'",
});

// Step 2: Specific parsers for each action
const getParser = StructuredOutputParser.fromNamesAndDescriptions({
    list_name: "List to retrieve items from",
    action: "Must be 'get'",
});

const addParser = StructuredOutputParser.fromNamesAndDescriptions({
    list_name: "List to add items to",
    list_items: "Array of items to add",
    action: "Must be 'add'",
});

const resetParser = StructuredOutputParser.fromNamesAndDescriptions({
    list_name: "List to reset (clear all items)",
    action: "Must be 'reset'",
});

// Map parsers by action type
const parsers = {
    "get": getParser,
    "add": addParser,
    "reset": resetParser,
};

// Function to select the correct parser
const getParserByAction = (action) => {
    return parsers[action] || null;
};

// Step 3: Modify prompt to first detect action, then refine output
const prompt = new PromptTemplate({
    template: `You are a list manager AI. Your job is to detect the intent behind the user's request regarding a list.

The user may phrase their request in different ways. Your task is to classify the request as one of the following actions:

1. **"add"** – If the user wants to **add items** to a list (e.g., "Add milk to my shopping list", "Put eggs in my grocery list").
2. **"get"** – If the user wants to **retrieve items** from a list (e.g., "What is in my shopping list?", "Show me my grocery list", "Do I have anything in my todo list?").
3. **"reset"** – If the user wants to **clear or reset a list** (e.g., "Empty my shopping list", "Clear my grocery list", "Reset my todo list").

\`\`\`json
{format_instructions}
\`\`\`

Do not include any explanations—only return the JSON object.

{question}`,
    inputVariables: ["question"],
    partialVariables: { format_instructions: actionDetectionParser.getFormatInstructions() },
});

// Step 4: Process input and dynamically select a parser
const promptFunc = async (input) => {
    try {
        // **First Call: Detect action**
        const detectionPrompt = await prompt.format({
            question: input,
            format_instructions: actionDetectionParser.getFormatInstructions()
        });
        const detectionRes = await model.invoke(detectionPrompt);

        try {
            const detectedAction = await actionDetectionParser.parse(detectionRes);
            const action = detectedAction.action.toLowerCase();

            console.log(`Detected Action: ${action}`);

            // **Select the appropriate parser**
            const selectedParser = getParserByAction(action);
            if (!selectedParser) return `Unknown action detected: ${action}`;

            // **Second Call: Get structured data based on action**
            const finalPrompt = await prompt.format({
                question: input,
                format_instructions: selectedParser.getFormatInstructions()
            });
            const finalRes = await model.invoke(finalPrompt);

            return await selectedParser.parse(finalRes);
        } catch (e) {
            console.error("Parsing Error:", e);
            return detectionRes;  // Return raw response if parsing fails
        }
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

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
