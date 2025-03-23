import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Add a status field to the application
    const applicationData = {
      ...body,
      status: "Under Review",
      submittedAt: new Date()
    };
    
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Insert the form data into MongoDB
    const result = await db.collection("applicants").insertOne(applicationData);
    
    return NextResponse.json({ 
      success: true, 
      message: "Application submitted successfully",
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit application" },
      { status: 500 }
    );
  }
}