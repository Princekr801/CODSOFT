import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../database.json');

let isMongo = false;

// Default initial seed data (jobs matching the design template)
const initialJobs = [
  {
    id: "1",
    title: 'Senior Product Designer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '$140k–$190k',
    exp: 'Senior',
    logo: 'S',
    logoColor: '#1e1e40',
    logoText: '#a593ff',
    posted: '2d ago',
    hot: true,
    tags: ['Design Systems', 'Figma', 'UX Research'],
    description: "We're looking for a Senior Product Designer to join our Design Platform team. You'll shape the experience of millions of developers and businesses who rely on Stripe every day. This is a high-impact role where your design decisions will touch every product surface.",
    requirements: [
      "5+ years of product design experience, ideally at a B2B or fintech company",
      "Proficiency in Figma and modern design tooling",
      "Strong portfolio demonstrating systems thinking and interaction design",
      "Experience with design systems and component libraries",
      "Ability to communicate complex design decisions clearly to stakeholders",
      "Experience with user research and usability testing"
    ],
    perks: ["Competitive equity package", "Remote-first culture", "$2,000 learning budget", "Premium health & dental", "Unlimited PTO", "Home office stipend", "401k with match", "Annual team retreats"],
    deadline: "2026-08-31"
  },
  {
    id: "2",
    title: 'Frontend Engineer',
    company: 'Linear',
    location: 'Remote',
    type: 'Full-time',
    mode: 'Remote',
    salary: '$120k–$165k',
    exp: 'Mid',
    logo: 'L',
    logoColor: '#1a2030',
    logoText: '#378add',
    posted: '1d ago',
    hot: false,
    tags: ['React', 'TypeScript', 'CSS'],
    description: "Linear is looking for a Frontend Engineer to help us build a tool for high-performance software development. You will build user interfaces that are fast, intuitive, and visually exceptional.",
    requirements: [
      "3+ years building rich client-side applications in React",
      "Expert knowledge of CSS/HTML and modern CSS layouts",
      "Deep understanding of TypeScript and React state management",
      "Obsessive attention to detail in visual design and micro-interactions"
    ],
    perks: ["Remote-first workflow", "Flexible hours", "$4,000 co-working/hardware stipend", "Competitive salary & equity", "Generous health insurance", "Unlimited vacation"],
    deadline: "2026-09-15"
  },
  {
    id: "3",
    title: 'Data Scientist',
    company: 'Notion',
    location: 'New York, NY',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '$130k–$175k',
    exp: 'Senior',
    logo: 'N',
    logoColor: '#1e2820',
    logoText: '#4ade80',
    posted: '3d ago',
    hot: true,
    tags: ['Python', 'ML', 'SQL'],
    description: "Notion is a single space where you can think, write, and plan. We are seeking a Data Scientist to build models and surface insights that will guide product strategy and improve user engagement.",
    requirements: [
      "4+ years of data analysis or modeling experience",
      "Expert proficiency in Python (Pandas/NumPy) and SQL",
      "Experience setting up A/B tests and working with statistical inference",
      "Superb communication skills to turn complex numbers into actionable logic"
    ],
    perks: ["Beautiful workspace in NY", "Fully covered premium healthcare", "Annual $3,000 wellness stipend", "401(k) retirement matching", "Unlimited PTO", "Complimentary catered daily lunch"],
    deadline: "2026-07-30"
  },
  {
    id: "4",
    title: 'Product Manager',
    company: 'Vercel',
    location: 'Remote',
    type: 'Full-time',
    mode: 'Remote',
    salary: '$150k–$200k',
    exp: 'Senior',
    logo: 'V',
    logoColor: '#202020',
    logoText: '#eeeef5',
    posted: '5h ago',
    hot: false,
    tags: ['Strategy', 'Analytics', 'Roadmap'],
    description: "Join Vercel's product team to define the developer platform of the future. You will coordinate between frontend design, serverless backend engineers, and marketing to execute core roadmaps.",
    requirements: [
      "5+ years of PM experience handling web platforms or developer tools",
      "Technical background in frontend development or software engineering",
      "Strong track record in analytics, SQL, and data-driven product shipping",
      "Excellent storytelling, writing, and presentation skills"
    ],
    perks: ["Remote-first environment", "Open PTO policy", "$3,000 learning stipend", "Mental health benefits", "State-of-the-art developer workspace setup"],
    deadline: "2026-09-01"
  },
  {
    id: "5",
    title: 'DevOps Engineer',
    company: 'PlanetScale',
    location: 'Remote',
    type: 'Contract',
    mode: 'Remote',
    salary: '$100k–$140k',
    exp: 'Mid',
    logo: 'P',
    logoColor: '#1e1030',
    logoText: '#c084fc',
    posted: '1w ago',
    hot: false,
    tags: ['Kubernetes', 'AWS', 'CI/CD'],
    description: "We are seeking a DevOps Engineer to manage database clusters, enhance continuous delivery, and guarantee scaling performance for developer pipelines.",
    requirements: [
      "3+ years managing AWS, GCP, or Kubernetes infrastructures",
      "Strong skills in infrastructure-as-code scripting (Terraform, CloudFormation)",
      "Background in managing CI/CD tools (GitHub Actions, Jenkins)",
      "Basic programming experience in Go or Python"
    ],
    perks: ["Highly flexible contract", "Home setup allowance", "Premium database education courses", "Access to modern DevOps toolsets"],
    deadline: "2026-06-30"
  },
  {
    id: "6",
    title: 'UX Researcher',
    company: 'Figma',
    location: 'San Francisco, CA',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '$110k–$155k',
    exp: 'Mid',
    logo: 'F',
    logoColor: '#201a30',
    logoText: '#f8a4d8',
    posted: '4d ago',
    hot: true,
    tags: ['User Testing', 'Interviews', 'Surveys'],
    description: "Figma is looking for a UX Researcher to join our core editor team. You will lead research initiatives, coordinate focus groups, and run usability feedback tests to optimize user productivity.",
    requirements: [
      "3+ years of user research experience, preferably on creative or productivity tools",
      "Deep experience conducting structured user interviews and remote testing",
      "Ability to synthesis data into concrete, visually descriptive designer suggestions",
      "Degree in HCI, Psychology, or equivalent background"
    ],
    perks: ["Competitive salary + Figma equity", "Figma design office access", "Full medical, vision & dental coverage", "Learning budget", "Flexible vacation plan"],
    deadline: "2026-10-15"
  }
];

