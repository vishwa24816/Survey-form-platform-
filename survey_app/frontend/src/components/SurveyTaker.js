import React, { useState, useEffect } from 'react';

function SurveyTaker({ surveyId, onSubmissionSuccess }) { // Renamed prop for clarity
    const [survey, setSurvey] = useState(null);
    const [responses, setResponses] = useState({}); // { questionIndex: response_value }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submissionMessage, setSubmissionMessage] = useState('');


    useEffect(() => {
        if (!surveyId) return;

        const fetchSurveyDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                setSubmissionMessage('');
                const response = await fetch(`http://localhost:3001/api/surveys/${surveyId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSurvey(data);
                // Initialize responses state based on question IDs or indices
                const initialResponses = {};
                data.questions.forEach((q, index) => {
                    // Using index as a simple key for now, but a unique question ID would be better
                    initialResponses[`q_${index}`] = '';
                });
                setResponses(initialResponses);
            } catch (e) {
                console.error(`Failed to fetch survey ${surveyId}:`, e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveyDetails();
    }, [surveyId]);

    const handleInputChange = (questionIndex, value) => {
        setResponses(prev => ({
            ...prev,
            [`q_${questionIndex}`]: value
        }));
    };

    const handleOptionChange = (questionIndex, optionValue) => {
        setResponses(prev => ({
            ...prev,
            [`q_${questionIndex}`]: optionValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionMessage(''); // Clear previous messages

        // Basic validation: Check if all questions have been answered
        // This is simple validation; more complex rules might be needed depending on question types
        const unansweredQuestions = survey.questions.filter((q, index) => {
            const response = responses[`q_${index}`];
            return response === undefined || response === null || response === '';
        });

        if (unansweredQuestions.length > 0) {
            setSubmissionMessage('Error: Please answer all questions before submitting.');
            return;
        }

        try {
            const payload = { answers: responses };
            const response = await fetch(`http://localhost:3001/api/surveys/${surveyId}/responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmissionMessage(`Survey submitted successfully! Response ID: ${result.responseSetId}`);
                // Optionally, disable the form or clear responses
                // setResponses({}); // Or reset to initial empty state
                if (onSubmissionSuccess) {
                    onSubmissionSuccess(surveyId, responses); // Notify parent
                }
            } else {
                setSubmissionMessage(`Error submitting survey: ${result.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to submit survey responses:', error);
            setSubmissionMessage(`Failed to submit survey: ${error.message}. Is the backend server running?`);
        }
    };


    if (loading) {
        return <p>Loading survey...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error loading survey: {error}.</p>;
    }

    if (!survey) {
        return <p>Survey not found or an error occurred.</p>;
    }

    return (
        <div className="survey-container">
            <h2>{survey.title}</h2>
            {submissionMessage && (
                <p className={`message-text ${submissionMessage.includes('Error') || submissionMessage.includes('Failed') ? 'error' : 'success'}`}>
                    {submissionMessage}
                </p>
            )}
            <form onSubmit={handleSubmit}>
                {survey.questions.map((question, qIndex) => (
                    <div key={qIndex} className="question-block survey-taker-question">
                        <p>{qIndex + 1}. {question.text}</p>
                        {question.type === 'text' && (
                            <input
                                type="text"
                                value={responses[`q_${qIndex}`] || ''}
                                onChange={(e) => handleInputChange(qIndex, e.target.value)}
                                placeholder="Your answer"
                                required
                            />
                        )}
                        {question.type === 'multiple-choice' && question.options && (
                            <div className="mc-options">
                                {question.options.map((option, optIndex) => (
                                    <div key={optIndex}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`q_${qIndex}_options`}
                                                value={option}
                                                checked={responses[`q_${qIndex}`] === option}
                                                onChange={(e) => handleOptionChange(qIndex, e.target.value)}
                                                required
                                            />
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Add more question types here later (e.g., checkbox, paragraph) */}
                    </div>
                ))}
                <button
                    type="submit"
                    className="btn-success"
                    style={{ marginTop: '20px' }}
                >
                    Submit Survey
                </button>
            </form>
        </div>
    );
}

export default SurveyTaker;
