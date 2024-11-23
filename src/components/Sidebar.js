import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { FaTrash, FaSyncAlt } from 'react-icons/fa';

const Sidebar = ({ load }) => {
  const [questions, setQuestions] = useState([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/clustered_questions');
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        setQuestions(data); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [load]);

  const handleClearAll = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/clear_all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear all records');
      }

      setQuestions([]); 
      window.location.reload();
    } catch (error) {
      console.error('Error clearing all records:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/messages/${id}`, {
        method: 'DELETE',
      });

     
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="highlight-message">
        <h4>Current Topic</h4>
        <p>{"People in the chat are discussing about ..." || 'Loading...'}</p>
      </div>

      <div className="questions-list">
        <h4 style={{ color: 'blue' }}>Questions in the Chat</h4>
        {questions.length > 0 ? (
          <ul>
            {questions.map((question) => (
              <li key={question.id} className="question-item">
                {question.text}
                <button className="delete-button" onClick={() => handleDelete(question.id)}>
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No questions found.</p>
        )}
      </div>

    
      <div
        className="tooltip-wrapper"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <button className="circular-button" onClick={handleClearAll}>
          <FaSyncAlt />
        </button>
        {tooltipVisible && <span className="tooltip-text">Start New Stream</span>}
      </div>
    </div>
  );
};

export default Sidebar;
