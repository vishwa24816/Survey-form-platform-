import React, { useState, useEffect } from 'react';

function SurveyList({ onTakeSurvey }) { // onTakeSurvey will be a function passed from App.js
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('http://localhost:3001/api/surveys');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSurveys(data);
            } catch (e) {
                console.error("Failed to fetch surveys:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveys();
    }, []);

    if (loading) {
        return <p>Loading surveys...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error loading surveys: {error}. Is the backend server running?</p>;
    }

    if (surveys.length === 0) {
        return <p>No surveys available yet. Try creating one!</p>;
    }

    return (
        <div className="survey-container">
            <h2>Available Surveys</h2>
            <ul className="survey-list">
                {surveys.map(survey => (
                    <li key={survey.id} className="survey-list-item">
                        <span>{survey.title}</span>
                        <button onClick={() => onTakeSurvey(survey.id)} className="btn-primary">
                            Take Survey
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SurveyList;
