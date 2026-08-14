'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Github } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (path: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const router = useRouter();

  const handleCTA = () => {
    if (onNavigate) onNavigate('/login');
    else router.push('/login');
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[100] bg-white transition-all duration-300"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full px-6 md:px-12 flex items-center justify-between h-[64px]">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-bold text-zinc-900 tracking-tight font-sans">
            Aegis<span className="text-zinc-400 font-medium ml-0.5">AI</span>
          </span>
        </Link>

        {/* Center Cursive Editorial Tagline */}
        <div className="hidden md:block">
          <span className="font-serif-italic italic text-zinc-500 font-light text-[14.5px] tracking-wide">
            &ldquo;Post-login zero-trust biometrics identity shield&rdquo;
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-6 font-sans">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-zinc-900 transition-colors p-1"
          >
            <Github className="w-4 h-4" />
          </a>
          <button
            onClick={handleCTA}
            className="text-zinc-900 font-medium text-[13.5px] hover:text-zinc-600 transition-colors flex items-center space-x-1.5 group cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-800 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
