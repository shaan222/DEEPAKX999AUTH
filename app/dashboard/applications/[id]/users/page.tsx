'use client'

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface AppUser {
  id: string;
  username: string;
  email?: string;
  licenseKey?: string;
  createdAt: string;
  lastLogin?: string;
  hwid?: string;
  banned?: boolean;
  paused?: boolean;
}

interface Application {
  id: string;
  name: string;
}

export default function ApplicationUsersPage() {
  const { user } = useAuth();
  const params = useParams();
  const appId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [availableLicenses, setAvailableLicenses] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (appId) {
      fetchApplication();
      fetchUsers();
      fetchLicenses();
    }
  }, [appId]);

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

  const fetchApplication = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/application/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const app = data.applications?.find((a: Application) => a.id === appId);
      setApplication(app || null);
    } catch {
      toast.error('Failed to fetch application');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/user/list?appId=${appId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenses = async () => {
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

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
          appId,
          username,
          password,
          email: email || undefined,
          licenseKey: licenseKey || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User created successfully!');
        setShowCreateModal(false);
        setUsername('');
        setPassword('');
        setEmail('');
        setLicenseKey('');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch {
      toast.error('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
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
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    }
    setOpenDropdown(null);
  };

  const handleResetHWID = async (userId: string, username: string) => {
    if (!confirm(`Reset HWID for user "${username}"?`)) {
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
        body: JSON.stringify({ userId, appId }),
      });

      if (response.ok) {
        toast.success('HWID reset successfully');
        fetchUsers();
      } else {
        toast.error('Failed to reset HWID');
      }
    } catch {
      toast.error('Failed to reset HWID');
    }
    setOpenDropdown(null);
  };

  const handleBanUser = async (userId: string, username: string, currentlyBanned: boolean) => {
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
        fetchUsers();
      } else {
        toast.error(`Failed to ${action.toLowerCase()} user`);
      }
    } catch {
      toast.error(`Failed to ${action.toLowerCase()} user`);
    }
    setOpenDropdown(null);
  };

  const handlePauseUser = async (userId: string, username: string, currentlyPaused: boolean) => {
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
        fetchUsers();
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
      const updates: Record<string, string | null> = {
        username: editUsername,
        email: editEmail || null,
      };

      if (editPassword) {
        updates.password = editPassword;
      }

      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId: editingUser.id, 
          appId,
          updates
        }),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
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

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div>
        {/* Header */}
        <div className="mb-8">
          <Link href={`/dashboard/applications/${appId}`} className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
            ← Back to {application.name}
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Users & Clients</h2>
          <p className="text-slate-600 mt-2">
            Manage end-users who have registered in your application
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="text-sm font-medium text-slate-600">Total Users</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="text-sm font-medium text-slate-600">With License</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {users.filter(u => u.licenseKey).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="text-sm font-medium text-slate-600">Active Today</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {users.filter(u => u.lastLogin && 
                new Date(u.lastLogin) > new Date(Date.now() - 24*60*60*1000)
              ).length}
            </div>
          </div>
        </div>

        {/* Create User Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            + Create New User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-4">
                No users yet. Users will appear here when they register through your application.
              </p>
              <Link
                href={`/dashboard/applications/${appId}`}
                className="text-slate-900 hover:text-slate-700 font-medium"
              >
                View integration guide →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      License Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((appUser) => (
                    <tr key={appUser.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-slate-900">
                            {appUser.username}
                          </div>
                          {appUser.banned && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
                              Banned
                            </span>
                          )}
                          {appUser.paused && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                              Paused
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {appUser.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {appUser.licenseKey ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {appUser.licenseKey}
                            </code>
                            <button
                              onClick={() => copyToClipboard(appUser.licenseKey!)}
                              className="text-slate-400 hover:text-slate-600"
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {appUser.lastLogin ? formatDate(appUser.lastLogin) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(appUser.createdAt)}
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
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="john_doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bind License Key (optional)
                </label>
                <select
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
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
                <p className="text-xs text-slate-500 mt-1">
                  Optionally bind a license key to this user account
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setUsername('');
                    setPassword('');
                    setEmail('');
                    setLicenseKey('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit User</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
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
          className="dropdown-menu fixed w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-[9999]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="py-1">
            {users.find(u => u.id === openDropdown) && (() => {
              const appUser = users.find(u => u.id === openDropdown)!;
              return (
                <>
                  <button
                    onClick={() => handleEditUser(appUser)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit User
                  </button>
                  
                  <button
                    onClick={() => handleResetHWID(appUser.id, appUser.username)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    disabled={!appUser.hwid}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset User HWID
                  </button>

                  <button
                    onClick={() => handleBanUser(appUser.id, appUser.username, appUser.banned || false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    {appUser.banned ? 'Unban User' : 'Ban User'}
                  </button>

                  <button
                    onClick={() => handlePauseUser(appUser.id, appUser.username, appUser.paused || false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={appUser.paused ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                    {appUser.paused ? 'Unpause User' : 'Pause User'}
                  </button>

                  <div className="border-t border-slate-200 my-1"></div>

                  <button
                    onClick={() => handleDeleteUser(appUser.id, appUser.username)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
    </div>
  );
}

