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

    const supabase = createClient();

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