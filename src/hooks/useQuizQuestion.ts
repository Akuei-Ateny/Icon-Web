import { useState, useEffect } from 'react';

interface QuizQuestionData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface AnswerResult {
  isCorrect: boolean;
  explanation: string;
}

// This is our cache to avoid fetching the same question multiple times
const questionsCache: Record<number, QuizQuestionData> = {};

export function useQuizQuestion(questionIndex: number) {
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have cached this question
        if (questionsCache[questionIndex]) {
          const cachedQuestion = questionsCache[questionIndex];
          setQuestion(cachedQuestion.question);
          setOptions(cachedQuestion.options);
          setCorrectAnswer(cachedQuestion.correctAnswer);
          setIsLoading(false);
          return;
        }

        // If not cached, fetch from the API
        const apiKey = process.env.VITE_OPENAI_API_KEY || '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'; 
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are a quiz generator for data structures and algorithms. Generate a multiple-choice question with exactly 4 options (A, B, C, D). Format your response as a JSON object with these fields:
                {
                  "question": "The full question text",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": "The correct option text (exactly matching one of the options)",
                  "explanation": "A detailed explanation of why the answer is correct"
                }
                Make the question challenging but fair. Include code snippets if relevant.`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch question');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse the JSON response
        const questionData: QuizQuestionData = JSON.parse(content);
        
        // Cache the question
        questionsCache[questionIndex] = questionData;
        
        setQuestion(questionData.question);
        setOptions(questionData.options);
        setCorrectAnswer(questionData.correctAnswer);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionIndex]);

  const checkAnswer = async (selectedOption: string): Promise<AnswerResult> => {
    const isCorrect = selectedOption === correctAnswer;
    
    // If the question is cached, we already have the explanation
    if (questionsCache[questionIndex]) {
      return {
        isCorrect,
        explanation: questionsCache[questionIndex].explanation
      };
    }
    
    // This should rarely happen as the question should be cached
    return { 
      isCorrect, 
      explanation: isCorrect ? 
        "Correct! Well done." : 
        `Incorrect. The correct answer is: ${correctAnswer}`
    };
  };

  return {
    question,
    options,
    isLoading,
    error,
    checkAnswer,
  };
}