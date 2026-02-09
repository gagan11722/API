// API Configuration

let API_KEY = '2251d905-4614-48fb-afac-177d429bcee4';
let API_URL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';

// DOM Elements
let wordInput = document.getElementById('wordInput');
let searchBtn = document.getElementById('searchBtn');
let resultContainer = document.getElementById('resultContainer');
let errorMessage = document.getElementById('errorMessage');
let loadingDiv = document.querySelector('.loading');

// Event Listeners
searchBtn.addEventListener('click', searchWord);
wordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWord();
    }
});

// Main search function
function searchWord() {
    let word = wordInput.value.trim().toLowerCase();
    
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

    // Fetch data from API (following professor's style)
    let url = `${API_URL}${word}?key=${API_KEY}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            showLoading(false);
            disableButton(false);
            displayResults(data, word);
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
    let entry = data[0];
    
    // Create word title using semantic tags and DOM manipulation
    let titleHeader = document.createElement('header');
    titleHeader.className = 'word-title';
    titleHeader.textContent = entry.hwi.hw.replace(/\*/g, '');
    
    // Create word info (pronunciation, part of speech)
    let infoPara = document.createElement('p');
    infoPara.className = 'word-info';
    
    let infoText = '';
    if (entry.fl) {
        infoText += entry.fl;
    }
    if (entry.hwi.prs && entry.hwi.prs[0] && entry.hwi.prs[0].mw) {
        infoText += ` | /${entry.hwi.prs[0].mw}/`;
    }
    infoPara.textContent = infoText;

    // Create definition section using semantic tags
    let defSection = document.createElement('article');
    defSection.className = 'definition-section';

    // Part of speech
    if (entry.fl) {
        let posHeader = document.createElement('h2');
        posHeader.className = 'part-of-speech';
        posHeader.textContent = entry.fl;
        defSection.appendChild(posHeader);
    }

    // Get first definition
    if (entry.shortdef && entry.shortdef.length > 0) {
        let defPara = document.createElement('p');
        defPara.className = 'definition';
        defPara.textContent = `1. ${entry.shortdef[0]}`;
        defSection.appendChild(defPara);

        // Add additional definitions if available
        if (entry.shortdef.length > 1) {
            for (let i = 1; i < Math.min(entry.shortdef.length, 3); i++) {
                let additionalDef = document.createElement('p');
                additionalDef.className = 'definition';
                additionalDef.textContent = `${i + 1}. ${entry.shortdef[i]}`;
                defSection.appendChild(additionalDef);
            }
        }
    }

    // Clear and populate result container using DOM manipulation
    resultContainer.innerHTML = '';
    resultContainer.appendChild(titleHeader);
    resultContainer.appendChild(infoPara);
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