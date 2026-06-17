'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { updateExitWindowAppSettings } from '@/actions/app-settings';

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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { QueryKeys } from '@/constants/query-keys';

const EXIT_KEYS = [
  'exit_window_fee_percentage',
  'exit_window_min_sell_amount',
  'exit_window_min_buy_amount',
] as const;

async function fetchExitWindowSettings() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [...EXIT_KEYS]);

  if (error) throw new Error(error.message);

  const map: Record<string, unknown> = {};
  data?.forEach((row) => {
    map[row.key] = row.value;
  });

  const num = (k: string, fallback: number) => {
    const v = map[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
  };

  return {
    feePercentage: num('exit_window_fee_percentage', 1.5),
    minSellAmount: num('exit_window_min_sell_amount', 1),
    minBuyAmount: num('exit_window_min_buy_amount', 1),
  };
}

export function ExitWindowSettingsContent() {
  const queryClient = useQueryClient();
  const [feePct, setFeePct] = useState('');
  const [minSell, setMinSell] = useState('');
  const [minBuy, setMinBuy] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: [QueryKeys.APP_SETTINGS, 'exit-window'],
    queryFn: fetchExitWindowSettings,
  });

  useEffect(() => {
    if (!data) return;
    setFeePct(String(data.feePercentage));
    setMinSell(String(Math.round(data.minSellAmount)));
    setMinBuy(String(Math.round(data.minBuyAmount)));
  }, [data]);

  const saveAction = useAction(updateExitWindowAppSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.APP_SETTINGS, 'exit-window'],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXIT_WINDOWS] });
      toast.success('Exit window settings saved');
    },
    onError: (e) =>
      toast.error(
        (e as { error?: { serverError?: string } })?.error?.serverError ??
          'Save failed',
      ),
  });

  const handleSave = () => {
    const f = Number(feePct);
    const ms = Number(minSell);
    const mb = Number(minBuy);
    if (!Number.isFinite(f) || f < 0 || f > 100) {
      toast.error('Fee must be between 0 and 100');
      return;
    }
    if (!Number.isFinite(ms) || ms < 1) {
      toast.error('Minimum sell amount must be at least 1');
      return;
    }
    if (!Number.isFinite(mb) || mb < 1) {
      toast.error('Minimum buy amount must be at least 1');
      return;
    }
    saveAction.execute({
      feePercentage: f,
      minSellAmount: ms,
      minBuyAmount: mb,
    });
  };

  if (error) {
    return (
      <p className='text-sm text-destructive'>
        Failed to load exit window settings.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exit window</CardTitle>
        <CardDescription>
          Fees and minimum stake amounts for secondary trades during an open
          exit window.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {isLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : (
          <>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='exit_fee_pct'>Platform fee (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        className='text-muted-foreground hover:text-foreground'
                        aria-label='About platform fee'
                      >
                        <Info className='h-4 w-4' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-sm text-left'>
                      <p>
                        One number (e.g. 1.5%). It is applied symmetrically: the
                        buyer pays this percentage <strong>on top</strong> of the
                        cash value at exit price, and the seller receives the
                        value <strong>minus</strong> the same percentage. Total
                        platform revenue per trade is about twice this
                        percentage of that base value (e.g. 1.5% + 1.5% ≈ 3%).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id='exit_fee_pct'
                type='number'
                min={0}
                max={100}
                step={0.01}
                value={feePct}
                onChange={(e) => setFeePct(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                Applied to both sides: buyer pays extra; seller receives less;
                combined platform take ≈ 2× this % of the value at exit price.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='exit_min_sell'>Minimum stake to sell (UGX)</Label>
              <Input
                id='exit_min_sell'
                type='number'
                min={1}
                step={1}
                value={minSell}
                onChange={(e) => setMinSell(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='exit_min_buy'>Minimum stake to buy (UGX)</Label>
              <Input
                id='exit_min_buy'
                type='number'
                min={1}
                step={1}
                value={minBuy}
                onChange={(e) => setMinBuy(e.target.value)}
              />
            </div>

            <Button
              variant='default'
              onClick={handleSave}
              disabled={saveAction.isExecuting || isLoading}
            >
              Save exit window settings
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
