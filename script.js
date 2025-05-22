/**
 * QuizVault JavaScript - Main Application Logic
 * A complete quiz platform for college students
 */

// Global variables to manage application state
let currentQuizData = null;      // Stores the currently active quiz
let currentQuestionIndex = 0;    // Current question being displayed
let userAnswers = [];            // Array to store user's answers
let questionCount = 1;           // Counter for questions in create quiz form

/**
 * Navigation Functions
 */

// Show specific section and hide others
function showSection(sectionId) {
    // Hide all sections by removing 'active' class
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the target section by adding 'active' class
    document.getElementById(sectionId).classList.add('active');
    
    // Show/hide back button based on current section
    const backBtn = document.querySelector('.back-btn');
    if (sectionId === 'homepage') {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
    }
    
    // Load section-specific data
    if (sectionId === 'quiz-list') {
        loadQuizList();
    }
}

// Navigate back to homepage
function goBack() {
    showSection('homepage');
}

/**
 * Quiz Creation Functions
 */

// Add a new question to the create quiz form
function addQuestion() {
    questionCount++;
    const questionsContainer = document.getElementById('questions-container');
    
    // Create new question card HTML
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.innerHTML = `
        <h3>Question ${questionCount}</h3>
        <div class="form-group">
            <label>Question:</label>
            <textarea class="question-text" placeholder="Enter your question" required></textarea>
        </div>
        
        <div class="option-group">
            <input type="text" class="option" placeholder="Option A" required>
            <input type="text" class="option" placeholder="Option B" required>
            <input type="text" class="option" placeholder="Option C" required>
            <input type="text" class="option" placeholder="Option D" required>
        </div>
        
        <div class="form-group">
            <label>Correct Answer:</label>
            <select class="correct-answer" required>
                <option value="">Select correct answer</option>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
            </select>
        </div>
        
        <button type="button" class="btn-secondary" onclick="removeQuestion(this)" style="float: right;">Remove</button>
    `;
    
    questionsContainer.appendChild(questionCard);
}

// Remove a question from the create quiz form
function removeQuestion(button) {
    // Ensure at least one question remains
    if (questionCount > 1) {
        button.parentElement.remove();
        questionCount--;
        updateQuestionNumbers();
    } else {
        alert('At least one question is required!');
    }
}

// Update question numbers after a question is removed
function updateQuestionNumbers() {
    const questionCards = document.querySelectorAll('.question-card h3');
    questionCards.forEach((heading, index) => {
        heading.textContent = `Question ${index + 1}`;
    });
}

/**
 * Quiz Form Submission Handler
 */
document.addEventListener('DOMContentLoaded', function() {
    const quizForm = document.getElementById('quiz-form');
    
    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get quiz title
        const quizTitle = document.getElementById('quiz-title').value.trim();
        
        if (!quizTitle) {
            alert('Please enter a quiz title!');
            return;
        }
        
        // Get all question cards
        const questionCards = document.querySelectorAll('.question-card');
        const questions = [];
        
        // Extract data from each question card
        let isValid = true;
        questionCards.forEach((card, index) => {
            const questionText = card.querySelector('.question-text').value.trim();
            const options = Array.from(card.querySelectorAll('.option')).map(input => input.value.trim());
            const correctAnswer = card.querySelector('.correct-answer').value;
            
            // Validation
            if (!questionText) {
                alert(`Please enter text for Question ${index + 1}`);
                isValid = false;
                return;
            }
            
            if (options.some(option => !option)) {
                alert(`Please fill all options for Question ${index + 1}`);
                isValid = false;
                return;
            }
            
            if (correctAnswer === '') {
                alert(`Please select correct answer for Question ${index + 1}`);
                isValid = false;
                return;
            }
            
            questions.push({
                question: questionText,
                options: options,
                correctAnswer: parseInt(correctAnswer)
            });
        });
        
        if (!isValid) return;
        
        // Create quiz object
        const quiz = {
            id: Date.now().toString(),
            title: quizTitle,
            questions: questions,
            createdAt: new Date().toLocaleDateString()
        };
        
        // Save quiz to localStorage
        saveQuiz(quiz);
        
        // Reset form and return to homepage
        resetQuizForm();
        alert('Quiz saved successfully! 🎉');
        showSection('homepage');
    });
});

