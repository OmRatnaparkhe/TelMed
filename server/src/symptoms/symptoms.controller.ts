import { Request, Response } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

// Fallback function for when OpenAI is not available
const getFallbackSymptomAnalysis = (symptoms: string): { condition: string; recommendation: string }[] => {
  const lowerCaseSymptoms = symptoms.toLowerCase();
  const results: { condition: string; recommendation: string }[] = [];

  if (lowerCaseSymptoms.includes('fever') && lowerCaseSymptoms.includes('cough')) {
    results.push({
      condition: 'Common Cold',
      recommendation: 'Rest, hydrate, and consider over-the-counter cold medication.',
    });
  }

  if (lowerCaseSymptoms.includes('headache') && lowerCaseSymptoms.includes('nausea')) {
    results.push({
      condition: 'Migraine',
      recommendation: 'Rest in a dark, quiet room. Consider pain relievers and consult a doctor if severe.',
    });
  }

  if (lowerCaseSymptoms.includes('stomach pain') || lowerCaseSymptoms.includes('diarrhea')) {
    results.push({
      condition: 'Gastroenteritis (Stomach Flu)',
      recommendation: 'Stay hydrated with clear fluids. Eat bland foods. Seek medical advice if symptoms persist.',
    });
  }

  if (results.length === 0) {
    results.push({
      condition: 'General Symptoms',
      recommendation: 'Please consult a healthcare professional for proper diagnosis and treatment.',
    });
  }

  return results;
};

export const checkSymptoms = async (req: AuthRequest, res: Response) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: 'Symptoms are required' });
  }

  if (typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a valid symptom description' });
  }

  try {
    let results: { condition: string; recommendation: string }[] = getFallbackSymptomAnalysis(symptoms.trim());

    // Add disclaimer to all recommendations
    results = results.map(result => ({
      ...result,
      recommendation: `${result.recommendation} **Disclaimer: This is not a substitute for professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.**`
    }));

    res.json(results);
  } catch (error) {
    console.error('Error in symptom checking:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
};
