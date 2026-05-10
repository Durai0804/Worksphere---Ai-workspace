// AI Assistant Controller - MVP version with built-in responses
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

const HR_KNOWLEDGE = {
  'leave policy': 'Our company provides: Sick Leave (12 days/year), Casual Leave (10 days/year), and Paid Leave (15 days/year). Leaves can be applied through the Leave Management module and require HR/Admin approval.',
  'attendance': 'Working hours are 9:00 AM to 6:00 PM. Check-in after 9:30 AM is marked as late. Employees must check in and check out daily through the attendance system.',
  'salary': 'Salaries are processed on the last working day of each month. For salary-related queries, please contact the HR department.',
  'benefits': 'Employee benefits include health insurance, provident fund, annual bonus, flexible working hours, and professional development allowance.',
  'holidays': 'The company follows standard national holidays plus 2 floating holidays per year. The holiday calendar is shared at the beginning of each year.',
  'probation': 'New employees are on a 6-month probation period. Performance reviews are conducted at 3 and 6 months.',
  'resignation': 'The notice period is 30 days for regular employees and 60 days for senior positions. Submit your resignation through the HR portal.',
  'work from home': 'Employees can avail up to 2 WFH days per week with prior manager approval. Remote work policy details are in the employee handbook.',
  'dress code': 'Business casual is the standard dress code. Formal attire is required for client meetings.',
  'training': 'The company provides an annual training budget of $1000 per employee for professional development courses and certifications.'
};

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const lowerMsg = message.toLowerCase();
    let response = '';

    // Check for HR knowledge base matches
    for (const [key, value] of Object.entries(HR_KNOWLEDGE)) {
      if (lowerMsg.includes(key)) { response = value; break; }
    }

    // Dynamic queries
    if (!response && (lowerMsg.includes('how many employees') || lowerMsg.includes('employee count'))) {
      const count = await User.countDocuments({ status: 'active' });
      response = `There are currently ${count} active employees in the organization.`;
    }

    if (!response && lowerMsg.includes('my leave balance')) {
      const user = await User.findById(req.user._id);
      response = `Your leave balance: Sick: ${user.leaveBalance.sick} days, Casual: ${user.leaveBalance.casual} days, Paid: ${user.leaveBalance.paid} days.`;
    }

    if (!response && lowerMsg.includes('pending leave')) {
      const pending = await Leave.countDocuments({ status: 'pending' });
      response = `There are ${pending} pending leave requests awaiting approval.`;
    }

    if (!response && (lowerMsg.includes('draft leave') || lowerMsg.includes('leave request draft'))) {
      response = `Here's a leave request draft:\n\nSubject: Leave Application\n\nDear HR,\n\nI would like to request [leave type] leave from [start date] to [end date] ([number] days).\n\nReason: [Your reason]\n\nPlease approve my leave request. I will ensure all pending work is handled before my leave.\n\nThank you.`;
    }

    if (!response && lowerMsg.includes('meeting summary')) {
      response = `Meeting Summary Template:\n\n📋 Meeting: [Title]\n📅 Date: ${new Date().toLocaleDateString()}\n👥 Attendees: [Names]\n\n🎯 Key Points:\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]\n\n✅ Action Items:\n- [Action 1] - Assigned to: [Name] - Due: [Date]\n- [Action 2] - Assigned to: [Name] - Due: [Date]\n\n📌 Next Meeting: [Date/Time]`;
    }

    if (!response) {
      response = "I'm your workplace AI assistant. I can help with:\n• HR policies & leave policy\n• Attendance information\n• Leave balance & requests\n• Draft leave applications\n• Meeting summary templates\n• Company benefits & holidays\n• Work from home policy\n\nTry asking about any of these topics!";
    }

    res.status(200).json({
      success: true,
      data: { message: response, timestamp: new Date() }
    });
  } catch (error) { next(error); }
};

module.exports = { chat };
