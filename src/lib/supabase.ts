
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yeocrioblbcucfbvaeav.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb2NyaW9ibGJjdWNmYnZhZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTgzNzcsImV4cCI6MjA1ODY5NDM3N30.JMtCn8cfuwECYXcQgKH_PApHUlrGVuGaJxidyxzlJYQ';

// Create a singleton instance to avoid multiple connections
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  },
});

// Type definitions with proper nullability for optional fields
export type Profile = {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  rating: number;
  created_at: string;
  updated_at?: string;
};

export type RatingHistory = {
  id: string;
  user_id: string;
  rating: number;
  battle_id: string | null;
  notes: string | null;
  created_at: string;
};

export type Battle = {
  id: string;
  creator_id: string;
  defender_id: string | null;
  problem_id: number;
  programming_language: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  battle_type: 'Rated' | 'Casual';
  status: 'open' | 'in_progress' | 'completed';
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
};

export type Submission = {
  id: string;
  battle_id: string;
  user_id: string;
  code: string;
  language: string;
  status: 'pending' | 'correct' | 'incorrect' | 'evaluated';
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  evaluated_at: string | null;
};

export type Solution = {
  id: string;
  battle_id: string;
  user_id: string;
  code: string;
  submitted_at: string;
};

// Helper function to optimize data fetching
export const optimizedFetch = async <T>(
  table: string,
  query: any,
  options?: { 
    single?: boolean,
    limit?: number,
    order?: {column: string, ascending: boolean}
  }
): Promise<T | T[] | null> => {
  try {
    let baseQuery = supabase.from(table).select('*');
    
    // Apply filters from query object
    Object.entries(query).forEach(([key, value]) => {
      baseQuery = baseQuery.eq(key, value);
    });
    
    // Apply ordering if specified
    if (options?.order) {
      baseQuery = baseQuery.order(options.order.column, { ascending: options.order.ascending });
    }
    
    // Apply limit if specified
    if (options?.limit) {
      baseQuery = baseQuery.limit(options.limit);
    }
    
    // Execute as single or multiple
    const { data, error } = options?.single 
      ? await baseQuery.single() 
      : await baseQuery;
    
    if (error) throw error;
    return data as (T | T[]);
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error);
    return null;
  }
};
