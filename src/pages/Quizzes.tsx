import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { QuizIntro } from '@/components/quiz/QuizIntro';

const Quizzes: React.FC = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setTotalAnswered(0);
    setCorrectAnswers(0);
  };

  const handleQuestionAnswered = (isCorrect: boolean) => {
    setTotalAnswered(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1);
    }, 1500);
  };

  const handleFinishQuiz = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Algorithm Practice Arena</h1>
      
      {!quizStarted ? (
        <QuizIntro onStartQuiz={handleStartQuiz} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Question {currentQuestionIndex + 1}</span>
              <span className="text-sm text-muted-foreground">
                Score: {correctAnswers}/{totalAnswered}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleFinishQuiz}>
              Exit Quiz
            </Button>
          </div>
          
          <QuizQuestion 
            questionIndex={currentQuestionIndex}
            onAnswered={handleQuestionAnswered}
          />
        </div>
      )}
    </div>
  );
};

export default Quizzes;