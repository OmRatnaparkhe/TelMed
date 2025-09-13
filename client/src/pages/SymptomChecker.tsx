import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

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

  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by this browser. Please use Chrome.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError('Speech recognition failed. Please try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">AI Symptom Checker</h1>

        <div className="mb-4">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Describe your symptoms:</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <textarea
              id="symptoms"
              name="symptoms"
              rows={5}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              placeholder="e.g., I have a fever, cough, and sore throat..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            ></textarea>
            <button
              type="button"
              onClick={handleSpeechToText}
              className={`absolute bottom-2 right-2 p-2 rounded-full text-white ${isListening ? 'bg-red-500' : 'bg-blue-500'} hover:${isListening ? 'bg-red-600' : 'bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isListening ? 'Listening...' : 'Speak'}
            </button>
          </div>
        </div>

        <button
          onClick={handleCheckSymptoms}
          disabled={loading || !symptoms.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check Symptoms'}
        </button>

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
