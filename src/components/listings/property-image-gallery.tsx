'use client';

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { ListingsViewRow } from '@/types/dao';

interface PropertyImageGalleryProps {
  property: ListingsViewRow;
}

export const PropertyImageGallery = ({
  property,
}: PropertyImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const investmentPercentage = property.investment_percentage || 0;
  const averageRent = property.average_rent_6_months || 0;

  return (
    <Card>
      <CardContent className='p-0'>
        {/* Main Image Display */}
        <div className='relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted'>
          {hasImages ? (
            <>
              <Image
                src={images[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw'
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={prevImage}
                    className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white'
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>

                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={nextImage}
                    className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white'
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>

                  <div className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-sm text-white'>
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              <div className='absolute left-4 top-4'>
                <Badge
                  variant='secondary'
                  className='bg-white/90 text-gray-900'
                >
                  <Building2 className='mr-1 h-3 w-3' />
                  {investmentPercentage > 0
                    ? `${formatNumber(investmentPercentage, 1)}% Invested`
                    : 'Available'}
                </Badge>
              </div>

              {averageRent > 0 && (
                <div className='absolute right-4 top-4'>
                  <Badge variant='default' className='bg-green-600'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    {formatCurrency(averageRent)}/mo avg
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <div className='flex h-full items-center justify-center text-muted-foreground'>
              <div className='text-center'>
                <ImageIcon className='mx-auto mb-2 h-12 w-12' />
                <p>No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* Image Grid Thumbnails */}
        {hasImages && images.length > 1 && (
          <div className='p-4'>
            <div className='grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'>
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:opacity-80 ${
                    currentImageIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${property.title} - Thumbnail ${index + 1}`}
                    fill
                    className='object-cover'
                    sizes='120px'
                  />
                  {currentImageIndex === index && (
                    <div className='absolute inset-0 bg-primary/10' />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
