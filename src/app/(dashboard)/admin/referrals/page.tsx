import { AdminReferralsContent } from '@/components/admin/referrals/admin-referrals-content';

export default function AdminReferralsPage() {
  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Referrals Management
        </h1>
        <p className='text-muted-foreground'>
          View all referrals and manage referral rewards.
        </p>
      </div>

      <AdminReferralsContent />
    </div>
  );
}
