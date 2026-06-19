import { ArrowRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

interface ComingSoonPageProps {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
}

export function ComingSoonPage({
  eyebrow,
  title,
  description,
  note,
  icon: Icon,
}: ComingSoonPageProps) {
  return (
    <div className='mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center'>
      <section className='relative w-full overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(145deg,#fafaf9,#ffffff_55%,#ecfdf5)] p-8 sm:p-12 lg:p-16'>
        <div className='relative z-10 max-w-2xl'>
          <div className='inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800'>
            <Icon className='h-5 w-5' />
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
          <div className='mt-8 rounded-2xl border border-stone-200/80 bg-white/75 p-5 text-sm leading-6 text-stone-600 shadow-sm backdrop-blur'>
            {note}
          </div>
          <Button asChild className='mt-8 rounded-xl'>
            <Link href={paths.listings.list}>
              Return to ownership openings
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
        <div className='absolute -right-28 -top-28 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl' />
      </section>
    </div>
  );
}
