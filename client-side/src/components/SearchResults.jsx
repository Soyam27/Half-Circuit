import React, { useState } from 'react';
import { 
  ExternalLink, 
  Clock, 
  Star, 
  BookOpen, 
  Eye, 
  Download,
  Share,
  Bookmark,
  Filter,
  Grid,
  List,
  ChevronDown
} from 'lucide-react';

const SearchResults = ({ results = [], query, isLoading = false }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState('all');

  // Mock data for demonstration
  const mockResults = [
    {
      id: 1,
      title: "Complete Guide to Data Structures and Algorithms - Linked Lists",
      description: "Comprehensive tutorial covering linked list implementation, operations, and common interview questions. Learn about singly, doubly, and circular linked lists with code examples in multiple programming languages including Python, Java, and C++.",
      url: "https://geeksforgeeks.org/linked-list",
      domain: "geeksforgeeks.org",
      rating: 4.8,
      readTime: "12 min",
      difficulty: "Intermediate",
      tags: ["DSA", "Linked Lists", "Programming", "Algorithms"],
      category: "Tutorial",
      publishDate: "2024-01-15",
      author: "GeeksforGeeks Team"
    },
    {
      id: 2,
      title: "LeetCode Linked List Problems - Practice & Solutions",
      description: "Master linked list concepts with curated problems from easy to hard difficulty. Includes detailed explanations, multiple approaches, and time/space complexity analysis for each solution.",
      url: "https://leetcode.com/explore/learn/card/linked-list/",
      domain: "leetcode.com",
      rating: 4.6,
      readTime: "25 min",
      difficulty: "Advanced",
      tags: ["Practice", "Interview Prep", "Problem Solving"],
      category: "Practice Platform",
      publishDate: "2024-02-01",
      author: "LeetCode"
    },
    {
      id: 3,
      title: "Visualizing Linked Lists with Interactive Animations",
      description: "Interactive visual guide to understanding linked list operations. Step-by-step animations showing insertion, deletion, traversal, and reversal operations with real-time code execution.",
      url: "https://visualgo.net/en/list",
      domain: "visualgo.net",
      rating: 4.9,
      readTime: "8 min",
      difficulty: "Beginner",
      tags: ["Visualization", "Interactive", "Learning"],
      category: "Educational Tool",
      publishDate: "2024-01-20",
      author: "VisuAlgo Team"
    }
  ];

  const displayResults = results.length > 0 ? results : mockResults;

  const ResultCard = ({ result, index }) => (
    <div className="group interactive-card glass-effect rounded-2xl p-6 cursor-pointer">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm">{result.domain}</span>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={12} className="fill-current" />
                <span>{result.rating}</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500">{result.category}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Bookmark size={16} className="text-slate-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Share size={16} className="text-slate-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ExternalLink size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-gradient transition-colors">
        {result.title}
      </h3>

      {/* Description */}
      <p className="text-slate-300 mb-4 line-clamp-3 text-sm leading-relaxed">
        {result.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {result.tags.slice(0, 4).map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
          >
            {tag}
          </span>
        ))}
        {result.tags.length > 4 && (
          <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
            +{result.tags.length - 4} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{result.readTime} read</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={12} />
            <span>{result.difficulty}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            <Eye size={12} />
            <span>Preview</span>
          </button>
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            <Download size={12} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="glass-effect rounded-2xl p-6 animate-pulse">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-8 h-8 bg-slate-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-32 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-24" />
            </div>
          </div>
          <div className="h-6 bg-slate-700 rounded w-full mb-3" />
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-slate-700 rounded w-full" />
            <div className="h-4 bg-slate-700 rounded w-4/5" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-slate-700 rounded w-16" />
            <div className="h-6 bg-slate-700 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <section className="section-spacing">
        <div className="container-premium">
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  return (
  <section className="section-spacing scroll-mt-24 px-4 sm:px-6">
      <div className="container-premium">
        
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="font-black text-white mb-4 text-3xl sm:text-4xl md:text-5xl leading-tight">
                Search Results
                {query && (
                  <span className="block text-responsive-lg text-slate-300 font-normal mt-2">
                    for "<span className="text-gradient">{query}</span>"
                  </span>
                )}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Found {displayResults.length} relevant results • Powered by AI
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 glass-effect rounded-xl p-1 order-2 sm:order-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative order-1 sm:order-2 w-full xs:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none glass-effect w-full xs:w-auto text-white px-4 py-2 pr-8 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="date">Sort by Date</option>
                  <option value="difficulty">Sort by Difficulty</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <button className="glass-effect text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 order-3 text-sm sm:text-base">
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {displayResults.map((result, index) => (
            <ResultCard key={result.id} result={result} index={index} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="button-premium glass-effect text-white font-semibold w-full sm:w-auto px-7 sm:px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base">
            Load More Results
          </button>
        </div>

      </div>
    </section>
  );
};

export default SearchResults;