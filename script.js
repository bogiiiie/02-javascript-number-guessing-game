// ===== INITIALIZATION & SETUP =====

// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// ===== CONSTANTS & GAME CONFIGURATION =====
const INITIAL_LIVES = 10;
const MIN_NUMBER = 1;
const MAX_NUMBER = 100;

// ===== GLOBAL VARIABLES =====
let lives = INITIAL_LIVES;
let isCorrect;
let correctNum = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;

// ===== DOM ELEMENT REFERENCES =====
const blurOverlay = document.querySelector(`.blur-overlay-wrapper`);
const livesValue = document.querySelectorAll(`.lives-value`);
const guessInput = document.getElementById(`guess-input`);
const guessBtn = document.getElementById(`guess-btn`);
const gameCard = document.getElementById(`game-card`);
const guessForm = document.getElementById(`guess-form`);
const guessHistoryList = document.getElementById(`guess-history-list`);
const guessHistoryContainer = document.getElementById(`guess-history`);
const correctNumber = document.getElementById(`correct-number`);
const helpBtn = document.querySelector(`.btn-help`);

// Debug: Log the correct number to console
console.log(correctNum);

// ===== MODAL TEMPLATE CONTENT =====

// Game Rules Modal Configuration
const gameRulesModalContainerElementById = `game-rules-modal`;
const gameRulesModalCloseBtnQuerySelector = `#game-rules-modal .close-btn`;
const gameRulesModalContent = `
                            <div
                            id="game-rules-modal"
                            class="game-rules-modal fixed inset-0 z-50 top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 h-fit max-w-[500px] bg-white rounded-4xl flex flex-col justify-start items-center text-left p-8 gap-6 w-[calc(100%-2.5rem)]"
                            role="region"
                            aria-labelledby="game-rules-title"
                            aria-describedby="game-rules-description"
                            >
                            <h3 id="game-rules-title" class="text-2xl font-bold w-full text-gray-800">
                                Game Rules
                            </h3>

                            <p id="game-rules-description" class="sr-only">
                                Instructions for how to play the number guessing game.
                            </p>

                            <button
                                class="close-btn select-none absolute right-10 top-8 text-xl text-gray-400 hover:text-gray-800 active:text-gray-800 transition cursor-pointer"
                                aria-label="Close game rules"
                            >
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>

                            <ul class="w-full space-y-5">
                                <li class="flex justify-start items-center gap-3">
                                <i class="bi bi-question-circle text-indigo-500" aria-hidden="true"></i>
                                <span class="font-medium text-gray-600"
                                    >Guess the secret number between 1 and ${MAX_NUMBER}</span
                                >
                                </li>
                                <li class="flex justify-start items-center gap-3">
                                <i class="bi bi-heart-fill text-red-500" aria-hidden="true"></i>
                                <span class="font-medium text-gray-600"
                                    >You have ${INITIAL_LIVES} lives to guess correctly</span
                                >
                                </li>
                                <li class="flex justify-start items-center gap-3">
                                <i class="bi bi-arrow-up text-green-500" aria-hidden="true"></i>
                                <span class="font-medium text-gray-600"
                                    >Get hints "Higher" or "Lower" after each guess</span
                                >
                                </li>
                                <li class="flex justify-start items-center gap-3">
                                <i class="bi bi-trophy-fill text-orange-400" aria-hidden="true"></i>
                                <span class="font-medium text-gray-600"
                                    >Win by guessing the correct number!</span
                                >
                                </li>
                            </ul>
                            </div>
                        `;

// ===== UTILITY FUNCTIONS =====

/**
 * Shows the background blur overlay for modals
 */
function displayBackgroundBlur() {
    blurOverlay.classList.remove(`hidden`);
}

/**
 * Hides the background blur overlay
 */
function removeBackgroundBlur() {
    blurOverlay.classList.add(`hidden`);
}

/**
 * Sets up modal close functionality
 * @param {HTMLElement} modalContainer - The modal container element
 * @param {HTMLElement} modalCloseBtn - The close button element
 */
function closeModal(modalContainer, modalCloseBtn) {
    if(!modalContainer) {
        return console.error(`Modal Doesn't Exist`);
    }

    return modalCloseBtn.onclick = function () {
        modalContainer.remove();
        removeBackgroundBlur();
    }
}

