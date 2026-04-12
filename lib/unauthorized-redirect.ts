/**
 * Utility for handling unauthorized access
 * 
 * Provides consistent unauthorized responses and redirects
 */

import { NextResponse } from 'next/server';

/**
 * Create an unauthorized response with optional redirect
 */
export function createUnauthorizedResponse(message?: string, redirect: boolean = false) {
  if (redirect) {
    return NextResponse.redirect(new URL('/unauthorized', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
  
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message: message || 'You do not have permission to access this resource',
      redirectTo: '/unauthorized',
    },
    { status: 401 }
  );
}

/**
 * Create a forbidden response (403)
 */
export function createForbiddenResponse(message?: string) {
  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden',
      message: message || 'Access to this resource is forbidden',
      redirectTo: '/unauthorized',
    },
    { status: 403 }
  );
}

/**
 * Funny unauthorized messages
 */
export const UNAUTHORIZED_MESSAGES = [
  "Nice try, but you're not getting in here buddy",
  "Access Denied! You shall not pass!",
  "Whoa there! This area is VIP only",
  "Authentication failed. Better luck next time",
  "You don't have permission for this. Go back before I call your mom",
  "Unauthorized! This isn't a free trial area",
  "Don't act oversmart bro",
  "Nope! You're not authorized. Get outta here",
];

/**
 * Get a random unauthorized message
 */
export function getRandomUnauthorizedMessage(): string {
  return UNAUTHORIZED_MESSAGES[Math.floor(Math.random() * UNAUTHORIZED_MESSAGES.length)];
}

