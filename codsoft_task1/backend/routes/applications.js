import express from 'express';
import { ApplicationModel, JobModel, UserModel, NotificationModel } from '../config/dbStore.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Mock Email Notification Trigger helper
const sendMockEmail = (toEmail, subject, bodyText) => {
  console.log('\n--- 📧 SIMULATED EMAIL NOTIFICATION SENT ---');
  console.log(`To:      ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:    ${bodyText}`);
  console.log('--------------------------------------------\n');
};

// @route   POST api/applications
// @desc    Submit a job application
// @access  Private (Candidate only)
router.post('/', [authMiddleware, authorizeRoles('candidate')], async (req, res) => {
  const { jobId, firstName, lastName, email, phone, linkedin, portfolio, coverLetter, experience, authorized } = req.body;

  try {
    if (!jobId || !firstName || !lastName || !email || !phone || !experience || !authorized) {
      return res.status(400).json({ msg: 'Please fill in all mandatory application fields.' });
    }

    // Verify job exists
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Target job opening no longer exists.' });
    }

    // Check if user already applied
    const existingApps = await ApplicationModel.find({ jobId, candidateId: req.user.id });
    if (existingApps.length > 0) {
      return res.status(400).json({ msg: 'You have already submitted an application for this role.' });
    }

    // Create application
    const appData = {
      jobId,
      jobTitle: job.title,
      company: job.company,
      candidateId: req.user.id,
      firstName,
      lastName,
      email,
      phone,
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      coverLetter: coverLetter || '',
      resumeName: 'Resume_Jane_Smith.pdf', // Mock uploaded file name
      resumeUrl: '#',
      experience,
      authorized,
      status: 'Review'
    };

    const newApp = await ApplicationModel.create(appData);

    // 1. Notify the Employer
    await NotificationModel.create({
      userId: job.employerId,
      text: `New applicant Priya Sharma (Mock: ${firstName} ${lastName}) applied for ${job.title}`,
      type: 'info'
    });

    // 2. Notify the Candidate
    await NotificationModel.create({
      userId: req.user.id,
      text: `Your application for ${job.title} at ${job.company} was submitted successfully!`,
      type: 'success'
    });

    // 3. Send Simulated Emails
    sendMockEmail(
      email,
      `Application Received: ${job.title} at ${job.company}`,
      `Hello ${firstName},\n\nThank you for applying to the ${job.title} position at ${job.company}. We have received your profile and cover letter. Our hiring team will review it shortly!\n\nBest regards,\nTalentHub Careers Team`
    );

    res.json(newApp);
  } catch (err) {
    console.error('Application submit error: ', err.message);
    res.status(500).send('Server Error submitting application');
  }
});

// @route   GET api/applications
// @desc    Get applications (Candidates see their own, Employers see candidates applying to their postings)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'candidate') {
      // Return applications sent by this candidate
      const apps = await ApplicationModel.find({ candidateId: req.user.id });
      res.json(apps);
    } else if (req.user.role === 'employer') {
      // Return applications for jobs posted by this employer
      // First, get all jobs posted by this employer
      const employerJobs = await JobModel.find({ employerId: req.user.id });
      const jobIds = employerJobs.map(j => j.id || j._id);
      
      const allApps = await ApplicationModel.find();
      const employerApps = allApps.filter(app => jobIds.includes(app.jobId));
      
      res.json(employerApps);
    }
  } catch (err) {
    console.error('Fetch applications error: ', err.message);
    res.status(500).send('Server Error fetching applications');
  }
});

// @route   PUT api/applications/:id
// @desc    Update application status (Review, Interview, Offer, Rejected)
// @access  Private (Employer only)
router.put('/:id', [authMiddleware, authorizeRoles('employer')], async (req, res) => {
  const { status } = req.body;

  if (!['Review', 'Interview', 'Offer', 'Rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid application status option.' });
  }

  try {
    const app = await ApplicationModel.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ msg: 'Application not found.' });
    }

    // Verify that this employer posted the job associated with this application
    const job = await JobModel.findById(app.jobId);
    if (!job || job.employerId !== req.user.id) {
      return res.status(401).json({ msg: 'Employer not authorized to manage this application.' });
    }

    // Update Status
    const updatedApp = await ApplicationModel.findByIdAndUpdate(req.params.id, { status });

    // 1. Create Dashboard Notification for Candidate
    let notifyText = `Your application for ${app.jobTitle} at ${app.company} has been updated to: ${status}`;
    let notifyType = 'info';

    if (status === 'Interview') {
      notifyText = `🎉 Interview scheduled! ${app.company} wants to interview you for the ${app.jobTitle} position. Check your email!`;
      notifyType = 'warning';
    } else if (status === 'Offer') {
      notifyText = `🔥 Congratulations! You received an Offer from ${app.company} for the ${app.jobTitle} role! 🥳`;
      notifyType = 'success';
    } else if (status === 'Rejected') {
      notifyText = `Update on your application for ${app.jobTitle} at ${app.company}: Decision completed.`;
      notifyType = 'danger';
    }

    await NotificationModel.create({
      userId: app.candidateId,
      text: notifyText,
      type: notifyType
    });

    // 2. Send Simulated Email to Candidate
    sendMockEmail(
      app.email,
      `Update on your application for ${app.jobTitle} at ${app.company}`,
      `Hello ${app.firstName},\n\nThe hiring team at ${app.company} has updated the status of your application for the ${app.jobTitle} role.\n\nNew Status: ${status}\n\n${status === 'Interview' ? 'Please reply to set up an interview time!' : status === 'Offer' ? 'Congratulations! Our team will follow up with details on the contract.' : 'Thank you for your interest and time. We wish you the best of luck in your search.'}\n\nBest regards,\n${app.company} Recruitment`
    );

    res.json(updatedApp);
  } catch (err) {
    console.error('Update application error: ', err.message);
    res.status(500).send('Server Error updating application status');
  }
});

export default router;
