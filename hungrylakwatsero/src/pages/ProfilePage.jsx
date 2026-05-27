import React, { useState } from 'react';
import { Camera, User, Lock, Settings, Shield, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    currentPassword: '',
    newPassword: '',
    notifications: true,
    newsletter: false,
    profileVisibility: 'public'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (activeTab === 'personal') {
        const response = await updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber
        });
        toast.success('Profile updated successfully!');
        setFormData(prev => ({
          ...prev,
          firstName: response.firstName || prev.firstName,
          lastName: response.lastName || prev.lastName,
          email: response.email || prev.email,
          phoneNumber: response.phoneNumber || prev.phoneNumber
        }));
      } else if (activeTab === 'security') {
        if (!formData.currentPassword || !formData.newPassword) {
          setError('Both current and new password are required.');
          setSaving(false);
          return;
        }
        await axios.put('/api/auth/password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        toast.success('Password updated successfully!');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Save failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content min-h-screen bg-background text-primary">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-8">Account Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 bg-secondary">
                  <img 
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-1">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : formData.firstName ? `${formData.firstName} ${formData.lastName || ''}` : 'User'}</h2>
              <span className="badge-green mb-6 px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {user?.role || 'Food Explorer'}
              </span>
              
              <button className="btn-secondary w-full py-2 px-4 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                Edit Picture
              </button>
            </div>
          </div>

          {/* Right Column: Tabs and Forms */}
          <div className="lg:col-span-2">
            <div className="bg-card backdrop-blur-md shadow-sm border border-primary/10 rounded-2xl p-6">
              
              {/* Tabs Navigation */}
              <div className="relative">
                <div className="flex overflow-x-auto space-x-2 border-b border-primary/10 mb-6 pb-2 scrollbar-hide">
                {[
                  { id: 'personal', label: 'Personal Info', icon: User },
                  { id: 'security', label: 'Security', icon: Lock },
                  { id: 'preferences', label: 'Preferences', icon: Settings },
                  { id: 'privacy', label: 'Privacy', icon: Shield }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-emerald-500/10 text-emerald-500 font-medium' 
                          : 'text-sage-400 hover:text-primary hover:bg-secondary/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave}>
                {activeTab === 'personal' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-sm font-medium text-sage-400 mb-1">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input-green w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-400 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input-green w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-400 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                        className="input-green w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-400 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="input-green w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-sm font-medium text-sage-400 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="input-green w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-400 mb-1">New Password</label>
                      <input 
                        type="password" 
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input-green w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-4 animate-in fade-in">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input 
                        type="checkbox" 
                        name="notifications"
                        checked={formData.notifications}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-primary/20 text-emerald-500 focus:ring-emerald-500 bg-secondary"
                      />
                      <div>
                        <p className="font-medium text-primary">Push Notifications</p>
                        <p className="text-sm text-sage-400">Receive alerts for new local spots</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input 
                        type="checkbox" 
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-primary/20 text-emerald-500 focus:ring-emerald-500 bg-secondary"
                      />
                      <div>
                        <p className="font-medium text-primary">Weekly Newsletter</p>
                        <p className="text-sm text-sage-400">Get top culinary news from Cavite</p>
                      </div>
                    </label>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-sm font-medium text-sage-400 mb-2">Profile Visibility</label>
                      <select 
                        name="profileVisibility"
                        value={formData.profileVisibility}
                        onChange={handleChange}
                        className="input-green w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-primary appearance-none"
                      >
                        <option value="public">Public - Everyone can see</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-primary/10">
                  {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                  )}
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="btn-primary bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-dark-950 font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
