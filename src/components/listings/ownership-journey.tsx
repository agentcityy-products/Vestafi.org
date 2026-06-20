'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Crown,
  KeyRound,
  ShieldCheck,
  Upload,
  Users,
  Vault,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAction } from 'next-safe-action/hooks';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { useLoggedInUser } from '@/hooks/queries/profile';
import { useVaultBalance } from '@/hooks/queries/vault';

import { createOwnershipCheckout } from '@/actions/ownership';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import { onError } from '@/lib/show-error-toast';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/number-functions';
import { uploadToSupabase } from '@/utils/supabase-bucket';

import { bankData } from '@/constants/bank-data';
import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

import { ListingsViewRow } from '@/types/dao';

type JourneyStep =
  | 'details'
  | 'ownership'
  | 'summary'
  | 'payment'
  | 'confirmed';
type PaymentMethod = 'bank_transfer' | 'vault';

const PLACEHOLDER_IMAGE = '/images/vestafi/apartment-placeholder.png';
const LIVE_MINIMUM = 1_000_000;

type CheckoutResult = {
  completed: boolean;
  expiresAt: string;
  propertyTitle: string | null;
  checkout: {
    ownershipAmount: number;
    legalFee: number;
    serviceFee: number;
    totalDue: number;
  };
};

export function OwnershipJourney({
  initialProperty: property,
}: {
  initialProperty: ListingsViewRow;
}) {
  const queryClient = useQueryClient();
  const ownershipType =
    property.opportunity_type === 'prime' ? 'prime' : 'live';
  const isPrime = ownershipType === 'prime';
  const price = Number(property.price || 0);
  const available = Math.max(
    0,
    Number(
      property.available_ownership ??
        price - Number(property.total_investment || 0),
    ),
  );
  const liveMinimum = Math.min(LIVE_MINIMUM, available);
  const [step, setStep] = useState<JourneyStep>('details');
  const [amount, setAmount] = useState(isPrime ? price : liveMinimum);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('bank_transfer');
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const { data: user } = useLoggedInUser();
  const { data: vault, isLoading: vaultLoading } = useVaultBalance();
  const vaultBalance = Number(vault?.balance || 0);

  const legalFee = isPrime ? Math.round(price * 0.015) : 0;
  const serviceFee = isPrime ? Math.round(price * 0.01) : 0;
  const totalDue = amount + legalFee + serviceFee;
  const ownershipPercentage = price > 0 ? (amount / price) * 100 : 0;
  const monthlyRent = Number(
    property.average_rent_6_months || property.minimum_monthly_rent || 0,
  );
  const monthlyDistribution = monthlyRent * (ownershipPercentage / 100);
  const annualYield =
    price > 0 && monthlyRent > 0 ? (monthlyRent * 12 * 100) / price : 17;

  const steps = useMemo(
    () =>
      isPrime
        ? [
            ['details', 'Property'],
            ['ownership', 'Price'],
            ['summary', 'Summary'],
            ['payment', 'Payment'],
            ['confirmed', 'Confirmed'],
          ]
        : [
            ['details', 'Property'],
            ['ownership', 'Amount'],
            ['summary', 'Summary'],
            ['payment', 'Payment'],
            ['confirmed', 'Confirmed'],
          ],
    [isPrime],
  );

  const checkoutAction = useAction(createOwnershipCheckout, {
    onError,
    onSuccess: ({ data }) => {
      setResult(data as CheckoutResult);
      setStep('confirmed');
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LISTINGS] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OWNERSHIP_RESERVATIONS],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VAULT] });
    },
  });

  const onDrop = useCallback((files: File[]) => {
    setProofFiles((current) => [...current, ...files].slice(0, 5));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
  });

  const submitCheckout = async () => {
    if (!property.id || !user) return;
    if (paymentMethod === 'vault' && vaultBalance < totalDue) {
      toast.error('Your Vestafi Vault balance is not enough for this payment.');
      return;
    }
    if (paymentMethod === 'bank_transfer' && proofFiles.length === 0) {
      toast.error('Upload your bank transfer proof to continue.');
      return;
    }

    const proofImages: string[] = [];
    for (const file of proofFiles) {
      const upload = await uploadToSupabase(
        file,
        `${user.id}/${property.id}/${file.name}_${Date.now()}`,
        'payment-proofs',
      );
      if (upload.error || !upload.url) {
        toast.error(`Could not upload ${file.name}. Please try again.`);
        return;
      }
      proofImages.push(upload.url);
    }

    await checkoutAction.executeAsync({
      propertyId: property.id,
      ownershipAmount: amount,
      paymentMethod,
      proofImages,
    });
  };

  const image = property.images?.[0] || PLACEHOLDER_IMAGE;
  const location = [property.city, property.state, property.country]
    .filter(Boolean)
    .join(', ');

  if (step === 'confirmed' && result) {
    return (
      <div className='mx-auto max-w-3xl py-8'>
        <Card className='overflow-hidden border-primary/20 shadow-xl'>
          <div className='bg-gradient-to-br from-emerald-950 via-primary to-emerald-700 px-6 py-12 text-center text-white'>
            <div className='mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary shadow-lg'>
              <CheckCircle2 className='h-11 w-11' />
            </div>
            <p className='text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100'>
              {result.completed ? 'Ownership confirmed' : 'Apartment reserved'}
            </p>
            <h1 className='mt-2 text-3xl font-bold md:text-4xl'>
              {result.completed
                ? 'Welcome to ownership.'
                : 'Your seven-day hold is active.'}
            </h1>
          </div>
          <CardContent className='space-y-6 p-6 md:p-9'>
            <div className='rounded-2xl border bg-muted/30 p-5'>
              <p className='font-semibold'>{result.propertyTitle}</p>
              <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                <SummaryValue
                  label='Ownership amount'
                  value={formatCurrency(result.checkout.ownershipAmount)}
                />
                <SummaryValue
                  label='Total paid / due'
                  value={formatCurrency(result.checkout.totalDue)}
                />
              </div>
            </div>
            {!result.completed && (
              <div className='flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950'>
                <CalendarClock className='mt-0.5 h-5 w-5 flex-none' />
                <p className='text-sm'>
                  Vestafi will review your bank transfer. This reservation is
                  held for you until{' '}
                  <strong>
                    {new Date(result.expiresAt).toLocaleString('en-UG', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </strong>
                  . If payment is not completed, the ownership becomes available
                  again.
                </p>
              </div>
            )}
            <div className='grid gap-3 sm:grid-cols-2'>
              <Button asChild size='lg'>
                <Link href={paths.dashboard.savingsOverview}>
                  View My Ownership <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <Button asChild size='lg' variant='outline'>
                <Link href={paths.listings.list}>Explore more apartments</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <JourneyProgress steps={steps} current={step} />

      {step === 'details' && (
        <div className='overflow-hidden rounded-[2rem] border bg-background shadow-xl'>
          <div className='relative aspect-[16/9] max-h-[600px] w-full overflow-hidden'>
            <Image
              src={image}
              alt={property.title || 'Vestafi apartment'}
              fill
              priority
              className='object-cover'
              onError={(event) => {
                event.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10' />
            <div className='absolute left-5 top-5 flex flex-wrap gap-2'>
              <Badge className={cn('px-4 py-2 text-sm', isPrime && 'bg-black')}>
                {isPrime ? (
                  <Crown className='mr-2 h-4 w-4' />
                ) : (
                  <Users className='mr-2 h-4 w-4' />
                )}
                VESTAFI {ownershipType.toUpperCase()}
              </Badge>
              <Badge variant='secondary' className='px-4 py-2 text-sm'>
                {isPrime ? (
                  <KeyRound className='mr-2 h-4 w-4' />
                ) : (
                  <Banknote className='mr-2 h-4 w-4' />
                )}
                {isPrime ? 'FULL OWNERSHIP' : 'RENT ACTIVE'}
              </Badge>
            </div>
            <Badge className='absolute bottom-5 left-5 bg-primary/95 px-4 py-2 text-sm'>
              <ShieldCheck className='mr-2 h-4 w-4' /> Managed by Vestafi
            </Badge>
          </div>
          <div className='space-y-7 p-6 md:p-10'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight md:text-5xl'>
                {property.title}
              </h1>
              <p className='mt-2 text-lg text-muted-foreground'>{location}</p>
              <p className='mt-5 max-w-3xl text-muted-foreground'>
                {property.description ||
                  'A vetted apartment inside the Vestafi Inner Society, professionally structured and managed for confident ownership.'}
              </p>
            </div>

            <div className='grid gap-4 rounded-2xl border bg-emerald-50/40 p-5 md:grid-cols-3'>
              <Feature
                icon={Building2}
                title={
                  isPrime ? 'Entire apartment available' : 'Tenant occupied'
                }
                text={
                  isPrime ? 'Become the sole owner' : 'Rental income is active'
                }
              />
              <Feature
                icon={ShieldCheck}
                title='Professionally managed'
                text='Managed by Vestafi'
              />
              <Feature
                icon={isPrime ? KeyRound : Banknote}
                title={isPrime ? 'Tenant-ready' : 'Monthly distributions'}
                text={
                  isPrime
                    ? 'Move in or lease with ease'
                    : 'Earn from active rent'
                }
              />
            </div>

            <div className='grid overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 to-primary text-white md:grid-cols-2'>
              <div className='p-6 md:p-8'>
                <p className='text-sm font-semibold uppercase tracking-wider text-amber-300'>
                  {isPrime ? 'Full ownership price' : 'Starting ownership'}
                </p>
                <p className='mt-3 text-3xl font-semibold md:text-4xl'>
                  {formatCurrency(isPrime ? price : liveMinimum)}
                </p>
                <p className='mt-3 text-sm text-emerald-100'>
                  {isPrime
                    ? 'One-time purchase. 100% ownership.'
                    : 'Choose the share that fits your goals.'}
                </p>
              </div>
              <div className='border-t border-white/15 p-6 md:border-l md:border-t-0 md:p-8'>
                <p className='text-sm font-semibold uppercase tracking-wider text-amber-300'>
                  Projected annual yield
                </p>
                <p className='mt-3 text-4xl font-semibold'>
                  {annualYield.toFixed(1)}%
                </p>
                <p className='mt-3 text-sm text-emerald-100'>
                  Estimated rental yield per year
                </p>
              </div>
            </div>

            <Button
              size='lg'
              className='h-14 w-full text-lg'
              disabled={
                available <= 0 || Boolean(isPrime && property.is_reserved)
              }
              onClick={() => setStep('ownership')}
            >
              {property.is_reserved && isPrime
                ? 'Reserved by another member'
                : isPrime
                  ? 'Own Entire Apartment'
                  : 'Join Ownership'}
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </div>
        </div>
      )}

      {step === 'ownership' && (
        <JourneyCard
          title={
            isPrime
              ? 'Full ownership and price'
              : 'Choose your ownership amount'
          }
          description={
            isPrime
              ? 'Review what is included in owning the entire apartment.'
              : 'Adjust your share and see the estimated monthly distribution.'
          }
          onBack={() => setStep('details')}
        >
          {isPrime ? (
            <div className='space-y-6'>
              <p className='text-4xl font-bold text-amber-700'>
                {formatCurrency(price)}
              </p>
              <PriceRow label='Property price' value={price} />
              <PriceRow
                label='Transfer & legal fees (estimated)'
                value={legalFee}
              />
              <PriceRow label='Vestafi service fee' value={serviceFee} />
              <Separator />
              <PriceRow label='Total amount' value={totalDue} strong />
              <div className='space-y-3 rounded-2xl bg-muted/50 p-5'>
                {[
                  'Full ownership with titled deed',
                  'Right to sell or lease the apartment',
                  'Optional property management',
                  'Access to Vestafi owner benefits',
                ].map((item) => (
                  <p key={item} className='flex gap-3 text-sm'>
                    <Check className='h-5 w-5 text-primary' /> {item}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className='space-y-7'>
              <p className='text-4xl font-bold text-primary'>
                {formatCurrency(amount)}
              </p>
              <input
                type='range'
                min={liveMinimum}
                max={available}
                step={100_000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className='w-full accent-primary'
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{formatCurrency(liveMinimum)}</span>
                <span>{formatCurrency(available)}</span>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <SummaryValue
                  label='Estimated monthly distribution'
                  value={formatCurrency(monthlyDistribution)}
                />
                <SummaryValue
                  label='Estimated annual distribution'
                  value={formatCurrency(monthlyDistribution * 12)}
                />
              </div>
              <p className='rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950'>
                Distributions are paid monthly while the apartment remains
                rented. Estimates follow current property performance and may
                vary.
              </p>
            </div>
          )}
          <Button
            size='lg'
            className='mt-7 w-full'
            onClick={() => setStep('summary')}
          >
            Continue to Summary <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </JourneyCard>
      )}

      {step === 'summary' && (
        <JourneyCard
          title='Ownership summary'
          description='Review your ownership before choosing payment.'
          onBack={() => setStep('ownership')}
        >
          <div className='flex gap-4 rounded-2xl border p-4'>
            <div className='relative h-20 w-24 flex-none overflow-hidden rounded-xl'>
              <Image src={image} alt='' fill className='object-cover' />
            </div>
            <div>
              <p className='font-semibold'>{property.title}</p>
              <p className='text-sm text-muted-foreground'>{location}</p>
              <Badge variant='outline' className='mt-2'>
                VESTAFI {ownershipType.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className='mt-6 space-y-3'>
            <PriceRow label='Ownership amount' value={amount} />
            {isPrime && (
              <PriceRow label='Transfer & legal fees' value={legalFee} />
            )}
            {isPrime && (
              <PriceRow label='Vestafi service fee' value={serviceFee} />
            )}
            <Separator />
            <PriceRow label='Total due' value={totalDue} strong />
            <PriceRow
              label='Estimated annual yield'
              textValue={`${annualYield.toFixed(1)}%`}
            />
          </div>
          <label className='mt-6 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm'>
            <Checkbox
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            />
            I have read and agree to the Terms of Service and Ownership
            Agreement.
          </label>
          <Button
            size='lg'
            className='mt-6 w-full'
            disabled={!acceptedTerms}
            onClick={() => setStep('payment')}
          >
            Continue to Payment <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </JourneyCard>
      )}

      {step === 'payment' && (
        <JourneyCard
          title='Choose a payment method'
          description='Complete immediately from Vestafi Vault or reserve for seven days with a bank transfer.'
          onBack={() => setStep('summary')}
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <PaymentChoice
              active={paymentMethod === 'bank_transfer'}
              icon={Building2}
              title='Bank Transfer'
              text='Upload proof for admin approval'
              onClick={() => setPaymentMethod('bank_transfer')}
            />
            <PaymentChoice
              active={paymentMethod === 'vault'}
              icon={Vault}
              title='Vestafi Vault'
              text={
                vaultLoading
                  ? 'Loading balance...'
                  : `Available: ${formatCurrency(vaultBalance)}`
              }
              onClick={() => setPaymentMethod('vault')}
            />
          </div>

          {paymentMethod === 'bank_transfer' ? (
            <div className='mt-6 space-y-5'>
              <div className='grid gap-3 rounded-2xl bg-muted/50 p-5 sm:grid-cols-2'>
                <SummaryValue label='Bank' value={bankData.bankName} />
                <SummaryValue
                  label='Account name'
                  value={bankData.accountName}
                />
                <SummaryValue
                  label='Account number'
                  value={bankData.accountNumber}
                />
                <SummaryValue label='Amount' value={formatCurrency(totalDue)} />
              </div>
              <div
                {...getRootProps()}
                className={cn(
                  'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50',
                )}
              >
                <input {...getInputProps()} />
                <Upload className='mx-auto h-8 w-8 text-primary' />
                <p className='mt-3 font-medium'>Upload bank transfer proof</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Images or PDF, up to five files
                </p>
              </div>
              {proofFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className='flex items-center justify-between rounded-xl border px-4 py-3 text-sm'
                >
                  <span className='truncate'>{file.name}</span>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() =>
                      setProofFiles((files) =>
                        files.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
              <p className='flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950'>
                <CalendarClock className='h-5 w-5 flex-none' />
                Once submitted, this ownership is reserved in your name for
                seven days while Vestafi confirms the transfer.
              </p>
            </div>
          ) : (
            <div className='mt-6 rounded-2xl border p-5'>
              <PriceRow label='Vestafi Vault balance' value={vaultBalance} />
              <PriceRow label='Total due' value={totalDue} />
              <Separator className='my-3' />
              <PriceRow
                label='Balance after ownership'
                value={vaultBalance - totalDue}
                strong
              />
              {vaultBalance < totalDue && (
                <p className='mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700'>
                  Add {formatCurrency(totalDue - vaultBalance)} to Vestafi Vault
                  before continuing.
                </p>
              )}
            </div>
          )}

          <Button
            size='lg'
            className='mt-6 w-full'
            disabled={
              checkoutAction.isExecuting ||
              (paymentMethod === 'vault' && vaultBalance < totalDue)
            }
            onClick={() => void submitCheckout()}
          >
            {checkoutAction.isExecuting
              ? 'Completing ownership...'
              : paymentMethod === 'vault'
                ? 'Complete with Vestafi Vault'
                : 'Submit Transfer & Reserve'}
            {!checkoutAction.isExecuting && (
              <ArrowRight className='ml-2 h-4 w-4' />
            )}
          </Button>
        </JourneyCard>
      )}
    </div>
  );
}

function JourneyProgress({
  steps,
  current,
}: {
  steps: string[][];
  current: JourneyStep;
}) {
  const currentIndex = steps.findIndex(([id]) => id === current);
  return (
    <div className='overflow-x-auto rounded-2xl border bg-background px-4 py-4'>
      <div className='mx-auto flex min-w-[580px] max-w-3xl items-center'>
        {steps.map(([id, label], index) => (
          <div key={id} className='flex flex-1 items-center last:flex-none'>
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold',
                  index <= currentIndex
                    ? 'border-primary bg-primary text-white'
                    : 'bg-background text-muted-foreground',
                )}
              >
                {index < currentIndex ? (
                  <Check className='h-4 w-4' />
                ) : (
                  index + 1
                )}
              </span>
              <span className='text-xs font-medium'>{label}</span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'mx-3 h-px flex-1',
                  index < currentIndex ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function JourneyCard({
  title,
  description,
  onBack,
  children,
}: {
  title: string;
  description: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className='mx-auto max-w-2xl shadow-lg'>
      <CardContent className='p-6 md:p-9'>
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 mb-5'
          onClick={onBack}
        >
          <ArrowLeft className='mr-2 h-4 w-4' /> Back
        </Button>
        <h1 className='text-2xl font-bold md:text-3xl'>{title}</h1>
        <p className='mt-2 text-muted-foreground'>{description}</p>
        <div className='mt-7'>{children}</div>
      </CardContent>
    </Card>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Building2;
  title: string;
  text: string;
}) {
  return (
    <div className='flex gap-3'>
      <div className='flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-primary shadow-sm'>
        <Icon className='h-5 w-5' />
      </div>
      <div>
        <p className='font-semibold'>{title}</p>
        <p className='text-sm text-muted-foreground'>{text}</p>
      </div>
    </div>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className='mt-1 font-semibold'>{value}</p>
    </div>
  );
}

function PriceRow({
  label,
  value,
  textValue,
  strong,
}: {
  label: string;
  value?: number;
  textValue?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4',
        strong && 'text-lg font-bold',
      )}
    >
      <span>{label}</span>
      <span className={cn(strong && 'text-primary')}>
        {textValue ?? formatCurrency(Number(value || 0))}
      </span>
    </div>
  );
}

function PaymentChoice({
  active,
  icon: Icon,
  title,
  text,
  onClick,
}: {
  active: boolean;
  icon: typeof Building2;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-5 text-left transition-all hover:border-primary',
        active && 'border-primary bg-primary/5 ring-1 ring-primary',
      )}
    >
      <Icon className='h-7 w-7 text-primary' />
      <p className='mt-4 font-semibold'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{text}</p>
    </button>
  );
}
