import React, { useState } from 'react';

function QuestionEditor({ question, index, updateQuestion, removeQuestion }) {
    const [optionInput, setOptionInput] = useState('');

    const handleInputChange = (e) => {
        updateQuestion(index, { ...question, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        const updatedQuestion = { ...question, type: newType };
        if (newType === 'multiple-choice' && !question.options) {
            updatedQuestion.options = ['Option 1'];
        } else if (newType !== 'multiple-choice') {
            delete updatedQuestion.options;
        }
        updateQuestion(index, updatedQuestion);
    };

    const addOption = () => {
        if (optionInput.trim() === '') return;
        const newOptions = [...(question.options || []), optionInput];
        updateQuestion(index, { ...question, options: newOptions });
        setOptionInput('');
    };

    const updateOption = (optIndex, value) => {
        const newOptions = question.options.map((opt, i) => (i === optIndex ? value : opt));
        updateQuestion(index, { ...question, options: newOptions });
    };

    const removeOption = (optIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        updateQuestion(index, { ...question, options: newOptions });
    };

    return (
        <div className="question-block">
            <h4>Question {index + 1}</h4>
            <div>
                <label htmlFor={`qtext-${index}`}>Question Text:</label>
                <input
                    type="text"
                    id={`qtext-${index}`}
                    name="text"
                    className="question-text-input" // Added class for specific styling if needed
                    value={question.text || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your question"
                />
            </div>
            <div>
                <label htmlFor={`qtype-${index}`}>Question Type:</label>
                <select
                    id={`qtype-${index}`}
                    name="type"
                    value={question.type || 'text'}
                    onChange={handleTypeChange}
                >
                    <option value="text">Short Answer (Text)</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    {/* Add other types like 'checkbox', 'paragraph' later if needed */}
                </select>
            </div>

            {question.type === 'multiple-choice' && (
                <div className="options-editor">
                    <h5>Options:</h5>
                    {question.options && question.options.map((option, optIndex) => (
                        <div key={optIndex} className="option-item">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                            />
                            <button type="button" onClick={() => removeOption(optIndex)} className="btn-light">
                                Remove
                            </button>
                        </div>
                    ))}
                    <div className="option-item" style={{marginTop: '10px'}}>
                        <input
                            type="text"
                            className="option-input-new"
                            value={optionInput}
                            onChange={(e) => setOptionInput(e.target.value)}
                            placeholder="New option text"
                        />
                        <button type="button" onClick={addOption} className="btn-secondary">
                            Add Option
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="btn-danger"
                style={{ marginTop: '15px' }} // Keep some top margin for this button
            >
                Remove Question
            </button>
        </div>
    );
}

export default QuestionEditor;
