import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Get current registration status
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Get the registration status from settings collection
    const settings = await db.collection("settings").findOne({ key: "registrationOpen" });
    
    // Default to open if setting doesn't exist
    const isOpen = settings ? settings.value : true;
    
    return NextResponse.json({ 
      success: true,
      isOpen
    });
  } catch (error) {
    console.error("Error getting registration status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get registration status" },
      { status: 500 }
    );
  }
}

// Update registration status
export async function POST(request: Request) {
  try {
    const { isOpen } = await request.json();
    
    if (isOpen === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing isOpen parameter" },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Update the registration status in settings collection
    await db.collection("settings").updateOne(
      { key: "registrationOpen" },
      { $set: { key: "registrationOpen", value: isOpen } },
      { upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: isOpen ? "Registration opened successfully" : "Registration closed successfully"
    });
  } catch (error) {
    console.error("Error updating registration status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update registration status" },
      { status: 500 }
    );
  }
}