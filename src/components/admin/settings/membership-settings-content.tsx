'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Info, Settings2, Trash2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect,useState } from 'react';
import { toast } from 'sonner';

import { deleteAppSetting,updateAppSetting } from '@/actions/app-settings';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/utils/number-functions';

import {
  type AdminNotification,
  membershipConfig,
  type NotificationTheme,
  notificationThemes,
} from '@/config/app';
import { QueryKeys } from '@/constants/query-keys';

// Client-side function to fetch settings
async function fetchAppSettings() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'membership_enabled',
      'membership_annual_fee',
      'membership_admin_notification',
    ]);

  if (error) throw new Error(error.message);

  const settings: Record<string, unknown> = {};
  data?.forEach((setting) => {
    settings[setting.key] = setting.value;
  });

  // Parse admin notification
  let adminNotification: AdminNotification | null = null;
  if (settings.membership_admin_notification) {
    try {
      const notification = settings.membership_admin_notification as
        | AdminNotification
        | string;
      adminNotification =
        typeof notification === 'string'
          ? (JSON.parse(notification) as AdminNotification)
          : notification;
    } catch {
      // Invalid JSON, ignore
    }
  }

  return {
    membershipEnabled:
      settings.membership_enabled === true ||
      settings.membership_enabled === 'true',
    annualFee:
      typeof settings.membership_annual_fee === 'number'
        ? settings.membership_annual_fee
        : Number(settings.membership_annual_fee) ||
          membershipConfig.defaultAnnualFee,
    adminNotification,
  };
}

