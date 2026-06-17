'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  showClearButton?: boolean;
}

export function MultiSelectCombobox({
  options,
  value = [],
  onChange,
  placeholder = 'Select items...',
  label,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  className,
  showClearButton = true,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  const toggleOption = (option: MultiSelectOption) => {
    const newValue = value.includes(option.value)
      ? value.filter((v) => v !== option.value)
      : [...value, option.value];
    onChange(newValue);
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const clearAll = () => {
    onChange([]);
  };

  // Filter options based on search query (case-insensitive)
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [options, searchQuery]);

  return (
    <>
      {label && <Label>{label}</Label>}

      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between'
          >
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : placeholder}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[--radix-popover-trigger-width] p-0'
          align='start'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className='max-h-64 overflow-auto'>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      toggleOption(option);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(option.value)
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedOptions.length > 0 && (
        <div className='flex flex-wrap items-center gap-1'>
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant='secondary' className='gap-1'>
              {option.label}
              <button
                type='button'
                className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    removeOption(option.value);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => removeOption(option.value)}
              >
                <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
              </button>
            </Badge>
          ))}
          {showClearButton && selectedOptions.length > 0 && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs'
              onClick={clearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </>
  );
}
