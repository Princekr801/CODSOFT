const API_URL = '/api';

let currentUser = null;
let quizzes = [];
let activeQuiz = null;
let currentQ = 0;
let userAnswers = [];
let questionIdCounter = 0;

const catColors = {
  Technology: { bg: 'rgba(37,99,235,0.2)', color: '#60a5fa' },
  Science: { bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
  Geography: { bg: 'rgba(6,182,212,0.2)', color: '#22d3ee' },
  History: { bg: 'rgba(245,158,11,0.2)', color: '#fcd34d' },
  'Pop Culture': { bg: 'rgba(236,72,153,0.2)', color: '#f472b6' },
  Sports: { bg: 'rgba(239,68,68,0.2)', color: '#f87171' },
  Math: { bg: 'rgba(139,92,246,0.2)', color: '#c084fc' },
  General: { bg: 'rgba(255,255,255,0.1)', color: '#d1d5db' },
};

// ── INIT ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('qc_token');
  if (token) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
      } else {
        localStorage.removeItem('qc_token');
      }
    } catch (err) {
      console.error(err);
    }
  }
  updateNav();
  await loadQuizzes();
});

async function loadQuizzes() {
  try {
    const res = await fetch(`${API_URL}/quizzes`);
    if (res.ok) {
      quizzes = await res.json();
      document.getElementById('statQuizzes').textContent = quizzes.length;
    }
  } catch (err) {
    console.error('Failed to load quizzes', err);
    document.getElementById('statQuizzes').textContent = '0';
  }
}

// ── NAVIGATION ─────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'list') {
    loadQuizzes().then(renderQuizList);
  }
  if (name === 'create') {
    if (!currentUser) {
      toast('Please sign in to create a quiz', 'error');
      showPage('auth');
      return;
    }
    initCreator();
  }
}

function goHome() { showPage('home'); }