// Reset the quiz creation form
function resetQuizForm() {
    document.getElementById('quiz-form').reset();
    questionCount = 1;
    
    // Reset questions container to initial state
    document.getElementById('questions-container').innerHTML = `
        <div class="question-card">
            <h3>Question 1</h3>
            <div class="form-group">
                <label>Question:</label>
                <textarea class="question-text" placeholder="Enter your question" required></textarea>
            </div>
            
            <div class="option-group">
                <input type="text" class="option" placeholder="Option A" required>
                <input type="text" class="option" placeholder="Option B" required>
                <input type="text" class="option" placeholder="Option C" required>
                <input type="text" class="option" placeholder="Option D" required>
            </div>
            
            <div class="form-group">
                <label>Correct Answer:</label>
                <select class="correct-answer" required>
                    <option value="">Select correct answer</option>
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Local Storage Functions
 */

// Save quiz to localStorage
function saveQuiz(quiz) {
    try {
        let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        quizzes.push(quiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
    } catch (error) {
        console.error('Error saving quiz:', error);
        alert('Error saving quiz. Please try again.');
    }
}

// Get all quizzes from localStorage
function getQuizzes() {
    try {
        return JSON.parse(localStorage.getItem('quizzes')) || [];
    } catch (error) {
        console.error('Error loading quizzes:', error);
        return [];
    }
}

/**
 * Quiz List Functions
 */

// Load and display all available quizzes
function loadQuizList() {
    const quizzes = getQuizzes();
    const container = document.getElementById('quizzes-container');
    
    // Show empty state if no quizzes exist
    if (quizzes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No quizzes available yet!</h3>
                <p>Create your first quiz to get started.</p>
                <button class="btn" onclick="showSection('create-quiz')">📝 Create Quiz</button>
            </div>
        `;
        return;
    }
    
    // Display all quizzes
    container.innerHTML = '';
    quizzes.forEach(quiz => {
        const quizItem = document.createElement('div');
        quizItem.className = 'quiz-item';
        quizItem.onclick = () => startQuiz(quiz);
        quizItem.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>${quiz.questions.length} question${quiz.questions.length !== 1 ? 's' : ''} • Created on ${quiz.createdAt}</p>
        `;
        container.appendChild(quizItem);
    });
}

/**
 * Quiz Taking Functions
 */

// Initialize quiz taking session
function startQuiz(quiz) {
    currentQuizData = quiz;
    currentQuestionIndex = 0;
    userAnswers = new Array(quiz.questions.length).fill(null);
    
    // Set quiz title and show quiz section
    document.getElementById('current-quiz-title').textContent = quiz.title;
    showSection('take-quiz');
    loadQuestion();
}

// Load and display current question
function loadQuestion() {
    const question = currentQuizData.questions[currentQuestionIndex];
    const container = document.getElementById('quiz-content');
    
    // Create question HTML with radio options
    container.innerHTML = `
        <div class="question-card">
            <h3>${question.question}</h3>
            <div style="margin-top: 20px;">
                ${question.options.map((option, index) => `
                    <label class="radio-option">
                        <input type="radio" name="answer" value="${index}" 
                               ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
                        ${String.fromCharCode(65 + index)}. ${option}
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    updateQuestionNavigation();
}

// Update question counter and navigation buttons
function updateQuestionNavigation() {
    // Update question counter
    document.getElementById('question-counter').textContent = 
        `Question ${currentQuestionIndex + 1} of ${currentQuizData.questions.length}`;
    
    // Update navigation buttons visibility
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // Show/hide previous button
    prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
    
    // Show next or submit button based on current question
    if (currentQuestionIndex === currentQuizData.questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

// Navigate to next question
function nextQuestion() {
    saveCurrentAnswer();
    if (currentQuestionIndex < currentQuizData.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

// Navigate to previous question
function previousQuestion() {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Save the currently selected answer
function saveCurrentAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        userAnswers[currentQuestionIndex] = parseInt(selectedAnswer.value);
    }
}

/**
 * Quiz Results Functions
 */

// Submit quiz and calculate results
function submitQuiz() {
    saveCurrentAnswer();
    
    // Calculate score and create results array
    let score = 0;
    const results = [];
    
    currentQuizData.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) score++;
        
        results.push({
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.correctAnswer,
            options: question.options,
            isCorrect: isCorrect
        });
    });
    
    showResults(score, currentQuizData.questions.length, results);
}

// Display quiz results with score and answer review
function showResults(score, total, results) {
    // Update score display
    document.getElementById('final-score').textContent = `${score}/${total}`;
    
    // Calculate percentage and show appropriate message
    const percentage = Math.round((score / total) * 100);
    const scoreMessage = document.getElementById('score-message');
    
    if (percentage >= 80) {
        scoreMessage.textContent = "Excellent work! 🌟";
        scoreMessage.style.color = "#28a745";
    } else if (percentage >= 60) {
        scoreMessage.textContent = "Good job! 👍";
        scoreMessage.style.color = "#ffc107";
    } else {
        scoreMessage.textContent = "Keep practicing! 💪";
        scoreMessage.style.color = "#dc3545";
    }
    
    // Create detailed answer review
    const reviewContainer = document.getElementById('answer-review');
    reviewContainer.innerHTML = '<h3>📋 Answer Review</h3>';
    
    results.forEach((result, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = `answer-item ${result.isCorrect ? '' : 'wrong'}`;
        
        const userAnswerText = result.userAnswer !== null ? 
            result.options[result.userAnswer] : 'No answer selected';
        
        answerItem.innerHTML = `
            <strong>Q${index + 1}: ${result.question}</strong><br>
            <span style="color: ${result.isCorrect ? '#28a745' : '#dc3545'};">
                Your answer: ${userAnswerText}
            </span><br>
            <span style="color: #28a745;">
                Correct answer: ${result.options[result.correctAnswer]}
            </span>
        `;
        
        reviewContainer.appendChild(answerItem);
    });
    
    showSection('results');
}

/**
 * Application Initialization
 */

// Initialize the app with sample data if needed
function initializeApp() {
    const existingQuizzes = getQuizzes();
    
    // Add sample quiz if no quizzes exist (for demonstration)
    if (existingQuizzes.length === 0) {
        const sampleQuiz = {
            id: "sample-1",
            title: "JavaScript Basics",
            questions: [
                {
                    question: "What does 'DOM' stand for?",
                    options: [
                        "Document Object Model", 
                        "Data Object Management", 
                        "Dynamic Object Method", 
                        "Digital Output Mode"
                    ],
                    correctAnswer: 0
                },
                {
                    question: "Which method adds an element to the end of an array?",
                    options: ["append()", "push()", "add()", "insert()"],
                    correctAnswer: 1
                },
                {
                    question: "What is the correct way to declare a variable in JavaScript?",
                    options: ["variable x = 5", "var x = 5", "v x = 5", "declare x = 5"],
                    correctAnswer: 1
                },
                {
                    question: "Which symbol is used for single-line comments in JavaScript?",
                    options: ["//", "/*", "#", "--"],
                    correctAnswer: 0
                },
                {
                    question: "What will 'typeof null' return in JavaScript?",
                    options: ["null", "undefined", "object", "string"],
                    correctAnswer: 2
                }
            ],
            createdAt: new Date().toLocaleDateString()
        };
        
        saveQuiz(sampleQuiz);
    }
}

/**
 * Utility Functions
 */

// Clear all quiz data (for testing/reset purposes)
function clearAllQuizzes() {
    if (confirm('Are you sure you want to delete all quizzes? This cannot be undone.')) {
        localStorage.removeItem('quizzes');
        alert('All quizzes have been deleted.');
        if (document.getElementById('quiz-list').classList.contains('active')) {
            loadQuizList();
        }
    }
}

// Export quiz data as JSON (for backup)
function exportQuizzes() {
    const quizzes = getQuizzes();
    if (quizzes.length === 0) {
        alert('No quizzes to export!');
        return;
    }
    
    const dataStr = JSON.stringify(quizzes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quizvault-backup.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Import quiz data from JSON file
function importQuizzes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuizzes = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedQuizzes)) {
                throw new Error('Invalid file format');
            }
            
            // Validate quiz structure
            importedQuizzes.forEach(quiz => {
                if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
                    throw new Error('Invalid quiz format');
                }
            });
            
            // Add imported quizzes to existing ones
            const existingQuizzes = getQuizzes();
            const allQuizzes = [...existingQuizzes, ...importedQuizzes];
            localStorage.setItem('quizzes', JSON.stringify(allQuizzes));
            
            alert(`Successfully imported ${importedQuizzes.length} quiz(es)!`);
            
            if (document.getElementById('quiz-list').classList.contains('active')) {
                loadQuizList();
            }
            
        } catch (error) {
            alert('Error importing quizzes: Invalid file format');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}

/**
 * Keyboard Navigation Support
 */
document.addEventListener('keydown', function(e) {
    // Only handle keyboard navigation in quiz taking mode
    if (!document.getElementById('take-quiz').classList.contains('active')) {
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            if (currentQuestionIndex > 0) {
                previousQuestion();
            }
            break;
        case 'ArrowRight':
            if (currentQuestionIndex < currentQuizData.questions.length - 1) {
                nextQuestion();
            }
            break;
        case 'Enter':
            if (currentQuestionIndex === currentQuizData.questions.length - 1) {
                submitQuiz();
            } else {
                nextQuestion();
            }
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            const optionIndex = parseInt(e.key) - 1;
            const radioButtons = document.querySelectorAll('input[name="answer"]');
            if (radioButtons[optionIndex]) {
                radioButtons[optionIndex].checked = true;
            }
            break;
    }
});

/**
 * Error Handling and User Feedback
 */

// Show loading indicator
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '<div class="loading"></div>';
}

// Show error message
function showError(message, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #dc3545;">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Validate quiz data integrity
function validateQuizData(quiz) {
    if (!quiz.title || typeof quiz.title !== 'string') {
        return false;
    }
    
    if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        return false;
    }
    
    return quiz.questions.every(question => {
        return question.question && 
               Array.isArray(question.options) && 
               question.options.length === 4 &&
               typeof question.correctAnswer === 'number' &&
               question.correctAnswer >= 0 && 
               question.correctAnswer <= 3;
    });
}

/**
 * Performance Optimization
 */

// Debounce function for search functionality (if needed in future)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * App Initialization - Run when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Add event listeners for better user experience
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // Refresh quiz list when user returns to the page
            if (document.getElementById('quiz-list').classList.contains('active')) {
                loadQuizList();
            }
        }
    });
    
    // Handle beforeunload event to warn about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        const createQuizSection = document.getElementById('create-quiz');
        const takeQuizSection = document.getElementById('take-quiz');
        
        if (createQuizSection.classList.contains('active')) {
            const quizTitle = document.getElementById('quiz-title').value;
            const questionText = document.querySelector('.question-text').value;
            
            if (quizTitle || questionText) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        }
        
        if (takeQuizSection.classList.contains('active') && currentQuizData) {
            e.preventDefault();
            e.returnValue = 'You are in the middle of taking a quiz. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    
    console.log('🎯 QuizVault initialized successfully!');
});