// API Configuration
const API_KEY = '2251d905-4614-48fb-afac-177d429bcee4';
const API_URL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';

// DOM Elements
const wordInput = document.getElementById('wordInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const errorMessage = document.getElementById('errorMessage');
const loadingDiv = document.querySelector('.loading');

// Event Listeners
searchBtn.addEventListener('click', searchWord);
wordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWord();
    }
});

// Main search function
function searchWord() {
    const word = wordInput.value.trim().toLowerCase();
    
    // Validation
    if (!word) {
        showError('Please enter a word to search.');
        return;
    }

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your Merriam-Webster API key to the code.');
        return;
    }

    // Clear previous results and show loading
    clearResults();
    showLoading(true);
    disableButton(true);

    // Fetch data from API
    const url = `${API_URL}${word}?key=${API_KEY}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showLoading(false);
            disableButton(false);
            displayResults(data, word);
        })
        .catch(error => {
            showLoading(false);
            disableButton(false);
            showError('Failed to fetch definition. Please check your internet connection and API key.');
            console.error('Error:', error);
        });
}

// Display results using DOM manipulation
function displayResults(data, searchedWord) {
    // Check if word was found
    if (!data || data.length === 0) {
        showError('No definition found for this word.');
        return;
    }

    // Check if API returned suggestions instead of definitions
    if (typeof data[0] === 'string') {
        showError(`Word not found. Did you mean: ${data.slice(0, 5).join(', ')}?`);
        return;
    }

    // Get the first entry
    const entry = data[0];
    
    // Create word title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'word-title';
    titleDiv.textContent = entry.hwi.hw.replace(/\*/g, '');
    
    // Create word info (pronunciation, part of speech)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'word-info';
    
    let infoText = '';
    if (entry.fl) {
        infoText += entry.fl;
    }
    if (entry.hwi.prs && entry.hwi.prs[0] && entry.hwi.prs[0].mw) {
        infoText += ` | /${entry.hwi.prs[0].mw}/`;
    }
    infoDiv.textContent = infoText;

    // Create definition section
    const defSection = document.createElement('div');
    defSection.className = 'definition-section';

    // Part of speech
    if (entry.fl) {
        const posDiv = document.createElement('div');
        posDiv.className = 'part-of-speech';
        posDiv.textContent = entry.fl;
        defSection.appendChild(posDiv);
    }

    // Get first definition
    if (entry.shortdef && entry.shortdef.length > 0) {
        const defDiv = document.createElement('div');
        defDiv.className = 'definition';
        defDiv.textContent = `1. ${entry.shortdef[0]}`;
        defSection.appendChild(defDiv);

        // Add additional definitions if available
        if (entry.shortdef.length > 1) {
            for (let i = 1; i < Math.min(entry.shortdef.length, 3); i++) {
                const additionalDef = document.createElement('div');
                additionalDef.className = 'definition';
                additionalDef.textContent = `${i + 1}. ${entry.shortdef[i]}`;
                defSection.appendChild(additionalDef);
            }
        }
    }

    // Clear and populate result container
    resultContainer.innerHTML = '';
    resultContainer.appendChild(titleDiv);
    resultContainer.appendChild(infoDiv);
    resultContainer.appendChild(defSection);
    resultContainer.style.display = 'block';
}

// Helper functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

function disableButton(disable) {
    searchBtn.disabled = disable;
}

function clearResults() {
    resultContainer.innerHTML = '';
    resultContainer.style.display = 'none';
    errorMessage.style.display = 'none';
}