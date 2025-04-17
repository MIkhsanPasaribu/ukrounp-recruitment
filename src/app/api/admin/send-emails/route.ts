/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId, WithId, Document } from 'mongodb';
import { prepareEmail, isValidEmailType } from '@/utils/emailService';
import { ApplicationData } from '@/types';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { ids, emailType } = await request.json();
    
    if (!ids || !ids.length || !emailType) {
      return NextResponse.json(
        { success: false, message: "Missing application IDs or email type" },
        { status: 400 }
      );
    }
    
    // Validate email type
    if (!isValidEmailType(emailType)) {
      return NextResponse.json(
        { success: false, message: `Invalid email type: ${emailType}` },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("ititanix");
    
    // Get all applications by IDs
    const objectIds = ids.map((id: string) => new ObjectId(id));
    const applications = await db.collection("applicants").find({
      _id: { $in: objectIds }
    }).toArray();
    
    if (applications.length === 0) {
      return NextResponse.json(
        { success: false, message: "No applications found with the provided IDs" },
        { status: 404 }
      );
    }
    
    // Create a transporter using Mailtrap credentials
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });
    
    const emailPromises = applications.map(async (application: WithId<Document>) => {
      try {
        // Cast MongoDB document to ApplicationData
        const appData = application as unknown as ApplicationData;
        const emailData = prepareEmail(appData, emailType);
        
        // Send email using Mailtrap
        await transporter.sendMail({
          from: '"UKRO UNP" <recruitment@ukro-unp.com>',
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
        });
        
        console.log(`Email sent to ${appData.email} with type ${emailType}`);
        
        // Update the application to record that this email was sent
        await db.collection("applicants").updateOne(
          { _id: application._id },
          { 
            $push: { 
              "emailsSent": {
                type: emailType,
                sentAt: new Date(),
                subject: emailData.subject
              } 
            } 
          } as any
        );
        
        return { success: true, email: appData.email };
      } catch (error) {
        console.error(`Error sending email to ${(application as any).email}:`, error);
        return { success: false, email: (application as any).email, error };
      }
    });
    
    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully sent ${successful} emails, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send emails" },
      { status: 500 }
    );
  }
}