'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  createExitWindow,
  getExitWindow,
  listPropertiesWithExitPrices,
  setExitWindowPropertyPrices,
  updateExitWindow,
} from '@/actions/admin-exit-window';

import { PropertyTitleWithThumb } from '@/components/common/property-title-with-thumb';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

type Props = {
  windowId?: string;
  focusPrices?: boolean;
};

export function ExitWindowForm({ windowId, focusPrices }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);

  const { data: windowData } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, windowId],
    queryFn: async () => {
      if (!windowId) return null;
      const r = await getExitWindow({ id: windowId });
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.window ?? null;
    },
    enabled: !!windowId,
  });

  const {
    data: propertiesData,
    isLoading: propertiesLoading,
  } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, windowId, 'properties'],
    queryFn: async () => {
      if (!windowId) return { properties: [] };
      const r = await listPropertiesWithExitPrices({ exit_window_id: windowId });
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data ?? { properties: [] };
    },
    enabled: !!windowId,
  });

  const window = windowData ?? null;
  const properties = propertiesData?.properties ?? [];

  useEffect(() => {
    if (!window) return;
    const start = window.start_at.slice(0, 10);
    const end = window.end_at.slice(0, 10);
    setStartAt(start);
    setEndAt(end);
  }, [window?.id, window?.start_at, window?.end_at]);

  useEffect(() => {
    if (properties.length === 0) return;
    const next: Record<string, string> = {};
    properties.forEach((p: { id: string; exit_price: number | null }) => {
      next[p.id] = p.exit_price != null ? String(p.exit_price) : '';
    });
    setPriceInputs(next);
  }, [properties]);

  const createAction = useAction(createExitWindow, {
    onSuccess: (result) => {
      const id = result.data?.window?.id;
      if (id) {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.EXIT_WINDOWS] });
        router.push(paths.admin.exitWindowForm(id));
        toast.success('Exit window created. Set property prices and activate.');
      }
    },
    onError: (e) =>
      toast.error(
        (e?.error?.serverError ?? e?.error?.validationErrors?.formErrors?.[0]) ??
          'Create failed',
      ),
  });

  const updateAction = useAction(updateExitWindow, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXIT_WINDOWS] });
      if (windowId)
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.EXIT_WINDOWS, windowId],
        });
      toast.success('Window updated');
    },
    onError: (e) =>
      toast.error(
        (e?.error?.serverError ?? e?.error?.validationErrors?.formErrors?.[0]) ??
          'Update failed',
      ),
  });

  const savePricesAction = useAction(setExitWindowPropertyPrices, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EXIT_WINDOWS, windowId, 'properties'],
      });
      toast.success('Property prices saved');
    },
    onError: (e) =>
      toast.error(
        (e?.error?.serverError ?? e?.error?.validationErrors?.formErrors?.[0]) ??
          'Save prices failed',
      ),
  });

  const toISOStartOfDay = (dateInput: string) =>
    dateInput ? new Date(`${dateInput}T00:00:00.000Z`).toISOString() : '';
  const toISOEndOfDay = (dateInput: string) =>
    dateInput ? new Date(`${dateInput}T23:59:59.999Z`).toISOString() : '';

  const filteredProperties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return properties;

    return properties.filter(
      (p: {
        id: string;
        title: string | null;
        price: number;
        images: string[] | null;
        exit_price: number | null;
      }) => {
        const title = (p.title ?? '').toLowerCase();
        const id = p.id.toLowerCase();
        return title.includes(term) || id.includes(term);
      },
    );
  }, [properties, searchTerm]);

  const handleCreate = () => {
    if (!startAt || !endAt) {
      toast.error('Set start and end dates');
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      toast.error('End date must be after start date');
      return;
    }
    createAction.execute({
      start_at: toISOStartOfDay(startAt),
      end_at: toISOEndOfDay(endAt),
    });
  };

  const handleUpdateDates = () => {
    if (!windowId || !startAt || !endAt) return;
    if (new Date(endAt) <= new Date(startAt)) {
      toast.error('End date must be after start date');
      return;
    }
    updateAction.execute({
      id: windowId,
      start_at: toISOStartOfDay(startAt),
      end_at: toISOEndOfDay(endAt),
    });
  };

  const handleSavePrices = () => {
    if (!windowId) return;
    const prices = Object.entries(priceInputs)
      .filter(([, v]) => v !== '' && Number(v) > 0)
      .map(([property_id, exit_price]) => ({
        property_id,
        exit_price: Number(exit_price),
      }));
    if (prices.length === 0) {
      toast.error('Set at least one property exit price');
      return;
    }
    savePricesAction.execute({ exit_window_id: windowId, prices });
  };

  const handleActivate = () => {
    if (!windowId) return;
    updateAction.execute({ id: windowId, status: 'active' });
  };

  const isDraft = window?.status === 'draft';
  /** Active windows remain editable for dates and prices; ended is view-only. */
  const canEdit = !window || window.status !== 'ended';

  if (windowId && !window && windowData === undefined) {
    return <p className='text-muted-foreground'>Loading…</p>;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          {windowId ? 'Edit exit window' : 'Create exit window'}
        </h1>
        <p className='text-muted-foreground'>
          {windowId
            ? 'Update dates and set per-property exit prices. Activate when ready.'
            : 'Set the start and end dates for the window.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Window period</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <Label htmlFor='start_at'>Start (UTC)</Label>
              <Popover
                open={startPopoverOpen}
                onOpenChange={setStartPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    id='start_at'
                    variant='outline'
                    className='w-full justify-start text-left font-normal'
                    disabled={!!windowId && !canEdit}
                  >
                    <span className={startAt ? '' : 'text-muted-foreground'}>
                      {startAt
                        ? format(new Date(`${startAt}T00:00:00`), 'PPP')
                        : 'Select start date'}
                    </span>
                    <CalendarIcon className='ml-auto h-4 w-4 text-muted-foreground' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto rounded-xl p-0 shadow-xl' align='start'>
                  <Calendar
                    mode='single'
                    selected={startAt ? new Date(`${startAt}T00:00:00`) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      setStartAt(format(date, 'yyyy-MM-dd'));
                      setStartPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor='end_at'>End (UTC)</Label>
              <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id='end_at'
                    variant='outline'
                    className='w-full justify-start text-left font-normal'
                    disabled={!!windowId && !canEdit}
                  >
                    <span className={endAt ? '' : 'text-muted-foreground'}>
                      {endAt
                        ? format(new Date(`${endAt}T00:00:00`), 'PPP')
                        : 'Select end date'}
                    </span>
                    <CalendarIcon className='ml-auto h-4 w-4 text-muted-foreground' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto rounded-xl p-0 shadow-xl' align='start'>
                  <Calendar
                    mode='single'
                    selected={endAt ? new Date(`${endAt}T00:00:00`) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      setEndAt(format(date, 'yyyy-MM-dd'));
                      setEndPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {windowId ? (
            canEdit && (
              <Button
                onClick={handleUpdateDates}
                disabled={updateAction.isExecuting}
              >
                Save dates
              </Button>
            )
          ) : (
            <Button onClick={handleCreate} disabled={createAction.isExecuting}>
              Create window
            </Button>
          )}
        </CardContent>
      </Card>

      {windowId && (
        <Card className={focusPrices ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle>Property exit prices</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Set the valuation per property for this window. Sellers see this
              value when listing stakes.
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search properties by name or ID...'
                className='pl-9'
              />
            </div>
            {propertiesLoading ? (
              <p className='text-muted-foreground'>Loading properties…</p>
            ) : properties.length === 0 ? (
              <p className='text-muted-foreground'>No properties found.</p>
            ) : filteredProperties.length === 0 ? (
              <p className='text-muted-foreground'>
                No properties match your search.
              </p>
            ) : (
              <>
                <div className='space-y-2'>
                  {filteredProperties.map(
                    (p: {
                      id: string;
                      title: string | null;
                      price: number;
                      images: string[] | null;
                      exit_price: number | null;
                    }) => (
                      <div
                        key={p.id}
                        className='flex flex-wrap items-center gap-4 rounded border p-3'
                      >
                        <div className='min-w-0 flex-1 basis-[220px]'>
                          <PropertyTitleWithThumb
                            title={p.title ?? p.id}
                            images={p.images}
                            size='sm'
                            subtitle={
                              <span>
                                Listing price: {formatCurrency(p.price)}
                              </span>
                            }
                          />
                        </div>
                        <div className='flex flex-1 items-center gap-2'>
                          <Label htmlFor={`price-${p.id}`} className='sr-only'>
                            Exit price
                          </Label>
                          <Input
                            id={`price-${p.id}`}
                            type='number'
                            min={0}
                            step={0.01}
                            placeholder='Exit price'
                            value={priceInputs[p.id] ?? ''}
                            onChange={(e) =>
                              setPriceInputs((prev) => ({
                                ...prev,
                                [p.id]: e.target.value,
                              }))
                            }
                            disabled={!canEdit}
                            className='max-w-[140px]'
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
                {canEdit && (
                  <Button
                    onClick={handleSavePrices}
                    disabled={savePricesAction.isExecuting}
                  >
                    Save property prices
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {windowId && isDraft && (
        <Card>
          <CardContent className='pt-6'>
            <Button
              variant='default'
              onClick={handleActivate}
              disabled={updateAction.isExecuting}
            >
              Activate window
            </Button>
            <p className='mt-2 text-sm text-muted-foreground'>
              Members will be able to sell and buy stakes until the end time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
