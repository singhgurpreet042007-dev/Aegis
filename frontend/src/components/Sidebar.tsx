'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Cpu,
  TrendingUp,
  FolderKanban,
  Bot,
  Eye,
  Dna,
  Zap,
  BrainCircuit,
  Globe,
  ShieldAlert,
  Sliders,
  Link2,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  FileText,
  CreditCard,
  LogOut,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export type NavTab =
  | 'dashboard'
  | 'ensemble'
  | 'drift'
  | 'sessions'
  | 'sentinel'
  | 'honeypot'
  | 'dna'
  | 'simulator'
  | 'analytics'
  | 'threat-map'
  | 'alerts'
  | 'policies'
  | 'integrations'
  | 'team'
  | 'docs'
  | 'billing'
  | 'profile';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  currentUser?: { fullName?: string; email?: string; role?: string } | null;
  onOpenConnectSite?: () => void;
}

import { useConnectedWebsite } from '@/lib/aegis-website';
import { useSubscription } from '@/lib/useSubscription';

export function Sidebar({
  activeTab,
  setActiveTab,
  alertCount = 4,
  isMobileOpen = false,
  onCloseMobile,
  currentUser,
  onOpenConnectSite,
}: SidebarProps) {
  const router = useRouter();
  const { connectedSite, isConnected } = useConnectedWebsite();
  const subscription = useSubscription();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userObj, setUserObj] = useState<{ fullName?: string; email?: string; role?: string } | null>(currentUser || null);

  useEffect(() => {
    if (currentUser) {
      setUserObj(currentUser);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aegis_user');
      if (stored) {
        try {
          setUserObj(JSON.parse(stored));
        } catch (_) {}
      }
    }
  }, [currentUser]);

  const userName = userObj?.fullName || 'Security Officer';
  const userRole = userObj?.role || 'SecOps Lead';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SO';

  // Keyboard shortcut listener (Ctrl+B or Cmd+H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'b') || (e.metaKey && e.key.toLowerCase() === 'h')) {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navCategories = [
    {
      title: 'Command Center',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'sessions', label: 'Sessions & Replay', icon: FolderKanban },
        { id: 'risk', label: 'Risk & Behavior', icon: Cpu, badge: 'PRO' },
      ],
    },
    {
      title: 'Security & Intelligence',
      items: [
        { id: 'alerts', label: 'Alerts & Verification', icon: ShieldAlert, badge: alertCount },
        {
          id: 'attack-surface',
          label: 'Attack Surface & Posture',
          icon: ShieldCheck,
          badge: isConnected ? '🟢 Active' : '⚡ Connect',
        },
        { id: 'sandbox', label: 'Deception & Red Team', icon: Eye, badge: 'SANDBOX' },
        { id: 'integrations', label: 'SIEM & Webhooks', icon: Link2 },
        { id: 'policies', label: 'Policy Rules', icon: Sliders },
      ],
    },
    {
      title: 'Management & Docs',
      items: [
        { id: 'billing', label: 'Billing & Plans 💳', icon: CreditCard, badge: 'PRO' },
        { id: 'reports', label: 'Reports & Export', icon: FileText },
        { id: 'docs', label: 'Developer & SDK', icon: BookOpen, badge: 'HELP' },
        { id: 'profile', label: 'Settings', icon: Users },
      ],
    },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aegis_token');
      localStorage.removeItem('aegis_user');
    }
    router.replace('/login');
  };

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = (collapsed: boolean, isMobile = false) => (
    <>
      {/* ══ TOP SECTION: Header & Branding ══ */}
      <div className="p-3 relative z-10">
        {/* Header row with controls & collapse toggle */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-3 px-1`}>
          {!collapsed && (
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block opacity-80" />
            </div>
          )}

          <div className="flex items-center space-x-1">
            {!collapsed && !isMobile && (
              <div
                className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[9px] font-mono text-zinc-500"
                title="Keyboard Shortcut: Ctrl+B or ⌘H"
              >
                ⌘H
              </div>
            )}

            {!isMobile ? (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500 hover:text-zinc-900 cursor-pointer"
                title={collapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            ) : (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500 hover:text-zinc-900 cursor-pointer"
                title="Close Mobile Menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Aegis AI Brand Title */}
        <div
          onClick={() => handleItemClick('dashboard')}
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'space-x-2.5 px-1'
          } cursor-pointer group py-1 border-b border-zinc-200/80 pb-3`}
        >
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <ShieldCheck className="w-4.5 h-4.5 text-white" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1">
                <span className="text-[15px] font-bold text-zinc-900 tracking-tight font-sans">
                  Aegis<span className="text-zinc-400 font-medium ml-0.5">AI</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">®</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono truncate">Zero Trust Security Platform</p>
            </div>
          )}
        </div>

        {/* ══ TARGET WEBSITE CONNECTOR QUICK ACTION ══ */}
        <div className="mt-3 px-1">
          {!collapsed ? (
            <div
              onClick={() => {
                if (onOpenConnectSite) {
                  onOpenConnectSite();
                } else {
                  handleItemClick('integrations');
                }
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between ${
                isConnected
                  ? 'bg-emerald-50/90 border-emerald-200 hover:bg-emerald-100/90 text-emerald-900'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-sm'
              }`}
              title="Click to Connect or Switch Target Website"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Globe className={`w-4 h-4 shrink-0 ${isConnected ? 'text-emerald-600' : 'text-white animate-pulse'}`} />
                <div className="truncate">
                  <div className="font-bold text-[11px] truncate">
                    {isConnected ? connectedSite?.domain : '⚡ Connect Target Site'}
                  </div>
                  <div className={`text-[9px] font-mono truncate ${isConnected ? 'text-emerald-700' : 'text-amber-100'}`}>
                    {isConnected ? '🟢 Active Monitoring' : 'Tap to Add Site URL ➕'}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                isConnected ? 'bg-emerald-200/70 text-emerald-800' : 'bg-white/20 text-white'
              }`}>
                {isConnected ? 'Change' : 'Add'}
              </span>
            </div>
          ) : (
            <div
              onClick={() => {
                if (onOpenConnectSite) onOpenConnectSite();
                else handleItemClick('integrations');
              }}
              className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 border ${
                isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-500 border-amber-600 text-white animate-pulse'
              }`}
              title={isConnected ? `Target: ${connectedSite?.domain}` : 'Connect Target Website'}
            >
              <Globe className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* ══ NAVIGATION CATEGORIES ══ */}
        <div className="mt-3 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-none pr-0.5">
          {navCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  {cat.title}
                </div>
              )}

              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <div key={item.id} className="relative group">
                      <motion.button
                        onClick={() => handleItemClick(item.id)}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center relative ${
                          collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2 space-x-2.5'
                        } ${isMobile ? 'min-h-[44px]' : ''} rounded-xl text-xs font-medium transition-colors duration-150 cursor-pointer ${
                          isActive
                            ? 'text-white font-semibold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900 border border-transparent'
                        }`}
                      >
                        {/* Smooth sliding active background pill */}
                        {isActive && (
                          <motion.div
                            layoutId={isMobile ? 'activeSidebarBgMobile' : 'activeSidebarBg'}
                            className="absolute inset-0 bg-zinc-900 rounded-xl z-0"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}

                        <Icon className={`w-4 h-4 shrink-0 z-10 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-900'}`} />

                        {!collapsed && (
                          <span className="truncate flex-1 text-left z-10">{item.label}</span>
                        )}

                        {!collapsed && item.badge !== undefined && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                              typeof item.badge === 'number'
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : isActive
                                ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </motion.button>

                      {/* Tooltip for Collapsed Mode */}
                      {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-zinc-900 text-white text-xs font-medium rounded-md shadow-xl border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50">
                          {item.label}
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

      {/* ══ BOTTOM SECTION: Dynamic User Profile & Logout ══ */}
      <div className="p-3 border-t border-zinc-200/80 relative z-10">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1`}>
          {!collapsed ? (
            <div
              onClick={() => handleItemClick('profile')}
              className="flex items-center space-x-2.5 cursor-pointer group flex-1 min-w-0"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-200 flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0">
                {userInitials}
              </div>
              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-zinc-900 truncate">{userName}</div>
                <div className="text-[10px] font-mono truncate text-emerald-700 font-bold">
                  {subscription.activePlan === 'enterprise'
                    ? 'ENTERPRISE 👑'
                    : subscription.isPaidPlan
                    ? 'PRO SEC-OPS ⚡'
                    : 'STARTER (FREE)'}
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleItemClick('profile')}
              className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-200 flex items-center justify-center text-[10px] font-mono font-bold text-white cursor-pointer"
              title={`${userName} (${userRole})`}
            >
              {userInitials}
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-900 cursor-pointer ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ══ DESKTOP PERSISTENT SIDEBAR ══ */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 68 : 240 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex flex-col justify-between h-screen bg-white border-r border-zinc-200/80 text-zinc-900 select-none z-40 shrink-0 font-sans shadow-xs"
      >
        {renderNavContent(isCollapsed, false)}
      </motion.aside>

      {/* ══ MOBILE SLIDE-OVER DRAWER & BACKDROP OVERLAY ══ */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Mobile Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-zinc-200/80 text-zinc-900 select-none z-50 flex flex-col justify-between font-sans shadow-2xl md:hidden"
            >
              {renderNavContent(false, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

