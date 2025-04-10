import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase URL and key from .env (or fallback values)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yeocrioblbcucfbvaeav.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb2NyaW9ibGJjdWNmYnZhZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTgzNzcsImV4cCI6MjA1ODY5NDM3N30.JMtCn8cfuwECYXcQgKH_PApHUlrGVuGaJxidyxzlJYQ';

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

// Function to initialize database tables
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    
    // Create users table - using the structure from the schema
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        avatar_url TEXT,
        rating INTEGER DEFAULT 1000,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Create rating_history table - using the exact structure from your schema
    const createRatingHistoryTableSQL = `
      CREATE TABLE IF NOT EXISTS rating_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id),
        rating INTEGER NOT NULL,
        battle_id UUID,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Create battles table
    const createBattlesTableSQL = `
      CREATE TABLE IF NOT EXISTS battles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        creator_id UUID NOT NULL REFERENCES auth.users(id),
        defender_id UUID REFERENCES auth.users(id),
        problem_id INTEGER NOT NULL,
        programming_language TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
        duration INTEGER NOT NULL,
        battle_type TEXT NOT NULL CHECK (battle_type IN ('Rated', 'Casual')),
        status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed')),
        winner_id UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        started_at TIMESTAMP WITH TIME ZONE,
        ended_at TIMESTAMP WITH TIME ZONE
      );
    `;
    
    // Create submissions table with nullable fields as per your schema
    const createSubmissionsTableSQL = `
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        battle_id UUID NOT NULL REFERENCES battles(id),
        user_id UUID NOT NULL REFERENCES auth.users(id),
        code TEXT NOT NULL,
        language TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'correct', 'incorrect', 'evaluated', 'error')),
        score INTEGER,
        feedback TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        evaluated_at TIMESTAMP WITH TIME ZONE
      );
    `;

    // Create join_battle function
    const createJoinBattleFunctionSQL = `
      CREATE OR REPLACE FUNCTION join_battle(battle_id UUID, defender_user_id UUID)
      RETURNS void AS $$
      BEGIN
        UPDATE battles 
        SET 
          defender_id = defender_user_id, 
          status = 'in_progress', 
          started_at = NOW()
        WHERE id = battle_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Try to execute SQL statements
    try {
      await supabase.rpc('exec_sql', { sql: createUsersTableSQL });
      console.log('Users table created or already exists');
    } catch (err) {
      console.warn('Failed to create users table:', err);
    }
    
    try {
      await supabase.rpc('exec_sql', { sql: createRatingHistoryTableSQL });
      console.log('Rating history table created or already exists');
    } catch (err) {
      console.warn('Failed to create rating_history table:', err);
    }
    
    try {
      await supabase.rpc('exec_sql', { sql: createBattlesTableSQL });
      console.log('Battles table created or already exists');
    } catch (err) {
      console.warn('Failed to create battles table:', err);
    }
    
    try {
      await supabase.rpc('exec_sql', { sql: createSubmissionsTableSQL });
      console.log('Submissions table created or already exists');
    } catch (err) {
      console.warn('Failed to create submissions table:', err);
    }
    
    try {
      await supabase.rpc('exec_sql', { sql: createJoinBattleFunctionSQL });
      console.log('join_battle function created or already exists');
    } catch (err) {
      console.warn('Failed to create join_battle function:', err);
    }
    
    // Setup RLS policies based on your schema
    try {
      // Enable RLS on all tables
      await supabase.rpc('exec_sql', { sql: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;` });
      await supabase.rpc('exec_sql', { sql: `ALTER TABLE rating_history ENABLE ROW LEVEL SECURITY;` });
      await supabase.rpc('exec_sql', { sql: `ALTER TABLE battles ENABLE ROW LEVEL SECURITY;` });
      await supabase.rpc('exec_sql', { sql: `ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;` });
      
      // Create RLS policies for rating_history as defined in your schema
      await supabase.rpc('exec_sql', { sql: `
        CREATE POLICY IF NOT EXISTS "Rating history is viewable by everyone" 
        ON rating_history
        FOR SELECT 
        USING (true);
      ` });
      
      await supabase.rpc('exec_sql', { sql: `
        CREATE POLICY IF NOT EXISTS "Users can add to their own rating history" 
        ON rating_history
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
      ` });
      
      await supabase.rpc('exec_sql', { sql: `
        CREATE POLICY IF NOT EXISTS "Users can update their own rating history" 
        ON rating_history
        FOR UPDATE 
        USING (auth.uid() = user_id);
      ` });
      
      // Create policies for users table
      await supabase.rpc('exec_sql', { sql: `
        CREATE POLICY IF NOT EXISTS "Users are viewable by everyone" 
        ON users
        FOR SELECT 
        USING (true);
      ` });
      
      await supabase.rpc('exec_sql', { sql: `
        CREATE POLICY IF NOT EXISTS "Users can update their own data" 
        ON users
        FOR UPDATE 
        USING (auth.uid() = id);
      ` });
      
      // Create indexes for rating_history as defined in your schema
      await supabase.rpc('exec_sql', { sql: `
        CREATE INDEX IF NOT EXISTS idx_rating_history_user_id 
        ON rating_history(user_id);
      ` });
      
      await supabase.rpc('exec_sql', { sql: `
        CREATE INDEX IF NOT EXISTS idx_rating_history_battle_id 
        ON rating_history(battle_id);
      ` });
      
      console.log('RLS policies and indexes created or already exist');
    } catch (err) {
      console.warn('Failed to create some RLS policies or indexes:', err);
    }
    
    console.log('Database initialization completed');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
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
    
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
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
      console.warn(`Table ${table} does not exist. Initializing database...`);
      await initializeDatabase();
      // If it still doesn't exist after initialization, return null
      if (!(await tableExists(table))) {
        console.error(`Table ${table} still does not exist after initialization`);
        return null;
      }
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