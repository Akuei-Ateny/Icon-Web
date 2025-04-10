import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useQuizQuestion } from '../../hooks/useQuizQuestion';

interface QuizQuestionProps {
  questionIndex: number;
  onAnswered: (isCorrect: boolean) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  questionIndex,
  onAnswered
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  
  const { 
    question, 
    options, 
    isLoading, 
    error,
    checkAnswer
  } = useQuizQuestion(questionIndex);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption('');
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setExplanation('');
  }, [questionIndex]);

  const handleOptionChange = (value: string) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(value);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || isAnswerSubmitted) return;
    
    setIsAnswerSubmitted(true);
    
    try {
      const result = await checkAnswer(selectedOption);
      setIsCorrect(result.isCorrect);
      setExplanation(result.explanation);
      onAnswered(result.isCorrect);
    } catch (error) {
      console.error('Error checking answer:', error);
      setIsCorrect(false);
      setExplanation('An error occurred while checking your answer.');
      onAnswered(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="h-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Failed to load question. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Question</CardTitle>
        <CardDescription className="whitespace-pre-wrap">
          {question}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedOption} className="space-y-3">
          {options.map((option, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-2 p-3 rounded-md border ${
                isAnswerSubmitted && selectedOption === option && isCorrect 
                  ? 'border-green-500 bg-green-50' 
                  : isAnswerSubmitted && selectedOption === option && !isCorrect 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200'
              }`}
            >
              <RadioGroupItem 
                value={option} 
                id={`option-${index}`} 
                onClick={() => handleOptionChange(option)}
                disabled={isAnswerSubmitted}
              />
              <Label 
                htmlFor={`option-${index}`}
                className={`flex-grow ${isAnswerSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {option}
              </Label>
              {isAnswerSubmitted && selectedOption === option && (
                isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )
              )}
            </div>
          ))}
        </RadioGroup>

        {isAnswerSubmitted && (
          <Alert className={`mt-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
            <AlertDescription className="mt-2">
              <div className="font-medium mb-1">
                {isCorrect ? 'Correct!' : 'Incorrect!'}
              </div>
              <div className="text-sm whitespace-pre-wrap">{explanation}</div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmitAnswer} 
          disabled={!selectedOption || isAnswerSubmitted}
          className="w-full"
        >
          {isAnswerSubmitted ? 'Next Question Loading...' : 'Submit Answer'}
        </Button>
      </CardFooter>
    </Card>
  );
};