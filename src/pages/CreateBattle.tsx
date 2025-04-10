import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getRandomProblem } from '@/lib/problems';
import { useAuth } from '@/contexts/AuthContext';
import { BattleConfigForm, BattleConfig } from '@/components/battle/BattleConfigForm';
import { BattlePreview } from '@/components/battle/BattlePreview';

const CreateBattle = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<BattleConfig>({
    language: '',
    difficulty: '',
    duration: '',
    battleType: 'Rated'
  });

  const handleCreateBattle = async (config: BattleConfig) => {
    // Validation
    if (!config.language || !config.difficulty || !config.duration) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a battle");
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating battle with user:", user.id);
      
      // Verify the user exists in the users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile) {
        console.error("User profile not found:", profileError);
        toast.error("Could not find your user profile. Please try logging out and back in.");
        setIsLoading(false);
        return;
      }
      
      console.log("User profile found:", userProfile);
      
      // Get a random problem
      const randomProblem = await getRandomProblem();
      
      if (!randomProblem || !randomProblem.id) {
        throw new Error("Failed to get a random problem");
      }
      
      console.log("Creating battle with problem:", randomProblem.id);
      
      // Create battle in Supabase
      const { data: battle, error } = await supabase
        .from('battles')
        .insert([
          {
            creator_id: user.id,
            programming_language: config.language,
            difficulty: config.difficulty,
            duration: parseInt(config.duration),
            battle_type: config.battleType,
            status: 'open',
            problem_id: randomProblem.id
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!battle || !battle.id) {
        throw new Error("No battle data returned");
      }
      
      console.log("Battle created successfully:", battle);
      toast.success("Battle created successfully!");
      
      // Navigate to the battle arena with the battle ID
      navigate(`/battle/${battle.id}`);
    } catch (error: any) {
      console.error('Error creating battle:', error);
      toast.error(`Failed to create battle: ${error.message || "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to check login status
  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to create a battle");
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen pt-10 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Create a Battle
          </h1>
          <p className="mt-3 text-icon-light-gray max-w-2xl mx-auto">
            Configure your coding battle and challenge others to compete with you in solving algorithmic problems.
          </p>
        </div>

        <BattleConfigForm 
          onSubmit={handleCreateBattle}
          onChange={setFormState}
          isLoading={isLoading}
        />

        <BattlePreview 
          language={formState.language}
          difficulty={formState.difficulty}
          duration={formState.duration}
          battleType={formState.battleType}
        />
      </div>
    </div>
  );
};

export default CreateBattle;