/**
 * Creates and displays a modal
 * @param {string} modalContent - HTML content for the modal
 * @param {string} modalContainerSelector - ID selector for the modal container
 * @param {string} modalCloseBtnSelector - CSS selector for the close button
 */
function displayModal(modalContent, modalContainerSelector, modalCloseBtnSelector) {
    displayBackgroundBlur();
    document.body.insertAdjacentHTML(`beforeend`, modalContent);
    const modalCloseBtn = document.querySelector(modalCloseBtnSelector);
    const modalContainer = document.getElementById(modalContainerSelector);
    closeModal(modalContainer, modalCloseBtn);
}

/**
 * Displays the game rules modal
 */
function displayGameRules () {
    displayModal(gameRulesModalContent, gameRulesModalContainerElementById, gameRulesModalCloseBtnQuerySelector)
}

// ===== UI CONTROL FUNCTIONS =====

/**
 * Disables the guess button and input field when game ends
 */
function disableGuessBtnAndGuessInput() {
    guessBtn.disabled = true;
    guessBtn.classList.remove(
        `bg-gradient-to-r`,
        `from-indigo-500`,
        `to-violet-600`,
        `hover:-translate-y-1`,
        `hover:shadow-lg`,
        `active:scale-95`,
        `px-2`
    );
    guessBtn.classList.add(`bg-gray-300`);
    guessInput.disabled = true;
}

/**
 * Enables the guess button and input field when game is active
 */
function enableGuessBtnAndGuessInput() {
    guessBtn.disabled = false;
    guessInput.disabled = false;
    guessBtn.classList.remove(`bg-gray-300`);
    guessBtn.classList.add(
        `bg-gradient-to-r`,
        `from-indigo-500`,
        `to-violet-600`,
        `px-2`,
        `hover:-translate-y-1`,
        `hover:shadow-lg`,
        `active:scale-95`
    );
}

/**
 * Checks remaining lives and enables/disables input accordingly
 */
function checkLives() {
    if (lives <= 0) {
        // Disable guess input and button when no lives left
        disableGuessBtnAndGuessInput();
    } else {
        // Enable guess input and button when lives remaining
        enableGuessBtnAndGuessInput();
    }
}

/**
 * Updates all lives display elements on the page
 */
function updateLivesLabel() {
    for (let i = 0; i < livesValue.length; i++) {
        livesValue[i].textContent = lives;
    }
}

/**
 * Removes all feedback messages from the DOM
 */
function removeFeedbacks() {
    let feedbacks = document.querySelectorAll(`.feedback`);
    for (let i = 0; i < feedbacks.length; i++) {
        feedbacks[i].remove();
    }
}

/**
 * Creates a new feedback message element
 * @returns {HTMLElement} The feedback paragraph element
 */
function createFeedback() {
    let feedback = document.createElement(`p`);
    feedback.classList.add(
        `feedback`,
        `w-full`,
        `font-semibold`,
        `text-center`,
        `p-3.5`,
        `rounded-xl`
    );
    feedback.ariaLive = `assertive`; // For screen readers
    return feedback;
}

// ===== GAME LOGIC FUNCTIONS =====

/**
 * Resets the game to initial state for a new round
 */
function reset() {
    correctNum = Math.floor(Math.random() * 100 + 1); // Generate new random number
    lives = INITIAL_LIVES; // Reset lives back to initial amount
    guessHistoryContainer.classList.add(`hidden`); // Hide guess history container
    guessHistoryList.innerHTML = " "; // Clear all guessed entries
    updateLivesLabel(); // Update lives display
    removeFeedbacks(); // Remove any feedback messages
    enableGuessBtnAndGuessInput(); // Re-enable guess input and button
    isCorrect = false; // Reset correct guess flag
}

/**
 * Handles the "Play Again" button click
 * @param {HTMLElement} element - The clicked play again button
 */
function playAgain(element) {
    // Navigate up the DOM to find the modal container
    const modalContainer = element.parentNode.parentNode;
    modalContainer.remove();
    removeBackgroundBlur();
    reset(); // Start a new game
}

/**
 * Checks if the game has ended and displays appropriate modal
 */
