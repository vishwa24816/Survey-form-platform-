import React, { useState } from 'react';
import QuestionEditor from './QuestionEditor';

function SurveyCreator() {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [message, setMessage] = useState(''); // For success/error messages

    const addQuestion = () => {
        setQuestions([...questions, { text: '', type: 'text' }]); // Default new question
    };

    const updateQuestion = (index, updatedQuestion) => {
        const newQuestions = questions.map((q, i) => (i === index ? updatedQuestion : q));
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!title.trim()) {
            setMessage('Survey title is required.');
            return;
        }
        if (questions.length === 0) {
            setMessage('At least one question is required.');
            return;
        }
        // Basic validation for questions
        for (const q of questions) {
            if (!q.text || !q.type) {
                setMessage('All questions must have text and type.');
                return;
            }
            if (q.type === 'multiple-choice' && (!q.options || q.options.length < 2)) {
                setMessage('Multiple-choice questions must have at least two options.');
                return;
            }
            if (q.type === 'multiple-choice' && q.options) {
                for (const opt of q.options) {
                    if (!opt.trim()) {
                        setMessage('Multiple-choice options cannot be empty.');
                        return;
                    }
                }
            }
        }

        const surveyData = { title, questions };

        try {
            // Assuming backend is running on port 3001
            const response = await fetch('http://localhost:3001/api/surveys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(surveyData),
            });

            if (response.ok) {
                const result = await response.json();
                setMessage(`Survey "${result.title}" created successfully! ID: ${result.id}`);
                setTitle('');
                setQuestions([]);
            } else {
                const errorData = await response.json();
                setMessage(`Error creating survey: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to submit survey:', error);
            setMessage(`Failed to submit survey: ${error.message}. Is the backend server running?`);
        }
    };

    return (
        <div className="survey-container">
            <h2>Create New Survey</h2>
            {message && (
                <p className={`message-text ${message.startsWith('Error') || message.startsWith('Failed') ? 'error' : 'success'}`}>
                    {message}
                </p>
            )}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="surveyTitle">Survey Title:</label>
                    <input
                        type="text"
                        id="surveyTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter survey title"
                    />
                </div>

                {questions.map((q, index) => (
                    <QuestionEditor
                        key={index} // Ideally, use a stable unique ID
                        index={index}
                        question={q}
                        updateQuestion={updateQuestion}
                        removeQuestion={removeQuestion}
                    />
                ))}

                <div style={{ marginTop: '20px' }}> {/* Wrapper for buttons to add some top margin */}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="btn-primary"
                    >
                        Add Question
                    </button>
                    <button
                        type="submit"
                        className="btn-success"
                    >
                        Save Survey
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SurveyCreator;
