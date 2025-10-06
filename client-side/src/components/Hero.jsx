import React, { useState, useEffect, useRef } from 'react';
import { Search, Brain, Zap, Globe, Sparkles, ArrowRight, Play, ChevronDown } from 'lucide-react';
import { Element, scroller } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AnimatedCounterText = () => {
  const texts = [
    'Organize Knowledge',
    'Process Data',
    'Compute Insights',
    'Generate Solutions',
    'Analyze Patterns',
    'Transform Information'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayChars, setDisplayChars] = useState(texts[0].split(''));
  const [isAnimating, setIsAnimating] = useState(false);
  const runningRef = useRef(false);
  const stopRef = useRef(false);
  const indexRef = useRef(0); // track current index reliably inside the loop

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const animateToIndex = async (nextIndex) => {
    const nextText = texts[nextIndex].split('');
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const steps = 6;
    const stepDelay = 60;

    const maxLen = Math.max(displayChars.length, nextText.length);

    for (let pos = 0; pos < maxLen; pos++) {
      if (stopRef.current) return;
      for (let s = 0; s < steps; s++) {
        if (stopRef.current) return;
        setDisplayChars((prev) => {
          const arr = prev.slice();
          while (arr.length <= pos) arr.push(' ');
          arr[pos] = charset[Math.floor(Math.random() * charset.length)];
          return arr;
        });
        await sleep(stepDelay);
      }

      // set final char for this position
      setDisplayChars((prev) => {
        const arr = prev.slice();
        while (arr.length <= pos) arr.push(' ');
        arr[pos] = nextText[pos] || ' ';
        return arr;
      });
      await sleep(40);
    }

    // finalize exact next text
    setDisplayChars(() => nextText.slice());
    setCurrentIndex(nextIndex);
    indexRef.current = nextIndex;
  };

  useEffect(() => {
    stopRef.current = false;
    if (runningRef.current) return;
    runningRef.current = true;

    (async () => {
      while (!stopRef.current) {
        // show current text for a readable duration
        await sleep(2200);
        if (stopRef.current) break;
        setIsAnimating(true);
        const next = (indexRef.current + 1) % texts.length;
        await animateToIndex(next);
        setIsAnimating(false);
      }
      runningRef.current = false;
    })();

    return () => {
      stopRef.current = true;
    };
  }, []);

  return (
    <>
      {displayChars.map((char, index) => (
        <span
          key={`${currentIndex}-${index}`}
          className={`inline-block transition-all duration-150 ${isAnimating ? 'animate-pulse' : ''}`}
          style={{ transform: isAnimating ? 'scale(1.04)' : 'scale(1)' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  );
};

const FloatingIcon = ({ icon: Icon, delay = 0, position }) => (
  <div 
    className={`absolute ${position} opacity-20 animate-float`}
    style={{ animationDelay: `${delay}s` }}
  >
    <Icon size={24} className="text-blue-400" />
  </div>
);

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  const placeholders = [
    'DSA Linked Lists',
    'Machine Learning',
    'React Hooks',
    'Python Automation',
    'Web Scraping',
    'AI Algorithms'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (user) {
        // If user is logged in, navigate to search page with query
        navigate(`/main?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        // If not logged in, just scroll to features section
        scroller.scrollTo('features', {
          duration: 800,
          delay: 0,
          smooth: 'easeInOutQuart'
        });
      }
    }
  };


  const scrollToNext = () => {
    scroller.scrollTo('features', {
      duration: 50,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  };

  return (
  <section className="hero-stable px-3 sm:px-6 scroll-mt-24">

      {/* Large Background Blob - Hide on mobile to improve performance */}
      <div className="hidden sm:block hero-bg-blob animate-blob-float animate-blob-pulse" style={{animationDelay: '0s, 1s'}} />
      
      {/* Hero Section Blobs - Hide on mobile */}
      <div className="hidden sm:block hero-blob hero-blob-1 animate-blob-float animate-blob-pulse" />
      <div className="hidden sm:block hero-blob hero-blob-2 animate-blob-float animate-blob-pulse" style={{animationDelay: '8s, 2s'}} />
      <div className="hidden sm:block hero-blob hero-blob-3 animate-blob-float animate-blob-pulse" style={{animationDelay: '16s, 4s'}} />

      {/* Floating Icons - Only on large screens */}
      <div className="hidden lg:block">
        <FloatingIcon icon={Brain} delay={0} position="top-24 left-20" />
        <FloatingIcon icon={Zap} delay={1} position="top-44 right-32" />
        <FloatingIcon icon={Globe} delay={2} position="bottom-44 left-32" />
        <FloatingIcon icon={Sparkles} delay={3} position="bottom-24 right-20" />
      </div>

      {/* Grid Pattern - Subtle on mobile */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] sm:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)]" />

      <div className="container-premium relative z-10 pt-12 sm:pt-20">
        <div className="sm:mt-8 lg:mt-12 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto text-center">
          
          {/* Badge - Responsive sizing */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8 glass-effect rounded-full text-xs sm:text-sm font-medium text-blue-200 animate-pulse-slow">
            <Sparkles size={14} className="sm:w-4 sm:h-4 text-blue-400" />
            <span className="hidden xs:inline">AI-Powered Content Discovery</span>
            <span className="xs:hidden">AI Discovery</span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Main Heading - Better fluid typography */}
          <h1 className="font-black mb-4 sm:mb-6 text-balance text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl leading-tight tracking-tight">
            <span className="block text-white">Discover, Analyze &</span>
            <span className="block text-blue-600 animate-gradient mt-1 sm:mt-2">
              <AnimatedCounterText />
            </span>
            <span className="block text-white font-semibold opacity-90 mt-2 sm:mt-4 text-fluid-lg sm:text-fluid-xl lg:text-fluid-2xl">with AI Intelligence</span>
          </h1>

          {/* Subtitle - Better responsive text */}
          <p className="text-fluid-sm sm:text-fluid-base md:text-fluid-lg text-slate-300 mb-6 sm:mb-8 max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto text-balance leading-relaxed px-1 sm:px-2">
            Transform any topic into organized, comprehensive knowledge with AI-powered analysis.
          </p>

          {/* Search Interface - Fully responsive layout */}
          <form onSubmit={handleSearch} className="mb-6 sm:mb-8 px-4 sm:px-0">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto group">
              <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              <div className="relative dark-glass-effect rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl">
                {/* Responsive horizontal layout */}
                <div className="flex items-center gap-0">
                  {/* Search Input Container */}
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex items-center pl-3 sm:pl-4 md:pl-6 pr-2 sm:pr-3 md:pr-4">
                      <Search size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Try "${placeholders[currentPlaceholder]}"...`}
                      className="flex-1 bg-transparent text-white text-sm sm:text-base md:text-lg placeholder-slate-400 border-none outline-none py-3 sm:py-3.5 md:py-4 pr-2 sm:pr-3 md:pr-4 min-w-0"
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                    />
                  </div>
                  
                  {/* Search Button - Responsive sizing */}
                  <button
                    type="submit"
                    className="button-premium gradient-primary text-white font-semibold px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base flex-shrink-0"
                    disabled={!searchQuery.trim()}
                  >
                    <span className="hidden sm:inline">{user ? 'Search' : 'Explore'}</span>
                    <Search size={18} className="sm:hidden" />
                    <ArrowRight size={16} className="hidden sm:block sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>


          {/* Feature Pills - Hidden on mobile */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { icon: Brain, text: 'AI Analysis', color: 'from-blue-500 to-cyan-500' },
              { icon: Zap, text: 'Instant Results', color: 'from-yellow-500 to-orange-500' },
              { icon: Globe, text: 'Web Scraping', color: 'from-green-500 to-emerald-500' },
            ].map(({ icon: Icon, text, color }, index) => (
              <div
                key={text}
                className={`flex items-center gap-2 px-3 py-2 glass-effect rounded-xl text-sm font-medium text-white/90 hover:scale-105 transition-transform cursor-pointer`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-1 rounded-lg bg-gradient-to-r ${color}`}>
                  <Icon size={14} className="text-white" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

         
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 w-full max-w-sm sm:max-w-lg mx-auto px-4 sm:px-0">
            <button 
              onClick={scrollToNext}
              className="button-premium gradient-primary text-white font-bold w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base group min-h-[48px]"
            >
              <span>Start Exploring</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            <button 
              className="hidden sm:flex button-premium glass-effect text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl items-center justify-center gap-2 hover:bg-white/20 transition-colors text-sm sm:text-base w-full sm:w-auto min-h-[48px]" 
              onClick={() => window.location.href = 'https://www.youtube.com/@avgsoyamm'}
            >
              <Play size={18} className="flex-shrink-0" />
              <span>Watch Out</span>
            </button>
          </div>

        </div>
      </div>

    
      <button
        onClick={scrollToNext}
        className="hidden sm:block absolute bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce p-2 rounded-full hover:bg-white/10"
        aria-label="Scroll to features section"
      >
        <ChevronDown size={28} className="lg:w-8 lg:h-8" />
      </button>
    </section>
  );
};

export default Hero;
