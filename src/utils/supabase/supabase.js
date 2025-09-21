import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Get full session data if exists
export async function getSessionByJoinCode(joinCode) {
  try {    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('join_code', joinCode)
      // Remove .single() - this might be causing the 406
    
    if (error) {
      console.error('Query error:', error)
      throw error
    }
        
    // Handle array response manually
    if (!data || data.length === 0) {
      return { success: false, error: 'Session not found.' }
    }

    // Return the first (and should be only) result
    return { success: true, session: data[0] }
  } catch (error) {
    console.error('Caught error:', error)
    return { success: false, error: error.message }
  }
}

// TODO: replace with supabase rpc function that generates a unique 5-digit code and checks it there
// (to avoid the repeated api calls)
export async function createSession() {
  const maxRetries = 10;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Generate random 5-digit code
      const joinCode = Math.floor(10000 + Math.random() * 90000).toString();
      
      console.log(`Attempt ${attempt + 1}: Trying join code ${joinCode}`);
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          join_code: joinCode
        })
        .select()
        .single();
      
      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505' && error.message.includes('join_code')) {
          console.log(`Join code ${joinCode} already exists, retrying...`);
          continue; // Try again with new code
        }
        throw error; // Other errors
      }
      
      console.log('Session created successfully:', data);
      return { success: true, session: data };
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        return { success: false, error: 'Failed to generate unique join code after multiple attempts' };
      }
    }
  }
}


export async function submitQuestion(sessionId, questionText) {
  // Validation
  if (!sessionId) {
    console.error('ERROR: sessionId is undefined or null')
    return { success: false, error: 'Session ID is required' }
  }
  
  if (!questionText || questionText.trim() === '') {
    console.error('ERROR: questionText is empty')
    return { success: false, error: 'Question text is required' }
  }
  
  try {
    const insertData = {
      session_id: sessionId,
      text: questionText.trim(),
      votes: 0
    }

    const { data, error } = await supabase
      .from('questions')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Successfully inserted question:', data)
    return { success: true, question: data }
  } catch (error) {
    console.error('Caught error:', error)
    return { success: false, error: error.message }
  }
}

// Uses RPC functions for atomicity (preventing race conditions), performance, and security
// Ideally these functions would run on the server or via rpc entirely?
export async function updateVote(questionId, worth) {
    try {
        const {data, error} = 
            await supabase.rpc('update_vote', {
                question_id: questionId,
                worth: 1,
            })

        if (error) throw error;
        return {success: true, newVote: data}
    } catch (error) {
        return updateVoteSecondary(questionId, worth)
    }
}

export async function updateVoteSecondary(questionId, worth) {
    try {
        // if rpc breaks
        if (error) {
            const { data: question, error: fetchError } = await supabase
                .from('questions')
                .select('votes')
                .eq('id', questionId)
                .single()
            if (fetchError) throw fetchError

            const { data: updatedQuestion, error: updateError } = await supabase
                .from('questions')
                .update({votes: question.votes + 1 })
                .eq('id', questionId)
                .select()
                .single()
            
            if (updateError) throw updateError
            return { success: true, question: updatedQuestion }
        }
        if (error) throw error;
        return { success: true, question: data }
    } catch (error) {
        return { success: false, error: error }
    }
}

export async function getQuestionsBySession(sessionId) {
    console.log("Fetching questions...")
    try {
        const {data, error} = await supabase
            .from('questions')
            .select('*')
            .eq('session_id', sessionId)
            .order('votes', { ascending: false })
            .order('created_at', { ascending: true })
        if (error) throw error;
        return {success: true, questions: data}
    } catch (error) {
        return {success: false, error: error.message}
    }   
}

export async function getQuestionsByJoinCode(joinCode) {
    console.log("Fetching questions by join code...")
    try {
      // Fetch session by join code
      const sessionResult = await getSessionByJoinCode(joinCode)
      if (sessionResult.error) throw error
      // Now fetch questions
      const sessionId = sessionResult.session.id
      const questionResult = await getQuestionsBySession(sessionId);
      if (questionResult.success) {
        return {success: true, questions: questionResult.questions}
      }
      if (error) throw error;
    } catch (error) {
      return {success: false, error: error}
    }
}

export async function subscribeToQuestionUpdates(sessionId) {
    return supabase
        .channel(`questions-${session-id}`)
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'questions',
                filter: `session_id=eq.${sessionId}`
            },
            callback
        )
        .subscribe()
}

/*
export async function runTests() {
    console.log('Starting supabase tests...')
    try {
        // Create sessoin
        console.log('Creating a new session')
        const sessionResult = await createSessionWithJoinCode()
        if (!sessionResult.success) {
            throw new Error(`Failed to create session: ${sessionResult.error}`)
        }
        const sessionId = sessionResult.session.id
        const joinCode = sessionResult.session.joinCode;
        console.log(`Session created with id: ${sessionId} and join code ${joinCode}`)

        // Submit questions
        console.log('Submitting test questions...')
        const questions = [
            "what is a computer?",
            "Can you explain the letter r?",
            "Why is?"
        ]

        const questionIds = []
        for (const questionText of questions) {
            console.log(`Submitting question: ${questionText}`)
            const result = await submitQuestion(sessionId, questionText);
            if (!result.success) {
                throw new Error(`Failed to submit questions: ${result.error.message}`)
            }
            questionIds.push(result.question.id)
            console.log(`Question submitted: ${questionText}`)
        }

        // Vote on questions
        console.log("Voting...")
        await updateVote(questionIds[0], 1)
        await updateVote(questionIds[1], 1)
        await updateVote(questionIds[1], 1)
        await updateVote(questionIds[2], 1)
        await updateVote(questionIds[1], 1)
        console.log('votes added')

        // Fetch questions
        const questionResult = await getQuestions(sessionId);
        if (!questionResult.success) {
            throw new Error(`Failed to fetch questions: ${questionResult.error}`);
        }

        console.log('Questions: ')
        questionResult.questions.forEach((q, index) => {
            console.log(`${index + 1}. "${q.text}" (${q.votes} votes)`)
        });
        console.log("ALL TESTS PASS")
    } catch (error) {
        console.error(`Test failed: ${error.message}`)
    }
}
*/

export default supabase