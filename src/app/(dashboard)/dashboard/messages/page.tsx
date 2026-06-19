import { MessagesSquare } from 'lucide-react';

import { ComingSoonPage } from '@/components/dashboard/coming-soon-page';

export default function MessagesPage() {
  return (
    <ComingSoonPage
      eyebrow='Private communication'
      title='Messages'
      description='A dedicated conversation space for guidance from the Vestafi team and ownership updates.'
      note='Secure member messaging is being prepared. Until it opens, use Support to speak directly with Vestafi.'
      icon={MessagesSquare}
    />
  );
}
