const fs = require('fs');
const path = require('path');

const files = [
  { path: 'codsoft_task1/frontend/src/components/Footer.jsx', depth: 2 },
  { path: 'codsoft_task1/frontend/src/components/Navbar.jsx', depth: 2 },
  { path: 'codsoft_task1/frontend/src/pages/CandidateDashboard.jsx', depth: 2 },
  { path: 'codsoft_task1/frontend/src/pages/EmployerDashboard.jsx', depth: 2 },
  { path: 'codsoft_task1/frontend/src/pages/JobDetail.jsx', depth: 2 }
];

files.forEach(f => {
  const fullPath = path.join(__dirname, f.path);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (!content.includes('import { toast }')) {
    const importStr = "import { toast } from '../utils/toast';\n";
    content = content.replace(/(import React.*?\n)/, `$1${importStr}`);
  }
  
  content = content.replace(/alert\((['`].*?['`])\)/g, 'toast($1, "info")');
  
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', f.path);
});
