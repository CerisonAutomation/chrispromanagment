'use client';

import { Render } from '@measured/puck';
import puckConfig from '@/puck.config';
import dynamic from 'next/dynamic';

interface PuckClientRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

// Inner component that actually renders Puck
function PuckRenderInner({ data }: PuckClientRendererProps) {
  return <Render config={puckConfig} data={data} />;
}

// Dynamically import with SSR disabled - must be in client component
export const PuckClientRenderer = dynamic(
  () => Promise.resolve(PuckRenderInner),
  { ssr: false }
);
