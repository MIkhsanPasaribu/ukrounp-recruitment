import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Get total applications count
    const totalApplications = await db.collection('applicants').countDocuments();
    
    // Get applications by status
    const statusCounts = await db.collection('applicants').aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    
    // Get applications by faculty
    const facultyCounts = await db.collection('applicants').aggregate([
      { $match: { faculty: { $exists: true, $ne: "" } } },
      { $group: { _id: "$faculty", count: { $sum: 1 } } }
    ]).toArray();
    
    // Get applications by gender
    const genderCounts = await db.collection('applicants').aggregate([
      { $match: { gender: { $exists: true, $ne: "" } } },
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]).toArray();
    
    // Get applications by day (for the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyApplications = await db.collection('applicants').aggregate([
      { 
        $match: { 
          submittedAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]).toArray();
    
    return NextResponse.json({ 
      success: true,
      statistics: {
        totalApplications,
        statusCounts,
        facultyCounts,
        genderCounts,
        dailyApplications
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}