'use server';

import { auth, reverificationError } from '@clerk/nextjs/server';

export async function ensureRecentVerification() {
  const { has } = await auth.protect();

  if (!has({ reverification: 'strict' })) {
    return reverificationError('strict');
  }

  return { success: true } as const;
}
