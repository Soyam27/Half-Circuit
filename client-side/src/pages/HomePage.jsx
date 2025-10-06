import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';

const HomePage = () => {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    // Redirect to main page with search query
    navigate(`/main?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent to-slate-950">
      <Hero onSearch={handleSearch} />
      <Features />
      {/* Mobile bottom spacer to prevent white gap */}
      <div className="h-20 bg-slate-950 md:hidden" />
    </div>
  );
};

export default HomePage;