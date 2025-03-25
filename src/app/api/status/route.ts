import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Find the application by email
    const application = await db.collection("applicants").findOne({ email });
    
    if (!application) {
      return NextResponse.json(
        { success: false, message: "No application found with this email" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      status: application.status || "Under Review",
      submittedAt: application.submittedAt
    });
  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check application status" },
      { status: 500 }
    );
  }
}