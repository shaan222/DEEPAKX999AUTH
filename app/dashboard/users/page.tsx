'use client'

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';

// Animated Counter Component
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startValueRef = useRef(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      startValueRef.current = 0;
      return;
    }

    setIsAnimating(true);
    let startTime: number;
    startValueRef.current = displayValue;

    const animate = (currentTime: number) => {
      if (!startTime) {
        startTime = currentTime;
      }
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValueRef.current + (value - startValueRef.current) * easeOutQuart);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={isAnimating ? 'tabular-nums' : ''}>{displayValue.toLocaleString()}</span>;
}

interface AppUser {
  id: string;
  username: string;
  email?: string;
  licenseKey?: string;
  createdAt: string;
  lastLogin?: string;
  hwid?: string;
  lastIp?: string;  // Last IP address used for login
  appId: string;
  banned?: boolean;
  paused?: boolean;
  expiresAt?: string;  // Expiration date/time for the user
  hwidLocked?: boolean;  // Whether HWID is locked for this user
}

interface Application {
  id: string;
  name: string;
  apiKey?: string;  // API Key (starts with 'sk_')
  currentVersion?: string;
  minimumVersion?: string;
}

export default function AllUsersPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingVersionApp, setEditingVersionApp] = useState<Application | null>(null);
  const [versionCurrent, setVersionCurrent] = useState('');
  const [versionMinimum, setVersionMinimum] = useState('');
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [expiresAt, setExpiresAt] = useState('');  // Expiration date/time
  const [hwidLocked, setHwidLocked] = useState(false);  // HWID lock status
  const [creating, setCreating] = useState(false);
  const [availableLicenses, setAvailableLicenses] = useState<any[]>([]);
  const [filterAppId, setFilterAppId] = useState('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');  // Edit expiration date
  const [editHwidLocked, setEditHwidLocked] = useState(false);  // Edit HWID lock status
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);
  const [totalLicenses, setTotalLicenses] = useState(0);
  const [showSensitiveData, setShowSensitiveData] = useState(false); // Toggle for sensitive data visibility
  const [selectedLang, setSelectedLang] = useState('javascript'); // Selected programming language for credentials

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside both the button and dropdown
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        !target.closest('.dropdown-menu')
      ) {
        setOpenDropdown(null);
      }
    };

    // Update dropdown position on scroll
    const updateDropdownPosition = () => {
      if (openDropdown) {
        const button = document.querySelector(`[data-user-id="${openDropdown}"]`) as HTMLElement;
        if (button) {
          const rect = button.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.right - 192
          });
        }
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [openDropdown]);

  useEffect(() => {
    if (applications.length > 0) {
      fetchAllUsers();
      fetchSubscriptionStats();
      fetchTotalLicenses();
    }
  }, [applications]);

  useEffect(() => {
    if (selectedAppId) {
      fetchLicensesForApp(selectedAppId);
    }
  }, [selectedAppId]);

  const fetchApplications = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/application/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch {
      toast.error('Failed to fetch applications');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = await user?.getIdToken();
      
      // Fetch users from all applications
      const allUsers: AppUser[] = [];
      for (const app of applications) {
        const response = await fetch(`/api/user/list?appId=${app.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.users) {
          allUsers.push(...data.users.map((u: any) => ({ ...u, appId: app.id })));
        }
      }
      
      setUsers(allUsers);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchLicensesForApp = async (appId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/license/list?appId=${appId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAvailableLicenses(data.licenses || []);
    } catch {
      console.error('Failed to fetch licenses');
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/subscription/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSubscriptionStats(data);
      }
    } catch {
      console.error('Failed to fetch subscription stats');
    }
  };

  const fetchTotalLicenses = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/license/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTotalLicenses(data.licenses?.length || 0);
    } catch {
      console.error('Failed to fetch total licenses');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppId) {
      toast.error('Please select an application');
      return;
    }

    if (!username || !password) {
      toast.error('Username and password are required');
      return;
    }

    setCreating(true);

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: selectedAppId,
          username,
          password,
          email: email || undefined,
          licenseKey: licenseKey || undefined,
          expiresAt: expiresAt || undefined,
          hwidLocked: hwidLocked,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User created successfully!');
        setShowCreateModal(false);
        setSelectedAppId('');
        setUsername('');
        setPassword('');
        setEmail('');
        setLicenseKey('');
        setExpiresAt('');
        setHwidLocked(false);
        setAvailableLicenses([]);
        fetchAllUsers();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch {
      toast.error('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string, appId: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, appId }),
      });

      if (response.ok) {
        toast.success('User deleted');
        fetchAllUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    }
    setOpenDropdown(null);
  };

  const handleResetHWID = async (userId: string, username: string, appId: string, _hwidLocked?: boolean) => {
    if (!confirm(`⚠️ Reset HWID for user "${username}"?\n\nThis will:\n• Clear their current device binding\n• Allow them to login from a new device\n• They will be locked to the new device on next login`)) {
      setOpenDropdown(null);
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/reset-hwid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userDocId: userId, appId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ HWID reset! User can login from new device');
        fetchAllUsers();
      } else {
        toast.error(data.error || 'Failed to reset HWID');
      }
    } catch {
      toast.error('Failed to reset HWID');
    }
    setOpenDropdown(null);
  };

  const handleBanUser = async (userId: string, username: string, appId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'Unban' : 'Ban';
    if (!confirm(`${action} user "${username}"?`)) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId, 
          appId,
          updates: { banned: !currentlyBanned }
        }),
      });

      if (response.ok) {
        toast.success(`User ${currentlyBanned ? 'unbanned' : 'banned'} successfully`);
        fetchAllUsers();
      } else {
        toast.error(`Failed to ${action.toLowerCase()} user`);
      }
    } catch {
      toast.error(`Failed to ${action.toLowerCase()} user`);
    }
    setOpenDropdown(null);
  };

  const handlePauseUser = async (userId: string, username: string, appId: string, currentlyPaused: boolean) => {
    const action = currentlyPaused ? 'Unpause' : 'Pause';
    if (!confirm(`${action} user "${username}"?`)) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId, 
          appId,
          updates: { paused: !currentlyPaused }
        }),
      });

      if (response.ok) {
        toast.success(`User ${currentlyPaused ? 'unpaused' : 'paused'} successfully`);
        fetchAllUsers();
      } else {
        toast.error(`Failed to ${action.toLowerCase()} user`);
      }
    } catch {
      toast.error(`Failed to ${action.toLowerCase()} user`);
    }
    setOpenDropdown(null);
  };

  const handleEditUser = (appUser: AppUser) => {
    setEditingUser(appUser);
    setEditUsername(appUser.username);
    setEditEmail(appUser.email || '');
    setEditPassword('');
    // Set expiration date in date-only format (YYYY-MM-DD)
    if (appUser.expiresAt) {
      const date = new Date(appUser.expiresAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setEditExpiresAt(`${year}-${month}-${day}`);
    } else {
      setEditExpiresAt('');
    }
    setEditHwidLocked(appUser.hwidLocked || false);
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const updates: any = {
        username: editUsername,
        email: editEmail || null,
        hwidLocked: editHwidLocked,
      };

      if (editPassword) {
        updates.password = editPassword;
      }

      // Add expiration date if provided
      if (editExpiresAt) {
        updates.expiresAt = new Date(editExpiresAt).toISOString();
      } else {
        updates.expiresAt = null;
      }

      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId: editingUser.id, 
          appId: editingUser.appId,
          updates
        }),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
        fetchAllUsers();
      } else {
        toast.error('Failed to update user');
      }
    } catch {
      toast.error('Failed to update user');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleEditVersion = (app: Application) => {
    setEditingVersionApp(app);
    setVersionCurrent(app.currentVersion || '1.0.0');
    setVersionMinimum(app.minimumVersion || '1.0.0');
    setShowVersionModal(true);
  };

  const handleUpdateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVersionApp) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/application/update-version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: editingVersionApp.id,
          currentVersion: versionCurrent,
          minimumVersion: versionMinimum,
        }),
      });

      if (response.ok) {
        toast.success('Version updated successfully!');
        setShowVersionModal(false);
        setEditingVersionApp(null);
        fetchApplications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update version');
      }
    } catch {
      toast.error('Failed to update version');
    }
  };

  const getIntegrationCode = (lang: string, app: Application) => {
    const baseUrl = 'https://www.DEEPAKX999AUTH.space/';
    
    const credentials: Record<string, string> = {
      javascript: `// Application Configuration
const DEEPAKX999AUTHConfig = {
  API_KEY: "${app.apiKey || app.id}",
  APP_ID: "${app.id}",
  APP_NAME: "${app.name}",
  BASE_URL: "${baseUrl}",
  CURRENT_VERSION: "${app.currentVersion || '1.0.0'}",
  MINIMUM_VERSION: "${app.minimumVersion || '1.0.0'}"
};

// Usage in your application
const apiKey = DEEPAKX999AUTHConfig.API_KEY;
const appId = DEEPAKX999AUTHConfig.APP_ID;
const endpoint = \`\${DEEPAKX999AUTHConfig.BASE_URL}/api/user/login\`;`,

      typescript: `// Application Configuration
interface IDEEPAKX999AUTHConfig {
  API_KEY: string;
  APP_ID: string;
  APP_NAME: string;
  BASE_URL: string;
  CURRENT_VERSION: string;
  MINIMUM_VERSION: string;
}

const DEEPAKX999AUTHConfig: IDEEPAKX999AUTHConfig = {
  API_KEY: "${app.apiKey || app.id}",
  APP_ID: "${app.id}",
  APP_NAME: "${app.name}",
  BASE_URL: "${baseUrl}",
  CURRENT_VERSION: "${app.currentVersion || '1.0.0'}",
  MINIMUM_VERSION: "${app.minimumVersion || '1.0.0'}"
};

// Usage in your application
const apiKey = DEEPAKX999AUTHConfig.API_KEY;
const appId = DEEPAKX999AUTHConfig.APP_ID;
const endpoint = \`\${DEEPAKX999AUTHConfig.BASE_URL}/api/user/login\`;`,

      python: `# Application Configuration
class DEEPAKX999AUTHConfig:
    API_KEY = "${app.apiKey || app.id}"
    APP_ID = "${app.id}"
    APP_NAME = "${app.name}"
    BASE_URL = "${baseUrl}"
    CURRENT_VERSION = "${app.currentVersion || '1.0.0'}"
    MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}"

# Usage in your application
api_key = DEEPAKX999AUTHConfig.API_KEY
app_id = DEEPAKX999AUTHConfig.APP_ID
endpoint = f"{DEEPAKX999AUTHConfig.BASE_URL}/api/user/login"`,

      csharp: `// Application Configuration
public class DEEPAKX999AUTHConfig
{
    public const string API_KEY = "${app.apiKey || app.id}";
    public const string APP_ID = "${app.id}";
    public const string APP_NAME = "${app.name}";
    public const string BASE_URL = "${baseUrl}";
    public const string CURRENT_VERSION = "${app.currentVersion || '1.0.0'}";
    public const string MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}";
}

// Usage in your application
string apiKey = DEEPAKX999AUTHConfig.API_KEY;
string appId = DEEPAKX999AUTHConfig.APP_ID;
string endpoint = $"{DEEPAKX999AUTHConfig.BASE_URL}/api/user/login";`,

      php: `<?php
// Application Configuration
class DEEPAKX999AUTHConfig {
    const API_KEY = "${app.apiKey || app.id}";
    const APP_ID = "${app.id}";
    const APP_NAME = "${app.name}";
    const BASE_URL = "${baseUrl}";
    const CURRENT_VERSION = "${app.currentVersion || '1.0.0'}";
    const MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}";
}

// Usage in your application
$apiKey = DEEPAKX999AUTHConfig::API_KEY;
$appId = DEEPAKX999AUTHConfig::APP_ID;
$endpoint = DEEPAKX999AUTHConfig::BASE_URL . "/api/user/login";
?>`,

      java: `// Application Configuration
public class DEEPAKX999AUTHConfig {
    public static final String API_KEY = "${app.apiKey || app.id}";
    public static final String APP_ID = "${app.id}";
    public static final String APP_NAME = "${app.name}";
    public static final String BASE_URL = "${baseUrl}";
    public static final String CURRENT_VERSION = "${app.currentVersion || '1.0.0'}";
    public static final String MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}";
}

// Usage in your application
String apiKey = DEEPAKX999AUTHConfig.API_KEY;
String appId = DEEPAKX999AUTHConfig.APP_ID;
String endpoint = DEEPAKX999AUTHConfig.BASE_URL + "/api/user/login";`,

      cpp: `// Application Configuration
class DEEPAKX999AUTHConfig {
public:
    static constexpr const char* API_KEY = "${app.apiKey || app.id}";
    static constexpr const char* APP_ID = "${app.id}";
    static constexpr const char* APP_NAME = "${app.name}";
    static constexpr const char* BASE_URL = "${baseUrl}";
    static constexpr const char* CURRENT_VERSION = "${app.currentVersion || '1.0.0'}";
    static constexpr const char* MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}";
};

// Usage in your application
const char* apiKey = DEEPAKX999AUTHConfig::API_KEY;
const char* appId = DEEPAKX999AUTHConfig::APP_ID;
std::string endpoint = std::string(DEEPAKX999AUTHConfig::BASE_URL) + "/api/user/login";`,

      go: `// Application Configuration
package main

const (
    API_KEY         = "${app.apiKey || app.id}"
    APP_ID          = "${app.id}"
    APP_NAME        = "${app.name}"
    BASE_URL        = "${baseUrl}"
    CURRENT_VERSION = "${app.currentVersion || '1.0.0'}"
    MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}"
)

// Usage in your application
apiKey := API_KEY
appId := APP_ID
endpoint := BASE_URL + "/api/user/login"`,

      rust: `// Application Configuration
pub struct DEEPAKX999AUTHConfig;

impl DEEPAKX999AUTHConfig {
    pub const API_KEY: &'static str = "${app.apiKey || app.id}";
    pub const APP_ID: &'static str = "${app.id}";
    pub const APP_NAME: &'static str = "${app.name}";
    pub const BASE_URL: &'static str = "${baseUrl}";
    pub const CURRENT_VERSION: &'static str = "${app.currentVersion || '1.0.0'}";
    pub const MINIMUM_VERSION: &'static str = "${app.minimumVersion || '1.0.0'}";
}

// Usage in your application
let api_key = DEEPAKX999AUTHConfig::API_KEY;
let app_id = DEEPAKX999AUTHConfig::APP_ID;
let endpoint = format!("{}/api/user/login", DEEPAKX999AUTHConfig::BASE_URL);`,

      ruby: `# Application Configuration
module DEEPAKX999AUTHConfig
  API_KEY = "${app.apiKey || app.id}"
  APP_ID = "${app.id}"
  APP_NAME = "${app.name}"
  BASE_URL = "${baseUrl}"
  CURRENT_VERSION = "${app.currentVersion || '1.0.0'}"
  MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}"
end

# Usage in your application
api_key = DEEPAKX999AUTHConfig::API_KEY
app_id = DEEPAKX999AUTHConfig::APP_ID
endpoint = "#{DEEPAKX999AUTHConfig::BASE_URL}/api/user/login"`,

      lua: `-- Application Configuration
local DEEPAKX999AUTHConfig = {
    API_KEY = "${app.apiKey || app.id}",
    APP_ID = "${app.id}",
    APP_NAME = "${app.name}",
    BASE_URL = "${baseUrl}",
    CURRENT_VERSION = "${app.currentVersion || '1.0.0'}",
    MINIMUM_VERSION = "${app.minimumVersion || '1.0.0'}"
}

-- Usage in your application
local apiKey = DEEPAKX999AUTHConfig.API_KEY
local appId = DEEPAKX999AUTHConfig.APP_ID
local endpoint = DEEPAKX999AUTHConfig.BASE_URL .. "/api/user/login"`
    };

    return credentials[lang] || credentials.javascript;
  };

  const getAppName = (appId: string) => {
    return applications.find(a => a.id === appId)?.name || 'Unknown';
  };

  const filteredUsers = filterAppId === 'all' 
    ? users 
    : users.filter(u => u.appId === filterAppId);

  const stats = {
    total: filteredUsers.length,
    withLicense: filteredUsers.filter(u => u.licenseKey).length,
    activeToday: filteredUsers.filter(u => u.lastLogin && 
      new Date(u.lastLogin) > new Date(Date.now() - 24*60*60*1000)
    ).length,
    totalApps: applications.length,
    totalLicenses: totalLicenses,
    subscriptionTier: subscriptionStats?.tier || 'free',
    usersLimit: subscriptionStats?.limits?.users?.limit ?? 20,
    usersUsed: subscriptionStats?.limits?.users?.current ?? 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
      {/* Header with fade-in animation */}
      <ScrollAnimateWrapper animation="fade">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Users & Clients 👥
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
            Manage all end-users across your applications
          </p>
        </div>
      </ScrollAnimateWrapper>

      {/* Comprehensive Stats Grid with animations */}
      <ScrollAnimateWrapper animation="scale">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {/* Total Users Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Total Users</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            <AnimatedCounter value={stats.total} />
          </div>
          <div className="mt-1 sm:mt-2 text-xs text-slate-500 dark:text-slate-400">
            {stats.usersUsed} / {stats.usersLimit === -1 ? '∞' : stats.usersLimit} used
          </div>
        </div>

        {/* Total Applications Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Applications</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            <AnimatedCounter value={stats.totalApps} />
          </div>
          <div className="mt-1 sm:mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across all apps
          </div>
        </div>

        {/* Total Licenses Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Licenses</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            <AnimatedCounter value={stats.totalLicenses} />
          </div>
          <div className="mt-1 sm:mt-2 text-xs text-slate-500 dark:text-slate-400">
            {stats.withLicense} users assigned
          </div>
        </div>

        {/* Active Today Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Active Today</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            <AnimatedCounter value={stats.activeToday} />
          </div>
          <div className="mt-1 sm:mt-2 text-xs text-slate-500 dark:text-slate-400">
            Last 24 hours
          </div>
        </div>
      </div>
      </ScrollAnimateWrapper>

      {/* Filter and Action Bar with smooth animations */}
      <ScrollAnimateWrapper animation="slide-left" delay={300}>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
              Filter by Application
            </label>
            <select
              value={filterAppId}
              onChange={(e) => setFilterAppId(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all duration-200"
            >
              <option value="all">All Applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Show/Hide Sensitive Data Toggle */}
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-full sm:w-auto sm:self-end"
            title={showSensitiveData ? "Hide sensitive data" : "Show sensitive data"}
          >
            {showSensitiveData ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <span className="hidden sm:inline">Hide</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">Show</span>
              </>
            )}
          </button>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={applications.length === 0}
          className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white px-4 sm:px-6 py-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create New User</span>
          <span className="sm:hidden">New User</span>
        </button>
      </div>
      </ScrollAnimateWrapper>

      {/* Users Table with animations */}
      <ScrollAnimateWrapper animation="fade" delay={400}>
      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No users found. Create your first user to get started!
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    License Key
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    HWID
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    HWID Lock
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200/60 dark:divide-slate-700">
                {filteredUsers.map((appUser, index) => (
                  <tr 
                    key={appUser.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${600 + index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {getAppName(appUser.appId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {appUser.username}
                        </div>
                        {appUser.banned && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            Banned
                          </span>
                        )}
                        {appUser.paused && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                            Paused
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {appUser.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {appUser.licenseKey ? (
                        <div className="flex items-center gap-2 group">
                          <code className={`text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded transition-all duration-300 ${!showSensitiveData ? 'blur-md group-hover:blur-none select-none group-hover:select-auto' : ''}`}>
                            {appUser.licenseKey}
                          </code>
                        <button
                          onClick={() => copyToClipboard(appUser.licenseKey!)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No license</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {appUser.lastLogin ? formatDate(appUser.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appUser.hwid ? (
                        <div className="flex items-center gap-2 group">
                          <code className={`text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-mono transition-all duration-300 ${!showSensitiveData ? 'blur-md group-hover:blur-none select-none group-hover:select-auto' : ''}`}>
                            {appUser.hwid.substring(0, 12)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(appUser.hwid!)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No HWID</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {appUser.lastIp ? (
                        <div className="flex items-center gap-2 group">
                          <code className={`text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-mono transition-all duration-300 ${!showSensitiveData ? 'blur-md group-hover:blur-none select-none group-hover:select-auto' : ''}`}>
                            {appUser.lastIp}
                          </code>
                          <button
                            onClick={() => copyToClipboard(appUser.lastIp!)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No IP</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(appUser.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {appUser.expiresAt ? (
                        <div className="flex items-center gap-2">
                          <span>{formatDate(appUser.expiresAt)}</span>
                          {new Date(appUser.expiresAt) < new Date() && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">No expiration</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appUser.hwidLocked ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 flex items-center gap-1 w-fit">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Locked
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 w-fit">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Unlocked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div ref={openDropdown === appUser.id ? dropdownRef : null}>
                        <button
                          data-user-id={appUser.id}
                          onClick={(e) => {
                            const target = e.currentTarget;
                            const rect = target.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + 4,
                              left: rect.right - 192
                            });
                            setOpenDropdown(openDropdown === appUser.id ? null : appUser.id);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-lg hover:from-slate-800 hover:to-slate-700 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          Actions
                          <svg 
                            className={`w-4 h-4 transition-transform ${openDropdown === appUser.id ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </ScrollAnimateWrapper>

      {/* Integration Codes Section */}
      {applications.length > 0 && (
        <ScrollAnimateWrapper animation="slide-left" delay={300}>
        <div className="mt-8 credentials-container rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2" role="heading" aria-level={2}>
              Application Credentials 🔑
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">Configure these credentials in your application</p>
          </div>

          {/* Application Selector */}
          <div className="mb-6">
            <label htmlFor="app-selector" className="block text-sm font-medium text-slate-300 mb-2">
              Select Application
            </label>
            <select
              id="app-selector"
              value={filterAppId === 'all' ? applications[0]?.id : filterAppId}
              onChange={(e) => setFilterAppId(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1724] border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] text-white transition-all"
              aria-label="Select application to view credentials"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {(() => {
            const selectedApp = applications.find(a => a.id === (filterAppId === 'all' ? applications[0]?.id : filterAppId)) || applications[0];
            const languages = [
              { key: 'javascript', label: 'JavaScript' },
              { key: 'typescript', label: 'TypeScript' },
              { key: 'python', label: 'Python' },
              { key: 'csharp', label: 'C#' },
              { key: 'java', label: 'Java' },
              { key: 'php', label: 'PHP' },
              { key: 'cpp', label: 'C++' },
              { key: 'go', label: 'Go' },
              { key: 'rust', label: 'Rust' },
              { key: 'ruby', label: 'Ruby' },
              { key: 'lua', label: 'Lua' }
            ];
            
            const code = getIntegrationCode(selectedLang, selectedApp);

            return (
              <>
                {/* Credential Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8" role="tabpanel" id={`${selectedLang}-panel`}>
                  {/* API Key Card */}
                  <div className="credentials-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-400">API Key / Owner ID</h3>
                      <button
                        onClick={() => copyToClipboard(selectedApp?.apiKey || selectedApp?.id || '')}
                        className="text-slate-400 hover:text-[#1F6FEB] transition-colors p-1.5 rounded hover:bg-slate-800/50"
                        aria-label="Copy API key"
                        title="Copy API Key"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <code className="block text-sm text-[#79C0FF] font-mono break-all">
                      {selectedApp?.apiKey || selectedApp?.id}
                    </code>
                  </div>

                  {/* App Name Card */}
                  <div className="credentials-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-400">Application Name</h3>
                      <button
                        onClick={() => copyToClipboard(selectedApp?.name || '')}
                        className="text-slate-400 hover:text-[#1F6FEB] transition-colors p-1.5 rounded hover:bg-slate-800/50"
                        aria-label="Copy application name"
                        title="Copy App Name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <code className="block text-sm text-[#79C0FF] font-mono break-all">
                      {selectedApp?.name}
                    </code>
                  </div>

                  {/* Base URL Card */}
                  <div className="credentials-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-400">Base URL</h3>
                      <button
                        onClick={() => copyToClipboard('https://www.DEEPAKX999AUTH.space/')}
                        className="text-slate-400 hover:text-[#1F6FEB] transition-colors p-1.5 rounded hover:bg-slate-800/50"
                        aria-label="Copy base URL"
                        title="Copy Base URL"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <code className="block text-sm text-[#79C0FF] font-mono break-all">
                      https://www.DEEPAKX999AUTH.space/
                    </code>
                  </div>

                  {/* Current Version Card */}
                  <div className="credentials-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-400">Current Version</h3>
                      <button
                        onClick={() => selectedApp && handleEditVersion(selectedApp)}
                        className="text-slate-400 hover:text-[#1F6FEB] transition-colors p-1.5 rounded hover:bg-slate-800/50"
                        aria-label="Edit version"
                        title="Edit Version"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                    <code className="block text-sm text-[#79C0FF] font-mono">
                      v{selectedApp?.currentVersion || '1.0.0'}
                    </code>
                  </div>

                  {/* Minimum Version Card */}
                  <div className="credentials-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-400">Minimum Version</h3>
                      <button
                        onClick={() => copyToClipboard(selectedApp?.minimumVersion || '1.0.0')}
                        className="text-slate-400 hover:text-[#1F6FEB] transition-colors p-1.5 rounded hover:bg-slate-800/50"
                        aria-label="Copy minimum version"
                        title="Copy Minimum Version"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <code className="block text-sm text-[#79C0FF] font-mono">
                      v{selectedApp?.minimumVersion || '1.0.0'}
                    </code>
                  </div>

                  {/* App ID Card */}
                  <div className="credentials-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-400">Application ID</h3>
                      <button
                        onClick={() => copyToClipboard(selectedApp?.id || '')}
                        className="text-slate-400 hover:text-[#1F6FEB] transition-colors p-1.5 rounded hover:bg-slate-800/50"
                        aria-label="Copy application ID"
                        title="Copy App ID"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <code className="block text-sm text-[#79C0FF] font-mono break-all">
                      {selectedApp?.id}
                    </code>
                  </div>
                </div>

                {/* Language Tabs */}
                <div className="border-b border-slate-700/50 mb-6 overflow-x-auto">
                  <div className="flex gap-1 min-w-max" role="tablist" aria-label="Programming language selection">
                    {languages.map((lang) => (
                      <button
                        key={lang.key}
                        role="tab"
                        aria-selected={selectedLang === lang.key}
                        aria-controls={`${lang.key}-panel`}
                        onClick={() => setSelectedLang(lang.key)}
                        className={`tab-pill ${selectedLang === lang.key ? 'active' : ''}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Example Card */}
                <div className="credentials-card p-6 mb-6 tab-content">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white">Configuration Example</h3>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="inline-flex items-center gap-2 px-4 py-2 btn-primary"
                      aria-label="Copy code to clipboard"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </button>
                  </div>
                  <div className="code-panel p-5" tabIndex={0} role="region" aria-label="Code example">
                    <pre className="text-sm leading-relaxed text-slate-100">
                      <code>{code}</code>
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/docs"
                    className="inline-flex items-center gap-2 btn-primary"
                    aria-label="View integration documentation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Documentation
                  </a>
                  <a
                    href="/docs/sdk"
                    className="inline-flex items-center gap-2 btn-outlined"
                    aria-label="View SDK examples and tutorials"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    SDK Examples
                  </a>
                  <a
                    href="/dashboard/docs/api"
                    className="inline-flex items-center gap-2 btn-outlined"
                    aria-label="View API reference"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    API Reference
                  </a>
                </div>
              </>
            );
          })()}
        </div>
        </ScrollAnimateWrapper>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Application *
                </label>
                <select
                  required
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                >
                  <option value="">Select application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                  placeholder="john_doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bind License Key (optional)
                </label>
                <select
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                  disabled={!selectedAppId}
                >
                  <option value="">No license</option>
                  {availableLicenses
                    .filter(l => l.isActive)
                    .map((license) => (
                      <option key={license.id} value={license.key}>
                        {license.key}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedAppId ? 'Select a license for this user' : 'Select an application first'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expiration Date (optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                  placeholder="Select expiration date"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  User account will expire at the end of this date. Leave empty for no expiration.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hwidLocked}
                    onChange={(e) => setHwidLocked(e.target.checked)}
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Lock HWID for this user
                  </span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
                  When enabled, user's HWID will be locked and cannot be changed or reset
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedAppId('');
                    setUsername('');
                    setPassword('');
                    setEmail('');
                    setLicenseKey('');
                    setExpiresAt('');
                    setHwidLocked(false);
                    setAvailableLicenses([]);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Edit User</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expiration Date (optional)
                </label>
                <input
                  type="date"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-transparent"
                  placeholder="Select expiration date"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  User account will expire at the end of this date. Leave empty for no expiration.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editHwidLocked}
                    onChange={(e) => setEditHwidLocked(e.target.checked)}
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Lock HWID for this user
                  </span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
                  When enabled, user's HWID will be locked and cannot be changed or reset
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setEditExpiresAt('');
                    setEditHwidLocked(false);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-slate-700 font-medium transition-all duration-200 shadow-sm hover:shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dropdown Menu - Rendered outside table */}
      {openDropdown && (
        <div 
          className="dropdown-menu fixed w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[9999] animate-fadeIn"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="py-1">
            {filteredUsers.find(u => u.id === openDropdown) && (() => {
              const appUser = filteredUsers.find(u => u.id === openDropdown)!;
              return (
                <>
                  <button
                    onClick={() => handleEditUser(appUser)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit User
                  </button>
                  
                  <button
                    onClick={() => handleResetHWID(appUser.id, appUser.username, appUser.appId, appUser.hwidLocked)}
                    className="w-full text-left px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!appUser.hwid}
                    title={!appUser.hwid ? 'No HWID to reset - User has not logged in yet' : appUser.hwidLocked ? 'Reset locked HWID' : 'Reset HWID'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {appUser.hwidLocked ? '🔓 Reset Locked HWID' : 'Reset HWID'}
                  </button>

                  <button
                    onClick={() => handleBanUser(appUser.id, appUser.username, appUser.appId, appUser.banned || false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    {appUser.banned ? 'Unban User' : 'Ban User'}
                  </button>

                  <button
                    onClick={() => handlePauseUser(appUser.id, appUser.username, appUser.appId, appUser.paused || false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={appUser.paused ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                    {appUser.paused ? 'Unpause User' : 'Pause User'}
                  </button>

                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

                  <button
                    onClick={() => handleDeleteUser(appUser.id, appUser.username, appUser.appId)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete User
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Version Edit Modal */}
      {showVersionModal && editingVersionApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Version</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{editingVersionApp.name}</p>
            <form onSubmit={handleUpdateVersion} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Current Version *
                </label>
                <input
                  type="text"
                  required
                  value={versionCurrent}
                  onChange={(e) => setVersionCurrent(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                  placeholder="1.0.0"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  The latest version of your application
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Minimum Required Version *
                </label>
                <input
                  type="text"
                  required
                  value={versionMinimum}
                  onChange={(e) => setVersionMinimum(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                  placeholder="1.0.0"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Users with versions below this will be blocked from logging in
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong className="font-semibold">Version Format:</strong> Use semantic versioning (e.g., 1.0.0, 2.1.3)<br/>
                  <strong className="font-semibold">Example:</strong> If minimum is 1.5.0, users with 1.4.9 will be blocked.
                </p>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowVersionModal(false);
                    setEditingVersionApp(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg hover:shadow-lg font-semibold transition-all"
                >
                  Update Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}

