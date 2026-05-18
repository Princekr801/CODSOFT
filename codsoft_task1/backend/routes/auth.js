import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../config/dbStore.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'talenthub_super_secret_jwt_key_2026';

// @route   POST api/auth/register
// @desc    Register a new user (Job Seeker or Employer)
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  try {
    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ msg: 'Please enter all required registration fields.' });
    }

    // Check if user exists
    let user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ msg: 'User account already exists with this email address.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      title: '',
      bio: '',
      skills: [],
      companyName: role === 'employer' ? `${firstName}'s Enterprise` : '',
      companyLogoColor: '#7c6dfa',
      savedJobs: []
    };

    const newUser = await UserModel.create(userData);

    // Sign JWT Token
    const payload = {
      user: {
        id: newUser.id || newUser._id,
        role: newUser.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: newUser.id || newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error: ', err.message);
    res.status(500).send('Server Error during registration');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide both email and password credentials.' });
    }

    // Find User
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email or password credentials.' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email or password credentials.' });
    }

    // Sign JWT Token
    const payload = {
      user: {
        id: user.id || user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id || user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error: ', err.message);
    res.status(500).send('Server Error during login');
  }
});

// @route   GET api/auth/user
// @desc    Get current authenticated user profile details
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User profile not found.' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Get profile error: ', err.message);
    res.status(500).send('Server Error fetching profile');
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  const { firstName, lastName, title, bio, skills, companyName, companyLogoColor } = req.body;

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User profile not found.' });
    }

    // Build update object
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (title !== undefined) updates.title = title;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    
    if (req.user.role === 'employer') {
      if (companyName) updates.companyName = companyName;
      if (companyLogoColor) updates.companyLogoColor = companyLogoColor;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, updates);
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Update profile error: ', err.message);
    res.status(500).send('Server Error updating profile');
  }
});

// @route   POST api/auth/toggle-save/:jobId
// @desc    Toggle saving a job listing
// @access  Private (Candidate only)
router.post('/toggle-save/:jobId', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    let savedJobs = user.savedJobs || [];
    const jobId = req.params.jobId;
    
    const exists = savedJobs.includes(jobId);
    if (exists) {
      savedJobs = savedJobs.filter(id => id !== jobId);
    } else {
      savedJobs.push(jobId);
    }
    
    await UserModel.findByIdAndUpdate(req.user.id, { savedJobs });
    res.json({ savedJobs, isSaved: !exists });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error saving job');
  }
});

export default router;
