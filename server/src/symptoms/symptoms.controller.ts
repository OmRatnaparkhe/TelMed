import { Request, Response } from 'express';
import OpenAI from 'openai';

interface AuthRequest extends Request {
  userId?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// AI-powered symptom analysis using OpenAI GPT-4
const getAISymptomAnalysis = async (symptoms: string): Promise<{ condition: string; recommendation: string }[]> => {
  try {
    const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide possible conditions and recommendations. 

IMPORTANT GUIDELINES:
- Provide 1-3 most likely conditions based on the symptoms
- Always emphasize the need for professional medical consultation
- Do not provide definitive diagnoses
- Include general care recommendations
- Be conservative and responsible in your suggestions
- Format your response as a JSON array with objects containing 'condition' and 'recommendation' fields

Symptoms: ${symptoms}

Respond with a JSON array only, no additional text:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are a responsible medical AI assistant. Always recommend consulting healthcare professionals and never provide definitive diagnoses. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysisResults = JSON.parse(response);
    
    // Validate the response format
    if (!Array.isArray(analysisResults)) {
      throw new Error('Invalid response format');
    }

    // Ensure each result has the required fields
    const validResults = analysisResults.filter(result => 
      result.condition && result.recommendation
    ).map(result => ({
      condition: String(result.condition),
      recommendation: String(result.recommendation)
    }));

    return validResults.length > 0 ? validResults : getFallbackSymptomAnalysis(symptoms);

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fall back to simple keyword matching
    return getFallbackSymptomAnalysis(symptoms);
  }
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
    let results: { condition: string; recommendation: string }[];

    // Try AI analysis first, fall back to simple matching if needed
    if (process.env.OPENAI_API_KEY) {
      results = await getAISymptomAnalysis(symptoms.trim());
    } else {
      console.log('OpenAI API key not found, using fallback analysis');
      results = getFallbackSymptomAnalysis(symptoms.trim());
    }

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
