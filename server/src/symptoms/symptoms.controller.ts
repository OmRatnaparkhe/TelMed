import { Request, Response } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

export const checkSymptoms = async (req: AuthRequest, res: Response) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: 'Symptoms are required' });
  }

  // MVP: Simple keyword matching for conditions and recommendations
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
      condition: 'No specific condition identified (MVP)',
      recommendation: 'Please consult a doctor for a professional diagnosis.',
    });
  }

  res.json(results);
};
