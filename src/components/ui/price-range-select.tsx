'use client';

import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';


interface PriceRangeSelectProps {
  value: { min?: number; max?: number };
  onChange: (value: { min?: number; max?: number }) => void;
  placeholder?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
}

const formatCurrency = (value: number): string => {
  // Format as USh (Ugandan Shilling)
  const formatted = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  // Replace UGX with USh for display
  return formatted.replace('UGX', 'USh');
};

export function PriceRangeSelect({
  value,
  onChange,
  placeholder = 'Select price range',
  label,
  min = 0,
  max = 10000000, // 10M
  step = 10000,
}: PriceRangeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [localValue, setLocalValue] = React.useState<[number, number]>([
    value.min ?? min,
    value.max ?? max,
  ]);

  // Update local value when external value changes
  React.useEffect(() => {
    setLocalValue([value.min ?? min, value.max ?? max]);
  }, [value.min, value.max, min, max]);

  const handleSliderChange = (newValue: number[]) => {
    if (newValue.length === 2) {
      setLocalValue([newValue[0], newValue[1]]);
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(numValue, localValue[1]));
    setLocalValue([clampedValue, localValue[1]]);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value) || max;
    const clampedValue = Math.max(localValue[0], Math.min(numValue, max));
    setLocalValue([localValue[0], clampedValue]);
  };

  const handleApply = () => {
    const newValue = {
      min: localValue[0] !== min ? localValue[0] : undefined,
      max: localValue[1] !== max ? localValue[1] : undefined,
    };
    onChange(newValue);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalValue([min, max]);
    onChange({ min: undefined, max: undefined });
    setOpen(false);
  };

  const hasSelection =
    (value.min !== undefined && value.min !== min) ||
    (value.max !== undefined && value.max !== max);

  const displayText = hasSelection
    ? `${formatCurrency(value.min ?? min)} - ${formatCurrency(value.max ?? max)}`
    : placeholder;

  return (
    <div className='space-y-2'>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between'
          >
            {displayText}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[--radix-popover-trigger-width] p-4'
          align='start'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Price Range</span>
                <span className='font-medium'>
                  {formatCurrency(localValue[0])} -{' '}
                  {formatCurrency(localValue[1])}
                </span>
              </div>
              <Slider
                value={localValue}
                onValueChange={handleSliderChange}
                min={min}
                max={max}
                step={step}
                className='w-full'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='min-price-input' className='text-xs'>
                  Min Price
                </Label>
                <Input
                  id='min-price-input'
                  type='number'
                  value={localValue[0]}
                  onChange={handleMinInputChange}
                  min={min}
                  max={localValue[1]}
                  step={step}
                  className='w-full'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='max-price-input' className='text-xs'>
                  Max Price
                </Label>
                <Input
                  id='max-price-input'
                  type='number'
                  value={localValue[1]}
                  onChange={handleMaxInputChange}
                  min={localValue[0]}
                  max={max}
                  step={step}
                  className='w-full'
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleClear}
                className='text-xs'
              >
                Clear
              </Button>
              <Button type='button' size='sm' onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
