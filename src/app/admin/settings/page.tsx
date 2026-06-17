import { Metadata } from 'next';

import { ExitWindowSettingsContent } from '@/components/admin/settings/exit-window-settings-content';
import { MembershipSettingsContent } from '@/components/admin/settings/membership-settings-content';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage application settings',
};

export default function AdminSettingsPage() {
  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage global application settings and configurations
        </p>
      </div>

      <MembershipSettingsContent />

      <ExitWindowSettingsContent />
    </div>
  );
}

