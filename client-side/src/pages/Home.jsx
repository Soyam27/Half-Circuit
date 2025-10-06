import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="bg-gray-900 text-white">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;
