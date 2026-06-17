'use client';

import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentProofsViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
}

export function PaymentProofsViewer({
  isOpen,
  onClose,
  images,
}: PaymentProofsViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-proof-${currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    }
  };

  const handleClose = () => {
    setCurrentImageIndex(0);
    onClose();
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Payment Proofs</DialogTitle>
          <DialogDescription>
            {hasMultipleImages
              ? `Image ${currentImageIndex + 1} of ${images.length}`
              : 'Payment proof image'}
          </DialogDescription>
        </DialogHeader>

        <div className='relative'>
          {/* Image Container */}
          <div className='relative aspect-video w-full overflow-hidden rounded-lg bg-muted'>
            <Image
              src={currentImage}
              alt={`Payment proof ${currentImageIndex + 1}`}
              fill
              className='object-contain'
              unoptimized
            />
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <Button
                variant='outline'
                size='icon'
                className='absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm'
                onClick={goToPrevious}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm'
                onClick={goToNext}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </>
          )}

          {/* Close Button */}
          <Button
            variant='outline'
            size='icon'
            className='absolute right-2 top-2 bg-background/80 backdrop-blur-sm'
            onClick={handleClose}
          >
            <X className='h-4 w-4' />
          </Button>

          {/* Download Button */}
          <Button
            variant='outline'
            size='icon'
            className='absolute left-2 top-2 bg-background/80 backdrop-blur-sm'
            onClick={downloadImage}
          >
            <Download className='h-4 w-4' />
          </Button>
        </div>

        {/* Image Thumbnails */}
        {hasMultipleImages && (
          <div className='flex gap-2 overflow-x-auto py-2'>
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                  index === currentImageIndex
                    ? 'border-primary'
                    : 'border-muted'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className='object-cover'
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