export function MembershipSettingsContent() {
  const queryClient = useQueryClient();
  const [localFee, setLocalFee] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationExpiresAt, setNotificationExpiresAt] =
    useState<string>('');
  const [notificationTheme, setNotificationTheme] =
    useState<NotificationTheme>('info');

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['app_settings', 'membership'],
    queryFn: fetchAppSettings,
  });

  // Initialize form when settings load
  useEffect(() => {
    if (settings?.adminNotification) {
      setNotificationMessage(settings.adminNotification.message);
      // Convert ISO string to datetime-local format
      const date = new Date(settings.adminNotification.expiresAt);
      const localDateTime = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      setNotificationExpiresAt(localDateTime);
      setNotificationTheme(settings.adminNotification.theme);
    } else {
      // Reset form if no notification
      setNotificationMessage('');
      setNotificationExpiresAt('');
      setNotificationTheme('info');
    }
  }, [settings?.adminNotification]);

  const { execute: updateSetting, isExecuting: isUpdating } = useAction(
    updateAppSetting,
    {
      onSuccess: () => {
        toast.success('Setting updated successfully');
        queryClient.invalidateQueries({ queryKey: ['app_settings'] });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.USER_MEMBERSHIP_STATUS],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.ADMIN_NOTIFICATION],
        });
      },
      onError: (error) => {
        toast.error(error.error.serverError || 'Failed to update setting');
      },
    },
  );

  const { execute: deleteSetting, isExecuting: isDeleting } = useAction(
    deleteAppSetting,
    {
      onSuccess: () => {
        toast.success('Notification deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['app_settings'] });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.USER_MEMBERSHIP_STATUS],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.ADMIN_NOTIFICATION],
        });
      },
      onError: (error) => {
        toast.error(error.error.serverError || 'Failed to delete notification');
      },
    },
  );

  const handleToggleMembership = (enabled: boolean) => {
    updateSetting({ key: 'membership_enabled', value: enabled });
  };

  const handleUpdateFee = () => {
    const fee = Number(localFee);
    if (isNaN(fee) || fee <= 0) {
      toast.error('Please enter a valid fee amount');
      return;
    }

    updateSetting({ key: 'membership_annual_fee', value: fee });
    setLocalFee('');
  };

  const handleSaveNotification = () => {
    if (!notificationMessage.trim()) {
      toast.error('Please enter a notification message');
      return;
    }

    if (!notificationExpiresAt) {
      toast.error('Please select an expiration date and time');
      return;
    }

    // Convert datetime-local to ISO string
    const expiresAt = new Date(notificationExpiresAt).toISOString();

    const notification: AdminNotification = {
      message: notificationMessage.trim(),
      expiresAt,
      theme: notificationTheme,
    };

    updateSetting({
      key: 'membership_admin_notification',
      value: JSON.stringify(notification),
    });
  };

  const handleDeleteNotification = () => {
    deleteSetting({ key: 'membership_admin_notification' });
    // Reset form
    setNotificationMessage('');
    setNotificationExpiresAt('');
    setNotificationTheme('info');
  };

  const isNotificationExpired = () => {
    if (!settings?.adminNotification) return false;
    return new Date(settings.adminNotification.expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-96' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-20 w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>
          Failed to load settings:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Settings2 className='h-5 w-5' />
          Membership Settings
        </CardTitle>
        <CardDescription>
          Configure membership requirements and annual fee for new users
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Membership Toggle */}
        <div className='flex items-center justify-between rounded-lg border p-4'>
          <div className='space-y-0.5'>
            <Label
              htmlFor='membership-toggle'
              className='text-base font-medium'
            >
              Membership Requirement
            </Label>
            <p className='text-sm text-muted-foreground'>
              When enabled, new users must pay the annual membership fee to
              access platform features. Existing approved users (founding
              members) are exempt.
            </p>
          </div>
          <Switch
            id='membership-toggle'
            checked={settings?.membershipEnabled ?? true}
            onCheckedChange={handleToggleMembership}
            disabled={isUpdating}
          />
        </div>

        {/* Annual Fee */}
        <div className='space-y-4 rounded-lg border p-4'>
          <div className='space-y-2'>
            <Label htmlFor='annual-fee' className='text-base font-medium'>
              Annual Membership Fee
            </Label>
            <p className='text-sm text-muted-foreground'>
              Set the annual membership fee in UGX. This fee applies to new
              users joining after the change. Existing members are not affected.
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <Input
                id='annual-fee'
                type='number'
                placeholder={settings?.annualFee.toString() || '70000'}
                value={localFee}
                onChange={(e) => setLocalFee(e.target.value)}
                min='1'
                disabled={isUpdating}
              />
            </div>
            <div className='text-sm text-muted-foreground'>
              Current:{' '}
              {formatCurrency(
                settings?.annualFee || membershipConfig.defaultAnnualFee,
              )}
            </div>
            <Button
              onClick={handleUpdateFee}
              disabled={!localFee || isUpdating}
              isLoading={isUpdating}
            >
              Update Fee
            </Button>
          </div>
        </div>

        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            <strong>Note:</strong> Fee changes only affect new users joining
            after the update. Existing members who have already paid will not be
            affected. Founding members have lifetime access and are exempt from
            all fees.
          </AlertDescription>
        </Alert>

        {/* Admin Notification Section */}
        <div className='space-y-4 rounded-lg border p-4'>
          <div className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            <Label className='text-base font-medium'>Admin Notification</Label>
          </div>
          <p className='text-sm text-muted-foreground'>
            Create a custom notification message that will be displayed in the
            membership ticker. The notification will automatically stop showing
            after the expiration date.
          </p>

          {settings?.adminNotification && (
            <Alert
              variant={isNotificationExpired() ? 'destructive' : 'default'}
            >
              <Info className='h-4 w-4' />
              <AlertDescription>
                {isNotificationExpired() ? (
                  <span>
                    <strong>Current notification has expired.</strong> It will
                    not be shown to users. Update or delete it.
                  </span>
                ) : (
                  <span>
                    <strong>Active notification:</strong> Expires on{' '}
                    {new Date(
                      settings.adminNotification.expiresAt,
                    ).toLocaleString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='notification-message'>Notification Message</Label>
              <Textarea
                id='notification-message'
                placeholder='Enter your notification message...'
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className='min-h-[100px]'
                disabled={isUpdating}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='notification-expires'>
                  Expiration Date & Time
                </Label>
                <Input
                  id='notification-expires'
                  type='datetime-local'
                  value={notificationExpiresAt}
                  onChange={(e) => setNotificationExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  disabled={isUpdating}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notification-theme'>Theme</Label>
                <Select
                  value={notificationTheme}
                  onValueChange={(value) =>
                    setNotificationTheme(value as NotificationTheme)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger id='notification-theme'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(notificationThemes).map(([key, theme]) => (
                      <SelectItem key={key} value={key}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={handleSaveNotification}
                disabled={isUpdating || isDeleting}
                isLoading={isUpdating}
              >
                {settings?.adminNotification
                  ? 'Update Notification'
                  : 'Save Notification'}
              </Button>
              {settings?.adminNotification && (
                <Button
                  variant='destructive'
                  onClick={handleDeleteNotification}
                  disabled={isUpdating || isDeleting}
                  isLoading={isDeleting}
                  icon={Trash2}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
