import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import './App.css';

// --- 1. CONFIGURATION: Firebase and Gemini API ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;


// --- 2. INITIALIZATION & DATABASE SETUP ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// A function to add our initial Mangaluru data to the database.
const setupInitialData = async () => {
    console.log("Setting up initial data in Firestore...");
    const data = {
        places: [
            { id: "panambur_beach", name: "Panambur Beach", category: "Beach", description: "One of Mangaluru's most popular beaches, known for its clean shores, beautiful sunsets, and various events.", best_time_to_visit: "Evenings (4 PM - 7 PM) are ideal. The best months are from September to February.", events: "Hosts the International Kite Festival (January) and other beach festivals.", lat: 12.9723, lng: 74.8055 },
            { id: "kadri_temple", name: "Kadri Manjunatha Temple", category: "Temple", description: "An ancient temple dedicated to Lord Shiva, known for its bronze statues and the ponds at the rear.", best_time_to_visit: "Early mornings or during evening prayers for a serene experience." },
            { id: "st_aloysius_chapel", name: "St. Aloysius Chapel", category: "Historical Site", description: "Famous for its magnificent interior paintings that cover nearly all of the walls and ceilings, created by the Italian Jesuit Antonio Moscheni in 1900. It is often compared to the Sistine Chapel in Rome.", best_time_to_visit: "Open on weekdays from 9:30 AM to 1:00 PM and 2:00 PM to 4:30 PM. The art is best viewed in daylight." }
        ],
        food: [
            { id: "ghee_roast", name: "Chicken Ghee Roast", type: "Lunch/Dinner", description: "A fiery, tangy, and rich chicken dish cooked with roasted spices and a generous amount of clarified butter ( ghee).", origin_story: "The iconic dish was invented at Shetty Lunch Home in Kundapura. It is a hallmark of Bunt cuisine.", restaurant_name: "Maharaja Restaurant", lat: 12.8739, lng: 74.8425 },
            { id: "neer_dosa", name: "Neer Dosa", type: "Breakfast", description: "A thin, soft, and delicate rice crepe. The name literally translates to 'water dosa' in Tulu. It is typically served with chutney or chicken/fish curry.", origin_story: "A staple breakfast item from the Tulu Nadu region, cherished for its simplicity and taste.", restaurant_name: "Hotel Ayodhya", lat: 12.8705, lng: 74.8398 },
            { id: "golibaje", name: "Golibaje (Mangalore Buns)", type: "Snack", description: "A popular tea-time snack in Mangaluru, these are soft, fluffy, slightly sweet and savory fritters made from a fermented all-purpose flour batter.", origin_story: "A classic snack found in Udupi-Mangaluru region restaurants, perfect with a cup of filter coffee.", restaurant_name: "Taj Mahal Cafe", lat: 12.8679, lng: 74.8416 },
            { id: "ideal_ice_cream", name: "Ideal Ice Cream", type: "Dessert", description: "A legendary ice cream brand from Mangaluru, famous for its unique flavors like 'Gadbad' and 'Pabba's Special'.", origin_story: "Started by Mr. Prabhakar Kamath in 1975, Ideal's has become an iconic part of Mangalorean culture and a must-visit for anyone in the city.", restaurant_name: "Pabba's Ideal Cafe", lat: 12.8829, lng: 74.8415 }
        ],
        tulu: [
            { id: "how_are_you", english: "How are you?", tulu: "Encha Ullar?", pronunciation: "En-chha Ool-lar" },
            { id: "thank_you", english: "Thank you", tulu: "Solmel", pronunciation: "Sol-mel" },
            { id: "whats_your_name", english: "What is your name?", tulu: "Eerena Pudar Enchina?", pronunciation: "Ee-ray-nah Poo-dahr En-chee-nah" },
            { id: "welcome", english: "Welcome", tulu: "Mokeda Magaleg", pronunciation: "Mo-kay-dah Mah-gah-leg" }
        ],
        events: [
            { id: "mangaluru_kambala", name: "Mangaluru Kambala", description: "The famous annual buffalo race, a spectacular traditional sport of the Tulu Nadu region.", location: "Various locations around Mangaluru", date: "November - March (Seasonal)" },
            { id: "car_festival", name: "Mangaladevi Car Festival", description: "A vibrant and important annual festival (Jathra) of the Mangaladevi Temple.", location: "Mangaladevi Temple, Bolar", date: "During Navaratri (October/November)" }
        ]
    };

    try {
        for (const [collectionName, documents] of Object.entries(data)) {
            for (const document of documents) {
                await setDoc(doc(db, collectionName, document.id), document);
            }
        }
        console.log("Initial data setup complete!");
    } catch (error) {
        console.error("Error setting up initial data: ", error);
    }
};

