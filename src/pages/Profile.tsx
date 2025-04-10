import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Battle, RatingHistory } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Trophy, 
  X, 
  Play, 
  Code, 
  Clock, 
  Shield, 
  ChevronsRight 
} from 'lucide-react';
import BattlesList from '@/components/profile/BattlesList';
import StatsOverview from '@/components/profile/StatsOverview';
import RatingHistoryChart from '@/components/profile/RatingHistoryChart';
import { LoaderCircle } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [createdBattles, setCreatedBattles] = useState<Battle[]>([]);
  const [joinedBattles, setJoinedBattles] = useState<Battle[]>([]);
  const [ratingHistory, setRatingHistory] = useState<RatingHistory[]>([]);
  const [stats, setStats] = useState({
    totalBattles: 0,
    wins: 0,
    rating: profile?.rating || 1000,
    winRate: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch active battles (open or in_progress) created by the user
      const { data: activeBattleData, error: activeBattleError } = await supabase
        .from('battles')
        .select('*')
        .eq('creator_id', user.id)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (activeBattleError && activeBattleError.code !== 'PGRST116') {
        console.error('Error fetching active battle:', activeBattleError);
      } else if (activeBattleData) {
        setActiveBattle(activeBattleData);
      }
      
      // Fetch completed battles created by the user
      const { data: createdData, error: createdError } = await supabase
        .from('battles')
        .select('*')
        .eq('creator_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (createdError) {
        console.error('Error fetching created battles:', createdError);
      } else {
        setCreatedBattles(createdData || []);
      }
      
      // Fetch battles joined by the user (as defender)
      const { data: joinedData, error: joinedError } = await supabase
        .from('battles')
        .select('*')
        .eq('defender_id', user.id)
        .order('created_at', { ascending: false });
      
      if (joinedError) {
        console.error('Error fetching joined battles:', joinedError);
      } else {
        setJoinedBattles(joinedData || []);
      }
      
      // Fetch rating history
      const { data: historyData, error: historyError } = await supabase
        .from('rating_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (historyError) {
        console.error('Error fetching rating history:', historyError);
      } else {
        setRatingHistory(historyData || []);
      }
      
      // Calculating statistics
      if (profile) {
        const allCompletedBattles = [
          ...(createdData || []).filter(b => b.status === 'completed'),
          ...(joinedData || []).filter(b => b.status === 'completed')
        ];
        
        const totalBattles = allCompletedBattles.length;
        const wins = allCompletedBattles.filter(b => b.winner_id === user.id).length;
        
        setStats({
          totalBattles,
          wins,
          rating: profile.rating,
          winRate: totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbortBattle = async () => {
    if (!activeBattle) return;
    
    try {
      const { error } = await supabase
        .from('battles')
        .delete()
        .eq('id', activeBattle.id)
        .eq('creator_id', user?.id);
      
      if (error) {
        console.error('Error aborting battle:', error);
        toast.error('Failed to abort battle');
        return;
      }
      
      toast.success('Battle aborted successfully');
      setActiveBattle(null);
    } catch (error) {
      console.error('Error aborting battle:', error);
      toast.error('Failed to abort battle');
    }
  };

  const handleRejoinBattle = () => {
    if (activeBattle) {
      navigate(`/battle/${activeBattle.id}`);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle className="animate-spin h-8 w-8 text-icon-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* User Profile Header */}
      <div className="mb-6">
        <Card className="border-icon-accent/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-icon-accent">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || 'User'} />
                <AvatarFallback className="text-2xl bg-icon-dark-gray text-icon-accent">
                  {profile?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{profile?.username || 'Coder'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  <Badge variant="outline" className="bg-icon-accent/10 text-icon-accent">
                    <Trophy size={14} className="mr-1" /> Rating: {stats.rating}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    <Code size={14} className="mr-1" /> {stats.totalBattles} Battles
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    <Trophy size={14} className="mr-1" /> {stats.wins} Wins
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                    Win Rate: {stats.winRate}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 self-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2" 
                  onClick={fetchUserData}
                >
                  <RefreshCw size={14} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Battle Section */}
      {activeBattle && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Play className="mr-2 text-green-500" size={20} />
            Active Battle
          </h2>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {activeBattle.programming_language} - {activeBattle.difficulty} Difficulty
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(activeBattle.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge className={
                  activeBattle.status === 'open' ? 'bg-blue-500' : 
                  'bg-yellow-500'
                }>
                  {activeBattle.status === 'open' ? 'Open' : 'In Progress'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} />
                <span>{activeBattle.duration} minutes duration</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>{activeBattle.battle_type} battle</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button 
                variant="destructive" 
                className="flex items-center gap-2" 
                onClick={handleAbortBattle}
              >
                <X size={16} />
                Abort Battle
              </Button>
              <Button 
                className="flex items-center gap-2" 
                onClick={handleRejoinBattle}
              >
                <ChevronsRight size={16} />
                Rejoin Battle
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Rating History Chart */}
      <div className="mb-8">
        <RatingHistoryChart 
          ratingHistory={ratingHistory} 
          isLoading={isLoading} 
        />
      </div>

      {/* Battles Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="created">Created Battles</TabsTrigger>
          <TabsTrigger value="joined">Joined Battles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <StatsOverview stats={stats} />
        </TabsContent>
        
        <TabsContent value="created">
          <BattlesList 
            battles={createdBattles} 
            emptyMessage="You haven't created any completed battles yet."
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="joined">
          <BattlesList 
            battles={joinedBattles} 
            emptyMessage="You haven't joined any battles yet."
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
