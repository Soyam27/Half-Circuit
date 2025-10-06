import React, { useState } from 'react';
import { Element } from 'react-scroll';
import { 
  Search, 
  Brain, 
  Layers,
  Bookmark,
  Filter,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target
} from 'lucide-react';

const FeatureCard = ({ feature, index, isHovered, onHover }) => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-cyan-500 to-blue-500'
  ];

  return (
    <div
      className={`group interactive-card glass-effect rounded-2xl p-8 cursor-pointer transition-all duration-500 ${
        isHovered ? 'shadow-xl scale-105' : ''
      }`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Icon Container */}
      <div className={`relative mb-6 w-16 h-16 rounded-2xl bg-gradient-to-r ${gradients[index % gradients.length]} p-1`}>
        <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
          <feature.icon size={28} className="text-white" />
        </div>
        
        {/* Floating Badge */}
        {feature.badge && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {feature.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gradient transition-all">
        {feature.title}
      </h3>
      
      <p className="text-slate-300 text-base leading-relaxed mb-6">
        {feature.description}
      </p>

      {/* Features List */}
      <div className="space-y-2 mb-6">
        {feature.highlights.map((highlight, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm text-slate-400">
            <CheckCircle size={16} className={`text-gradient bg-gradient-to-r ${gradients[index % gradients.length]} rounded-full`} />
            <span>{highlight}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className={`flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${gradients[index % gradients.length]} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
        <span>Learn More</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Hover Effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradients[index % gradients.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
};

const StatCard = ({ stat, index }) => {
  return (
    <div className="text-center">
      <div className="text-4xl font-black text-gradient mb-2">
        {stat.value}
      </div>
      <div className="text-slate-300 font-medium">
        {stat.label}
      </div>
    </div>
  );
};

const Features = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const featuresData = [
    {
      icon: Search,
      title: "Structured Web Search",
      description: "Fast multi-site search with background fetching that builds a unified knowledge set you can explore immediately.",
      highlights: ["Parallel fetching", "Background updates", "Cancelable requests"],
      badge: "CORE"
    },
    {
      icon: Layers,
      title: "Hierarchical Outline",
      description: "Automatic section & subsection extraction creates a clean, navigable outline of each source.",
      highlights: ["Heading parsing", "Multi-level structure", "Link + media capture"],
      badge: "NEW"
    },
    {
      icon: Brain,
      title: "AI Summaries (Gemini)",
      description: "Generate concise overviews of any collected content with context-aware Gemini summaries.",
      highlights: ["Context aware", "Length options (soon)", "Error fallback"],
      badge: "CORE"
    },
    {
      icon: Bookmark,
      title: "Bookmarks & Dashboard",
      description: "Save and revisit key sources instantly—your personal research hub stays organized by intent.",
      highlights: ["One‑click save", "Central library", "Quick revisit"],
      badge: "NEW"
    },
    {
      icon: Clock,
      title: "Recent Searches & History",
      description: "Automatic tracking of your latest queries so you can jump back into prior research flows.",
      highlights: ["Auto persistence", "Fast recall", "Session restore"],
      badge: "NEW"
    },
    {
      icon: Filter,
      title: "Clean Deduplicated Content",
      description: "Noise-reduced paragraphs, merged links & images, and trimmed redundancy for clearer reading.",
      highlights: ["Paragraph dedupe", "Image/link merge", "Reduced clutter"],
      badge: "BETA"
    }
  ];

  const stats = [
    { value: "6+", label: "Core Capabilities" },
    { value: "Quick", label: "Avg Response" },
    { value: "Beta", label: "Product Stage" },
    { value: "FireBase", label: "Client Storage" }
  ];

  return (
    <Element name="features">
  <section className="relative overflow-hidden scroll-mt-24 px-4 sm:px-6 pt-8 pb-20 sm:pt-12 sm:pb-24">
  <div className="container-premium relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-effect rounded-full text-sm font-medium text-purple-200">
              <Target size={16} className="text-purple-400" />
              <span>Powerful Features</span>
            </div>
            
            <h2 className="font-black text-white mb-6 text-3xl sm:text-4xl md:text-5xl leading-tight">
              Everything You Need to
              <span className="block text-gradient mt-2">Master Any Topic</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto text-balance px-1">
              Focused tools that help you search, structure, summarize, and retain the knowledge you find—without inflated claims.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20 p-5 sm:p-8 glass-effect rounded-2xl">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {featuresData.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                isHovered={hoveredFeature === index}
                onHover={setHoveredFeature}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <button className="button-premium gradient-primary text-white font-bold px-8 py-4 rounded-xl flex items-center gap-3 shadow-glow" onClick={() => window.location.href = '/main'}>
                <span>Try All Features</span>
                <Sparkles size={20} />
              </button>
              
              <span className="text-slate-400 text-sm">
                No credit card required • Free 14-day trial
              </span>
            </div>
          </div>
        </div>
      </section>
    </Element>
  );
};

export default Features;
