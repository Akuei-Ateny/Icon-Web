import React from 'react';
import { Code, ArrowRight, Award, Timer, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30 z-0"></div>
      
      {/* Animated code symbols in background */}
      <div className="absolute top-20 left-1/4 text-icon-accent/20 animate-pulse-slow">
        <Code size={60} />
      </div>
      <div className="absolute bottom-32 right-1/4 text-icon-accent/20 animate-pulse-slow" style={{ animationDelay: '1.5s' }}>
        <Code size={80} />
      </div>
      
      <div className="relative z-10 text-center space-y-6 max-w-3xl px-4 animate-fade-in">
        <div className="inline-block bg-icon-accent/10 text-icon-accent px-4 py-2 rounded-full text-sm font-medium mb-2">
          Welcome to the Coding Arena
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="text-icon-white">Compete. Code.</span>
          <span className="text-icon-accent"> Conquer.</span>
        </h1>
        
        <p className="text-xl text-icon-light-gray mt-6 max-w-2xl mx-auto">
          Join the ultimate competitive coding platform where developers battle in real-time to solve algorithmic challenges.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button 
            className="icon-button icon-button-primary group"
            onClick={() => navigate('/create-battle')}
          >
            Create Battle
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            className="icon-button icon-button-outline group"
            onClick={() => navigate('/join-battle')}
          >
            Join Battle
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            className="icon-button icon-button-secondary group"
            onClick={() => navigate('/quizzes')}
          >
            Practice Quizzes
            <BookOpen className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl px-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="bg-icon-dark-gray p-6 rounded-lg border border-icon-gray">
          <div className="h-12 w-12 rounded-full bg-icon-accent/20 flex items-center justify-center mb-4">
            <Timer className="h-6 w-6 text-icon-accent" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Timed Challenges</h3>
          <p className="text-icon-light-gray">Solve algorithmic problems against the clock to test your speed and precision.</p>
        </div>
        
        <div className="bg-icon-dark-gray p-6 rounded-lg border border-icon-gray">
          <div className="h-12 w-12 rounded-full bg-icon-accent/20 flex items-center justify-center mb-4">
            <Code className="h-6 w-6 text-icon-accent" />
          </div>
          <h3 className="text-xl font-semibold mb-2">1500+ Problems</h3>
          <p className="text-icon-light-gray">Access a vast library of challenging problems across various difficulty levels.</p>
        </div>
        
        <div className="bg-icon-dark-gray p-6 rounded-lg border border-icon-gray">
          <div className="h-12 w-12 rounded-full bg-icon-accent/20 flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-icon-accent" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Practice Quizzes</h3>
          <p className="text-icon-light-gray">Test your knowledge with multiple-choice quizzes on algorithms and data structures.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;