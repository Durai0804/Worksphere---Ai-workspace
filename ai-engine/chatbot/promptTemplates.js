// Prompt Templates for AI Assistant
const SYSTEM_PROMPT = `You are an intelligent workplace assistant for Smart Workplace OS. 
You help employees with HR-related queries, attendance information, leave management, 
company policies, and general workplace questions.

Be helpful, professional, and concise in your responses.
Always maintain a friendly yet professional tone.`;

const LEAVE_REQUEST_TEMPLATE = (name, leaveType, startDate, endDate, reason) => `
Subject: Leave Application - ${leaveType}

Dear HR Team,

I, ${name}, would like to request ${leaveType} leave from ${startDate} to ${endDate}.

Reason: ${reason}

I will ensure all pending work is handed over before my leave period. 
Please approve my leave request at your earliest convenience.

Thank you for your consideration.

Best regards,
${name}`;

const MEETING_SUMMARY_TEMPLATE = (title, date, attendees) => `
📋 Meeting Summary

Meeting: ${title}
Date: ${date}
Attendees: ${attendees}

Key Discussion Points:
1. [Point 1]
2. [Point 2]
3. [Point 3]

Action Items:
- [Action 1] | Owner: [Name] | Due: [Date]
- [Action 2] | Owner: [Name] | Due: [Date]

Decisions Made:
- [Decision 1]
- [Decision 2]

Next Steps:
- Follow-up meeting scheduled for [Date]
- [Additional next steps]`;

module.exports = {
  SYSTEM_PROMPT,
  LEAVE_REQUEST_TEMPLATE,
  MEETING_SUMMARY_TEMPLATE,
};
