'use client';

import { useRouter } from 'next/navigation';
import { setRole, removeRole } from '@components/_actions';

type SerializedUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{ id: string; emailAddress: string }>;
  primaryEmailAddressId: string | null;
  publicMetadata: { role?: string };
  createdAt: number | Date;
  banned: boolean;
  locked: boolean;
};

type UserCardProps = {
  user: SerializedUser;
  showRoleActions: boolean;
};

export default function UserCard({ user, showRoleActions }: UserCardProps) {
  const router = useRouter();
  const primaryEmail =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? '—';
  const role = user.publicMetadata?.role ?? '';
  const created = user.createdAt ? new Date(user.createdAt).toLocaleString() : '—';

  const handleCardClick = () => {
    router.push(`/admin/users/${user.id}`);
  };

  return (
    <div 
      className="group w-full rounded-[14px] border border-[#EDEEEF] bg-white shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col flex-row-1150 gap-4 lg:gap-0">
        {/* Column 1: Identity */}
        <div className="flex min-w-0 flex-1 items-start gap-4 lg:max-w-[400px] pt-4 pb-2 lg:pb-6 px-4 hover:bg-slate-50/40 rounded-[14px_14px_0_0] lg:rounded-none">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[16px] font-semibold text-slate-900">
                {user.firstName || user.lastName
                  ? `${user.firstName ?? ''} ${user.lastName ?? ''}`
                  : '—'}
              </h3>
            </div>

            <p className="mt-1 text-[13px] sm:text-[14px] text-slate-600 truncate">
              {primaryEmail}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center justify-center rounded-[999px] bg-[var(--Primary-P20,#F6F9FE)] px-[10px] py-[5.5px] text-[11px] sm:text-[12px] font-medium text-[var(--Dark-D500,#525A68)]">
                ID: {user.id}
              </span>
            </div>
          </div>
        </div>

        {/* Divider: horizontal on mobile, vertical on lg+ */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] lg:hidden" />
        <div className="hidden lg:block w-px flex-shrink-0 border border-[var(--Dark-D20,#F6F6F7)]" />

        {/* Column 2: Meta */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:max-w-md pt-2 lg:pt-4 pb-2 lg:pb-6 px-4 hover:bg-slate-50/40">
          <div className="flex items-center gap-2 w-full sm:w-1/2 lg:w-[200px] overflow-hidden">
            <span className="truncate text-[13px] sm:text-[14px] text-slate-900 font-semibold">
              Role
            </span>
            <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {role || '—'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-1/2 lg:w-[200px] overflow-hidden">
            <span className="truncate text-[13px] sm:text-[14px] text-slate-900 font-semibold">
              Created
            </span>
            <span className="ml-auto truncate text-[13px] sm:text-[14px] text-slate-600">
              {created}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] lg:hidden" />
        <div className="hidden lg:block w-px flex-shrink-0 border border-[var(--Dark-D20,#F6F6F7)]" />

        {/* Column 3: Actions (clickable area but buttons work normally) */}
        <div 
          className="flex lg:flex-1 flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-6 px-4 pt-2 lg:pt-4 pb-4 lg:pb-6"
        >
          <div className="text-[13px] sm:text-[14px] text-[var(--Dark-D500,#525A68)]">
            Manage Role
          </div>

          {showRoleActions && (
            <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <form action={setRole}>
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="role" value="admin" />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Make Admin
                </button>
              </form>

              <form action={setRole}>
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="role" value="moderator" />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Make Moderator
                </button>
              </form>

              <form action={removeRole}>
                <input type="hidden" name="id" value={user.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
                >
                  Remove Role
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
