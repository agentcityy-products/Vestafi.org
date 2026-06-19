'use client';

import { Mail, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { appConfig } from '@/config/app';

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SupportDialog = ({ open, onOpenChange }: SupportDialogProps) => {
  const contactLinks = [
    {
      name: 'Phone',
      icon: Phone,
      href: `tel:${appConfig.phone.vestafi_phone}`,
      color: 'text-blue-600 hover:text-blue-700',
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      href: `https://wa.me/${appConfig.phone.vestafi_whatsapp.replace(/\D/g, '')}`,
      color: 'text-green-600 hover:text-green-700',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:${appConfig.emails.support}`,
      color: 'text-blue-600 hover:text-blue-700',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center text-2xl font-semibold'>
            Speak To Vestafi
          </DialogTitle>
        </DialogHeader>

        <div className='mt-6 space-y-6'>
          <p className='text-center text-muted-foreground'>
            Need help choosing the right ownership opportunity? A Vestafi
            advisor can guide you privately.
          </p>

          <div className='grid grid-cols-3 gap-4'>
            {contactLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent'
              >
                <link.icon className={`h-6 w-6 ${link.color}`} />
                <span className='mt-2 text-sm font-medium'>{link.name}</span>
              </a>
            ))}
          </div>

          <div className='text-center text-sm text-muted-foreground'>
            <p>A Vestafi advisor typically responds within 24 hours.</p>
            <p className='mt-1'>
              Business hours: Monday - Friday, 9:00 AM - 5:00 PM EAT
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;
