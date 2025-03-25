import { NextResponse } from 'next/server';

export async function GET() {
  // Get password from environment variable
  const adminPassword = process.env.PASSWORD_ADMIN;
  
  return NextResponse.json({ 
    password: adminPassword 
  });
}