import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizcraft';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const quizSchema = new mongoose.Schema({
  title: String,
  desc: String,
  category: String,
  author: String,
  questions: [{
    text: String,
    options: [String],
    correct: Number
  }]
});
const Quiz = mongoose.model('Quiz', quizSchema);

// Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ user: { id: user._id, name, email }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    res.status(200).json({ user: { id: user._id, name: user.name, email }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quizzes', auth, async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Seeder
async function seedDatabase() {
  try {
    const count = await Quiz.countDocuments();
    if (count === 0) {
      console.log('Seeding default quizzes...');
      const defaultQuizzes = [
        {
          title: 'Web Development Fundamentals', desc: 'Test your HTML, CSS & JS knowledge.',
          category: 'Technology', author: 'QuizCraft Team',
          questions: [
            { text: 'What does HTML stand for?', options: ['HyperText Markup Language','HighTech Modern Language','HyperTransfer Markup Logic','HyperText Method Link'], correct: 0 },
            { text: 'Which CSS property controls text size?', options: ['text-size','font-size','size','letter-size'], correct: 1 },
            { text: 'What does DOM stand for?', options: ['Data Object Model','Document Object Model','Dynamic Output Model','Display Object Mode'], correct: 1 }
          ]
        },
        {
          title: 'World Geography Quiz', desc: 'Can you name the capitals and landmarks?',
          category: 'Geography', author: 'GeoWhiz',
          questions: [
            { text: 'What is the capital of Australia?', options: ['Sydney','Melbourne','Canberra','Brisbane'], correct: 2 },
            { text: 'Which country has the longest coastline?', options: ['Russia','USA','Canada','China'], correct: 2 }
          ]
        }
      ];
      await Quiz.insertMany(defaultQuizzes);
      console.log('Database seeded successfully.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../frontend')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
