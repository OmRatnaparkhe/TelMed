import React, { useState, useEffect, useRef } from "react";

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface Condition {
  ConditionName: string;
  Probability: number;
  Description: string;
  matchedSymptoms?: string[];
}

const SymptomChecker: React.FC = () => {
  const [symptom, setSymptom] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const handleAddSymptom = () => {
    if (symptom.trim() !== "" && !symptoms.includes(symptom.trim().toLowerCase())) {
      setSymptoms([...symptoms, symptom.trim().toLowerCase()]);
      setSymptom("");
      setError("");
    }
  };

  const removeSymptom = (indexToRemove: number) => {
    setSymptoms(symptoms.filter((_, index) => index !== indexToRemove));
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        }
      }

      if (finalTranscript) {
        // Add the recognized speech to the current symptom input
        setSymptom(prev => prev + (prev ? " " : "") + finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError("Microphone access denied. Please allow microphone access and try again.");
          break;
        case 'no-speech':
          setError("No speech detected. Please try speaking again.");
          break;
        case 'network':
          setError("Network error. Check your internet connection and try again.");
          break;
        case 'audio-capture':
          setError("Audio capture failed. Please check your microphone.");
          break;
        default:
          setError(`Speech recognition error: ${event.error}. Please try again.`);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSpeechInput = () => {
    if (!recognitionRef.current || !isSupported) {
      setError("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError("");
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setError("Failed to start speech recognition. Please try again.");
      }
    }
  };

  // Mock medical knowledge base for demonstration
  const medicalKnowledge: Record<string, Array<{ name: string; probability: number; description: string }>> = {
    fever: [
      { name: "Common Cold", probability: 0.65, description: "Viral upper respiratory infection" },
      { name: "Influenza", probability: 0.45, description: "Seasonal flu virus" },
      { name: "COVID-19", probability: 0.35, description: "Coronavirus infection" },
      { name: "Bacterial Infection", probability: 0.25, description: "Various bacterial causes" }
    ],
    headache: [
      { name: "Tension Headache", probability: 0.70, description: "Stress-related headache" },
      { name: "Migraine", probability: 0.40, description: "Severe recurring headache" },
      { name: "Sinus Infection", probability: 0.30, description: "Inflammation of sinuses" },
      { name: "Dehydration", probability: 0.25, description: "Insufficient fluid intake" }
    ],
    cough: [
      { name: "Common Cold", probability: 0.60, description: "Viral upper respiratory infection" },
      { name: "Bronchitis", probability: 0.45, description: "Inflammation of bronchial tubes" },
      { name: "Allergies", probability: 0.35, description: "Allergic reaction" },
      { name: "Asthma", probability: 0.30, description: "Respiratory condition" }
    ],
    "sore throat": [
      { name: "Viral Pharyngitis", probability: 0.65, description: "Viral throat infection" },
      { name: "Strep Throat", probability: 0.35, description: "Bacterial throat infection" },
      { name: "Allergies", probability: 0.25, description: "Allergic reaction" },
      { name: "Acid Reflux", probability: 0.20, description: "Stomach acid irritation" }
    ],
    "runny nose": [
      { name: "Common Cold", probability: 0.70, description: "Viral upper respiratory infection" },
      { name: "Allergies", probability: 0.50, description: "Allergic rhinitis" },
      { name: "Sinusitis", probability: 0.30, description: "Sinus inflammation" }
    ],
    fatigue: [
      { name: "Viral Infection", probability: 0.50, description: "Various viral causes" },
      { name: "Sleep Deprivation", probability: 0.45, description: "Insufficient rest" },
      { name: "Stress", probability: 0.40, description: "Physical or mental stress" },
      { name: "Anemia", probability: 0.25, description: "Low iron levels" }
    ],
    nausea: [
      { name: "Gastroenteritis", probability: 0.55, description: "Stomach flu" },
      { name: "Food Poisoning", probability: 0.40, description: "Contaminated food" },
      { name: "Migraine", probability: 0.30, description: "Severe headache with nausea" },
      { name: "Anxiety", probability: 0.25, description: "Stress-related nausea" }
    ],
    "stomach pain": [
      { name: "Gastritis", probability: 0.50, description: "Stomach lining inflammation" },
      { name: "Food Poisoning", probability: 0.40, description: "Contaminated food" },
      { name: "Indigestion", probability: 0.35, description: "Digestive discomfort" },
      { name: "Appendicitis", probability: 0.15, description: "Appendix inflammation" }
    ],
    dizziness: [
      { name: "Dehydration", probability: 0.45, description: "Insufficient fluid intake" },
      { name: "Low Blood Pressure", probability: 0.35, description: "Hypotension" },
      { name: "Inner Ear Problem", probability: 0.30, description: "Balance disorder" },
      { name: "Anemia", probability: 0.25, description: "Low iron levels" }
    ],
    "muscle aches": [
      { name: "Viral Infection", probability: 0.55, description: "Flu-like symptoms" },
      { name: "Physical Strain", probability: 0.45, description: "Overexertion" },
      { name: "Fibromyalgia", probability: 0.25, description: "Chronic pain condition" },
      { name: "Dehydration", probability: 0.20, description: "Electrolyte imbalance" }
    ]
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      setError("Please add at least one symptom before analyzing.");
      return;
    }

    setLoading(true);
    setError("");
    setConditions([]);

    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const conditionMap = new Map();
      
      // Analyze each symptom and aggregate conditions
      symptoms.forEach(symptom => {
        const symptomLower = symptom.toLowerCase().trim();
        const possibleConditions = medicalKnowledge[symptomLower] || [];
        
        possibleConditions.forEach(condition => {
          if (conditionMap.has(condition.name)) {
            // Increase probability if condition appears for multiple symptoms
            const existing = conditionMap.get(condition.name);
            existing.Probability = Math.min(0.95, existing.Probability + condition.probability * 0.3);
            existing.matchedSymptoms.push(symptom);
          } else {
            conditionMap.set(condition.name, {
              ConditionName: condition.name,
              Probability: condition.probability,
              Description: condition.description,
              matchedSymptoms: [symptom]
            });
          }
        });
      });

      // Convert to array and sort by probability
      const results = Array.from(conditionMap.values())
        .sort((a, b) => b.Probability - a.Probability)
        .slice(0, 8); // Limit to top 8 results

      // Add some general conditions if no specific matches found
      if (results.length === 0) {
        results.push(
          { ConditionName: "General Viral Infection", Probability: 0.40, Description: "Common viral illness" },
          { ConditionName: "Stress-Related Symptoms", Probability: 0.30, Description: "Physical manifestation of stress" },
          { ConditionName: "Minor Illness", Probability: 0.25, Description: "Self-limiting condition" }
        );
      }

      setConditions(results);
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong with the analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSymptoms([]);
    setConditions([]);
    setSymptom("");
    setError("");
  };

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      background: "#ffffff",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "30px",
      paddingBottom: "20px",
      borderBottom: "2px solid #22c55e"
    },
    title: {
      fontSize: "2.2rem",
      fontWeight: "600",
      margin: "0 0 10px 0",
      color: "#22c55e"
    },
    subtitle: {
      fontSize: "1rem",
      color: "#6b7280",
      margin: "0"
    },
    inputSection: {
      background: "#ffffff",
      padding: "25px",
      borderRadius: "12px",
      marginBottom: "25px",
      border: "2px solid #e5e7eb",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },
    inputContainer: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap" as const,
      alignItems: "center"
    },
    inputWrapper: {
      flex: "1",
      minWidth: "250px",
      position: "relative" as const,
      display: "flex",
      alignItems: "center"
    },
    input: {
      width: "100%",
      padding: "12px 50px 12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "1rem",
      outline: "none",
      background: "#ffffff",
      color: "#374151",
      boxSizing: "border-box" as const,
      transition: "border-color 0.2s ease"
    },
    micButton: {
      position: "absolute" as const,
      right: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      padding: "8px",
      border: isListening ? "2px solid #ef4444" : "2px solid #22c55e",
      borderRadius: "50%",
      cursor: isSupported ? "pointer" : "not-allowed",
      background: isListening ? "#fef2f2" : "#f0fdf4",
      color: isListening ? "#ef4444" : "#22c55e",
      fontSize: "16px",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      opacity: isSupported ? 1 : 0.5,
      boxShadow: isListening ? "0 0 0 4px rgba(239, 68, 68, 0.1)" : "0 0 0 4px rgba(34, 197, 94, 0.1)"
    },
    addButton: {
      padding: "12px 24px",
      border: "2px solid #22c55e",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      background: "#22c55e",
      color: "#ffffff",
      transition: "all 0.2s ease"
    },
    symptomsGrid: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "8px",
      marginBottom: "20px"
    },
    symptomTag: {
      background: "#f0fdf4",
      padding: "8px 12px",
      borderRadius: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "0.9rem",
      border: "1px solid #22c55e",
      color: "#166534"
    },
    removeButton: {
      background: "#ef4444",
      border: "none",
      borderRadius: "50%",
      width: "18px",
      height: "18px",
      cursor: "pointer",
      color: "#fff",
      fontSize: "12px",
      marginLeft: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    analyzeButton: {
      width: "100%",
      padding: "16px",
      border: "none",
      borderRadius: "8px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      background: loading ? "#9ca3af" : "#22c55e",
      color: "#ffffff",
      transition: "all 0.2s ease",
      opacity: loading ? 0.7 : 1,
      marginBottom: "15px"
    },
    clearButton: {
      width: "100%",
      padding: "12px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      background: "#ffffff",
      color: "#6b7280",
      transition: "all 0.2s ease"
    },
    resultsSection: {
      background: "#ffffff",
      padding: "25px",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      marginTop: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },
    resultsTitle: {
      fontSize: "1.4rem",
      fontWeight: "600",
      marginBottom: "20px",
      color: "#22c55e",
      textAlign: "center" as const
    },
    conditionsList: {
      display: "grid",
      gap: "12px"
    },
    conditionItem: {
      background: "#f9fafb",
      padding: "16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    conditionName: {
      fontSize: "1rem",
      fontWeight: "500",
      color: "#374151"
    },
    probability: {
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#22c55e",
      background: "#f0fdf4",
      padding: "4px 12px",
      borderRadius: "12px",
      border: "1px solid #22c55e"
    },
    error: {
      background: "#fef2f2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center" as const,
      border: "1px solid #fecaca"
    },
    disclaimer: {
      background: "#fffbeb",
      color: "#92400e",
      padding: "16px",
      borderRadius: "8px",
      marginTop: "20px",
      fontSize: "0.9rem",
      textAlign: "center" as const,
      border: "1px solid #fde68a"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🩺 Smart Symptom Analyzer</h1>
        <p style={styles.subtitle}>AI-powered medical symptom analysis</p>
      </div>

      <div style={styles.inputSection}>
        <div style={styles.inputContainer}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Type or speak a symptom (e.g., fever, headache, cough)"
              style={styles.input}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSymptom()}
            />
            <button
              onClick={handleSpeechInput}
              style={styles.micButton}
              className={`mic-button ${isListening ? 'listening' : ''}`}
              disabled={!isSupported}
              title={
                !isSupported 
                  ? "Speech recognition not supported" 
                  : isListening 
                    ? "Click to stop listening" 
                    : "Click to start voice input"
              }
            >
              {!isSupported ? "❌" : isListening ? "⏹" : "🎤"}
            </button>
          </div>
          <button
            onClick={handleAddSymptom}
            style={styles.addButton}
            className="add-symptom-btn"
          >
            ➕ Add Symptom
          </button>
        </div>

        {isListening && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: "15px",
            color: "#166534",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ animation: "pulse-dot 1.5s infinite" }}>🎤</span>
            Listening... Speak now!
          </div>
        )}

        {symptoms.length > 0 && (
          <div>
            <p style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "15px" }}>
              Selected Symptoms ({symptoms.length}):
            </p>
            <div style={styles.symptomsGrid}>
              {symptoms.map((s, i) => (
                <div key={i} style={styles.symptomTag}>
                  <span>{s}</span>
                  <button
                    onClick={() => removeSymptom(i)}
                    style={styles.removeButton}
                    title="Remove symptom"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={analyzeSymptoms}
          style={styles.analyzeButton}
          disabled={loading || symptoms.length === 0}
          className="analyze-btn"
        >
          {loading ? "🔄 Analyzing..." : "🔍 Analyze Symptoms"}
        </button>

        {(symptoms.length > 0 || conditions.length > 0) && (
          <button
            onClick={clearAll}
            style={styles.clearButton}
            className="clear-btn"
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {conditions.length > 0 && (
        <div style={styles.resultsSection}>
          <h2 style={styles.resultsTitle}>📋 Possible Conditions</h2>
          <div style={styles.conditionsList}>
            {conditions.slice(0, 10).map((c, i) => (
              <div key={i} style={styles.conditionItem}>
                <span style={styles.conditionName}>
                  {c.ConditionName}
                </span>
                <span style={styles.probability}>
                  {c.Probability ? `${(c.Probability * 100).toFixed(1)}%`  : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> This tool is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
      </div>

      <style>
        {`
          .add-symptom-btn:hover {
            background: #16a34a !important;
            transform: translateY(-1px);
          }
          
          .analyze-btn:hover:not(:disabled) {
            background: #16a34a !important;
            transform: translateY(-1px);
          }
          
          .clear-btn:hover {
            background: #f3f4f6 !important;
            border-color: #d1d5db !important;
          }
          
          .mic-button:hover:not(:disabled) {
            transform: translateY(-50%) scale(1.1);
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.2) !important;
          }
          
          .mic-button:active:not(:disabled) {
            transform: translateY(-50%) scale(0.95);
          }
          
          .mic-button.listening {
            animation: pulse-mic 1.5s infinite;
          }
          
          @keyframes pulse-mic {
            0% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
            50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.2); }
            100% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
          }
          
          @keyframes pulse-dot {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
          
          input:focus {
            border-color: #22c55e !important;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
          }
          
          @media (max-width: 768px) {
            .input-container {
              flex-direction: column;
            }
            
            .input-wrapper {
              min-width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SymptomChecker;
