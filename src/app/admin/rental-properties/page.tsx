'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  FileImage,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounceValue } from 'usehooks-ts';
import { z } from 'zod';

import { useAdminRentalProperties } from '@/hooks/queries/rental-properties';

import { updateRentalPropertySchema } from '@/schema/rental-property';
import {
  approveRentalProperty,
  rejectRentalProperty,
  updateRentalProperty,
} from '@/actions/admin-rental-properties';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { onError } from '@/lib/show-error-toast';
import { formatCurrency } from '@/utils/number-functions';

import { QueryKeys } from '@/constants/query-keys';

import { PropertyRow, PropertyWithProfile } from '@/types/dao';

// Custom viewers for property images and ownership proof
function PropertyImagesViewer({
  isOpen,
  onClose,
  images,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    setCurrentImageIndex(0);
    onClose();
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Property Images</DialogTitle>
          <DialogDescription>
            {hasMultipleImages
              ? `Image ${currentImageIndex + 1} of ${images.length}`
              : 'Property image'}
          </DialogDescription>
        </DialogHeader>

        <div className='relative'>
          <div className='relative aspect-video w-full overflow-hidden rounded-lg bg-muted'>
            <Image
              src={currentImage}
              alt={`Property image ${currentImageIndex + 1}`}
              fill
              className='object-contain'
              unoptimized
            />
          </div>

          {hasMultipleImages && (
            <>
              <Button
                variant='outline'
                size='icon'
                className='absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm'
                onClick={goToPrevious}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm'
                onClick={goToNext}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </>
          )}

          {hasMultipleImages && (
            <div className='mt-4 flex gap-2 overflow-x-auto py-2'>
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                    index === currentImageIndex
                      ? 'border-primary'
                      : 'border-muted'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className='object-cover'
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OwnershipProofViewer({
  isOpen,
  onClose,
  images,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName =
        currentImage.split('/').pop() ||
        `ownership-proof-${currentImageIndex + 1}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download document');
    }
  };

  const handleClose = () => {
    setCurrentImageIndex(0);
    onClose();
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Ownership Proof Documents</DialogTitle>
          <DialogDescription>
            {hasMultipleImages
              ? `Document ${currentImageIndex + 1} of ${images.length}`
              : 'Ownership proof document'}
          </DialogDescription>
        </DialogHeader>

        <div className='relative'>
          <div className='relative aspect-video w-full overflow-hidden rounded-lg bg-muted'>
            <Image
              src={currentImage}
              alt={`Ownership proof ${currentImageIndex + 1}`}
              fill
              className='object-contain'
              unoptimized
            />
          </div>

          {hasMultipleImages && (
            <>
              <Button
                variant='outline'
                size='icon'
                className='absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm'
                onClick={goToPrevious}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm'
                onClick={goToNext}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </>
          )}

          <Button
            variant='outline'
            size='icon'
            className='absolute left-2 top-2 bg-background/80 backdrop-blur-sm'
            onClick={downloadImage}
          >
            <Download className='h-4 w-4' />
          </Button>

          {hasMultipleImages && (
            <div className='mt-4 flex gap-2 overflow-x-auto py-2'>
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                    index === currentImageIndex
                      ? 'border-primary'
                      : 'border-muted'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className='object-cover'
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const rejectRentalPropertyFormSchema = z.object({
  rejection_reason: z.string().min(1, {
    message: 'Rejection reason is required.',
  }),
});

type RejectRentalPropertyFormData = z.infer<
  typeof rejectRentalPropertyFormSchema
>;

type EditRentalPropertyFormData = z.infer<typeof updateRentalPropertySchema>;

export default function RentalPropertiesPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'approved' | 'rejected' | 'all'
  >('all');
  const [selectedProperty, setSelectedProperty] = useState<PropertyRow | null>(
    null,
  );
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'edit' | null
  >(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imagesViewerOpen, setImagesViewerOpen] = useState(false);
  const [ownershipProofViewerOpen, setOwnershipProofViewerOpen] =
    useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedOwnershipProof, setSelectedOwnershipProof] = useState<
    string[]
  >([]);

  const rejectForm = useForm<RejectRentalPropertyFormData>({
    resolver: zodResolver(rejectRentalPropertyFormSchema),
    defaultValues: {
      rejection_reason: '',
    },
  });

  const editForm = useForm<EditRentalPropertyFormData>({
    resolver: zodResolver(updateRentalPropertySchema),
  });

  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);

  const {
    data: rentalData,
    isLoading,
    error,
    refetch,
  } = useAdminRentalProperties({
    page: currentPage,
    pageSize,
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const approveAction = useAction(approveRentalProperty, {
    onSuccess: () => {
      toast.success('Rental property approved successfully');
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN_RENTAL_PROPERTIES],
      });
      setActionDialogOpen(false);
      setSelectedProperty(null);
      setActionType(null);
    },
    onError,
  });

  const rejectAction = useAction(rejectRentalProperty, {
    onSuccess: () => {
      toast.success('Rental property rejected');
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN_RENTAL_PROPERTIES],
      });
      setActionDialogOpen(false);
      setSelectedProperty(null);
      setActionType(null);
    },
    onError,
  });

  const updateAction = useAction(updateRentalProperty, {
    onSuccess: () => {
      toast.success('Rental property updated successfully');
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN_RENTAL_PROPERTIES],
      });
      setEditDialogOpen(false);
      setSelectedProperty(null);
      editForm.reset();
    },
    onError,
  });

  const handleApprove = (property: PropertyRow) => {
    setSelectedProperty(property);
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleReject = (property: PropertyRow) => {
    setSelectedProperty(property);
    setActionType('reject');
    rejectForm.reset();
    setActionDialogOpen(true);
  };

  const handleEdit = (property: PropertyRow) => {
    setSelectedProperty(property);
    editForm.reset({
      propertyId: property.id,
      title: property.title || '',
      description: property.description || '',
      price: property.price || 0,
      address_line_1: property.address_line_1 || '',
      address_line_2: property.address_line_2 || null,
      city: property.city || '',
      state: property.state || null,
      country: property.country || '',
      zip_code: property.zip_code || null,
    });
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setActionDialogOpen(false);
    setSelectedProperty(null);
    setActionType(null);
    rejectForm.reset();
  };

  const handleConfirmAction = () => {
    if (!selectedProperty || !actionType) return;

    if (actionType === 'approve') {
      approveAction.execute({
        propertyId: selectedProperty.id,
        status: 'approved',
      });
    } else {
      // For rejection, we need the form data
      const formData = rejectForm.getValues();
      rejectAction.execute({
        propertyId: selectedProperty.id,
        rejection_reason: formData.rejection_reason,
      });
    }
  };

  const handleRejectSubmit = (data: RejectRentalPropertyFormData) => {
    if (!selectedProperty) return;
    rejectAction.execute({
      propertyId: selectedProperty.id,
      rejection_reason: data.rejection_reason,
    });
  };

  const handleEditSubmit = (data: EditRentalPropertyFormData) => {
    updateAction.execute(data);
  };

  // Extract results - getAllRentalProperties returns { data: PropertyWithProfile[], totalCount: number }
  const properties: PropertyWithProfile[] = rentalData?.data ?? [];
  const totalCount: number = rentalData?.totalCount ?? 0;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className='bg-green-100 text-green-800'>Approved</Badge>;
      case 'rejected':
        return <Badge className='bg-red-100 text-red-800'>Rejected</Badge>;
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      default:
        return <Badge variant='secondary'>Unknown</Badge>;
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Rental Properties</h1>
        <p className='text-muted-foreground'>
          Manage rental property submissions and approvals
        </p>
      </div>

      {/* Filters */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center'>
        <Input
          placeholder='Search by title, description, city, state...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className='max-w-sm'
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as typeof statusFilter);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='approved'>Approved</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className='py-8 text-center'>Loading...</div>
      ) : error ? (
        <div className='py-8 text-center text-destructive'>
          Error loading properties. Please try again.
        </div>
      ) : properties.length === 0 ? (
        <div className='py-8 text-center text-muted-foreground'>
          No rental properties found.
        </div>
      ) : (
        <>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Ownership Proof</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className='font-medium'>
                      {property.title}
                    </TableCell>
                    <TableCell>
                      <div className='max-w-xs'>
                        {[
                          property.address_line_1,
                          property.address_line_2,
                          property.city,
                          property.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(property.price)}/night
                    </TableCell>
                    <TableCell>
                      {property.images && property.images.length > 0 ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedImages(property.images || []);
                            setImagesViewerOpen(true);
                          }}
                          className='h-8 w-8 p-0'
                          title={`View ${property.images.length} image${property.images.length > 1 ? 's' : ''}`}
                        >
                          <ImageIcon className='h-4 w-4' />
                          <span className='ml-1 text-xs'>
                            {property.images.length}
                          </span>
                        </Button>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {property.ownership_proof &&
                      property.ownership_proof.length > 0 ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedOwnershipProof(
                              property.ownership_proof || [],
                            );
                            setOwnershipProofViewerOpen(true);
                          }}
                          className='h-8 w-8 p-0'
                          title={`View ${property.ownership_proof.length} document${property.ownership_proof.length > 1 ? 's' : ''}`}
                        >
                          <FileImage className='h-4 w-4' />
                          <span className='ml-1 text-xs'>
                            {property.ownership_proof.length}
                          </span>
                        </Button>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      {property.profile
                        ? `${property.profile.first_name} ${property.profile.last_name}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(property.status)}</TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        {property.status === 'pending' && (
                          <>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleEdit(property)}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </Button>
                            <Button
                              size='sm'
                              variant='default'
                              onClick={() => handleApprove(property)}
                            >
                              Approve
                            </Button>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => handleReject(property)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{' '}
              properties
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * pageSize >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={actionDialogOpen && actionType === 'approve'}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Rental Property?</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{selectedProperty?.title}"? It
              will be visible on the public apartments page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              variant='default'
              onClick={handleConfirmAction}
              isLoading={approveAction.isExecuting}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={actionDialogOpen && actionType === 'reject'}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Rental Property?</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedProperty?.title}".
              The user will be notified via email with this reason.
            </DialogDescription>
          </DialogHeader>
          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit(handleRejectSubmit)}
              className='space-y-4'
            >
              <FormField
                control={rejectForm.control}
                name='rejection_reason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter the reason for rejecting this rental property...'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='destructive'
                  isLoading={rejectAction.isExecuting}
                >
                  Reject Property
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            editForm.reset();
            setSelectedProperty(null);
          }
        }}
      >
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Rental Property</DialogTitle>
            <DialogDescription>
              Edit the details of "{selectedProperty?.title}". Images and
              ownership proof are view-only.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className='space-y-6'
            >
              <Tabs defaultValue='basic' className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                  <TabsTrigger value='location'>Location</TabsTrigger>
                  <TabsTrigger value='images'>Images</TabsTrigger>
                  <TabsTrigger value='ownership'>Ownership Proof</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value='basic' className='space-y-4'>
                  <FormField
                    control={editForm.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder='Property title' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Property description'
                            className='min-h-[120px]'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name='price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Night</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='0'
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value='location' className='space-y-4'>
                  <FormField
                    control={editForm.control}
                    name='address_line_1'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder='Street address' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name='address_line_2'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Apartment, suite, etc.'
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={editForm.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder='City' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name='country'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder='Country' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Images Tab (View Only) */}
                <TabsContent value='images' className='space-y-4'>
                  <div className='rounded-lg border p-4'>
                    <p className='mb-4 text-sm text-muted-foreground'>
                      Images are view-only. Cannot be edited.
                    </p>
                    {selectedProperty?.images &&
                    selectedProperty.images.length > 0 ? (
                      <div className='grid grid-cols-2 gap-4'>
                        {selectedProperty.images.map((image, index) => (
                          <div
                            key={index}
                            className='relative aspect-video w-full overflow-hidden rounded-lg border'
                          >
                            <Image
                              src={image}
                              alt={`Property image ${index + 1}`}
                              fill
                              className='object-cover'
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No images available
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Ownership Proof Tab (View Only) */}
                <TabsContent value='ownership' className='space-y-4'>
                  <div className='rounded-lg border p-4'>
                    <p className='mb-4 text-sm text-muted-foreground'>
                      Ownership proof documents are view-only. Cannot be edited.
                    </p>
                    {selectedProperty?.ownership_proof &&
                    selectedProperty.ownership_proof.length > 0 ? (
                      <div className='grid grid-cols-2 gap-4'>
                        {selectedProperty.ownership_proof.map((doc, index) => (
                          <div
                            key={index}
                            className='relative aspect-video w-full overflow-hidden rounded-lg border'
                          >
                            <Image
                              src={doc}
                              alt={`Ownership proof ${index + 1}`}
                              fill
                              className='object-contain'
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No ownership proof documents available
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setEditDialogOpen(false);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='default'
                  isLoading={updateAction.isExecuting}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Images Viewer */}
      {imagesViewerOpen && (
        <PropertyImagesViewer
          isOpen={imagesViewerOpen}
          onClose={() => {
            setImagesViewerOpen(false);
            setSelectedImages([]);
          }}
          images={selectedImages}
        />
      )}

      {/* Ownership Proof Viewer */}
      {ownershipProofViewerOpen && (
        <OwnershipProofViewer
          isOpen={ownershipProofViewerOpen}
          onClose={() => {
            setOwnershipProofViewerOpen(false);
            setSelectedOwnershipProof([]);
          }}
          images={selectedOwnershipProof}
        />
      )}
    </div>
  );
}
