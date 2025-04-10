import { supabase, RatingHistory } from './supabase';

/**
 * Records a rating change in the user's history
 * @param userId The user's ID
 * @param newRating The new rating value  
 * @param battleId Optional battle ID associated with the rating change
 * @param notes Optional notes about the rating change
 * @returns The created rating history entry or null if there was an error
 */
export async function recordRatingChange(
  userId: string, 
  newRating: number,
  battleId?: string | null,
  notes?: string | null
): Promise<RatingHistory | null> {
  try {
    // First update the user's current rating in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ rating: newRating, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user rating:', updateError);
      return null;
    }
    
    // Then add a rating history entry directly referencing auth.users(id)
    const { data, error } = await supabase
      .from('rating_history')
      .insert({
        user_id: userId,
        rating: newRating,
        battle_id: battleId || null,
        notes: notes || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating rating history entry:', error);
      return null;
    }
    
    return data as RatingHistory;
  } catch (error) {
    console.error('Exception in recordRatingChange:', error);
    return null;
  }
}

/**
 * Calculates a new rating based on win/loss and opponent rating
 * Implementation of a simplified Elo rating system
 * 
 * @param currentRating Player's current rating
 * @param opponentRating Opponent's rating
 * @param didWin Whether the player won
 * @param kFactor How volatile the rating is (higher means bigger changes)
 * @returns The new calculated rating
 */
export function calculateNewRating(
  currentRating: number,
  opponentRating: number,
  didWin: boolean,
  kFactor: number = 32
): number {
  // Expected outcome based on current ratings
  const expectedOutcome = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
  
  // Actual outcome is 1 for win, 0 for loss
  const actualOutcome = didWin ? 1 : 0;
  
  // Calculate new rating
  const newRating = Math.round(currentRating + kFactor * (actualOutcome - expectedOutcome));
  
  return newRating;
}

/**
 * Fetches the rating history for a user
 * @param userId The user's ID
 * @returns Array of rating history entries or empty array if there was an error
 */
export async function fetchRatingHistory(userId: string): Promise<RatingHistory[]> {
  try {
    // If no rating history exists yet, create an initial entry
    const { count, error: countError } = await supabase
      .from('rating_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error('Error checking rating history:', countError);
      return [];
    }
    
    // If no rating history exists, create an initial entry
    if (count === 0) {
      // Get the user's current rating
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('rating, created_at')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching user data:', profileError);
        return [];
      }
      
      // Create an initial rating history entry
      const { error: insertError } = await supabase
        .from('rating_history')
        .insert({
          user_id: userId,
          rating: userData.rating,
          notes: 'Initial rating',
          created_at: userData.created_at
        });
      
      if (insertError) {
        console.error('Error creating initial rating history:', insertError);
      }
    }
    
    // Fetch the rating history
    const { data, error } = await supabase
      .from('rating_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching rating history:', error);
      return [];
    }
    
    return data as RatingHistory[];
  } catch (error) {
    console.error('Exception in fetchRatingHistory:', error);
    return [];
  }
}