// --- 3. THE MAIN APPLICATION COMPONENT ---
function App() {
    const [isDataSetup, setIsDataSetup] = useState(false);
    const [theme, setTheme] = useState('light'); // New state for theme

    // Effect to apply the theme class to the body
    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);

    useEffect(() => {
        const checkAndSetupData = async () => {
            const placesCollection = collection(db, "places");
            const snapshot = await getDocs(placesCollection);
            if (snapshot.empty) {
                await setupInitialData();
            } else {
                console.log("Data already exists. Skipping setup.");
            }
            setIsDataSetup(true);
        };
        checkAndSetupData();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="app-container">
            <div className="chat-window">
                {isDataSetup ? <ChatInterface theme={theme} toggleTheme={toggleTheme} /> : <LoadingScreen />}
            </div>
        </div>
    );
}

// --- 4. LOADING SCREEN COMPONENT ---
function LoadingScreen() {
    return (
        <div className="loading-screen">
            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Setting up your local guide...</p>
            <p className="loading-subtext">This will only take a moment on the first run.</p>
        </div>
    );
}

// --- 5. CHAT INTERFACE COMPONENT ---
const initialMessage = { id: 1, from: 'bot', type: 'text', content: "Namaskara! I'm Mangaluru Mitra. Ask me about local food, famous places, or even some Tulu phrases!" };

