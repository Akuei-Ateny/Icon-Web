import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Ensure environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}
// Create a singleton instance to avoid multiple connections
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
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
  status: 'pending' | 'correct' | 'incorrect' | 'evaluated' | 'error';
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  evaluated_at: string | null;
};

export type Solution = {
  id: string;
  battle_id: string;
  user_id: string;
  code: string;
  submitted_at: string;
};

// Simplified database initialization function
// Instead of executing SQL directly, we'll check if tables exist
export const initializeDatabase = async () => {
  try {
    console.log('Checking database tables...');
    
    // Check if tables exist by attempting to query them
    const tablesStatus = {
      users: await tableExists('users'),
      rating_history: await tableExists('rating_history'),
      battles: await tableExists('battles'),
      submissions: await tableExists('submissions')
    };
    
    console.log('Tables status:', tablesStatus);
    
    // If all tables exist, assume initialization is complete
    if (Object.values(tablesStatus).every(status => status)) {
      console.log('All required tables exist. Database initialization complete.');
      return true;
    }
    
    // If we're here, not all tables exist, but we're not creating them
    // Instead, we'll log a message indicating tables need to be created in Supabase dashboard
    console.log('Some tables do not exist. Please create required tables in Supabase dashboard.');
    console.log('Missing tables:', Object.entries(tablesStatus)
      .filter(([_, exists]) => !exists)
      .map(([table]) => table)
      .join(', '));
    
    return false;
  } catch (error) {
    console.error('Error checking database tables:', error);
    return false;
  }
};

// Helper function to check if a table exists
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist error code
        console.log(`Table ${tableName} doesn't exist`);
        return false;
      }
      
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Join battle function using standard Supabase update
export const joinBattle = async (battleId: string, defenderId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('battles')
      .update({
        defender_id: defenderId,
        status: 'in_progress' as const,
        started_at: new Date().toISOString()
      })
      .eq('id', battleId)
      .select();
    
    if (error) {
      console.error('Error joining battle:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in joinBattle:', error);
    return false;
  }
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
    // Check if table exists before querying
    const exists = await tableExists(table);
    if (!exists) {
      console.warn(`Table ${table} does not exist.`);
      return null;
    }
    
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