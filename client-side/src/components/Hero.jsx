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
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 scroll-mt-24">

      {/* Large Background Blob */}
      <div className="hero-bg-blob animate-blob-float animate-blob-pulse" style={{animationDelay: '0s, 1s'}} />
      
      {/* Hero Section Blobs */}
      <div className="hero-blob hero-blob-1 animate-blob-float animate-blob-pulse" />
      <div className="hero-blob hero-blob-2 animate-blob-float animate-blob-pulse" style={{animationDelay: '8s, 2s'}} />
      <div className="hero-blob hero-blob-3 animate-blob-float animate-blob-pulse" style={{animationDelay: '16s, 4s'}} />

      {/* Floating Icons - Only on large screens */}
      <div className="hidden lg:block">
        <FloatingIcon icon={Brain} delay={0} position="top-24 left-20" />
        <FloatingIcon icon={Zap} delay={1} position="top-44 right-32" />
        <FloatingIcon icon={Globe} delay={2} position="bottom-44 left-32" />
        <FloatingIcon icon={Sparkles} delay={3} position="bottom-24 right-20" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)]" />

      <div className="container-premium relative z-10 pt-20">
        <div className=" sm:mt-12 max-w-4xl lg:max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-effect rounded-full text-sm font-medium text-blue-200 animate-pulse-slow">
            <Sparkles size={16} className="text-blue-400" />
            <span>AI-Powered Content Discovery</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Main Heading */}
          <h1 className="font-black mb-4 sm:mb-6 text-balance text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">
            <span className="block text-white">Discover, Analyze &</span>
            <span className="block text-blue-600 animate-gradient mt-1">
              <AnimatedCounterText />
            </span>
            <span className="block text-white font-semibold opacity-90 mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl">with AI Intelligence</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl md:max-w-2xl mx-auto text-balance leading-relaxed px-2">
            Transform any topic into organized, comprehensive knowledge with AI-powered analysis.
          </p>

          {/* Search Interface */}
          <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
            <div className="relative max-w-sm sm:max-w-xl md:max-w-2xl mx-auto group">
              <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              <div className="relative dark-glass-effect rounded-2xl p-2 shadow-2xl">
                <div className="flex items-center">
                  <div className="flex items-center pl-6 pr-4">
                    <Search size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Try "${placeholders[currentPlaceholder]}"...`}
                    className="flex-1 bg-transparent text-white text-base sm:text-lg placeholder-slate-400 border-0 outline-0 py-3 sm:py-4 pr-2 sm:pr-4 min-w-0"
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                  />
                  
                  <button
                    type="submit"
                    className="button-premium gradient-primary text-white font-semibold px-5 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    disabled={!searchQuery.trim()}
                  >
                    <span>{user ? 'Search' : 'Explore'}</span>
                    <ArrowRight size={20} />
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 w-full max-w-lg mx-auto">
            <button 
              onClick={scrollToNext}
              className="button-premium gradient-primary text-white font-bold w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base group"
            >
              <span>Start Exploring</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="hidden sm:flex button-premium glass-effect text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl items-center justify-center gap-2 hover:bg-white/20 transition-colors text-sm sm:text-base" onClick={() => window.location.href = 'https://www.youtube.com/@avgsoyamm'}>
              <Play size={18} />
              <span>Watch Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToNext}
        className="hidden xs:block absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default Hero;
