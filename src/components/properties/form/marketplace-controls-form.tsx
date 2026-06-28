'use client';

import { CalendarDays, CheckCircle2, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { apartmentStatuses, type PropertyFormValues } from '@/schema/property';

import UGXIcon from '@/components/common/ugx-icon';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { formatNumber } from '@/utils/number-functions';

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  acquiring: 'Acquiring',
  operational: 'Operational',
  'prime-available': 'Prime Available',
  'live-active': 'Live Active',
  'fractional-open': 'Fractional Open',
  'fully-sold': 'Fully Sold',
};

const moneyFields = [
  ['acquisition_cost', 'Acquisition Cost'],
  ['furnishing_cost', 'Furnishing Cost'],
  ['legal_setup_cost', 'Legal / Setup Costs'],
  ['operational_setup_cost', 'Operational Setup Costs'],
  ['markup_amount', 'Structuring Margin'],
  ['starting_ownership_amount', 'Starting Ownership'],
] as const;

function MoneyField({
  name,
  label,
}: {
  name: (typeof moneyFields)[number][0];
  label: string;
}) {
  const form = useFormContext<PropertyFormValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className='relative'>
              <UGXIcon className='absolute left-2 top-1.5' />
              <Input
                className='pl-10'
                placeholder='0'
                value={formatNumber(field.value || 0)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^\d]/g, '');
                  field.onChange(rawValue ? parseInt(rawValue) : 0);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ArrayTextarea({
  name,
  label,
  description,
  placeholder,
}: {
  name: 'apartment_features' | 'prime_highlights';
  label: string;
  description: string;
  placeholder: string;
}) {
  const form = useFormContext<PropertyFormValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              className='min-h-28'
              placeholder={placeholder}
              value={(field.value || []).join('\n')}
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    .split('\n')
                    .map((value) => value.trim())
                    .filter(Boolean),
                )
              }
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function MarketplaceControlsForm() {
  const form = useFormContext<PropertyFormValues>();
  const values = form.watch();

  const computedListedValue = useMemo(() => {
    const base =
      Number(values.acquisition_cost || 0) +
      Number(values.furnishing_cost || 0) +
      Number(values.legal_setup_cost || 0) +
      Number(values.operational_setup_cost || 0) +
      Number(values.markup_amount || 0);

    const percentageMarkup =
      base > 0 ? (base * Number(values.markup_percentage || 0)) / 100 : 0;

    return Math.round(base + percentageMarkup) || Number(values.price || 0);
  }, [
    values.acquisition_cost,
    values.furnishing_cost,
    values.legal_setup_cost,
    values.markup_amount,
    values.markup_percentage,
    values.operational_setup_cost,
    values.price,
  ]);

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>Marketplace Controls</h3>
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='apartment_status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <div className='flex items-center gap-2'>
                        <Sparkles className='h-4 w-4 text-muted-foreground' />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {apartmentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls the apartment lifecycle state shown internally and on
                  cards.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_published'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
                    <FormLabel className='text-base font-medium'>
                      Publish To Marketplace
                    </FormLabel>
                  </div>
                  <FormDescription>
                    Published apartments appear in the member marketplace.
                    Drafts stay admin-only.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-medium'>Apartment Economics</h3>
          <p className='text-sm text-muted-foreground'>
            Admin owns the apartment economics. Listed value is computed from
            costs and margin, but can be adjusted later by updating these
            numbers.
          </p>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {moneyFields.map(([name, label]) => (
            <MoneyField key={name} name={name} label={label} />
          ))}
          <FormField
            control={form.control}
            name='markup_percentage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margin %</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    max={100}
                    placeholder='0'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional. Leave 0 if margin should not affect the listing.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='listed_value'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Computed Listed Value</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <UGXIcon className='absolute left-2 top-1.5' />
                    <Input
                      className='pl-10'
                      value={formatNumber(field.value || computedListedValue)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        field.onChange(rawValue ? parseInt(rawValue) : 0);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Current calculation: UGX {formatNumber(computedListedValue)}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>Performance & Timing</h3>
        <div className='grid gap-4 md:grid-cols-3'>
          <FormField
            control={form.control}
            name='annual_yield_min'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Yield Min %</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='16'
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ''
                          ? null
                          : Number(event.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='annual_yield_max'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Yield Max %</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='19'
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ''
                          ? null
                          : Number(event.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='occupancy_percentage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupancy %</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='100'
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ''
                          ? null
                          : Number(event.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {[
            ['earnings_active_since', 'Earnings Active Since'],
            ['last_distribution_at', 'Last Distribution'],
            ['next_distribution_at', 'Next Distribution'],
          ].map(([name, label]) => (
            <FormField
              key={name}
              control={form.control}
              name={name as keyof PropertyFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <CalendarDays className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        type='date'
                        className='pl-10'
                        value={(field.value as string | null | undefined) || ''}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <ArrayTextarea
          name='apartment_features'
          label='Apartment Features'
          description='One feature per line. Used on Prime/Live/Fractional detail screens.'
          placeholder={'3 Bedroom Penthouse\nFully Furnished\nRooftop Terrace'}
        />
        <ArrayTextarea
          name='prime_highlights'
          label='Prime Highlights'
          description='One highlight per line. Mainly used by Prime detail screens.'
          placeholder={
            'Full ownership with individual title\nPremium location\nManaged by Vestafi optional'
          }
        />
      </div>

      <FormField
        control={form.control}
        name='managed_by_vestafi'
        render={({ field }) => (
          <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
            <div className='space-y-0.5'>
              <FormLabel className='text-base font-medium'>
                Managed By Vestafi
              </FormLabel>
              <FormDescription>
                Show management assurance on cards and detail pages.
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
