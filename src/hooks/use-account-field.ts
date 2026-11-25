import { useState } from 'react';

import { useSession } from '@/lib/auth-client';

// A form field that shows the signed-in user's name or email until the user edits it,
// even when the session finishes loading after the screen opened.
export function useAccountField(field: 'name' | 'email') {
  const { data: session } = useSession();
  const [edited, setEdited] = useState<string | null>(null);
  return [edited ?? session?.user[field] ?? '', setEdited] as const;
}
