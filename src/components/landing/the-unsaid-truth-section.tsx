'use client';

export const TheUnsaidTruthSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/30 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <h2 className='mb-6 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
            You have been losing time and access.
          </h2>
          <p className='mx-auto max-w-3xl text-center text-lg leading-relaxed text-slate-700 sm:text-xl'>
            You are faced with the pain of a future that moves forward without
            you. But with Vestafi, you now have the opportunity to join an elite
            circle of people with one mission: To co-own apartments and generate
            rent from them.
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

