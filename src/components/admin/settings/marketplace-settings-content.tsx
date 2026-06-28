'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Save } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { updateAppSetting } from '@/actions/app-settings';

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
import { Textarea } from '@/components/ui/textarea';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type DashboardMarketplaceContent = {
  heroLabel: string;
  heroTitle: string;
  heroDescription: string;
  supportTitle: string;
  supportDescription: string;
  webinarTitle: string;
  webinarDescription: string;
};

const defaultContent: DashboardMarketplaceContent = {
  heroLabel: 'Available inside Vestafi',
  heroTitle: 'Current Ownership Openings',
  heroDescription:
    'Private apartment ownership opportunities currently available inside Vestafi.',
  supportTitle: 'Need help choosing the right ownership opportunity?',
  supportDescription: 'A Vestafi advisor can guide you privately.',
  webinarTitle: 'Weekly ownership orientation',
  webinarDescription:
    'Join a guided session to understand Prime, Live, and Fractional apartment ownership.',
};

async function fetchMarketplaceSettings() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'marketplace_auto_approval_mode',
      'dashboard_marketplace_content',
    ]);

  if (error) throw new Error(error.message);

  const map = Object.fromEntries(
    (data || []).map((row) => [row.key, row.value]),
  );

  return {
    autoApprovalMode:
      typeof map.marketplace_auto_approval_mode === 'string'
        ? map.marketplace_auto_approval_mode
        : 'prime-only',
    content:
      typeof map.dashboard_marketplace_content === 'object' &&
      map.dashboard_marketplace_content
        ? ({
            ...defaultContent,
            ...(map.dashboard_marketplace_content as Record<string, string>),
          } as DashboardMarketplaceContent)
        : defaultContent,
  };
}

export function MarketplaceSettingsContent() {
  const queryClient = useQueryClient();
  const [autoApprovalMode, setAutoApprovalMode] = useState('prime-only');
  const [content, setContent] =
    useState<DashboardMarketplaceContent>(defaultContent);

  const { data, isLoading } = useQuery({
    queryKey: ['app_settings', 'marketplace'],
    queryFn: fetchMarketplaceSettings,
  });

  useEffect(() => {
    if (!data) return;
    setAutoApprovalMode(data.autoApprovalMode);
    setContent(data.content);
  }, [data]);

  const { execute: updateSetting, isExecuting } = useAction(updateAppSetting, {
    onSuccess: () => {
      toast.success('Marketplace settings updated');
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
    },
    onError: (error) => {
      toast.error(error.error.serverError || 'Failed to update setting');
    },
  });

  const updateContent = (
    key: keyof DashboardMarketplaceContent,
    value: string,
  ) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-56' />
          <Skeleton className='h-4 w-96' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-40 w-full' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <LayoutGrid className='h-5 w-5' />
          Marketplace Settings
        </CardTitle>
        <CardDescription>
          Control approval behavior and dashboard marketplace copy.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label>Applicant Auto Approval</Label>
          <Select value={autoApprovalMode} onValueChange={setAutoApprovalMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='off'>Manual approval for everyone</SelectItem>
              <SelectItem value='prime-only'>
                Auto-approve Prime applicants only
              </SelectItem>
              <SelectItem value='all'>
                Auto-approve all eligible applicants
              </SelectItem>
            </SelectContent>
          </Select>
          <p className='text-sm text-muted-foreground'>
            Prime applicants can enter the marketplace automatically while admin
            still receives their details.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Hero Label</Label>
            <Input
              value={content.heroLabel}
              onChange={(event) =>
                updateContent('heroLabel', event.target.value)
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>Hero Title</Label>
            <Input
              value={content.heroTitle}
              onChange={(event) =>
                updateContent('heroTitle', event.target.value)
              }
            />
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>Hero Description</Label>
            <Textarea
              value={content.heroDescription}
              onChange={(event) =>
                updateContent('heroDescription', event.target.value)
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>Support Title</Label>
            <Input
              value={content.supportTitle}
              onChange={(event) =>
                updateContent('supportTitle', event.target.value)
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>Support Description</Label>
            <Input
              value={content.supportDescription}
              onChange={(event) =>
                updateContent('supportDescription', event.target.value)
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>Webinar Title</Label>
            <Input
              value={content.webinarTitle}
              onChange={(event) =>
                updateContent('webinarTitle', event.target.value)
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>Webinar Description</Label>
            <Input
              value={content.webinarDescription}
              onChange={(event) =>
                updateContent('webinarDescription', event.target.value)
              }
            />
          </div>
        </div>

        <Button
          icon={Save}
          isLoading={isExecuting}
          onClick={() => {
            updateSetting({
              key: 'marketplace_auto_approval_mode',
              value: autoApprovalMode,
            });
            updateSetting({
              key: 'dashboard_marketplace_content',
              value: JSON.stringify(content),
            });
          }}
        >
          Save Marketplace Settings
        </Button>
      </CardContent>
    </Card>
  );
}
