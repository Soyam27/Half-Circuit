import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  ExternalLink,
  Sparkles,
  Clock,
  BookOpen,
  Copy,
  Share2,
  Download,
  X,
  ZoomIn,
  Info
} from 'lucide-react';

// Skeleton loader blocks
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-slate-700/40 ${className}`} />
);

const ContentSkeleton = () => (
    <div className="container-premium pt-24 pb-12">
    <div className="max-w-4xl mb-10 pt-30 mx-auto space-y-6">
      {/* Back button skeleton */}
      <Skeleton className="h-5 w-40" />
      
      <div className="glass-effect p-6 rounded-xl space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-effect p-6 rounded-xl space-y-4">
        <Skeleton className="h-6 w-48" />
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-2 ml-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
       <div className="glass-effect p-6 rounded-xl space-y-4">
        <Skeleton className="h-6 w-48" />
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-2 ml-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>


      <div className="glass-effect p-6 rounded-xl space-y-4">
        <Skeleton className="h-6 w-48" />
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-2 ml-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContentDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [summaries, setSummaries] = useState({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    let timeoutId = null;
    
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      const startTime = Date.now();
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const resp = await fetch(`${API_BASE}/content?url=${encodeURIComponent(url)}`, { 
          signal: controller.signal,
          timeout: 45000 // 45 second timeout
        });
        
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}: ${resp.statusText}`);
        }
        
        const data = await resp.json();
        if (data.status_code === 200 && data.data) {
            setContent(data.data);
            setError(null);
        } else {
            setContent(null);
            setError(data.error || `Failed to scrape content (${data.status_code})`);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Failed to fetch content', e);
          setContent(null);
          if (e.name === 'TimeoutError') {
            setError('Request timed out. The website may be slow or unreachable.');
          } else if (e.message.includes('Failed to fetch')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(e.message || 'Failed to load content. Please try again.');
          }
        }
        return; // Exit early on error
      }
      
      // Only set timeout if not aborted
      if (!controller.signal.aborted) {
        const elapsedTime = Date.now() - startTime;
        const minDelay = Math.max(0, 800 - elapsedTime);
        timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }, minDelay);
      }
    };
    
    fetchContent();
    return () => {
      controller.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsLoading(false);
    };
  }, [id, url]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleSubsection = (sectionId, subsectionId) => {
    const key = `${sectionId}-${subsectionId}`;
    setExpandedSubsections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateSummary = async (sectionId, subsectionId) => {
    const key = `${sectionId}-${subsectionId}`;
    setIsGeneratingSummary(prev => ({ ...prev, [key]: true }));

    try {
      // Gather the subsection text
      const section = content.sections.find(s => s.id === sectionId);
      const subsection = section?.subsections?.find(ss => ss.id === subsectionId);
      const rawText = subsection?.content || '';
      const textForSummary = rawText.split(/\n\n+/).slice(0, 50).join('\n\n'); // limit size

      if (!textForSummary.trim()) {
        setSummaries(prev => ({ ...prev, [key]: 'No text for generation.' }));
        setIsGeneratingSummary(prev => ({ ...prev, [key]: false }));
        return;
      }

      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const resp = await fetch(`${API_BASE}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textForSummary })
      });
      const data = await resp.json();
      if (resp.ok && data.status_code === 200) {
        setSummaries(prev => ({ ...prev, [key]: data.summary }));
      } else if (data.summary) {
        setSummaries(prev => ({ ...prev, [key]: data.summary }));
      } else if (data.error) {
        setSummaries(prev => ({ ...prev, [key]: `Error: ${data.error}` }));
      } else {
        setSummaries(prev => ({ ...prev, [key]: 'Failed to generate summary.' }));
      }
      // Increment AI analysis count (topics explored) metric
      try {
        const current = parseInt(localStorage.getItem('hc_ai_analysis_count') || '0', 10);
        localStorage.setItem('hc_ai_analysis_count', String(current + 1));
      } catch {}
    } catch (e) {
      console.error('Summary generation failed', e);
      setSummaries(prev => ({ ...prev, [key]: 'Failed to generate summary.' }));
    } finally {
      setIsGeneratingSummary(prev => ({ ...prev, [key]: false }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  // Image modal component
  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="relative max-w-4xl max-h-[90vh] w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <img 
              src={image.src}
              alt={image.alt}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            {(image.alt || image.caption) && (
              <div className="p-4 bg-slate-800">
                {image.alt && <p className="text-white font-medium mb-1">{image.alt}</p>}
                {image.caption && <p className="text-slate-300 text-sm">{image.caption}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <ContentSkeleton />;
  }

  if (error) {
    return (
      <div className="container-premium pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/main" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
              <ArrowLeft size={18} />
              Back to Search Results
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-400 mb-4">
                <ExternalLink size={48} className="mx-auto" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Failed to Load Content</h1>
              <p className="text-slate-300 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container-premium pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Content Not Found</h1>
          <Link to="/main" className="text-blue-400 hover:text-blue-300">
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      <div className="container-premium pt-36 sm:pt-40 pb-12">
        <div className="max-w-4xl mb-10 pt-30  mx-auto">
        {/* Back Button - Fixed positioning */}
        <div className="mb-6">
          <Link to="/main" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
            <ArrowLeft size={18} />
            Back to Search Results
          </Link>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          
          <div className="glass-effect p-5 sm:p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src={content.favicon} 
                  alt="Site favicon"
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <FileText size={20} className="text-slate-500 hidden" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">{content.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>{content.domain}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {content.readTime}
                  </span>
                  <span>By {content.author}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <a 
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                    View Original
                  </a>
                  <button 
                    onClick={() => copyToClipboard(content.url)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                    Copy URL
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="glass-effect p-5 sm:p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            Table of Contents
          </h2>
          <div className="space-y-2">
            {(content.sections || []).map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {expandedSections[section.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {section.title}
                </button>
                {expandedSections[section.id] && (
                  <div className="ml-6 mt-2 space-y-1">
                    {section.subsections.map((subsection) => (
                      <a
                        key={subsection.id}
                        href={`#${section.id}-${subsection.id}`}
                        className="block text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {subsection.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {content.sections.map((section) => (
            <div key={section.id} className="glass-effect p-5 sm:p-6 rounded-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-3">
                <span className="text-gradient">{section.title}</span>
              </h2>
              
              <div className="space-y-6">
                {(section.subsections || []).map((subsection) => {
                  const subsectionKey = `${section.id}-${subsection.id}`;
                  const isExpanded = expandedSubsections[subsectionKey];
                  
                  return (
                    <div key={subsection.id} id={subsectionKey} className="border-l-2 border-blue-500/30 pl-4 sm:pl-6">
                      <button
                        onClick={() => toggleSubsection(section.id, subsection.id)}
                        className="flex items-center justify-between w-full text-left mb-4 group"
                      >
                        <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {subsection.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateSummary(section.id, subsection.id);
                            }}
                            disabled={isGeneratingSummary[subsectionKey]}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Generate AI Summary"
                          >
                            <Sparkles size={16} className={isGeneratingSummary[subsectionKey] ? 'animate-spin' : ''} />
                          </button>
                          {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="space-y-6">
                          {/* AI Summary */}
                          {summaries[subsectionKey] && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                              <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                                <Sparkles size={16} />
                                AI Summary
                              </h4>
                              <p className="text-slate-300 text-sm leading-relaxed">
                                {summaries[subsectionKey]}
                              </p>
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="prose prose-invert max-w-none space-y-4">
                            {subsection.content
                              ?.split(/\n\n+/)
                              .filter(p => p.trim().length > 0)
                              .map((para, i) => (
                                <p key={i} className="text-slate-300 leading-relaxed">{para}</p>
                              )) || <p className="text-slate-500 italic">No content extracted.</p>}
                          </div>

                          {/* Related Links */}
                          {subsection.links && subsection.links.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-white font-semibold flex items-center gap-2">
                                <ExternalLink size={16} />
                                Related Links ({subsection.links.length})
                              </h4>
                              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                                {subsection.links.map((link, index) => {
                                  // Extract domain for favicon
                                  let domain = '';
                                  try {
                                    domain = new URL(link.href).hostname;
                                  } catch {}
                                  
                                  return (
                                    <a
                                      key={index}
                                      href={link.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group flex items-start gap-3 p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200"
                                    >
                                      <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mt-0.5">
                                        {domain ? (
                                          <img 
                                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                                            alt=""
                                            className="w-4 h-4"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'block';
                                            }}
                                          />
                                        ) : null}
                                        <ExternalLink size={14} className={`text-slate-400 ${domain ? 'hidden' : 'block'}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-blue-400 group-hover:text-blue-300 font-medium text-sm line-clamp-2 transition-colors">
                                          {link.text}
                                        </p>
                                        {link.description && link.description !== "External link" && (
                                          <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                                            {link.description}
                                          </p>
                                        )}
                                        {domain && (
                                          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                            <Info size={10} />
                                            {domain}
                                          </p>
                                        )}
                                      </div>
                                      <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Images */}
                          {subsection.images && subsection.images.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-white font-semibold flex items-center gap-2">
                                <Image size={16} />
                                Images & Diagrams ({subsection.images.length})
                              </h4>
                              <div className={`grid gap-4 ${
                                subsection.images.length === 1 
                                  ? 'grid-cols-1' 
                                  : subsection.images.length === 2 
                                    ? 'grid-cols-1 md:grid-cols-2' 
                                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                              }`}>
                                {subsection.images.map((image, index) => (
                                  <div 
                                    key={index} 
                                    className="group relative bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-800/70 transition-all duration-300"
                                    onClick={() => setSelectedImage(image)}
                                  >
                                    <div className="aspect-video bg-slate-700 relative overflow-hidden">
                                      <img 
                                        src={image.src} 
                                        alt={image.alt}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.parentNode.innerHTML = `
                                            <div class="w-full h-full flex items-center justify-center text-slate-500">
                                              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                              </svg>
                                            </div>
                                          `;
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <ZoomIn 
                                          size={24} 
                                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                      </div>
                                    </div>
                                    {(image.alt || image.caption) && (
                                      <div className="p-3">
                                        {image.alt && (
                                          <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                                            {image.alt}
                                          </p>
                                        )}
                                        {image.caption && image.caption !== image.alt && (
                                          <p className="text-slate-400 text-xs line-clamp-2">
                                            {image.caption}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default ContentDetail;