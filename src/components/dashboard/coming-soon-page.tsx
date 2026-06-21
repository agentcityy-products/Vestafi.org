import Link from 'next/link';

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
      <section className='relative w-full overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/50 p-8 shadow-xl sm:p-12 lg:p-16'>
        <div className='relative z-10 max-w-2xl'>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-2xl shadow-sm'>
            🏗️
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
            <div className='bg-emerald-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white'>
              Coming soon
            </div>
            <p className='p-5 text-sm leading-6 text-stone-600'>{note}</p>
          </div>

          <Link
            href='/listings'
            className='mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900'
          >
            Return to ownership openings →
          </Link>
        </div>
        <div className='absolute -right-28 -top-28 h-96 w-96 rounded-full bg-emerald-200/55 blur-3xl' />
      </section>
    </div>
  );
}
