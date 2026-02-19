/**
 * IMPROVED createConversation - Enhanced Debug Version
 * Use this to replace the existing function if the current version still fails
 */

import { supabase } from '../lib/supabaseClient';

export async function createConversationImproved(participantIds, isGroup = false, name = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('🔵 [IMPROVED] Starting conversation creation');
    console.log('🔵 [IMPROVED] Participant IDs:', participantIds);

    // Ensure current user is in the participant list
    if (!participantIds.includes(user.id)) {
      participantIds.push(user.id);
    }

    console.log('🔵 [IMPROVED] Final participant IDs:', participantIds);

    // =========================================
    // STEP 1: Verify all users exist
    // =========================================
    console.log('🔍 [IMPROVED] Step 1: Verifying users exist...');

    const { data: existingUsers, error: userCheckError } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', participantIds);

    if (userCheckError) {
      console.error('❌ [IMPROVED] Error checking users:', userCheckError);
      throw userCheckError;
    }

    console.log('✅ [IMPROVED] Found users:', existingUsers);

    if (!existingUsers || existingUsers.length !== participantIds.length) {
      console.error('❌ [IMPROVED] Not all users exist in database');
      console.error('Expected:', participantIds.length, 'Found:', existingUsers?.length || 0);
      throw new Error('One or more users do not exist');
    }

    // =========================================
    // STEP 2: Check if 1-1 conversation exists
    // =========================================
    if (!isGroup && participantIds.length === 2) {
      console.log('🔍 [IMPROVED] Step 2: Checking for existing 1-1 conversation...');

      const { data: existing, error: existingError } = await supabase
        .from('conversations')
        .select('*, conversation_participants(*)')
        .contains('participant_ids', participantIds)
        .eq('is_group', false)
        .maybeSingle();

      if (existing && !existingError) {
        console.log('✅ [IMPROVED] Found existing conversation:', existing.id);

        // Fetch full details with user info
        const { data: fullExisting, error: fullError } = await supabase
          .from('conversations')
          .select(`
            *,
            conversation_participants(
              id,
              unread_count,
              last_read_at,
              user_id,
              profiles:user_id(
                id,
                display_name,
                avatar_url,
                email,
                online_status
              )
            )
          `)
          .eq('id', existing.id)
          .single();

        if (fullError) {
          console.error('❌ [IMPROVED] Error fetching full existing conversation:', fullError);
        } else {
          console.log('✅ [IMPROVED] Returning existing conversation with', fullExisting.conversation_participants?.length || 0, 'participants');
          return fullExisting;
        }
      }
    }

    // =========================================
    // STEP 3: Create new conversation
    // =========================================
    console.log('🔍 [IMPROVED] Step 3: Creating new conversation...');

    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant_ids: participantIds,
        is_group: isGroup,
        name: isGroup ? name : null,
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [IMPROVED] Error creating conversation:', createError);
      throw createError;
    }

    console.log('✅ [IMPROVED] Conversation created:', newConversation.id);

    // =========================================
    // STEP 4: Create participant records
    // =========================================
    console.log('🔍 [IMPROVED] Step 4: Creating participant records...');

    const participantRecords = participantIds.map(userId => ({
      conversation_id: newConversation.id,
      user_id: userId,
      unread_count: 0
    }));

    console.log('📝 [IMPROVED] Participant records to insert:', participantRecords);

    const { data: insertedParticipants, error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participantRecords)
      .select();

    if (participantError) {
      console.error('❌ [IMPROVED] Error inserting participants:', participantError);
      console.error('❌ [IMPROVED] Participant error code:', participantError.code);
      console.error('❌ [IMPROVED] Participant error details:', participantError.details);
      console.error('❌ [IMPROVED] Participant error hint:', participantError.hint);

      // Try to delete the conversation if participant creation failed
      console.log('🔄 [IMPROVED] Rolling back - deleting conversation...');
      await supabase.from('conversations').delete().eq('id', newConversation.id);

      throw participantError;
    }

    console.log('✅ [IMPROVED] Participants inserted:', insertedParticipants);
    console.log('✅ [IMPROVED] Inserted count:', insertedParticipants?.length || 0);

    if (!insertedParticipants || insertedParticipants.length === 0) {
      console.error('❌ [IMPROVED] INSERT returned empty array - possible RLS issue');
      throw new Error('Failed to create participants - RLS may be blocking INSERT');
    }

    // =========================================
    // STEP 5: Wait for database consistency
    // =========================================
    console.log('⏳ [IMPROVED] Step 5: Waiting for database to settle...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Increased to 1 second

    // =========================================
    // STEP 6: Verify participants were created
    // =========================================
    console.log('🔍 [IMPROVED] Step 6: Verifying participants exist...');

    const { data: verifyParticipants, error: verifyError } = await supabase
      .from('conversation_participants')
      .select('id, conversation_id, user_id')
      .eq('conversation_id', newConversation.id);

    if (verifyError) {
      console.error('❌ [IMPROVED] Error verifying participants:', verifyError);
    } else {
      console.log('✅ [IMPROVED] Verification found', verifyParticipants?.length || 0, 'participants');
      console.log('✅ [IMPROVED] Verified participants:', verifyParticipants);
    }

    if (!verifyParticipants || verifyParticipants.length === 0) {
      console.error('❌ [IMPROVED] CRITICAL: Participants were inserted but cannot be read back');
      console.error('❌ [IMPROVED] This indicates RLS is blocking SELECT on conversation_participants');
      throw new Error('Participants created but not readable - RLS blocking SELECT');
    }

    // =========================================
    // STEP 7: Fetch full conversation details
    // =========================================
    console.log('🔍 [IMPROVED] Step 7: Fetching full conversation with user details...');

    const { data: fullConversation, error: fetchError } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          id,
          unread_count,
          last_read_at,
          user_id,
          profiles:user_id(
            id,
            display_name,
            avatar_url,
            email,
            online_status
          )
        ),
        messages(
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .eq('id', newConversation.id)
      .single();

    if (fetchError) {
      console.error('❌ [IMPROVED] Error fetching full conversation:', fetchError);
      throw fetchError;
    }

    console.log('✅ [IMPROVED] Full conversation fetched');
    console.log('✅ [IMPROVED] Participants in final result:', fullConversation.conversation_participants?.length || 0);
    console.log('✅ [IMPROVED] Participant details:', JSON.stringify(fullConversation.conversation_participants, null, 2));

    // =========================================
    // STEP 8: Final validation
    // =========================================
    if (!fullConversation.conversation_participants || fullConversation.conversation_participants.length === 0) {
      console.error('❌ [IMPROVED] CRITICAL: Final query returned empty participants array');
      console.error('❌ [IMPROVED] Conversation ID:', fullConversation.id);
      console.error('❌ [IMPROVED] Participant IDs:', participantIds);
      console.error('❌ [IMPROVED] This indicates the JOIN is failing or RLS is blocking the joined query');
      throw new Error('Final query returned empty participants - JOIN or RLS issue');
    }

    // Verify user data is populated
    const participantWithoutUserData = fullConversation.conversation_participants.find(
      p => !p.users || !p.users.id
    );

    if (participantWithoutUserData) {
      console.error('❌ [IMPROVED] WARNING: Some participants missing user data');
      console.error('❌ [IMPROVED] Participant without user data:', participantWithoutUserData);
      console.error('❌ [IMPROVED] This indicates the JOIN to users table is failing');
    }

    console.log('✅ [IMPROVED] Conversation creation successful!');
    console.log('✅ [IMPROVED] Final conversation:', {
      id: fullConversation.id,
      participantCount: fullConversation.conversation_participants.length,
      participants: fullConversation.conversation_participants.map(p => ({
        user_id: p.user_id,
        display_name: p.users?.display_name,
        email: p.users?.email
      }))
    });

    return fullConversation;

  } catch (error) {
    console.error('❌ [IMPROVED] createConversation failed:', error);
    console.error('❌ [IMPROVED] Error stack:', error.stack);
    throw error;
  }
}

// Export as default for easy import
export default { createConversationImproved };
