'use client';

import { Card, CardContent } from '@/components/ui/card';

export const AboutStorySection = () => {
  return (
    <section className='relative overflow-hidden bg-white py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          {/* Section 1: The Story of Vestafi */}
          <div className='mb-20'>
            <h2 className='mb-8 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
              The Story of Vestafi
            </h2>
            <div className='space-y-6 text-center'>
              <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
                Vestafi began in 2022 with a quiet but unsettling realization:
                apartments generate rent every single month, yet meaningful
                ownership remains unreachable for many capable, disciplined people,
                especially those whose capital is fragmented across borders,
                commitments, or institutions that move too slowly.
              </p>
              <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
                In Uganda, over 71% of urban households rent, not temporarily, but
                structurally. At the same time, the country faces a housing deficit
                of approximately 2.4 million units, a gap that continues to widen
                as urbanisation accelerates faster than formal supply. To merely
                stabilise this deficit, Uganda would need to deliver close to
                300,000 new housing units every year, a scale that individual
                ownership and traditional financing models cannot realistically
                absorb on their own.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className='mt-12 grid gap-6 sm:grid-cols-3'>
              <Card className='border-slate-200 bg-slate-50'>
                <CardContent className='p-6 text-center'>
                  <div className='mb-2 text-4xl font-bold text-slate-900 sm:text-5xl'>
                    71%
                  </div>
                  <p className='text-sm text-slate-700 sm:text-base'>
                    Urban households renting
                  </p>
                </CardContent>
              </Card>
              <Card className='border-slate-200 bg-slate-50'>
                <CardContent className='p-6 text-center'>
                  <div className='mb-2 text-4xl font-bold text-slate-900 sm:text-5xl'>
                    2.4M
                  </div>
                  <p className='text-sm text-slate-700 sm:text-base'>
                    Housing deficit units
                  </p>
                </CardContent>
              </Card>
              <Card className='border-slate-200 bg-slate-50'>
                <CardContent className='p-6 text-center'>
                  <div className='mb-2 text-4xl font-bold text-slate-900 sm:text-5xl'>
                    300K
                  </div>
                  <p className='text-sm text-slate-700 sm:text-base'>
                    Units needed annually
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className='mt-12 text-center text-lg leading-relaxed text-slate-700'>
              For working people in East Africa & the diaspora, high-net-worth
              individuals, and long-term partners, this reality creates a paradox:
              capital exists, demand exists, but the pathways to participate
              responsibly, remotely, and without friction remain limited.
            </p>
          </div>

          {/* Section 2: An Operational Question */}
          <div className='mb-20'>
            <h2 className='mb-8 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
              An Operational Question
            </h2>
            <div className='space-y-6 text-center'>
              <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
                Rather than treating this as a policy debate or a fundraising
                story, Hakiza Ronald approached it as an operational question:
                what works in practice, when distance, scale, and accountability
                all matter? Hakiza Ronald began by acquiring and managing
                apartments himself, learning firsthand the realities of rent,
                occupancy, maintenance cycles, cash flow discipline, and reporting
                long before inviting anyone else into the structure.
              </p>
              <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
                What later became Vestafi grew quietly from that discipline, first
                among a small trusted circle, anchored in real apartments, real
                tenants, real expenses, and rental income that was tracked,
                documented, and handled responsibly. There were no projections
                without receipts, and no expansion without operational proof.
              </p>
              <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
                As the structure proved itself, participation expanded deliberately
                into a private, invitation-based circle built on alignment,
                patience, and shared expectations. Collective participation was
                not positioned as a shortcut, but as a practical response to a
                housing market where scale, governance, and execution matter more
                than individual effort alone.
              </p>
            </div>
          </div>

          {/* Section 3: Vestafi Today */}
          <div className='mb-20'>
            <Card className='border-slate-200 bg-slate-50'>
              <CardContent className='p-8 sm:p-12'>
                <h2 className='mb-8 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                  Vestafi Today
                </h2>
                <div className='mb-12 space-y-6 text-center'>
                  <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
                    Today, Vestafi remains intentionally measured. Apartments are
                    held within a clear internal structure, participation is recorded
                    individually, and involvement is governed by agreement rather
                    than persuasion.
                  </p>
                  <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
                    This allows diaspora participants, HNW individuals, and aligned
                    institutions to engage with income-producing apartments through a
                    disciplined and documented framework without speculative
                    pressure.
                  </p>
                </div>

                {/* Two Panels */}
                <div className='grid gap-6 sm:grid-cols-2'>
                  <Card className='border-slate-200 bg-white'>
                    <CardContent className='p-6'>
                      <h3 className='mb-4 text-xl font-bold text-slate-900'>
                        Our Participants
                      </h3>
                      <ul className='space-y-2 text-base text-slate-700'>
                        <li className='flex items-start'>
                          <span className='mr-2 text-slate-400'>•</span>
                          <span>East African diaspora</span>
                        </li>
                        <li className='flex items-start'>
                          <span className='mr-2 text-slate-400'>•</span>
                          <span>High-net-worth individuals</span>
                        </li>
                        <li className='flex items-start'>
                          <span className='mr-2 text-slate-400'>•</span>
                          <span>Long-term aligned partners</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className='border-slate-200 bg-white'>
                    <CardContent className='p-6'>
                      <h3 className='mb-4 text-xl font-bold text-slate-900'>
                        Our Principles
                      </h3>
                      <ul className='space-y-2 text-base text-slate-700'>
                        <li className='flex items-start'>
                          <span className='mr-2 text-slate-400'>•</span>
                          <span>Operational proof before expansion</span>
                        </li>
                        <li className='flex items-start'>
                          <span className='mr-2 text-slate-400'>•</span>
                          <span>Documented and tracked income</span>
                        </li>
                        <li className='flex items-start'>
                          <span className='mr-2 text-slate-400'>•</span>
                          <span>Governed by agreement</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 4: Closing Statement */}
          <div className='text-center'>
            <div className='mx-auto mb-8 h-px w-24 bg-slate-300'></div>
            <p className='mx-auto mb-6 max-w-3xl text-lg leading-relaxed text-slate-700'>
              Vestafi is not built for everyone. It is designed for those who
              understand that proximity to well-run structures matters, especially
              before they become crowded or institutionalised.
            </p>
            <p className='mx-auto max-w-3xl text-lg leading-relaxed text-slate-700'>
              Each apartment limits participation by design, and once an apartment
              is fully held, it is closed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

