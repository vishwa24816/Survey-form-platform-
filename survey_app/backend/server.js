const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Backend server port

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

const surveysFilePath = path.join(__dirname, 'surveys.json');
const responsesFilePath = path.join(__dirname, 'responses.json');

// Helper function to read data
const readData = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { // File doesn't exist
            return filePath === surveysFilePath ? [] : {}; // Default for surveys is [], for responses {}
        }
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
};

// Helper function to write data
const writeData = async (filePath, data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw error;
    }
};

// Ensure responses.json exists (call this once at startup)
const initializeFiles = async () => {
    try {
        await fs.access(surveysFilePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeData(surveysFilePath, []);
            console.log('surveys.json created and initialized.');
        }
    }
    try {
        await fs.access(responsesFilePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeData(responsesFilePath, {}); // Initialize with an empty object for responses
            console.log('responses.json created and initialized.');
        }
    }
};

// POST /api/surveys - Create a new survey
app.post('/api/surveys', async (req, res) => {
    try {
        const surveys = await readData(surveysFilePath);
        const newSurvey = {
            id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: req.body.title,
            questions: req.body.questions
        };

        if (!newSurvey.title || !Array.isArray(newSurvey.questions) || newSurvey.questions.length === 0) {
            return res.status(400).json({ message: 'Survey title and at least one question are required.' });
        }
        // Basic validation for questions
        for (const q of newSurvey.questions) {
            if (!q.text || !q.type) {
                return res.status(400).json({ message: 'Each question must have text and type.' });
            }
            if (q.type === 'multiple-choice' && (!Array.isArray(q.options) || q.options.length === 0)) {
                return res.status(400).json({ message: 'Multiple-choice questions must have options.' });
            }
        }

        surveys.push(newSurvey);
        await writeData(surveysFilePath, surveys);
        res.status(201).json(newSurvey);
    } catch (error) {
        res.status(500).json({ message: 'Error creating survey', error: error.message });
    }
});

// POST /api/surveys/:surveyId/responses - Submit responses for a survey
app.post('/api/surveys/:surveyId/responses', async (req, res) => {
    const { surveyId } = req.params;
    const userAnswers = req.body.answers; // Expecting { answers: { "q_0": "ans", "q_1": "ans" ... } }

    if (!userAnswers || typeof userAnswers !== 'object' || Object.keys(userAnswers).length === 0) {
        return res.status(400).json({ message: 'Responses are required.' });
    }

    try {
        // First, verify the survey exists
        const surveys = await readData(surveysFilePath);
        const surveyExists = surveys.some(s => s.id === surveyId);
        if (!surveyExists) {
            return res.status(404).json({ message: 'Survey not found.' });
        }

        const allResponses = await readData(responsesFilePath);

        if (!allResponses[surveyId]) {
            allResponses[surveyId] = [];
        }

        const newResponseSet = {
            responseSetId: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            submittedAt: new Date().toISOString(),
            answers: userAnswers
        };

        allResponses[surveyId].push(newResponseSet);
        await writeData(responsesFilePath, allResponses);

        res.status(201).json({ message: 'Responses submitted successfully', responseSetId: newResponseSet.responseSetId });

    } catch (error) {
        console.error(`Error submitting responses for survey ${surveyId}:`, error);
        res.status(500).json({ message: 'Error submitting responses', error: error.message });
    }
});

// GET /api/surveys - Get all survey titles and IDs
app.get('/api/surveys', async (req, res) => {
    try {
        const surveys = await readData(surveysFilePath);
        const surveyList = surveys.map(s => ({ id: s.id, title: s.title }));
        res.json(surveyList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching surveys', error: error.message });
    }
});

// GET /api/surveys/:surveyId - Get a specific survey structure
app.get('/api/surveys/:surveyId', async (req, res) => {
    try {
        const surveys = await readData(surveysFilePath);
        const survey = surveys.find(s => s.id === req.params.surveyId);
        if (survey) {
            res.json(survey);
        } else {
            res.status(404).json({ message: 'Survey not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching survey', error: error.message });
    }
});

// Initialize files and then start the server
initializeFiles().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error("Failed to initialize files or start server:", error);
    process.exit(1);
});
