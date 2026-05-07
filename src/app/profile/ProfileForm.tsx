'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface InitialData {
  fullName: string;
  email: string;
  role: 'VENDOR' | 'CLIENT';
  avatarUrl: string;
  jobTitle: string;
}

const MAX_AVATAR_BYTES = 1_500_000; // ~1.5MB
const AVATAR_OUTPUT_PX = 512; // resize input image to this max edge before encoding

export function ProfileForm({ initial }: { initial: InitialData }) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error');
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, AVATAR_OUTPUT_PX);
      if (dataUrl.length > MAX_AVATAR_BYTES) {
        toast('That image is too large — try a smaller one', 'error');
        return;
      }
      setAvatarUrl(dataUrl);
    } catch {
      toast('Could not read that image', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function clearAvatar() {
    setAvatarUrl('');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        fullName,
        email,
        jobTitle,
        avatarUrl,
        ...(showPasswordSection && newPassword
          ? { currentPassword, newPassword }
          : {}),
      };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Could not save changes');
        return;
      }
      toast('Profile updated', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const initials = fullName.trim().slice(0, 1).toUpperCase() || '?';

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Avatar */}
      <section className="card p-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-brand-500/15 text-2xl font-semibold text-brand-200 backdrop-blur">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-midnight-900/70 text-xs text-white/80">
                Uploading…
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-ink-900">Profile photo</h3>
            <p className="mt-1 text-sm text-ink-500">
              Square JPG, PNG or SVG. Resized client-side to 512&nbsp;px.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-sm"
                disabled={uploading || saving}
              >
                {avatarUrl ? 'Change photo' : 'Upload photo'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="btn-ghost text-sm text-red-300 hover:bg-red-500/10"
                  disabled={uploading || saving}
                >
                  Remove
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onPickAvatar}
              />
            </div>
            <div className="mt-4">
              <label className="label" htmlFor="avatarUrl">Or paste a URL</label>
              <input
                id="avatarUrl"
                className="input"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={uploading || saving}
              />
              {avatarUrl.startsWith('data:') && (
                <div className="help">Currently using an uploaded photo.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Identity */}
      <section className="card p-6">
        <h3 className="text-base font-semibold text-ink-900">Account information</h3>
        <p className="text-sm text-ink-500">Your name and email as they appear in TipTop.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className="input"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="jobTitle">Job title</label>
            <input
              id="jobTitle"
              className="input"
              placeholder={initial.role === 'VENDOR' ? 'e.g. Business Development Lead' : 'e.g. Procurement Manager'}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Account type</label>
            <div className="input flex items-center justify-between">
              <span className="text-ink-800">
                {initial.role === 'VENDOR' ? 'Vendor' : 'Client'}
              </span>
              <span className="chip-brand text-[10px] uppercase tracking-wider">
                Read-only
              </span>
            </div>
            <div className="help">Account type is set during registration.</div>
          </div>
        </div>
      </section>

      {/* Password */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink-900">Password</h3>
            <p className="text-sm text-ink-500">Update your sign-in password.</p>
          </div>
          {!showPasswordSection && (
            <button
              type="button"
              onClick={() => setShowPasswordSection(true)}
              className="btn-secondary text-sm"
            >
              Change password
            </button>
          )}
        </div>
        {showPasswordSection && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="input"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="help">At least 8 characters.</div>
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="btn-secondary"
          disabled={saving}
        >
          Discard
        </button>
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

/**
 * Read an image file, resize it (so we don't upload 5MB blobs), and return a
 * data URL we can store directly in the DB. Aspect ratio preserved; the
 * longest edge is capped at `maxEdge`.
 */
async function resizeImageToDataUrl(file: File, maxEdge: number): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  // SVGs don't need resampling and can stay as-is.
  if (file.type === 'image/svg+xml') return dataUrl;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Could not load image'));
    i.src = dataUrl;
  });

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const targetW = Math.max(1, Math.round(img.width * scale));
  const targetH = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(mime, mime === 'image/jpeg' ? 0.85 : undefined);
}
