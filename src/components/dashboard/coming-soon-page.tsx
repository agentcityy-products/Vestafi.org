import {
  ArrowRight,
  Construction,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

interface ComingSoonPageProps {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
}

export function ComingSoonPage({
  eyebrow,
  title,
  description,
  note,
}: ComingSoonPageProps) {
  return (
    <div className='mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl items-center'>
      <section className='relative w-full overflow-hidden rounded-[2rem] border border-emerald-100 bg-[linear-gradient(145deg,#ffffff,#f7fcf8_55%,#eaf8ee)] p-8 shadow-[0_24px_80px_-55px_rgba(0,82,45,.5)] sm:p-12 lg:p-16'>
        <div className='relative z-10 max-w-2xl'>
          <div className='inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-800 shadow-sm'>
            <Construction className='h-6 w-6' />
          </div>
          <p className='mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700'>
            {eyebrow}
          </p>
          <h1 className='mt-4 text-4xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-5xl'>
            {title}
          </h1>
          <p className='mt-5 max-w-xl text-lg leading-8 text-stone-600'>
            {description}
          </p>
          <div className='mt-8 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm'>
            <div className='flex items-center gap-2 bg-emerald-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white'>
              <Construction className='h-4 w-4 text-emerald-200' />
              Coming soon
            </div>
            <p className='p-5 text-sm leading-6 text-stone-600'>{note}</p>
          </div>
          <Button asChild className='mt-8 rounded-xl'>
            <Link href={paths.listings.list}>
              Return to ownership openings
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
        <div className='absolute -right-28 -top-28 h-96 w-96 rounded-full bg-emerald-200/55 blur-3xl' />
        <div className='absolute -bottom-32 right-28 h-72 w-72 rounded-full bg-amber-100/45 blur-3xl' />
      </section>
    </div>
  );
}
