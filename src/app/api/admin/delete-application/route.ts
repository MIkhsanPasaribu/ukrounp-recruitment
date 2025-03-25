import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing application id" },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Delete the application
    const result = await db.collection("applicants").deleteOne(
      { _id: new ObjectId(id) }
    );
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete application" },
      { status: 500 }
    );
  }
}