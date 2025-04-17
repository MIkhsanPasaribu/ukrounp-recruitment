'use client';

import { useState } from 'react';

interface BulkEmailButtonProps {
  selectedApplications: string[];
  onEmailsSent: () => void;
}

export default function BulkEmailButton({ 
  selectedApplications, 
  onEmailsSent 
}: BulkEmailButtonProps) {
  const [loading, setLoading] = useState(false);
  const [emailType, setEmailType] = useState("");
  
  const sendBulkEmails = async (type: string) => {
    if (selectedApplications.length === 0) {
      alert("No applications selected");
      return;
    }

    if (!confirm(`Are you sure you want to send ${type} emails to ${selectedApplications.length} applicants?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/send-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          ids: selectedApplications,
          emailType: type 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Successfully sent emails: ${data.message}`);
        onEmailsSent();
      } else {
        alert(`Failed to send emails: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("An error occurred while sending emails");
    } finally {
      setLoading(false);
      setEmailType("");
    }
  };

  return (
    <select
      className="px-3 py-2 border border-gray-300 rounded-md"
      onChange={(e) => {
        const value = e.target.value;
        if (value) {
          sendBulkEmails(value);
          e.target.value = "";
        }
      }}
      value={emailType}
      disabled={loading || selectedApplications.length === 0}
    >
      <option value="" disabled>
        {loading ? "Sending emails..." : "Send email notification..."}
      </option>
      <option value="interview">Interview Invitation</option>
      <option value="acceptance">Acceptance Notification</option>
      <option value="rejection">Rejection Notification</option>
      <option value="reminder">Reminder</option>
    </select>
  );
}