// Initialize JSON database if it doesn't exist
const initializeJSONDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      users: [],
      jobs: initialJobs,
      applications: [],
      notifications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

const readJSONDb = () => {
  initializeJSONDb();
  const rawData = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(rawData);
};

const writeJSONDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// MONGOOSE SCHEMAS (Defined conditionally to prevent duplicate creation if not in Mongo mode)
let UserSchema, JobSchema, ApplicationSchema, NotificationSchema;
let MongoUser, MongoJob, MongoApplication, MongoNotification;

const initMongoModels = () => {
  UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'employer'], required: true },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    companyName: { type: String, default: '' },
    companyLogoColor: { type: String, default: '#7c6dfa' },
    savedJobs: { type: [String], default: [] }
  }, { timestamps: true });

  JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    mode: { type: String, required: true },
    salary: { type: String, required: true },
    exp: { type: String, required: true },
    logo: { type: String, required: true },
    logoColor: { type: String, default: '#1e1e40' },
    logoText: { type: String, default: '#a593ff' },
    posted: { type: String, default: 'Just now' },
    hot: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    perks: { type: [String], default: [] },
    deadline: { type: String, required: true },
    employerId: { type: String, required: true }
  }, { timestamps: true });

  ApplicationSchema = new mongoose.Schema({
    jobId: { type: String, required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    candidateId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    resumeName: { type: String, default: 'resume.pdf' },
    resumeUrl: { type: String, default: '#' },
    experience: { type: String, required: true },
    authorized: { type: String, required: true },
    status: { type: String, enum: ['Review', 'Interview', 'Offer', 'Rejected'], default: 'Review' },
    appliedDate: { type: String, default: 'Just now' }
  }, { timestamps: true });

  NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, default: 'info' },
    read: { type: Boolean, default: false }
  }, { timestamps: true });

  MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
  MongoJob = mongoose.models.Job || mongoose.model('Job', JobSchema);
  MongoApplication = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
  MongoNotification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
};

// CONNECT DATABASE
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️  No MONGODB_URI found in environment variables. Falling back to local JSON database! 📁');
    initializeJSONDb();
    isMongo = false;
    return;
  }

  try {
    await mongoose.connect(uri);
    isMongo = true;
    console.log('🔌 Connected to MongoDB successfully! 🚀');
    initMongoModels();
    
    // Seed initial jobs if the Job collection is empty
    const jobCount = await MongoJob.countDocuments();
    if (jobCount === 0) {
      console.log('🌱 Seeding initial jobs database...');
      // Map initial mock jobs to match schema
      const mappedJobs = initialJobs.map(j => ({
        ...j,
        employerId: "admin_seed"
      }));
      await MongoJob.insertMany(mappedJobs);
      console.log('✅ Seeding completed!');
    }
  } catch (error) {
    console.error('❌ MongoDB Connection failed, falling back to local JSON database: ', error.message);
    initializeJSONDb();
    isMongo = false;
  }
};

