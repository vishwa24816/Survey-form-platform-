import React, { useState } from 'react';
import './App.css';
import SurveyCreator from './components/SurveyCreator';
import SurveyList from './components/SurveyList';
import SurveyTaker from './components/SurveyTaker';

// Define view modes
const VIEW_MODES = {
  LIST_SURVEYS: 'list_surveys',
  CREATE_SURVEY: 'create_survey',
  TAKE_SURVEY: 'take_survey',
};

function App() {
  const [currentView, setCurrentView] = useState(VIEW_MODES.LIST_SURVEYS);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);

  const navigateToCreate = () => {
    setCurrentView(VIEW_MODES.CREATE_SURVEY);
    setSelectedSurveyId(null); // Clear selected survey when navigating to create
  };

  const navigateToList = () => {
    setCurrentView(VIEW_MODES.LIST_SURVEYS);
    setSelectedSurveyId(null);
  };

  const handleTakeSurvey = (surveyId) => {
    setSelectedSurveyId(surveyId);
    setCurrentView(VIEW_MODES.TAKE_SURVEY);
  };

  const handleSurveySubmissionSuccess = (surveyId, responses) => {
    console.log(`App: Survey ${surveyId} successfully submitted by SurveyTaker. Responses:`, responses);
    // Could show a global success message here if desired, then navigate.
    // For now, SurveyTaker shows its own message. We just navigate.
    setTimeout(() => { // Give user a moment to read SurveyTaker's message
        navigateToList();
    }, 2000); // Navigate back to list after 2 seconds
  };


  let content;
  if (currentView === VIEW_MODES.CREATE_SURVEY) {
    content = <SurveyCreator />;
  } else if (currentView === VIEW_MODES.TAKE_SURVEY && selectedSurveyId) {
    content = <SurveyTaker surveyId={selectedSurveyId} onSubmissionSuccess={handleSurveySubmissionSuccess} />;
  } else { // Default to list surveys
    content = <SurveyList onTakeSurvey={handleTakeSurvey} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Survey Form Application</h1>
        <nav>
          <button onClick={navigateToList} style={{marginRight: '10px'}}>View Surveys</button>
          <button onClick={navigateToCreate}>Create New Survey</button>
        </nav>
      </header>
      <main className="App-main">
        {content}
      </main>
      <footer className="App-footer">
        <p>Survey App &copy; 2024</p>
      </footer>
    </div>
  );
}

export default App;
