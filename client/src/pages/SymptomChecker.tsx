import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

interface SymptomResult {
  condition: string;
  recommendation: string;
}

const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState<SymptomResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const navigate = useNavigate();

  const handleCheckSymptoms = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await api.post('/api/symptoms/check', { symptoms });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check symptoms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check speech recognition support and microphone permissions
  useEffect(() => {
    const checkSpeechSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    };

    const checkMicrophonePermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicrophonePermission(permission.state as any);
        
        permission.onchange = () => {
          setMicrophonePermission(permission.state as any);
        };
      } catch (error) {
        console.log('Permission API not supported, will request permission on use');
        setMicrophonePermission('prompt');
      }
    };

    checkSpeechSupport();
    checkMicrophonePermission();
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicrophonePermission('granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicrophonePermission('denied');
      setError('Microphone access is required for voice input. Please enable microphone permissions in your browser settings.');
      return false;
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setSymptoms(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'network':
          if (retryCountRef.current < 2) {
            retryCountRef.current += 1;
            console.log(`Network error, retrying... (attempt ${retryCountRef.current})`);
            setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                } catch (err) {
                  console.error('Failed to restart recognition:', err);
                  setError('Network connection unstable. Please try again manually.');
                }
              }
            }, 1000);
          } else {
            retryCountRef.current = 0;
            setError('Network connection unstable. Please check your internet connection and try again.');
          }
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please enable microphone permissions and try again.');
          setMicrophonePermission('denied');
          break;
        case 'no-speech':
          setError('No speech detected. Please try speaking again.');
          break;
        case 'audio-capture':
          setError('Audio capture failed. Please check your microphone and try again.');
          break;
        case 'service-not-allowed':
          setError('Speech recognition service not available. Please try again later.');
          break;
        default:
          setError(`Speech recognition error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const handleSpeechToText = async () => {
    if (!speechSupported) {
      setError('Speech Recognition is not supported by this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (microphonePermission === 'denied') {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (microphonePermission === 'prompt') {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      retryCountRef.current = 0; // Reset retry counter on successful start
      recognitionRef.current = initializeSpeechRecognition();
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setError('Failed to start speech recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">AI Symptom Checker</h1>

        <div className="mb-4">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Describe your symptoms:</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <Textarea
              id="symptoms"
              name="symptoms"
              rows={5}
              className="block w-full sm:text-sm rounded-md p-2"
              placeholder="e.g., I have a fever, cough, and sore throat..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            ></Textarea>
            <div className="absolute bottom-2 right-2 flex gap-2">
              {!speechSupported && (
                <div className="bg-gray-400 text-white px-3 py-1 rounded text-xs">
                  Speech not supported
                </div>
              )}
              {microphonePermission === 'denied' && (
                <div className="bg-red-400 text-white px-3 py-1 rounded text-xs">
                  Mic access denied
                </div>
              )}
              <Button
                type="button"
                onClick={isListening ? stopListening : handleSpeechToText}
                disabled={!speechSupported || microphonePermission === 'denied'}
                className={`p-2 rounded-full text-white transition-colors ${
                  !speechSupported || microphonePermission === 'denied'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                title={!speechSupported ? 'Speech recognition not supported' : microphonePermission === 'denied' ? 'Microphone access required' : isListening ? 'Click to stop listening' : 'Click to start voice input'}
              >
                {isListening ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheckSymptoms}
          disabled={loading || !symptoms.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check Symptoms'}
        </Button>

        {error && <p className="mt-4 text-sm text-red-600">Error: {error}</p>}

        {results && (results.length > 0 ? (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Possible Conditions & Recommendations:</h2>
            <ul className="space-y-3">
              {results.map((result, index) => (
                <li key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                  <p className="font-medium text-gray-900">Condition: {result.condition}</p>
                  <p className="text-gray-700">Recommendation: {result.recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-gray-600">No conditions identified based on your symptoms. Please consult a doctor for a professional diagnosis.</p>
        ))}
      </div>
    </div>
  );
};

export default SymptomChecker;