function checkGameResult() {
    // Player won the game
    if (isCorrect) {
        // Congratulations Modal Configuration
        const congratsModalContainerElementById = `congrats-modal`;
        const congratsModalCloseBtnQuerySelector = `#congrats-modal .close-btn`;
        const congratsModalContent = `
                                        <div id="congrats-modal"
                                            class="game-result-card congrats-modal fixed inset-0 z-50 top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 h-fit w-full max-w-[400px] bg-white rounded-4xl flex flex-col justify-center items-center text-center p-7 gap-4"
                                            role="region" aria-labelledby="congrats-title" aria-describedby="congrats-description">
                                            <div class="congrats-icon text-3xl rounded-full text-white bg-green-500 w-20 h-20 flex justify-center items-center"
                                                aria-hidden="true">
                                                <i class="bi bi-trophy-fill"></i>
                                            </div>

                                            <h3 id="congrats-title" class="congrats-title text-green-500 font-semibold text-2xl">
                                                Congratulations!
                                            </h3>

                                            <p id="congrats-description" class="congrats-message font-semibold text-gray-600">
                                                You guessed the number
                                                <span class="correct-number">${correctNum}</span> correctly! You won with
                                                <span class="lives-value">${lives}</span> live(s) remaining!
                                            </p>

                                            <div class="congrats-actions w-full space-y-3">
                                                <button
                                                    class="play-again-btn select-none bg-gradient-to-r from-indigo-500 to-violet-600 text-white flex justify-center items-center gap-1 w-full rounded-lg font-semibold p-2 relative transition hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
                                                    aria-label="Play again"
                                                    onclick="playAgain(this)">
                                                    <i class="bi bi-play-fill text-2xl" aria-hidden="true"></i>
                                                    <span>Play Again</span>
                                                </button>

                                                <button
                                                    class="close-btn select-none text-gray-700 bg-gray-200 flex justify-center items-center w-full rounded-lg font-semibold p-2 hover:bg-gray-300 active:bg-gray-300 active:scale-95 transition cursor-pointer"
                                                    aria-label="Close congratulations card">
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    `;
        // Display Congrats Modal
        displayModal(congratsModalContent, congratsModalContainerElementById, congratsModalCloseBtnQuerySelector);

        // Disable input controls since game is over
        disableGuessBtnAndGuessInput();
    } 
    // Player lost the game (ran out of lives)
    else if (!isCorrect && lives <= 0) {
        // Game Over Modal Configuration
        const gameOverModalContainerElementById = `game-over-modal`;
        const gameOverModalCloseBtnQuerySelector = `#game-over-modal .close-btn`;
        const gameOverModalContent = `
                                        <div id="game-over-modal"
                                            class="game-over-modal fixed inset-0 z-50 top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 h-fit w-full max-w-[400px] bg-white rounded-4xl flex flex-col justify-center items-center text-center p-7 gap-4"
                                            role="region" aria-labelledby="game-over-title" aria-describedby="game-over-description">
                                            <div class="game-over-icon text-3xl rounded-full text-white bg-red-500 w-20 h-20 flex justify-center items-center"
                                                aria-hidden="true">
                                                <i class="fa-solid fa-skull"></i>
                                            </div>

                                            <h3 id="game-over-title" class="game-over-title text-red-500 font-semibold text-2xl">
                                                Game Over!
                                            </h3>

                                            <p id="game-over-description" class="game-over-message font-semibold text-gray-600">
                                                You ran out of lives! The number was
                                                <span class="correct-number">${correctNum}</span>. Better luck next time!
                                            </p>

                                            <div class="game-over-actions w-full space-y-3">
                                                <button
                                                    class="play-again-btn select-none bg-gradient-to-r from-indigo-500 to-violet-600 text-white flex justify-center items-center gap-1 w-full rounded-lg font-semibold p-2 relative transition hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
                                                    aria-label="Play again"
                                                    onclick="playAgain(this)">
                                                    <i class="bi bi-play-fill text-2xl" aria-hidden="true"></i>
                                                    <span>Play Again</span>
                                                </button>

                                                <button
                                                    class="close-btn select-none text-gray-700 bg-gray-200 flex justify-center items-center w-full rounded-lg font-semibold p-2 hover:bg-gray-300 active:bg-gray-300 active:scale-95 transition cursor-pointer"
                                                    aria-label="Close game over card">
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    `;
        // Display Game Over Modal
        displayModal(gameOverModalContent, gameOverModalContainerElementById, gameOverModalCloseBtnQuerySelector);
    }
}

