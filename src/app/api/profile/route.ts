import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  getCurrentUser,
  hashPassword,
  setSessionCookie,
  signSession,
  verifyPassword,
} from '@/lib/auth';

const Schema = z.object({
  fullName: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Enter a valid email').toLowerCase(),
  jobTitle: z
    .string()
    .max(120)
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  avatarUrl: z
    .string()
    .max(2_000_000) // ~1.5 MB base64 cap
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  // Password change is opt-in: leave both blank to skip.
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      jobTitle: user.jobTitle,
    },
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Email uniqueness check if email changed.
  if (data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        { error: 'That email is already in use by another account' },
        { status: 409 },
      );
    }
  }

  // Password change requires the current password.
  let nextPasswordHash: string | undefined;
  if (data.newPassword) {
    if (!data.currentPassword) {
      return NextResponse.json(
        { error: 'Enter your current password to set a new one' },
        { status: 400 },
      );
    }
    const ok = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    nextPasswordHash = await hashPassword(data.newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: data.fullName.trim(),
      email: data.email,
      jobTitle: data.jobTitle ?? null,
      avatarUrl: data.avatarUrl ?? null,
      ...(nextPasswordHash ? { passwordHash: nextPasswordHash } : {}),
    },
  });

  // Re-issue session if email changed (the JWT carries email).
  if (updated.email !== user.email) {
    const token = await signSession({
      userId: updated.id,
      email: updated.email,
      role: updated.role,
    });
    await setSessionCookie(token);
  }

  return NextResponse.json({
    user: {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      avatarUrl: updated.avatarUrl,
      jobTitle: updated.jobTitle,
    },
  });
}
