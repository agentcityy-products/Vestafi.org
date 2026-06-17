'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { getNextDraftExitWindowAction } from '@/actions/exit-window';

import { Alert, AlertDescription } from '@/components/ui/alert';

import { QueryKeys } from '@/constants/query-keys';

export function ExitWindowClosedNotice() {
  const { data: nextDraft, isLoading } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'next-draft'],
    queryFn: async () => {
      const r = await getNextDraftExitWindowAction();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.nextDraft ?? null;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Alert>
        <AlertDescription className='text-muted-foreground'>
          Checking schedule…
        </AlertDescription>
      </Alert>
    );
  }

  const message =
    nextDraft?.start_at != null
      ? `The exit window is currently closed. The next window opens on ${format(new Date(nextDraft.start_at), 'PPP')}.`
      : 'The exit window is currently closed. An admin will announce the next opening dates here.';

  return (
    <Alert>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
