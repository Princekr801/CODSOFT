import express from 'express';
import { JobModel, UserModel } from '../config/dbStore.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/jobs
// @desc    Get all job openings (supports search and advanced filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, location, type, exp, mode, salaryMin } = req.query;
    let jobs = await JobModel.find();

    // 1. Filter by Search keyword (Title, Company, Tags)
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.company.toLowerCase().includes(q) ||
        (j.tags && j.tags.some(t => t.toLowerCase().includes(q))) ||
        (j.description && j.description.toLowerCase().includes(q))
      );
    }

    // 2. Filter by Location
    if (location) {
      const loc = location.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(loc));
    }

    // 3. Filter by Job Type (expects comma separated or single type: e.g. "Full-time,Internship")
    if (type) {
      const types = type.split(',').map(t => t.trim().toLowerCase());
      jobs = jobs.filter(j => types.includes(j.type.toLowerCase()));
    }

    // 4. Filter by Experience Level (expects comma separated: e.g. "Mid,Senior")
    if (exp) {
      const exps = exp.split(',').map(e => e.trim().toLowerCase());
      jobs = jobs.filter(j => exps.includes(j.exp.toLowerCase()));
    }

    // 5. Filter by Work Mode (expects comma separated: e.g. "Remote,Hybrid")
    if (mode) {
      const modes = mode.split(',').map(m => m.trim().toLowerCase());
      jobs = jobs.filter(j => modes.includes(j.mode.toLowerCase()));
    }

    // 6. Filter by Minimum Salary Range
    // Expected salary formats in DB: "$140k–$190k", "$80k+"
    // We parse the first number in the salary string and compare
    if (salaryMin) {
      const minVal = parseInt(salaryMin, 10);
      jobs = jobs.filter(j => {
        const match = j.salary.replace(/[^0-9]/g, ''); // get digits, e.g. "140190" or "80"
        if (!match) return true; // Keep if no digits found
        
        // If it represents a range like "140190" (from $140k-$190k), get the first part "140"
        let parsedSalary = parseInt(match, 10);
        if (j.salary.includes('k')) {
          // If range, let's extract first number
          const firstNumMatch = j.salary.match(/\$?([0-9]+)k/);
          if (firstNumMatch) {
            parsedSalary = parseInt(firstNumMatch[1], 10);
          }
        }
        return parsedSalary >= minVal;
      });
    }

    res.json(jobs);
  } catch (err) {
    console.error('Fetch jobs error: ', err.message);
    res.status(500).send('Server Error fetching jobs');
  }
});

// @route   GET api/jobs/:id
// @desc    Get job opening by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await JobModel.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job opening not found.' });
    }
    res.json(job);
  } catch (err) {
    console.error('Fetch job by ID error: ', err.message);
    res.status(500).send('Server Error fetching job detail');
  }
});

// @route   POST api/jobs
// @desc    Post a new job opening
// @access  Private (Employer only)
router.post('/', [authMiddleware, authorizeRoles('employer')], async (req, res) => {
  const { title, location, type, mode, salary, exp, description, requirements, perks, deadline } = req.body;

  try {
    if (!title || !location || !type || !mode || !salary || !exp || !description || !deadline) {
      return res.status(400).json({ msg: 'Please provide all essential job details.' });
    }

    // Fetch Employer details to get Company Name
    const employer = await UserModel.findById(req.user.id);
    if (!employer) {
      return res.status(404).json({ msg: 'Employer profile not found.' });
    }

    const company = employer.companyName || `${employer.firstName} Corp`;
    const companyLogo = company.substring(0, 1).toUpperCase();
    const companyLogoColor = employer.companyLogoColor || '#7c6dfa';

    // Requirements & Perks parsed from arrays or comma strings
    const parsedReqs = Array.isArray(requirements) 
      ? requirements 
      : requirements ? requirements.split('\n').map(r => r.trim()).filter(Boolean) : [];
      
    const parsedPerks = Array.isArray(perks) 
      ? perks 
      : perks ? perks.split('\n').map(p => p.trim()).filter(Boolean) : [];

    // Infer tags from title, type, and mode
    const tags = [type, mode, exp];
    if (title.toLowerCase().includes('design') || title.toLowerCase().includes('ui') || title.toLowerCase().includes('ux')) tags.push('Design');
    if (title.toLowerCase().includes('engineer') || title.toLowerCase().includes('developer') || title.toLowerCase().includes('frontend')) tags.push('Engineering');
    if (title.toLowerCase().includes('data') || title.toLowerCase().includes('analyst')) tags.push('Data Science');

    const jobData = {
      title,
      company,
      location,
      type,
      mode,
      salary,
      exp,
      logo: companyLogo,
      logoColor: companyLogoColor,
      logoText: '#eeeef5',
      posted: 'Just now',
      hot: Math.random() > 0.6, // Dynamically hot list some jobs
      tags,
      description,
      requirements: parsedReqs,
      perks: parsedPerks,
      deadline,
      employerId: req.user.id
    };

    const newJob = await JobModel.create(jobData);
    res.json(newJob);
  } catch (err) {
    console.error('Post job error: ', err.message);
    res.status(500).send('Server Error posting job');
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job listing
// @access  Private (Employer only)
router.delete('/:id', [authMiddleware, authorizeRoles('employer')], async (req, res) => {
  try {
    const job = await JobModel.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job listing not found.' });
    }

    // Verify ownership
    if (job.employerId !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this job listing.' });
    }

    await JobModel.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Job listing deleted successfully.' });
  } catch (err) {
    console.error('Delete job error: ', err.message);
    res.status(500).send('Server Error deleting job');
  }
});

export default router;
