// backend/realtime.js
import { supabase } from './supabaseClient.js';
import sendEmail from './send.js';
import dotenv from 'dotenv';
import { getAutomationsForEvent } from './fetchAutomations.js';

dotenv.config({ path: '../.env' }); // ✅ go one level up from /backend

function detectEventType(payload) {
  if (payload.table === 'friend_requests' && payload.eventType === 'UPDATE') {
    return 'friendAccepted';
  } else if (payload.table === 'likes' && payload.eventType === 'INSERT') {
    return 'postLiked';
  }
  // add more as you go
  return null;
}

console.log('👂 Waiting for accepted friend requests...');

supabase
  .channel('friend_request_accept_channel')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'friend_requests'
  }, async (payload) => {
    const row = payload.new;
    if (row.status !== 'accepted') return;

    console.log('🤝 Friend request accepted:', row);
    const variables = await getFriendRequestVariables(payload.new, supabase);

    // 🧠 Optional: fetch user info
    const { data: sender } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', row.from_id)
      .single();

    const { data: receiver } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', row.to_id)
      .single();
      if (variables) {
        await sendEmail('friendAccepted', variables.toEmail, variables);
      }
    // 🎯 Send the email using your template
    await sendEmail('friendAccepted', sender.email, variables);

    console.log('📨 Email sent to', sender.email);
  })
  .subscribe();
// 🔁 Convert IDs to variables needed for the email
export async function getFriendRequestVariables(friendRequestRow, supabase) {
    const { sender_id, recipient_id } = friendRequestRow;
  
    // Get sender
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('username')
      .eq('id', sender_id)
      .single();
  
    // Get recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('username, email')
      .eq('id', recipient_id)
      .single();
  
    if (senderError || recipientError) {
      console.error("Error fetching user data", senderError || recipientError);
      return null;
    }
  
    // 🧩 Final shape that fits your HBS email
    return {
      senderName: sender.username,
      receiverName: recipient.username,
      toEmail: recipient.email,
      inviteLink: `https://creativeleague.pro/invite/${friendRequestRow.id}`,
      expiryDate: '24 hours',
    };
  }
  