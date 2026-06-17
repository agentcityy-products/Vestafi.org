'use client';

import {
  Building2,
  Calendar,
  Copy,
  DollarSign,
  HelpCircle,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { PropertyImageGallery } from './property-image-gallery';

import { ListingsViewRow } from '@/types/dao';

interface PropertyDetailsProps {
  property: ListingsViewRow;
  isExitWindow?: boolean;
}

// Reusable tooltip component for investment metrics
const MetricTooltip = ({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip: string;
}) => {
  return (
    <div className='flex items-center justify-center gap-1'>
      {children}
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className='-mt-1 h-3.5 w-3.5 text-muted-foreground' />
        </TooltipTrigger>
        <TooltipContent>
          <p className='w-60 text-sm'>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export const PropertyDetails = ({
  property,
  isExitWindow = false,
}: PropertyDetailsProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFullAddress = () => {
    const parts = [
      property.address_line_1,
      property.address_line_2,
      property.city,
      property.state,
      property.zip_code,
      property.country,
    ].filter(Boolean);

    return parts.join(', ');
  };

  const copyPropertyId = async () => {
    try {
      await navigator.clipboard.writeText(property.id || '');
      toast.success('Property ID copied to clipboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to copy property ID');
    }
  };

  const investmentPercentage = property.investment_percentage || 0;
  const averageRent = property.average_rent_6_months || 0;
  const propertyValue = property.price || 0;
  const totalInvested = property.total_investment || 0;
  const remainingAmount = propertyValue - totalInvested;
  const isFullyFunded = remainingAmount <= 0;

  return (
    <div className='space-y-8'>
      {/* Property Images */}
      <PropertyImageGallery property={property} />

      {/* Property Title and Location */}
      <div>
        <h1 className='mb-4 text-3xl font-bold'>
          {property.title || 'Untitled Property'}
        </h1>
        <div className='mb-6 flex items-center text-muted-foreground'>
          <MapPin className='mr-2 h-5 w-5' />
          <span className='text-lg'>{getFullAddress()}</span>
        </div>

        <div className='flex items-center gap-4'>
          <Badge variant='outline' className='text-sm'>
            <Calendar className='mr-1 h-3 w-3' />
            Listed {formatDate(property.created_at)}
          </Badge>

          {isFullyFunded && (
            <Badge className='bg-green-100 text-sm text-green-800 hover:bg-green-100'>
              <TrendingUp className='mr-1 h-3 w-3' />
              Fully Funded
            </Badge>
          )}
        </div>
      </div>

      {/* Investment Progress Card */}
      {!isExitWindow && (
        <Card
          className={cn(
            'border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10',
            isExitWindow &&
              'border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10',
          )}
        >
          <CardHeader
            className={cn('text-primary', isExitWindow && 'text-primary')}
          >
            <CardTitle
              className={cn(
                'flex items-center gap-2',
                isExitWindow && 'text-primary',
              )}
            >
              <TrendingUp className='h-5 w-5' />
              Contribution Progress
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Progress Bar Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-muted-foreground'>
                  Funding Progress
                </span>
                <span className='text-lg font-bold text-primary'>
                  {formatNumber(investmentPercentage, 1)}%
                </span>
              </div>

              <div className='space-y-2'>
                <Progress value={investmentPercentage} className='h-3 w-full' />
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Investment Stats Grid */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-lg bg-white/60 p-4 text-center backdrop-blur-sm'>
                <MetricTooltip tooltip='The total value of the property in UGX'>
                  <p className='mb-1 text-sm text-muted-foreground'>
                    Property Value
                  </p>
                </MetricTooltip>
                <p className='text-xl font-bold'>
                  {formatCurrency(propertyValue)}
                </p>
              </div>

              <div className='rounded-lg bg-white/60 p-4 text-center backdrop-blur-sm'>
                <MetricTooltip tooltip='The total amount invested in this property so far'>
                  <p className='mb-1 text-sm text-muted-foreground'>
                    Total Funded
                  </p>
                </MetricTooltip>
                <p className='text-xl font-bold text-blue-600'>
                  {formatCurrency(totalInvested)}
                </p>
              </div>

              <div className='rounded-lg bg-white/60 p-4 text-center backdrop-blur-sm'>
                <MetricTooltip tooltip='The amount of shares still available for Contribution'>
                  <p className='mb-1 text-sm text-muted-foreground'>
                    {isFullyFunded ? 'Fully Funded' : 'Available Shares'}
                  </p>
                </MetricTooltip>
                <p
                  className={`text-xl font-bold ${isFullyFunded ? 'text-green-600' : 'text-orange-600'}`}
                >
                  {isFullyFunded
                    ? 'Complete!'
                    : formatCurrency(remainingAmount)}
                </p>
              </div>
            </div>

            {/* Investment Status Message */}
            <div
              className={`rounded-lg p-4 text-center ${
                isFullyFunded
                  ? 'border border-green-200 bg-green-50'
                  : 'border border-orange-200 bg-orange-50'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isFullyFunded ? 'text-green-800' : 'text-orange-800'
                }`}
              >
                {isFullyFunded
                  ? '🎉 This property is fully funded and generating returns!'
                  : `💰 ${formatCurrency(remainingAmount)} remaining to fully fund this property`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Returns Information */}
      {(property.minimum_monthly_rent || property.maximum_monthly_rent) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Monthly Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div className='text-center'>
                <MetricTooltip tooltip='The minimum expected monthly rental income for this property'>
                  <p className='mb-1 text-sm text-muted-foreground'>
                    Minimum Monthly Return
                  </p>
                </MetricTooltip>
                <p className='text-xl font-bold text-green-600'>
                  {formatCurrency(property.minimum_monthly_rent)}
                </p>
              </div>

              <div className='text-center'>
                <MetricTooltip tooltip='The maximum expected monthly rental income for this property'>
                  <p className='mb-1 text-sm text-muted-foreground'>
                    Maximum Monthly Return
                  </p>
                </MetricTooltip>
                <p className='text-xl font-bold text-green-600'>
                  {formatCurrency(property.maximum_monthly_rent)}
                </p>
              </div>

              {averageRent > 0 && (
                <div className='text-center'>
                  <MetricTooltip tooltip='The average monthly rental income over the past 6 months'>
                    <p className='mb-1 text-sm text-muted-foreground'>
                      6-Month Average
                    </p>
                  </MetricTooltip>
                  <p className='text-xl font-bold text-blue-600'>
                    {formatCurrency(averageRent)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Property Description */}
          {property.description && (
            <div>
              <h4 className='mb-3 font-semibold'>About This Property</h4>
              <div className='prose max-w-none'>
                <p className='whitespace-pre-wrap leading-relaxed text-muted-foreground'>
                  {property.description}
                </p>
              </div>
            </div>
          )}

          {/* Property Details */}
          <div>
            <h4 className='mb-3 font-semibold'>Details</h4>
            <div className='space-y-3'>
              <div className='flex items-center gap-4'>
                <span className='w-24 text-muted-foreground'>Address</span>
                <span className='font-medium'>{getFullAddress()}</span>
              </div>

              <div className='flex items-center gap-4'>
                <span className='w-24 text-muted-foreground'>Property ID</span>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={copyPropertyId}
                    className='h-8 w-8 p-0'
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                  <span className='font-mono text-sm font-medium'>
                    {property.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