// ── AUTH ───────────────────────────────────────────────────────────
function switchAuthTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? '' : 'none';
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  const btn = document.getElementById('loginBtn');
  
  if (!email || !password) return toast('Fill all fields', 'error');
  
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('qc_token', data.token);
      currentUser = data.user;
      updateNav();
      toast('Welcome back, ' + currentUser.name + '!', 'success');
      showPage('home');
    } else {
      toast(data.error || 'Login failed', 'error');
    }
  } catch (err) {
    toast('Network error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function doSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPass').value.trim();
  const btn = document.getElementById('signupBtn');
  
  if (!name || !email || !password) return toast('Fill all fields', 'error');
  
  btn.disabled = true;
  btn.textContent = 'Creating...';
  
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('qc_token', data.token);
      currentUser = data.user;
      updateNav();
      toast('Account created! Welcome, ' + name + ' 🎉', 'success');
      showPage('home');
    } else {
      toast(data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    toast('Network error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

function updateNav() {
  const el = document.getElementById('navUser');
  if (currentUser) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    el.innerHTML = `
      <span class="user-name-display">${currentUser.name.split(' ')[0]}</span>
      <div class="avatar-wrap">
        <div class="avatar" title="Account Menu" onclick="toggleUserMenu(event)">${initials}</div>
        <div id="userMenu" class="user-dropdown">
          <div class="dropdown-item" onclick="toast('My Profile coming soon!', 'success')">My Profile</div>
          <div class="dropdown-item" onclick="toast('My Courses coming soon!', 'success')">My Courses</div>
          <div class="dropdown-item" onclick="toast('My Assessments coming soon!', 'success')">My Assessments</div>
          <div class="dropdown-item" onclick="toast('Scorecard coming soon!', 'success')">Scorecard</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item text-red" onclick="logOut()">Logout</div>
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <button class="btn-outline" style="padding:7px 16px;font-size:13px;" onclick="showPage('auth')">Sign In</button>
      <button class="nav-btn" onclick="showPage('auth')">Get Started</button>
    `;
  }
}

function toggleUserMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('userMenu');
  if (menu) menu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  const menu = document.getElementById('userMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

function logOut() {
  currentUser = null;
  localStorage.removeItem('qc_token');
  updateNav();
  toast('Signed out. See you soon!', 'success');
  showPage('home');
}

// ── QUIZ LIST ──────────────────────────────────────────────────────
function renderQuizList() {
  const grid = document.getElementById('quizGrid');
  if (quizzes.length === 0) {
    grid.innerHTML = '<div style="color:var(--white-50);text-align:center;width:100%;grid-column:1/-1;padding:2rem;">No quizzes found. Be the first to create one!</div>';
    return;
  }
  
  grid.innerHTML = quizzes.map(q => {
    const c = catColors[q.category] || catColors.General;
    return `
    <div class="quiz-card" onclick="startQuiz('${q._id}')">
      <div class="quiz-card-top">
        <span class="quiz-cat" style="background:${c.bg};color:${c.color}">${q.category}</span>
        <span class="quiz-q-count">${q.questions.length} Qs</span>
      </div>
      <h3>${q.title}</h3>
      <p>${q.desc}</p>
      <div class="quiz-meta">
        <span>By ${q.author || 'Anonymous'}</span>
      </div>
      <button class="take-btn" onclick="event.stopPropagation();startQuiz('${q._id}')">Take Quiz →</button>
    </div>`;
  }).join('');
}

// ── CREATION ───────────────────────────────────────────────────────
function initCreator() {
  document.getElementById('quizTitle').value = '';
  document.getElementById('quizDesc').value = '';
  document.getElementById('questionsContainer').innerHTML = '';
  questionIdCounter = 0;
  addQuestion();
}

function addQuestion() {
  questionIdCounter++;
  const id = questionIdCounter;
  const container = document.getElementById('questionsContainer');
  const div = document.createElement('div');
  div.className = 'question-block';
  div.id = 'qb-' + id;
  div.innerHTML = `
    <div class="question-block-header">
      <span class="question-num">Question ${id}</span>
      <button class="del-btn" onclick="removeQuestion(${id})">Remove</button>
    </div>
    <div class="form-group">
      <label>Question Text</label>
      <input type="text" id="qt-${id}" placeholder="Type your question here...">
    </div>
    <label style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);margin-bottom:8px;display:block;">
      Answer Options <span style="color:rgba(255,255,255,0.4);font-weight:400;">(select correct answer)</span>
    </label>
    <div class="options-grid">
      ${['A','B','C','D'].map((l, i) => `
        <div class="option-row">
          <span class="option-label">${l}</span>
          <input type="text" id="qo-${id}-${i}" placeholder="Option ${l}">
          <input type="radio" class="correct-radio" name="correct-${id}" value="${i}" title="Mark as correct">
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(div);
}

function removeQuestion(id) {
  const el = document.getElementById('qb-' + id);
  if (el) el.remove();
}

async function publishQuiz() {
  const title = document.getElementById('quizTitle').value.trim();
  const desc = document.getElementById('quizDesc').value.trim();
  const cat = document.getElementById('quizCat').value;
  if (!title) { toast('Please add a quiz title', 'error'); return; }

  const qBlocks = document.querySelectorAll('.question-block');
  if (qBlocks.length === 0) { toast('Add at least one question', 'error'); return; }

  const questions = [];
  let valid = true;
  qBlocks.forEach(block => {
    const id = block.id.replace('qb-', '');
    const text = document.getElementById('qt-' + id)?.value.trim();
    if (!text) { valid = false; return; }
    const options = [0,1,2,3].map(i => document.getElementById(`qo-${id}-${i}`)?.value.trim() || '');
    if (options.some(o => !o)) { valid = false; return; }
    const radios = block.querySelectorAll('input[type=radio]');
    const correct = [...radios].findIndex(r => r.checked);
    if (correct < 0) { valid = false; return; }
    questions.push({ text, options, correct });
  });

  if (!valid) { toast('Complete all questions and mark correct answers', 'error'); return; }

  const quiz = {
    title, desc, category: cat,
    author: currentUser.name,
    questions
  };

  const btn = document.getElementById('publishBtn');
  btn.disabled = true;
  btn.textContent = 'Publishing...';

  try {
    const token = localStorage.getItem('qc_token');
    const res = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quiz)
    });

    if (res.ok) {
      toast('Quiz published! 🎉', 'success');
      showPage('list');
    } else {
      const err = await res.json();
      toast(err.error || 'Failed to publish', 'error');
    }
  } catch (err) {
    toast('Network error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Publish Quiz 🚀';
  }
}

// ── QUIZ TAKING ────────────────────────────────────────────────────
function startQuiz(id) {
  activeQuiz = quizzes.find(q => q._id === id);
  if (!activeQuiz) return;
  currentQ = 0;
  userAnswers = new Array(activeQuiz.questions.length).fill(-1);
  showPage('take');
  renderQuestion();
}

function renderQuestion() {
  const q = activeQuiz.questions[currentQ];
  const total = activeQuiz.questions.length;
  const letters = ['A','B','C','D'];

  const prog = document.getElementById('quizProgress');
  prog.innerHTML = activeQuiz.questions.map((_, i) => {
    let cls = 'prog-dot';
    if (i < currentQ) cls += ' done';
    if (i === currentQ) cls += ' current';
    return `<div class="${cls}"></div>`;
  }).join('');

  const wrap = document.getElementById('qCardWrap');
  wrap.innerHTML = `
    <div class="q-card">
      <div class="q-meta">
        <span>${activeQuiz.title}</span>
        <span>Question ${currentQ + 1} of ${total}</span>
      </div>
      <div class="q-text">${q.text}</div>
      <div class="opt-list" id="optList">
        ${q.options.map((opt, i) => `
          <div class="opt-item" id="opt-${i}" onclick="selectAnswer(${i})">
            <div class="opt-letter">${letters[i]}</div>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>
      <div class="q-nav" id="qNav">
        ${currentQ > 0 ? `<button class="btn-ghost" onclick="prevQ()">← Back</button>` : '<div></div>'}
        <button class="btn-primary" id="nextBtn" onclick="nextQ()" style="opacity:0.4;pointer-events:none;">
          ${currentQ === total - 1 ? 'Finish Quiz 🎯' : 'Next →'}
        </button>
      </div>
    </div>
  `;

  if (userAnswers[currentQ] >= 0) {
    document.getElementById('opt-' + userAnswers[currentQ])?.classList.add('selected');
    document.getElementById('nextBtn').style.cssText = '';
  }
}

function selectAnswer(idx) {
  document.querySelectorAll('.opt-item').forEach(o => o.classList.remove('selected'));
  document.getElementById('opt-' + idx).classList.add('selected');
  userAnswers[currentQ] = idx;
  const btn = document.getElementById('nextBtn');
  btn.style.opacity = '1'; btn.style.pointerEvents = '';
}

function nextQ() {
  if (userAnswers[currentQ] < 0) { toast('Please select an answer', 'error'); return; }
  if (currentQ < activeQuiz.questions.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    showResults();
  }
}

function prevQ() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}

// ── RESULTS ────────────────────────────────────────────────────────
function showResults() {
  showPage('results');
  const qs = activeQuiz.questions;
  let correct = 0;
  qs.forEach((q, i) => { if (userAnswers[i] === q.correct) correct++; });
  const pct = Math.round((correct / qs.length) * 100);

  const circ = 2 * Math.PI * 68;
  const offset = circ - (pct / 100) * circ;
  document.getElementById('scoreArc').setAttribute('stroke-dashoffset', offset);
  document.getElementById('scoreArc').setAttribute('stroke',
    pct >= 80 ? '#10b981' : pct >= 50 ? '#2563eb' : '#ef4444');
  document.getElementById('scoreNum').textContent = pct + '%';
  document.getElementById('scoreLabel').textContent = correct + ' / ' + qs.length + ' correct';

  const msgs = pct === 100 ? ['🏆 Perfect Score! Absolutely brilliant!', 'You answered every question correctly.']
    : pct >= 80 ? ['🎉 Excellent Work!', 'You really know your stuff!']
    : pct >= 60 ? ['👍 Good Job!', 'Solid performance — keep it up!']
    : pct >= 40 ? ['📚 Not Bad!', 'A bit more study and you\'ll ace it.']
    : ['😅 Keep Practicing!', 'Review the answers and try again!'];

  document.getElementById('resultTitle').textContent = msgs[0];
  document.getElementById('resultSub').textContent = msgs[1];

  const letters = ['A','B','C','D'];
  document.getElementById('answersReview').innerHTML = qs.map((q, i) => {
    const ua = userAnswers[i];
    const isCorrect = ua === q.correct;
    return `
    <div class="review-item">
      <div class="review-q">${i + 1}. ${q.text}</div>
      <div class="review-ans">
        <span class="chip ${isCorrect ? 'chip-green' : 'chip-red'}">${isCorrect ? 'Correct' : 'Wrong'}</span>
        <span style="color:rgba(255,255,255,0.5);font-size:13px;">
          ${isCorrect ? 'You answered: ' + letters[ua] + '. ' + q.options[ua]
            : 'Your answer: <span style="color:#f87171">' + (ua >= 0 ? letters[ua] + '. ' + q.options[ua] : 'No answer') + '</span> · Correct: <span style="color:#34d399">' + letters[q.correct] + '. ' + q.options[q.correct] + '</span>'}
        </span>
      </div>
    </div>`;
  }).join('');
}

function retakeQuiz() {
  startQuiz(activeQuiz._id);
}

// ── TOAST ──────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}
