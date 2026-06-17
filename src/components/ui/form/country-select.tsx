'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

import { countries, getCountryFlag } from '@/constants/countries';

interface CountrySelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  className?: string;
  placeholder?: string;
}

export function CountrySelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  className,
  placeholder = 'Select country...',
}: CountrySelectProps<TFieldValues, TName>) {
  const [open, setOpen] = React.useState(false);
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  const selectedCountry = countries.find(
    (c) => c.name === field.value || c.code === field.value,
  );

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='h-14 w-full justify-between text-lg'
            >
              <div className='flex items-center gap-2'>
                {selectedCountry && (
                  <div className='relative h-5 w-5 overflow-hidden rounded-full'>
                    <Image
                      src={getCountryFlag(selectedCountry.code)}
                      alt={selectedCountry.name}
                      fill
                      className='object-cover'
                    />
                  </div>
                )}
                <span
                  className={selectedCountry ? '' : 'text-muted-foreground'}
                >
                  {selectedCountry?.name || placeholder}
                </span>
              </div>
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className='w-[--radix-popover-trigger-width] p-0'
          align='start'
        >
          <Command>
            <CommandInput placeholder='Search country...' className='h-9' />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className='max-h-[300px] overflow-auto'>
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code}`}
                    onSelect={() => {
                      field.onChange(country.name); // Store full country name
                      setOpen(false);
                    }}
                    className='cursor-pointer'
                  >
                    <div className='flex items-center gap-2'>
                      <div className='relative h-4 w-4 overflow-hidden rounded-full'>
                        <Image
                          src={getCountryFlag(country.code)}
                          alt={country.name}
                          fill
                          className='object-cover'
                        />
                      </div>
                      <span>{country.name}</span>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        field.value === country.name
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <FormMessage>{error.message}</FormMessage>}
    </FormItem>
  );
}
