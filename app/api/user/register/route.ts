import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * DISABLED: Public user registration endpoint
 * 
 * User registration through the public API has been disabled.
 * Users can only be created through the authenticated dashboard at /dashboard/users
 * 
 * To create users:
 * 1. Log in to your dashboard
 * 2. Go to "Users & Clients" section
 * 3. Select your application
 * 4. Click "Create New User"
 * 
 * This restriction ensures:
 * - Better control over user creation
 * - Subscription limit enforcement
 * - Security and management through authenticated dashboard only
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      success: false,
      message: 'User registration through API is disabled. Please create users through the dashboard at /dashboard/users. Only application owners can create users for their applications.',
      error: 'ENDPOINT_DISABLED'
    },
    { status: 403 }
  );
}

