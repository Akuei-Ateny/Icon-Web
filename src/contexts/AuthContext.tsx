import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile, initializeDatabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithGithub: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      
      try {
        // Initialize database tables first
        const initialized = await initializeDatabase();
        setDbInitialized(initialized);
        
        if (!initialized) {
          console.warn("Database initialization failed. Some features may not work correctly.");
          toast.error("Failed to initialize database. Please try again later.");
        }
        
        // Get the session regardless of database initialization
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error during app initialization:", error);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        if (!dbInitialized) {
          // Try initializing again if it failed initially
          const initialized = await initializeDatabase();
          setDbInitialized(initialized);
        }
        
        await fetchProfile(session.user.id);
        toast.success('Signed in successfully!');
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        toast.info('Signed out successfully');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, dbInitialized]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      // Check if we need to create the tables
      if (!dbInitialized) {
        await initializeDatabase();
        setDbInitialized(true);
      }
      
      // Query users table directly (not profiles)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        await createUserProfile(userId);
        return;
      }

      if (data) {
        console.log('Profile found:', data);
        setProfile(data as Profile);
        await ensureRatingHistory(userId);
      } else {
        await createUserProfile(userId);
      }
    } catch (err) {
      console.error('Exception in fetchProfile:', err);
    }
  };
  
  const ensureRatingHistory = async (userId: string) => {
    try {
      // Try to count rating history entries
      const { count, error } = await supabase
        .from('rating_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking rating history:', error);
        return;
      }
      
      if (count === 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('rating, created_at')
          .eq('id', userId)
          .single();
        
        if (userData) {
          await supabase
            .from('rating_history')
            .insert({
              user_id: userId,
              rating: userData.rating,
              notes: 'Initial rating',
              created_at: userData.created_at
            });
          
          console.log('Created initial rating history entry');
        }
      }
    } catch (err) {
      console.error('Error ensuring rating history:', err);
    }
  };
  
  const createUserProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        console.log('Creating new profile for user:', userData.user.id);
        
        const newProfile = {
          id: userData.user.id,
          username: userData.user.user_metadata?.name || userData.user.user_metadata?.full_name || `Coder${Math.floor(Math.random() * 10000)}`,
          email: userData.user.email,
          avatar_url: userData.user.user_metadata?.avatar_url || null,
          rating: 1000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating profile:', error);
          toast.error('Failed to create user profile');
        } else {
          console.log('Profile created successfully:', data);
          setProfile(data as Profile);
          
          try {
            // Create initial rating history
            await supabase
              .from('rating_history')
              .insert({
                user_id: userData.user.id,
                rating: 1000,
                notes: 'Initial rating',
                created_at: new Date().toISOString()
              });
            
            console.log('Created initial rating history entry');
          } catch (err) {
            console.error('Error creating rating history:', err);
          }
        }
      }
    } catch (err) {
      console.error('Exception in createUserProfile:', err);
    }
  };

  const signInWithGithub = async () => {
    // Initialize database if not already done
    if (!dbInitialized) {
      const initialized = await initializeDatabase();
      setDbInitialized(initialized);
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    
    if (error) {
      toast.error('Failed to sign in with GitHub');
      console.error('GitHub Sign In Error:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error('Failed to sign out');
      console.error('Sign Out Error:', error);
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGithub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};