// ===== MAIN EVENT LISTENER - GAME LOGIC =====

/**
 * Main game logic - handles form submission and guess processing
 */
guessForm.addEventListener(`submit`, (e) => {
    e.preventDefault(); // Prevent form from submitting normally
    
    // Show guess history container
    guessHistoryContainer.classList.remove(`hidden`);
    
    // Get the player's guessed number
    let guessedNum = Number(guessInput.value);
    
    // Remove any previous feedback messages
    removeFeedbacks();

    // Create new feedback element
    const feedback = createFeedback();

    // Validate if the guess is within the valid range
    if (guessedNum >= MIN_NUMBER && guessedNum <= MAX_NUMBER) {
        
        // Check if the guess is correct
        if (guessedNum == correctNum) {
            isCorrect = true;
            
            // Style feedback for correct guess
            feedback.classList.add(`guess-correct`, `bg-green-100`, `text-green-900`);
            feedback.innerHTML = `Correct! The number was <span class="correct-number">${guessedNum}</span>!`;
            
            // Add correct guess to history
            guessHistoryList.innerHTML += `
                <li 
                    class="guess guess-correct flex justify-center items-center gap-1 h-9  py-1 px-3 rounded-md font-semibold text-center bg-green-100 text-green-900 w-fit"
                    aria-label="Correct guess: ${guessedNum}">
                        <span class="guess-value">${guessedNum}</span>
                        <i class="bi bi-check-lg text-sm" aria-hidden="true"></i>
                </li>`;
            
        } else {
            // Guess is incorrect
            isCorrect = false;
            lives--; // Reduce lives by 1
            
            // Check if guess is too high
            if (guessedNum > correctNum) {
                feedback.classList.add(`guess_high`, `bg-orange-100`, `text-orange-900`);
                feedback.innerHTML = `Lower! Try a smaller number.`;
                
                // Add high guess to history
                guessHistoryList.innerHTML += `
                    <li 
                        class="guess guess-high flex justify-center items-center gap-1 h-9  py-1 px-3 rounded-md font-semibold text-center bg-orange-100 text-orange-900 w-fit"
                        aria-label="High guess: ${guessedNum}">
                            <span class="guess-value">${guessedNum}</span>
                            <i class="bi bi-arrow-down text-sm" aria-hidden="true"></i>
                    </li>`;
            } else {
                // Guess is too low
                feedback.classList.add(`guess_low`, `bg-blue-100`, `text-blue-900`);
                feedback.innerHTML = `Higher! Try a bigger number.`;
                
                // Add low guess to history
                guessHistoryList.innerHTML += `
                    <li 
                        class="guess guess-low flex justify-center items-center gap-1 h-9 py-1 px-3 rounded-md font-medium text-center bg-blue-100 text-blue-900 w-fit"
                        aria-label="Low guess: ${guessedNum}">
                            <span class="guess-value">${guessedNum}</span>
                            <i class="bi bi-arrow-up text-sm" aria-hidden="true"></i>
                    </li>`;
            }
        }
    } else {
        // Invalid guess (outside valid range)
        isCorrect = false;
        lives--; // Still lose a life for invalid input
        
        // Style feedback for invalid guess
        feedback.classList.add(`guess_invalid`, `bg-red-100`, `text-red-900`);
        feedback.innerHTML = `Please enter a valid number between 1 and 100`;
        
        // Add invalid guess indicator to history
        guessHistoryList.innerHTML += `
            <li 
                class="guess guess-invalid flex justify-center items-center gap-1 h-9  py-1 px-3 rounded-md font-semibold text-center bg-red-100 text-red-900 w-fit"
                aria-label="No guess">
                    <i class="bi bi-x-lg text-sm" aria-hidden="true"></i>
            </li>`;
    }

    // Insert feedback message after the form
    guessForm.parentNode.insertBefore(feedback, guessForm.nextSibling);
    
    // Update the lives display
    updateLivesLabel();
    
    // Check if input should be disabled based on remaining lives
    checkLives();
    
    // Clear the input field for next guess
    guessInput.value = null;
    
    // Check if game has ended (won or lost)
    checkGameResult();
});