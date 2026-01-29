import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:codenames@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function notifyPlayer(userId: string, gameId: string, message: string) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .single();

    if (!subData) return;

    const subscription = JSON.parse(subData.subscription);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const payload = JSON.stringify({
      title: 'Player Joined!',
      body: message,
      url: `${appUrl}/game/${gameId}`,
      gameId: gameId
    });

    await webpush.sendNotification(subscription, payload);
  } catch (error) {
    console.error('Failed to notify player:', error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the game
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if game is in waiting status
    if (game.status !== 'waiting') {
      return NextResponse.json({ error: 'Game is not available to join' }, { status: 400 });
    }

    // Check if user is already player1
    if (game.player1_id === user.id) {
      return NextResponse.json({ error: 'You are already in this game' }, { status: 400 });
    }

    // Check if player2 slot is taken
    if (game.player2_id) {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 });
    }

    // Join the game
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        player2_id: user.id,
        status: 'playing',
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error joining game:', updateError);
      return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
    }

    // Notify player1 that someone joined
    const joinerName = user.user_metadata?.username || 'A player';
    await notifyPlayer(
      game.player1_id,
      game.id,
      `${joinerName} joined your game! Let's play!`
    );

    return NextResponse.json({ game: updatedGame });
  } catch (error) {
    console.error('Error in POST /api/games/[id]/join:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
