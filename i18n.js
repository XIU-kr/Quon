// Internationalization (i18n) system - Main loader
// This file dynamically loads language files from the locales directory
// 
// To add a new language:
// 1. Create a new file in locales/ (e.g., locales/fr.js for French)
//    - Copy the structure from locales/en.js or locales/ko.js
//    - Translate all the values
// 2. Add the language code to SUPPORTED_LANGUAGES array below
// 3. Optionally add language detection logic in detectLanguage() function
//
// The system will automatically load the language file and make it available

// List of supported languages - add new language codes here
const SUPPORTED_LANGUAGES = ['en', 'ko'];

// Storage for loaded translations
const translations = {};

// Current language
let currentLanguage = 'en';

// Loading state
let isLoading = false;
let loadedLanguages = new Set();

// Load a language file
async function loadLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
        console.warn(`Language "${lang}" is not supported. Falling back to English.`);
        lang = 'en';
    }
    
    // Return if already loaded
    if (loadedLanguages.has(lang)) {
        return true;
    }
    
    try {
        // Dynamically load the language file
        const script = document.createElement('script');
        script.src = `locales/${lang}.js`;
        
        // Wait for the script to load
        await new Promise((resolve, reject) => {
            script.onload = () => {
                // The language file should have defined a variable with the language code
                // e.g., const en = { ... } or const ko = { ... }
                if (typeof window[lang] !== 'undefined') {
                    translations[lang] = window[lang];
                    loadedLanguages.add(lang);
                    resolve();
                } else {
                    reject(new Error(`Language data for "${lang}" not found after loading script`));
                }
            };
            script.onerror = () => reject(new Error(`Failed to load language file: locales/${lang}.js`));
            document.head.appendChild(script);
        });
        
        return true;
    } catch (error) {
        console.error(`Error loading language "${lang}":`, error);
        
        // If failed to load and not English, try to load English as fallback
        if (lang !== 'en' && !loadedLanguages.has('en')) {
            console.log('Attempting to load English as fallback...');
            return loadLanguage('en');
        }
        
        return false;
    }
}

// Detect user's language based on saved preference, then browser settings
function detectLanguage() {
    // First, check if user has manually selected a language (localStorage)
    const savedLang = localStorage.getItem('quon_language');
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
        console.log(`Using saved language preference: ${savedLang}`);
        return savedLang;
    }
    
    // If no saved preference, detect from browser settings
    const browserLang = navigator.language || navigator.userLanguage;
    console.log(`Browser language detected: ${browserLang}`);
    
    // Extract language code (e.g., 'en-US' -> 'en', 'ko-KR' -> 'ko')
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Check if the detected language is supported
    if (SUPPORTED_LANGUAGES.includes(langCode)) {
        return langCode;
    }
    
    // Check for specific language mappings
    if (browserLang.startsWith('ko')) {
        return 'ko';
    }
    
    // Default to English for all other languages
    return 'en';
}

// Get translation for a key
function t(key) {
    if (!translations[currentLanguage]) {
        console.warn(`Translations not loaded for language: ${currentLanguage}`);
        return key;
    }
    
    const translation = translations[currentLanguage][key];
    
    if (!translation) {
        // Try to fallback to English if key not found
        if (currentLanguage !== 'en' && translations['en'] && translations['en'][key]) {
            console.warn(`Translation key "${key}" not found for language "${currentLanguage}", using English fallback`);
            return translations['en'][key];
        }
        console.warn(`Translation key "${key}" not found`);
        return key;
    }
    
    return translation;
}

// Update all text content in the page
function updateLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        // Handle input/textarea placeholders
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.placeholder !== undefined) {
                element.placeholder = translation;
            }
        } else if (element.tagName === 'OPTION') {
            // For option elements, update the text content
            element.textContent = translation;
        } else if (element.tagName === 'SELECT') {
            // For select elements, update the label, not the options
            // Options should have their own data-i18n attributes
        } else {
            // For other elements, update text content
            element.textContent = translation;
        }
    });
    
    // Update html lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Update page title with proper branding
    const titleBase = t('header.title').replace('🎨 ', '');
    const titleSuffix = currentLanguage === 'ko' ? '맞춤형 QR 코드 생성기' : 'Free Custom QR Code Generator';
    document.title = `${titleBase} - ${titleSuffix}`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = t('header.subtitle');
    }
}

// Initialize language system
async function initLanguage() {
    try {
        isLoading = true;
        
        // Detect user's preferred language
        const detectedLang = detectLanguage();
        currentLanguage = detectedLang;
        
        // Load the detected language
        await loadLanguage(currentLanguage);
        
        // Also preload English as fallback if not already loaded
        if (currentLanguage !== 'en') {
            loadLanguage('en').catch(err => console.error('Failed to preload English fallback:', err));
        }
        
        // Initialize language switcher UI
        initLanguageSwitcher();
        
        // Update the UI
        updateLanguage();
        
        isLoading = false;
    } catch (error) {
        console.error('Error initializing language system:', error);
        isLoading = false;
    }
}

// Switch language (for language switcher UI)
async function switchLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
        console.warn(`Language "${lang}" is not supported`);
        return false;
    }
    
    // Don't switch if already on this language
    if (currentLanguage === lang && loadedLanguages.has(lang)) {
        return true;
    }
    
    try {
        // Load the language if not already loaded
        if (!loadedLanguages.has(lang)) {
            await loadLanguage(lang);
        }
        
        // Switch to the new language
        currentLanguage = lang;
        
        // Save user's language preference
        localStorage.setItem('quon_language', lang);
        console.log(`Language preference saved: ${lang}`);
        
        // Update the UI
        updateLanguage();
        
        // Update language switcher UI
        updateLanguageSwitcher();
        
        return true;
    } catch (error) {
        console.error(`Error switching to language "${lang}":`, error);
        return false;
    }
}

// Get list of supported languages (useful for language switcher UI)
function getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
}

// Get current language
function getCurrentLanguage() {
    return currentLanguage;
}

// Check if a language is loaded
function isLanguageLoaded(lang) {
    return loadedLanguages.has(lang);
}

// Update language switcher UI to reflect current language
function updateLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (!switcher) return;
    
    // For dropdown, just set the selected value
    switcher.value = currentLanguage;
}

// Initialize language switcher UI
function initLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (!switcher) {
        console.warn('Language switcher element not found');
        return;
    }
    
    // Create language options
    SUPPORTED_LANGUAGES.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.setAttribute('data-i18n', `lang.name.${lang}`);
        option.textContent = lang.toUpperCase(); // Temporary text until translations load
        
        switcher.appendChild(option);
    });
    
    // Add change event listener
    switcher.addEventListener('change', async (e) => {
        await switchLanguage(e.target.value);
    });
    
    // Update the UI to reflect current language
    updateLanguageSwitcher();
}