// UNIFIED MODEL PROVIDERS
export const UserModel = {
  find: async (query = {}) => {
    if (isMongo) return await MongoUser.find(query);
    const db = readJSONDb();
    return db.users.filter(u => {
      for (let key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    });
  },
  findOne: async (query = {}) => {
    if (isMongo) return await MongoUser.findOne(query);
    const db = readJSONDb();
    return db.users.find(u => {
      for (let key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },
  findById: async (id) => {
    if (isMongo) return await MongoUser.findById(id);
    const db = readJSONDb();
    return db.users.find(u => u.id === id || u._id === id) || null;
  },
  create: async (data) => {
    if (isMongo) return await MongoUser.create(data);
    const db = readJSONDb();
    const newUser = {
      id: Math.random().toString(36).substring(2, 11),
      _id: Math.random().toString(36).substring(2, 11),
      ...data,
      savedJobs: data.savedJobs || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeJSONDb(db);
    return newUser;
  },
  findByIdAndUpdate: async (id, updates, options = {}) => {
    if (isMongo) return await MongoUser.findByIdAndUpdate(id, updates, { new: true, ...options });
    const db = readJSONDb();
    const index = db.users.findIndex(u => u.id === id || u._id === id);
    if (index === -1) return null;
    
    // Perform update
    const updatedUser = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    db.users[index] = updatedUser;
    writeJSONDb(db);
    return updatedUser;
  }
};

export const JobModel = {
  find: async (query = {}) => {
    if (isMongo) {
      // Support keyword search via mongo query if relevant, but we handle search logic in the router
      return await MongoJob.find(query);
    }
    const db = readJSONDb();
    return db.jobs.filter(j => {
      for (let key in query) {
        if (query[key] !== undefined && j[key] !== query[key]) return false;
      }
      return true;
    });
  },
  findById: async (id) => {
    if (isMongo) return await MongoJob.findById(id);
    const db = readJSONDb();
    return db.jobs.find(j => j.id === id || j._id === id) || null;
  },
  create: async (data) => {
    if (isMongo) return await MongoJob.create(data);
    const db = readJSONDb();
    const newJob = {
      id: Math.random().toString(36).substring(2, 11),
      _id: Math.random().toString(36).substring(2, 11),
      posted: 'Just now',
      hot: false,
      tags: data.tags || [],
      requirements: data.requirements || [],
      perks: data.perks || [],
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.jobs.unshift(newJob); // Put new jobs at the top
    writeJSONDb(db);
    return newJob;
  },
  findByIdAndDelete: async (id) => {
    if (isMongo) return await MongoJob.findByIdAndDelete(id);
    const db = readJSONDb();
    const index = db.jobs.findIndex(j => j.id === id || j._id === id);
    if (index === -1) return null;
    const deletedJob = db.jobs[index];
    db.jobs.splice(index, 1);
    writeJSONDb(db);
    return deletedJob;
  }
};

export const ApplicationModel = {
  find: async (query = {}) => {
    if (isMongo) return await MongoApplication.find(query);
    const db = readJSONDb();
    return db.applications.filter(a => {
      for (let key in query) {
        if (a[key] !== query[key]) return false;
      }
      return true;
    });
  },
  findById: async (id) => {
    if (isMongo) return await MongoApplication.findById(id);
    const db = readJSONDb();
    return db.applications.find(a => a.id === id || a._id === id) || null;
  },
  create: async (data) => {
    if (isMongo) return await MongoApplication.create(data);
    const db = readJSONDb();
    const newApp = {
      id: Math.random().toString(36).substring(2, 11),
      _id: Math.random().toString(36).substring(2, 11),
      status: 'Review',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.applications.push(newApp);
    writeJSONDb(db);
    return newApp;
  },
  findByIdAndUpdate: async (id, updates, options = {}) => {
    if (isMongo) return await MongoApplication.findByIdAndUpdate(id, updates, { new: true, ...options });
    const db = readJSONDb();
    const index = db.applications.findIndex(a => a.id === id || a._id === id);
    if (index === -1) return null;
    
    const updatedApp = {
      ...db.applications[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    db.applications[index] = updatedApp;
    writeJSONDb(db);
    return updatedApp;
  }
};

export const NotificationModel = {
  find: async (query = {}) => {
    if (isMongo) return await MongoNotification.find(query);
    const db = readJSONDb();
    return db.notifications.filter(n => {
      for (let key in query) {
        if (n[key] !== query[key]) return false;
      }
      return true;
    });
  },
  create: async (data) => {
    if (isMongo) return await MongoNotification.create(data);
    const db = readJSONDb();
    const newNotification = {
      id: Math.random().toString(36).substring(2, 11),
      _id: Math.random().toString(36).substring(2, 11),
      read: false,
      ...data,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(newNotification);
    writeJSONDb(db);
    return newNotification;
  }
};
