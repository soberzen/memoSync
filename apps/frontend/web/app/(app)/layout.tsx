import type { PropsWithChildren } from 'react';

import ProtectRoute from '@/components/ProtectRoute';

export default function AppLayout({ children }: PropsWithChildren) {
  return <ProtectRoute>{children}</ProtectRoute>;
}