function ChatInterface({ theme, toggleTheme }) {
    const [messages, setMessages] = useState([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (messageText = input) => {
        if (!messageText.trim() || isLoading) return;
        
        setShowSuggestions(false);

        const userMessage = { id: Date.now(), from: 'user', type: 'text', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse = await getBotResponse(messageText);
            setMessages(prev => [...prev, { id: Date.now() + 1, ...botResponse }]);
        } catch (error) {
            console.error("Detailed error from handleSend:", error);
            const errorMessage = { 
                id: Date.now() + 1, 
                from: 'bot', 
                type: 'text', 
                content: `A critical error occurred: ${error.message}. Please check the browser's developer console for more details.` 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend(input);
        }
    };

    const handleClearChat = () => {
        setMessages([initialMessage]);
        setShowSuggestions(true);
    };

    return (
        <>
            <header className="chat-header">
                <div className="header-title">
                    <h1>Mangaluru Mitra 🗺️</h1>
                    <p>Your Interactive Local Guide</p>
                </div>
                <div className="header-controls">
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    <button onClick={handleClearChat} className="clear-chat-button">Clear</button>
                </div>
            </header>
            <div className="chat-body">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {isLoading && <LoadingIndicator />}
                <div ref={chatEndRef} />
            </div>
            
            {showSuggestions && <SuggestionChips onChipClick={handleSend} />}

            <div className="chat-footer">
                <div className="input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about Chicken Ghee Roast..."
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend(input)} disabled={isLoading}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </>
    );
}

function SuggestionChips({ onChipClick }) {
    const suggestions = [
        "Upcoming Events",
        "Plan a food tour for me",
        "Teach me some Tulu"
    ];

    return (
        <div className="suggestion-chips-container">
            {suggestions.map(suggestion => (
                <button key={suggestion} className="suggestion-chip" onClick={() => onChipClick(suggestion)}>
                    {suggestion}
                </button>
            ))}
        </div>
    );
}

// *** NEW THEME TOGGLE COMPONENT ***
function ThemeToggle({ theme, toggleTheme }) {
    return (
        <div className="theme-toggle">
            <span className="theme-toggle-label">Dark Mode</span>
            <label className="toggle-switch">
                <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
                <span className="slider"></span>
            </label>
        </div>
    );
}

// --- 6. CHAT MESSAGE & LOADING INDICATOR COMPONENTS ---
function ChatMessage({ message }) {
    const isBot = message.from === 'bot';
    const [copiedPhrase, setCopiedPhrase] = useState(null);

    const handleCopy = (text, id) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopiedPhrase(id);
            setTimeout(() => setCopiedPhrase(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };

    const renderContent = () => {
        switch (message.type) {
            case 'card':
                return (
                    <div className="info-card">
                        <div className="info-card-content">
                            <h3>{message.title}</h3>
                            <p>{message.content}</p>
                            {message.origin_story && <p className="origin-story">"{message.origin_story}"</p>}
                        </div>
                        {message.weather && <WeatherInfo weather={message.weather} />}
                    </div>
                );
            case 'tulu_list':
                return (
                    <div className="tulu-list-card">
                         <h3>{message.title}</h3>
                         <div className="tulu-phrases-container">
                            {message.phrases.map(phrase => (
                                <div key={phrase.id} className="tulu-phrase">
                                    <div>
                                        <p className="tulu-text">"{phrase.tulu}"</p>
                                        <p className="tulu-translation">({phrase.english}) - <span>{phrase.pronunciation}</span></p>
                                    </div>
                                    <button 
                                        className={`copy-button ${copiedPhrase === phrase.id ? 'copied' : ''}`}
                                        onClick={() => handleCopy(phrase.tulu, phrase.id)}
                                    >
                                        {copiedPhrase === phrase.id ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                );
            case 'food_tour':
                return (
                    <div className="food-tour-card">
                         <h3>{message.title}</h3>
                         <div className="tour-stops-container">
                            {message.stops.map(stop => (
                                <div key={stop.meal} className="tour-stop">
                                    <div className="tour-stop-content">
                                        <h4>{stop.meal}: {stop.name}</h4>
                                        <p>at {stop.restaurant_name}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <a href={message.mapUrl} target="_blank" rel="noopener noreferrer" className="map-button">
                            View Tour on Map
                         </a>
                    </div>
                );
            case 'event_list':
                return (
                    <div className="event-list-card">
                        <h3>{message.title}</h3>
                        <div className="event-items-container">
                            {message.events.map(event => (
                                <div key={event.id} className="event-item">
                                    <h4>{event.name}</h4>
                                    <p>{event.description}</p>
                                    <p className="date"><strong>When:</strong> {event.date} | <strong>Where:</strong> {event.location}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: // 'text'
                return <p>{message.content}</p>;
        }
    };

    return (
        <div className={`message-wrapper ${isBot ? 'bot-message-wrapper' : 'user-message-wrapper'}`}>
            <div className={`avatar ${isBot ? 'bot-avatar' : 'user-avatar'}`}>
                {isBot ? 'M' : 'You'}
            </div>
            <div className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                {renderContent()}
            </div>
        </div>
    );
}

function WeatherInfo({ weather }) {
    if (!weather) return null;
    return (
        <div className="weather-info">
            <p className="weather-title">Current Weather</p>
            <div className="weather-details">
                <span className="weather-temp">{weather.temp}°C</span>
                <span className="weather-desc">{weather.description}</span>
            </div>
        </div>
    );
}

function LoadingIndicator() {
    return (
        <div className="message-wrapper bot-message-wrapper">
            <div className="avatar bot-avatar skeleton"></div>
            <div className="message-bubble bot-bubble">
                <div className="loading-skeleton">
                    <div className="skeleton skeleton-line"></div>
                    <div className="skeleton skeleton-line"></div>
                </div>
            </div>
        </div>
    );
}

// --- 7. AI & DATABASE LOGIC (The Bot's Brain) ---
async function fetchWeather(lat, lon) {
    if (!lat || !lon || !WEATHER_API_KEY) return null;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather API call failed");
        const data = await response.json();
        return {
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
        };
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return null;
    }
}

async function getBotResponse(userInput) {
    const prompt = `
        You are "Mangaluru Mitra", a friendly and expert guide to Mangaluru city.
        Your goal is to understand what the user is asking and classify their request into one of the following categories.
        You must respond in JSON format only.

        Categories:
        1.  "GET_FOOD_INFO": User is asking for information about a specific local food.
        2.  "GET_PLACE_INFO": User is asking for information about a specific local place.
        3.  "GET_TULU_PHRASES": User is asking for Tulu language phrases.
        4.  "CREATE_FOOD_TOUR": User wants a one-day food tour, an itinerary, or a plan.
        5.  "GET_EVENTS": User is asking about events, festivals, or things happening in the city.
        6.  "CHITCHAT": The user is making small talk (e.g., "hello", "how are you?", "what's your name?", "hi").
        7.  "UNKNOWN_QUERY": The user is asking about a specific Mangalorean topic that you don't have data for.

        User's question: "${userInput}"

        Analyze the user's question and provide the JSON response.

        Example Responses:
        - User: "Tell me about Chicken Ghee Roast" -> {"category": "GET_FOOD_INFO", "entity": "Chicken Ghee Roast"}
        - User: "What's Panambur beach like?" -> {"category": "GET_PLACE_INFO", "entity": "Panambur Beach"}
        - User: "Teach me some Tulu" -> {"category": "GET_TULU_PHRASES", "entity": "all"}
        - User: "Plan a food tour for me" -> {"category": "CREATE_FOOD_TOUR", "entity": "all"}
        - User: "What events are happening?" -> {"category": "GET_EVENTS", "entity": "all"}
        - User: "hi" -> {"category": "CHITCHAT", "entity": "greeting"}
        - User: "Tell me about Tannirbhavi Beach" -> {"category": "UNKNOWN_QUERY", "entity": "Tannirbhavi Beach"}
    `;

    const geminiPayload = { contents: [{ parts: [{ text: prompt }] }] };
    
    const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.json().catch(() => ({ error: { message: "Could not parse error response." }}));
        console.error("API Error Body:", errorBody);
        throw new Error(`API call failed with status ${geminiResponse.status}: ${errorBody.error.message}`);
    }

    const geminiResult = await geminiResponse.json();
    
    if (!geminiResult.candidates || geminiResult.candidates.length === 0) {
        console.error("Invalid response from Gemini API:", geminiResult);
        throw new Error("Received an invalid or empty response from the AI service.");
    }
    
    const rawText = geminiResult.candidates[0].content.parts[0].text;
    
    const jsonText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const intent = JSON.parse(jsonText);

    switch (intent.category) {
        case 'GET_FOOD_INFO':
        case 'GET_PLACE_INFO':
            const collectionName = intent.category === 'GET_FOOD_INFO' ? 'food' : 'places';
            const q = query(collection(db, collectionName), where("name", "==", intent.entity));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0].data();
                
                let weatherData = null;
                if (intent.category === 'GET_PLACE_INFO' && docData.lat && docData.lng) {
                    weatherData = await fetchWeather(docData.lat, docData.lng);
                }

                return {
                    from: 'bot',
                    type: 'card',
                    title: docData.name,
                    content: docData.description,
                    origin_story: docData.origin_story || docData.best_time_to_visit,
                    weather: weatherData
                };
            } else {
                return { from: 'bot', type: 'text', content: `I'm sorry, I don't have specific information about "${intent.entity}" in my database right now. I'm always learning though!` };
            }

        case 'GET_TULU_PHRASES':
            const tuluSnapshot = await getDocs(collection(db, "tulu"));
            const phrases = tuluSnapshot.docs.map(doc => doc.data());
            return {
                from: 'bot',
                type: 'tulu_list',
                title: "Here are a few useful Tulu phrases:",
                phrases: phrases
            };
        
        case 'CREATE_FOOD_TOUR':
            const foodSnapshot = await getDocs(collection(db, "food"));
            const allFood = foodSnapshot.docs.map(doc => doc.data());
            
            const tourStops = allFood.filter(item => item.lat && item.lng);

            if (tourStops.length < 2) {
                return { from: 'bot', type: 'text', content: "I don't have enough location data to create a tour yet!" };
            }

            const baseUrl = "https://www.google.com/maps/dir/";
            const waypoints = tourStops.map(stop => `${stop.lat},${stop.lng}`).join('/');
            const mapUrl = baseUrl + waypoints;

            return {
                from: 'bot',
                type: 'food_tour',
                title: "Your Dynamic Mangaluru Food Tour!",
                stops: tourStops.map(stop => ({
                    meal: stop.type,
                    name: stop.name,
                    restaurant_name: stop.restaurant_name,
                })),
                mapUrl: mapUrl
            };
        
        case 'GET_EVENTS':
            const eventsSnapshot = await getDocs(collection(db, "events"));
            const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return {
                from: 'bot',
                type: 'event_list',
                title: "Upcoming Events in Mangaluru",
                events: events
            };

        case 'UNKNOWN_QUERY':
            return {
                from: 'bot',
                type: 'text',
                content: `That's a great question about ${intent.entity}! I don't have specific details in my database about that yet, but I'm always learning. You could try asking me about Panambur Beach or Ideal Ice Cream!`
            };

        case 'CHITCHAT':
        default:
            const responses = [
                "I'm doing great, thank you! Ready to explore Mangaluru?",
                "Namaskara! I'm here to help you discover the best of Mangaluru. What's on your mind?",
                "I'm a bot, so I'm always doing well! What can I tell you about the beautiful city of Mangaluru?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            return {
                from: 'bot',
                type: 'text',
                content: randomResponse
            };
    }
}

export default App;
