'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useLoggedInUser } from '@/hooks/queries/profile';

import Logo from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { cn } from '@/lib/utils';

import { paths } from '@/constants/paths';

export const LandingNavbar = ({
  isInHomePage = false,
  showRentAnApartmentButton = true,
}: {
  isInHomePage?: boolean;
  showRentAnApartmentButton?: boolean;
}) => {
  const { data: user, isLoading } = useLoggedInUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full border-b backdrop-blur',
        isInHomePage ? 'border-border/10' : 'border-border/60',
      )}
    >
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <Logo />

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-4 sm:flex'>
          <div className='flex gap-4'>
            <Link
              href={paths.howItWorks}
              className={cn(
                'text-sm font-medium transition-colors',
                isInHomePage
                  ? 'text-white hover:text-white/80'
                  : 'text-foreground hover:text-foreground/80',
              )}
            >
              How It Works
            </Link>
            <Link
              href={paths.about}
              className={cn(
                'text-sm font-medium transition-colors',
                isInHomePage
                  ? 'text-white hover:text-white/80'
                  : 'text-foreground hover:text-foreground/80',
              )}
            >
              About
            </Link>
          </div>
          {showRentAnApartmentButton && (
            <Button
              asChild
              variant='outline'
              className={cn(
                isInHomePage
                  ? 'border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white'
                  : 'border-border',
              )}
            >
              <Link href={paths.rentalProperties.list}>Rent an Apartment</Link>
            </Button>
          )}
          {isLoading ? (
            <Button
              className='w-28 animate-pulse bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
              disabled
            />
          ) : user ? (
            <Link href={paths.dashboard.root}>
              <Button className='bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'>
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Button
                asChild
                variant='ghost'
                className='hover:bg-white/10 hover:text-foreground'
              >
                <Link href={paths.auth.login}>Sign In</Link>
              </Button>
              <Button
                asChild
                className='bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
              >
                <Link href={paths.auth.apply}>Apply to Join</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className='flex items-center gap-2 sm:hidden'>
          {isLoading ? (
            <Button
              className='w-20 animate-pulse bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
              disabled
            />
          ) : user ? (
            <Link href={paths.dashboard.root}>
              <Button className='bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'>
                Dashboard
              </Button>
            </Link>
          ) : (
            <Button
              asChild
              className='bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
            >
              <Link href={paths.auth.apply}>Apply</Link>
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className={cn(
                  isInHomePage
                    ? 'text-white hover:bg-white/10'
                    : 'text-foreground hover:bg-accent',
                )}
              >
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-80'>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className='mt-8 flex flex-col gap-4'>
                <Link
                  href={paths.howItWorks}
                  onClick={() => setMobileMenuOpen(false)}
                  className='text-base font-medium text-foreground transition-colors hover:text-foreground/80'
                >
                  How It Works
                </Link>
                <Link
                  href={paths.about}
                  onClick={() => setMobileMenuOpen(false)}
                  className='text-base font-medium text-foreground transition-colors hover:text-foreground/80'
                >
                  About
                </Link>
                {showRentAnApartmentButton && (
                  <Link
                    href={paths.rentalProperties.list}
                    onClick={() => setMobileMenuOpen(false)}
                    className='text-base font-medium text-foreground transition-colors hover:text-foreground/80'
                  >
                    Rent an Apartment
                  </Link>
                )}
                {!user && (
                  <Button
                    asChild
                    variant='ghost'
                    className='w-full justify-start'
                  >
                    <Link
                      href={paths.auth.login}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
