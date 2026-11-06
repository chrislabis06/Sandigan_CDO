import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Heart,
  Shield,
  Save,
  CheckCircle2,
  Camera,
  Upload,
  Link,
  Trash2,
  AlertCircle,
  MapPin,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth, UserProfile, UserRole } from '../lib/auth';
import { processAvatarFile } from '../utils/image';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [role, setRole] = useState<UserRole>('volunteer');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [city, setCity] = useState('Cagayan de Oro');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoMode, setPhotoMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhone(user.phone || '');
      setBloodType(user.bloodType || 'O+');
      setRole(user.role || 'volunteer');
      setAvatarUrl(user.avatarUrl || '');
      setUrlInput(user.avatarUrl || '');
      setCity(user.city || 'Cagayan de Oro');
      setEmergencyName(user.emergencyContactName || '');
      setEmergencyPhone(user.emergencyContactPhone || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Handle local file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndSetImage(file);
    // Reset file input so the same file can be re-selected if desired
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAndSetImage(file);
    }
  };

  const processAndSetImage = async (file: File) => {
    setIsUploadingPhoto(true);
    try {
      const optimizedDataUrl = await processAvatarFile(file, 360);
      setAvatarUrl(optimizedDataUrl);
      setUrlInput('');

      // Immediately save avatar to user document users/{uid} for instant feedback
      await updateProfile({ avatarUrl: optimizedDataUrl });
      onShowToast('Profile picture updated and saved to your profile!');
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to process image file.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Apply custom URL
  const handleApplyUrl = async () => {
    if (!urlInput.trim()) return;
    setAvatarUrl(urlInput.trim());
    try {
      await updateProfile({ avatarUrl: urlInput.trim() });
      onShowToast('Avatar image URL updated and saved!');
    } catch (err: any) {
      onShowToast('Error updating avatar: ' + err?.message);
    }
  };

  // Select preset avatar
  const handleSelectPreset = async (presetUrl: string) => {
    setAvatarUrl(presetUrl);
    setUrlInput(presetUrl);
    try {
      await updateProfile({ avatarUrl: presetUrl });
      onShowToast('Avatar updated!');
    } catch (err: any) {
      onShowToast('Error updating avatar: ' + err?.message);
    }
  };

  // Reset to initials / dicebear
  const handleResetAvatar = async () => {
    const initialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      displayName || user.email
    )}`;
    setAvatarUrl(initialsUrl);
    setUrlInput('');
    try {
      await updateProfile({ avatarUrl: initialsUrl });
      onShowToast('Avatar reset to initials avatar!');
    } catch (err: any) {
      onShowToast('Error resetting avatar: ' + err?.message);
    }
  };

  // Save all profile fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName,
        phone,
        bloodType,
        role,
        avatarUrl,
        city,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
      });
      onShowToast(`Profile saved to users/${user.uid} successfully!`);
      onClose();
    } catch (err: any) {
      onShowToast('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const currentDisplayAvatar =
    avatarUrl ||
    user.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      displayName || user.displayName || 'Volunteer'
    )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Volunteer Identity & Profile</h3>
              <p className="text-[11px] text-slate-500 font-mono">users/{user.uid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700">
          {/* PROFILE PICTURE & AVATAR UPLOAD SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Profile Picture</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    photoMode === 'upload'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    photoMode === 'url'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('presets')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    photoMode === 'presets'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Presets
                </button>
              </div>
            </div>

            {/* Avatar Preview with Camera Overlay */}
            <div className="flex items-center gap-4">
              <div
                className={`relative group rounded-2xl overflow-hidden border-2 shadow-sm shrink-0 cursor-pointer transition ${
                  isDragOver ? 'border-emerald-500 scale-105' : 'border-emerald-600'
                }`}
                style={{ width: '76px', height: '76px' }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                title="Click or drag an image here to change photo"
              >
                <img
                  src={currentDisplayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with Camera Icon */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Change</span>
                </div>

                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Action Area based on Mode */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />

                {photoMode === 'upload' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetAvatar}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                        title="Reset to Initials Avatar"
                      >
                        <Trash2 className="w-3 h-3 text-slate-400" />
                        <span>Reset</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      JPG, PNG, WebP up to 10MB. Images are automatically cropped and optimized for your Sandigan pass.
                    </p>
                  </div>
                )}

                {photoMode === 'url' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <Link className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Paste any public image URL from Unsplash, Imgur, or social media.
                    </p>
                  </div>
                )}

                {photoMode === 'presets' && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(url)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                            avatarUrl === url
                              ? 'border-emerald-600 scale-105 shadow-xs'
                              : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-400'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">Click a community preset avatar to apply.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email (Permanent)</label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Contact & Pass Medical Info */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-600" />
                <span>On-Site Badge & Emergency Info</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Auto-fills Passes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Mobile Contact
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917-000-0000"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Blood Type
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="O+">O+ (Universal Donor / Common)</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Parent / Guardian / Spouse"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="0917-555-0000"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Location & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Base Location</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Cagayan de Oro">Cagayan de Oro City</option>
                <option value="Misamis Oriental">Misamis Oriental</option>
                <option value="Bukidnon">Bukidnon Province</option>
                <option value="Other Region X">Other Region X Area</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Platform Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="volunteer">Volunteer Advocate</option>
                <option value="organizer">Grassroots Organizer</option>
                {user.role === 'admin' && <option value="admin">System Administrator</option>}
              </select>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
