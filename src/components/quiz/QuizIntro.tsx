import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, BrainCircuit, Trophy } from 'lucide-react';

interface QuizIntroProps {
  onStartQuiz: () => void;
}

export const QuizIntro: React.FC<QuizIntroProps> = ({ onStartQuiz }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          Algorithm & Data Structure Quizzes
        </CardTitle>
        <CardDescription>
          Test your knowledge with multiple-choice questions on algorithms and data structures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Learn Concepts</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Reinforce your understanding of important algorithmic concepts through practice
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Test Knowledge</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Challenge yourself with multiple-choice questions of varying difficulty
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Track Progress</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              See your score and improve your knowledge with detailed explanations
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button size="lg" onClick={onStartQuiz} className="w-full md:w-auto">
          Start Practicing
        </Button>
      </CardFooter>
    </Card>
  );
};