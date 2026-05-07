import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const Schema = z.object({ vendorId: z.string().min(1), notes: z.string().optional() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CLIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const exists = await prisma.vendorProfile.findUnique({ where: { id: parsed.data.vendorId } });
  if (!exists) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

  await prisma.shortlistEntry.upsert({
    where: { clientId_vendorId: { clientId: user.id, vendorId: parsed.data.vendorId } },
    update: { notes: parsed.data.notes },
    create: { clientId: user.id, vendorId: parsed.data.vendorId, notes: parsed.data.notes },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CLIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  await prisma.shortlistEntry
    .delete({
      where: { clientId_vendorId: { clientId: user.id, vendorId: parsed.data.vendorId } },
    })
    .catch(() => null);
  return NextResponse.json({ ok: true });
}
