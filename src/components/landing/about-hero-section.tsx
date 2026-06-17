'use client';

export const AboutHeroSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/30 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl'>
            About Us
          </h1>
          <p className='text-xl text-slate-700 sm:text-2xl'>
            The story of Vestafi
          </p>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-200/20 to-green-200/20 blur-3xl'></div>
        <div className='absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-green-200/20 to-teal-200/20 blur-3xl'></div>
      </div>
    </section>
  );
};

