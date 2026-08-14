'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Smartphone,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  Trash2,
  Laptop,
  LogOut,
  Save,
} from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl: string;
  mfaEnabled: boolean;
  status: string;
}

export function ProfileSettingsView() {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'apikeys' | 'sessions'>('profile');

  // Profile Form State
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aegis_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          return {
            fullName: u.fullName || 'Security Officer',
            email: u.email || 'officer@aegisai.io',
            role: u.role || 'Lead SecOps Engineer',
            organization: u.organization || 'Aegis Security Corp',
            avatarUrl: (u.fullName || 'SO').substring(0, 2).toUpperCase(),
            mfaEnabled: true,
            status: 'ACTIVE',
          };
        } catch (_) {}
      }
    }
    return {
      fullName: 'Security Officer',
      email: 'officer@aegisai.io',
      role: 'Lead SecOps Engineer',
      organization: 'Aegis Security Corp',
      avatarUrl: 'SO',
      mfaEnabled: true,
      status: 'ACTIVE',
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [mfaPasscode, setMfaPasscode] = useState('982401');
  const [passcodeMsg, setPasscodeMsg] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    { id: 'key_1', name: 'Production Tracker SDK', key: 'aegis_live_99812a...77b1', createdAt: '2026-08-01', status: 'ACTIVE' },
    { id: 'key_2', name: 'FastAPI Microservice Bridge', key: 'aegis_live_44102b...88c2', createdAt: '2026-08-03', status: 'ACTIVE' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Active Sessions State
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess_1',
      device: 'MacBook Pro M2 (macOS 14.3)',
      browser: 'Chrome 122.0',
      ip: '198.51.100.42',
      location: 'San Francisco, CA, USA',
      isCurrent: true,
      lastActive: 'Just now',
    },
    {
      id: 'sess_2',
      device: 'iPhone 15 Pro (iOS 17.2)',
      browser: 'Safari Mobile',
      ip: '172.56.21.99',
      location: 'Oakland, CA, USA',
      isCurrent: false,
      lastActive: '2 hours ago',
    },
  ]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('aegis_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setProfile((prev) => ({
            ...prev,
            fullName: u.fullName || prev.fullName,
            email: u.email || prev.email,
            avatarUrl: u.fullName ? u.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'GS',
          }));
        } catch (_) {}
      }

      const storedCode = localStorage.getItem('aegis_mfa_code');
      if (storedCode) {
        setMfaPasscode(storedCode);
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aegis_user');
      const parsed = stored ? JSON.parse(stored) : {};
      const updatedUser = {
        ...parsed,
        fullName: profile.fullName,
        email: profile.email,
      };
      localStorage.setItem('aegis_user', JSON.stringify(updatedUser));
      setProfile((prev) => ({
        ...prev,
        avatarUrl: profile.fullName ? profile.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'GS',
      }));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveMfaPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaPasscode.length === 6) {
      localStorage.setItem('aegis_mfa_code', mfaPasscode);
      setPasscodeMsg(true);
      setTimeout(() => setPasscodeMsg(false), 3000);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  const handleCreateApiKey = () => {
    if (!newKeyName) return;
    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `aegis_live_${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleTerminateSession = (id: string) => {
    setActiveSessions(activeSessions.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Title Header Banner */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold text-lg shadow-xs">
            {profile.avatarUrl}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">{profile.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                {profile.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-light mt-0.5">{profile.role} • {profile.organization}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Biometric Baseline Enrolled</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-zinc-200/80 pb-3 overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Organization</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveSubTab('apikeys')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'apikeys'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys & SDK Tokens</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sessions')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'sessions'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Active Sessions ({activeSessions.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Profile & Organization */}
      {activeSubTab === 'profile' && (
        <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Personal Information</h3>
                <p className="text-xs text-zinc-500 font-light">Update your account details and organizational role</p>
              </div>
              {savedSuccess && (
                <div className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile Saved!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-700">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-700">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-700">Job Title / Role</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-700">Organization Name</label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: Security & Password */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs">
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="text-sm font-bold text-zinc-900">Update Account Password</h3>
                <p className="text-xs text-zinc-500 font-light">Passwords are hashed using high-security Argon2id encryption</p>
              </div>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-zinc-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-zinc-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-zinc-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-start">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Adaptive MFA Passcode Configurator Card */}
          <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs">
            <form onSubmit={handleSaveMfaPasscode} className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-zinc-900" />
                    <h3 className="text-sm font-bold text-zinc-900">Adaptive Step-Up 2FA Security Passcode</h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-light mt-1">
                    Set your custom 6-digit passcode required during risk challenges.
                  </p>
                </div>
                {passcodeMsg && (
                  <div className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passcode Saved!</span>
                  </div>
                )}
              </div>

              <div className="max-w-md space-y-2 text-left">
                <label className="text-xs font-semibold text-zinc-700">Official 6-Digit Verification Code</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaPasscode}
                    onChange={(e) => setMfaPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="982401"
                    className="w-40 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-base tracking-[0.2em] text-zinc-900 text-center focus:outline-none focus:border-zinc-900"
                  />
                  <button
                    type="submit"
                    disabled={mfaPasscode.length !== 6}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white disabled:opacity-40 hover:bg-zinc-800 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Save Passcode
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Default passcode is <span className="text-zinc-900 font-bold">982401</span>.
                </p>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication Status Card */}
          <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-900">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Two-Factor Step-Up Authentication (TOTP)</h4>
                <p className="text-xs text-zinc-500 font-light">
                  Adaptive TOTP challenge triggers automatically when session risk score exceeds 70%
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
              ENABLED
            </span>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: API Keys & SDK Tokens */}
      {activeSubTab === 'apikeys' && (
        <div className="space-y-6">
          {/* Create API Key Form */}
          <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">AegisTracker SDK API Keys</h3>
              <p className="text-xs text-zinc-500 font-light">Use these API keys to initialize client-side telemetry ingestion in your apps</p>
            </div>

            <div className="flex items-center space-x-3 max-w-lg">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Description (e.g. Staging React App)"
                className="flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-sans"
              />
              <button
                onClick={handleCreateApiKey}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs transition-colors flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Key</span>
              </button>
            </div>
          </div>

          {/* API Keys Table */}
          <div className="border border-zinc-200/80 rounded-2xl bg-white shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Key Description</th>
                  <th className="px-5 py-3 font-semibold">API Secret Key</th>
                  <th className="px-5 py-3 font-semibold">Created Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-zinc-900">{key.name}</td>
                    <td className="px-5 py-3 font-mono text-zinc-600 flex items-center space-x-2">
                      <span>{key.key}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(key.key)}
                        className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="px-5 py-3 text-zinc-500 font-mono">{key.createdAt}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                        {key.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleRevokeApiKey(key.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Active Device Sessions */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-4">
          <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Active Authenticated Devices</h3>
              <p className="text-xs text-zinc-500 font-light">Manage device sessions actively transmitting biometric telemetry</p>
            </div>
            <button
              onClick={() => setActiveSessions(activeSessions.filter((s) => s.isCurrent))}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Revoke All Other Sessions</span>
            </button>
          </div>

          <div className="space-y-3">
            {activeSessions.map((sess) => (
              <div
                key={sess.id}
                className="border border-zinc-200/80 rounded-2xl p-4 bg-white shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-zinc-900">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 flex items-center space-x-3 font-mono">
                      <span>IP: {sess.ip}</span>
                      <span>•</span>
                      <span>Location: {sess.location}</span>
                      <span>•</span>
                      <span>Last active: {sess.lastActive}</span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleTerminateSession(sess.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 text-xs text-rose-600 font-semibold transition-colors cursor-pointer font-mono"
                  >
                    Terminate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
