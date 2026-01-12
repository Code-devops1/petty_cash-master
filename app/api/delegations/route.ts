import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { delegator_id, delegate_id, start_date, end_date, reason } = await request.json();

    // Validate required fields
    if (!delegator_id || !delegate_id || !start_date || !end_date || !reason) {
      return Response.json(
        { error: 'Missing required fields: delegator_id, delegate_id, start_date, end_date, reason' },
        { status: 400 }
      );
    }

    // Validate date format and logic
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return Response.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    if (endDate < startDate) {
      return Response.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check that delegator and delegate are not the same person
    if (delegator_id === delegate_id) {
      return Response.json(
        { error: 'Cannot delegate to yourself' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if delegator and delegate share a team
    // Get all teams for the delegator
    const { data: delegatorTeams, error: delegatorTeamsError } = await supabase
      .from('team_memberships')
      .select('team_id')
      .eq('user_id', delegator_id);
      
    if (delegatorTeamsError) {
      console.error('Error fetching delegator teams:', delegatorTeamsError);
      return Response.json(
        { error: 'Failed to verify team membership' },
        { status: 500 }
      );
    }

    // Get all teams for the delegate
    const { data: delegateTeams, error: delegateTeamsError } = await supabase
      .from('team_memberships')
      .select('team_id')
      .eq('user_id', delegate_id);
      
    if (delegateTeamsError) {
      console.error('Error fetching delegate teams:', delegateTeamsError);
      return Response.json(
        { error: 'Failed to verify team membership' },
        { status: 500 }
      );
    }

    // Check if they share at least one team
    const delegatorTeamIds = delegatorTeams.map((tm: any) => tm.team_id);
    const delegateTeamIds = delegateTeams.map((tm: any) => tm.team_id);
    const sharedTeams = delegatorTeamIds.filter((teamId: any) => delegateTeamIds.includes(teamId));

    if (sharedTeams.length === 0) {
      return Response.json(
        { error: 'Cannot delegate to a user outside your team' },
        { status: 400 }
      );
    }

    // Insert the delegation record
    const { data, error } = await supabase
      .from('delegations')
      .insert([
        {
          delegator_id,
          delegate_id,
          start_date,
          end_date,
          reason,
          status: 'active'
        }
      ]);

    if (error) {
      console.error('Error inserting delegation:', error);
      return Response.json(
        { error: `Failed to create delegation: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({ 
      success: true, 
      message: 'Delegation created successfully',
      data 
    });
  } catch (error) {
    console.error('Unexpected error in delegation API:', error);
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}