import React from 'react';
import { Element } from 'react-scroll';
import { 
  Brain, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone,
  Heart,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API Docs', href: '#api' },
      { name: 'Integrations', href: '#integrations' }
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' }
    ],
    resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'Help Center', href: '#help' },
      { name: 'Community', href: '#community' },
      { name: 'Status', href: '#status' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' }
    ]
  };

  const socialLinks = [
    { icon: Github, href: '#github', label: 'GitHub' },
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: Mail, href: '#email', label: 'Email' }
  ];

  return (
    <Element name="contact">
      <footer className="relative bg-slate-950 border-t border-slate-800">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <div className="container-premium relative z-10">
          
          {/* Main Footer Content */}
          <div className="py-12 sm:py-16">
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-5">
              
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Brain size={28} className="text-white" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    Half<span className="text-gradient">Circuit</span>
                  </div>
                </div>
                
                <p className="text-slate-300 text-lg mb-8 max-w-md leading-relaxed">
                  Transforming how you discover, analyze, and organize knowledge with 
                  cutting-edge AI technology and intelligent automation.
                </p>

                {/* Contact Info */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail size={18} />
                    <span>hello@halfcircuit.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={18} />
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="p-3 glass-effect rounded-xl text-slate-400 hover:text-white hover:bg-white/20 transition-all hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Link Sections */}
              <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category}>
                    <h3 className="text-white font-bold text-lg mb-6 capitalize">
                      {category}
                    </h3>
                    <ul className="space-y-4">
                      {links.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-slate-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter Section removed as requested */}

          {/* Bottom Bar */}
          <div className="py-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              
              {/* Copyright */}
              <div className="text-slate-400 text-center md:text-left">
                <p className="flex items-center gap-2">
                  © 2025 Half Circuit. Made with 
                  <Heart size={16} className="text-red-500" />
                  in San Francisco
                </p>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Zap size={16} />
                  <span>React</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain size={16} />
                  <span>FastAPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>Global CDN</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        
      </footer>
    </Element>
  );
};

export default Footer;
