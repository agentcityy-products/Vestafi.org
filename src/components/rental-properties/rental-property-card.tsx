'use client';

import { format } from 'date-fns';
import { Calendar, MapPin, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect,useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';

import type { PropertyRow } from '@/types/dao';

interface RentalPropertyCardProps {
  property: PropertyRow;
  defaultDateRange?: DateRange;
}

// Generate WhatsApp message template with date range
const generateWhatsAppMessage = (
  property: PropertyRow,
  dateRange?: DateRange,
): string => {
  const location = [property.city, property.country].filter(Boolean).join(', ');

  let message = `Hi! I'm interested in booking "${property.title}" located in ${location}. I found this listing on Vestafi.`;

  if (dateRange?.from && dateRange?.to) {
    const checkIn = format(dateRange.from, 'MMM dd, yyyy');
    const checkOut = format(dateRange.to, 'MMM dd, yyyy');
    const nights = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalCost = (property.price || 0) * nights;

    message += `\n\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nDuration: ${nights} night${nights > 1 ? 's' : ''}\nTotal Cost: ${formatCurrency(totalCost)}`;
  }

  message += '\n\nCould you please provide more information?';

  return message;
};

// Generate WhatsApp URL
const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  // Remove any non-digit characters except +
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const RentalPropertyCard = ({
  property,
  defaultDateRange,
}: RentalPropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultDateRange,
  );

  // Track if user has manually selected a date range on this card
  const [hasUserSelection, setHasUserSelection] = useState(false);

  // Update local dateRange when defaultDateRange changes (from filter)
  // But only if user hasn't selected their own range yet
  useEffect(() => {
    if (defaultDateRange && !hasUserSelection) {
      setDateRange(defaultDateRange);
    }
  }, [defaultDateRange, hasUserSelection]);

  // Handle date range change - mark as user selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setHasUserSelection(true);
    } else if (!range) {
      // If cleared, reset user selection flag
      setHasUserSelection(false);
    }
  };

  if (!property.id) return null;

  const getMainImage = () => {
    return property.images && property.images.length > 0
      ? property.images[currentImageIndex]
      : '/placeholder-property.jpg';
  };

  const hasMultipleImages = property.images && property.images.length > 1;

  // Show only city and country (exact address hidden from users)
  const getDisplayLocation = () => {
    const parts = [property.city, property.country].filter(Boolean);
    return parts.join(', ');
  };

  // Calculate total cost based on date range
  const calculateTotalCost = () => {
    if (!dateRange?.from || !dateRange?.to || !property.price) return 0;
    const nights = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
    );
    return property.price * nights;
  };

  const totalCost = calculateTotalCost();
  const nights =
    dateRange?.from && dateRange?.to
      ? Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const handleBookClick = () => {
    const adminWhatsApp = appConfig.phone.whatsapp;
    if (!adminWhatsApp) {
      return;
    }

    const message = generateWhatsAppMessage(property, dateRange);
    const whatsappUrl = generateWhatsAppUrl(adminWhatsApp, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className='group overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg'>
      <div className='relative aspect-[4/3] overflow-hidden'>
        <Image
          src={getMainImage()}
          alt={property.title || 'Rental Property'}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />

        {/* Image Navigation */}
        {hasMultipleImages && (
          <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1'>
            {property.images?.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  index === currentImageIndex ? 'w-4 bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        <div className='absolute left-4 top-4'>
          <Badge variant='secondary' className='bg-white/90 text-gray-900'>
            For Rent
          </Badge>
        </div>
      </div>

      <div className='relative'>
        <div className='px-6 pt-6'>
          <h3 className='line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary'>
            {property.title || 'Untitled Property'}
          </h3>
        </div>

        <CardContent className='space-y-4 pb-0 pt-2'>
          <div className='flex items-center text-sm text-muted-foreground'>
            <MapPin className='mr-1 h-4 w-4 flex-shrink-0' />
            <span className='line-clamp-1'>{getDisplayLocation()}</span>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center text-sm text-muted-foreground'>
              <Calendar className='mr-1 h-4 w-4' />
              <span>Price Per Night</span>
            </div>
            <p className='text-lg font-semibold'>
              {formatCurrency(property.price) || 'N/A'}
            </p>
          </div>

          <div className='space-y-2'>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder='Select check-in/check-out dates'
            />
            {dateRange?.from && dateRange?.to && property.price && (
              <div className='rounded-lg bg-muted/50 p-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    {nights} night{nights > 1 ? 's' : ''} ×{' '}
                    {formatCurrency(property.price)}/night
                  </span>
                  <span className='font-semibold'>
                    Total: {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className='p-6 pt-2'>
          <Button className='w-full' onClick={handleBookClick}>
            <MessageCircle className='mr-2 h-4 w-4' />
            Contact Host on WhatsApp
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};
