import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';

// Pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import JobDetail from './pages/JobDetail';
import Apply from './pages/Apply';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

export default function App() {
  const [activePage, setActivePage] = useState('home'); // 'home', 'listings', 'job-detail', 'apply', 'candidate-dash', 'employer-dash'
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  // Search state passed from Home search to Listings search
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  
  // Auth modal global toggle
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleNavigate = (pageName, jobId = null) => {
    setActivePage(pageName);
    if (jobId) {
      setSelectedJobId(jobId);
    }
    window.scrollTo(0, 0);
  };

  const handleSearchJobs = (search, location) => {
    setSearchQuery(search);
    setLocationQuery(location);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setLocationQuery('');
  };

  return (
    <>
      <Navbar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
        onOpenAuth={() => setIsAuthOpen(true)} 
      />

      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        {activePage === 'home' && (
          <Home 
            onNavigate={handleNavigate} 
            onOpenAuth={() => setIsAuthOpen(true)} 
            onSearchJobs={handleSearchJobs}
          />
        )}
        
        {activePage === 'listings' && (
          <Listings 
            initialSearch={searchQuery} 
            initialLocation={locationQuery} 
            onNavigate={handleNavigate}
            clearSearchQueries={handleClearSearch}
          />
        )}
        
        {activePage === 'job-detail' && (
          <JobDetail 
            jobId={selectedJobId} 
            onNavigate={handleNavigate} 
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        
        {activePage === 'apply' && (
          <Apply 
            jobId={selectedJobId} 
            onNavigate={handleNavigate} 
          />
        )}
        
        {activePage === 'candidate-dash' && (
          <CandidateDashboard 
            onNavigate={handleNavigate} 
          />
        )}
        
        {activePage === 'employer-dash' && (
          <EmployerDashboard 
            onNavigate={handleNavigate} 
          />
        )}
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </>
  );
}
