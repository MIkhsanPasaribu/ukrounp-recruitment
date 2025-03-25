import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Missing id or status" },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Update the application status
    const result = await db.collection("applicants").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Status updated successfully"
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  }
}