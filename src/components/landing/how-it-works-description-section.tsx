'use client';

export const HowItWorksDescriptionSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900/90 to-green-900/90 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-3xl'>
          <div className='rounded-lg border border-emerald-400/20 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-8 shadow-2xl backdrop-blur-sm sm:p-12'>
            <p className='text-lg leading-relaxed text-slate-200 sm:text-xl'>
              Vestafi operates as a private, invitation-based circle where
              aligned members come together to collectively hold and manage
              specific apartments, contributing by mutual agreement and shared
              understanding of how rental income is generated.
            </p>
            <p className='mt-6 text-lg leading-relaxed text-slate-300 sm:text-xl'>
              Participation is voluntary, internal, and tied to real apartments
              within the circle, offering those who value structure, patience,
              and long-term alignment a quieter way to be part of
              income-producing living spaces rather than a public financial
              scheme.
            </p>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-400/10 to-green-400/10 blur-3xl'></div>
        <div className='absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-green-400/10 to-teal-400/10 blur-3xl'></div>
      </div>
    </section>
  );
};

