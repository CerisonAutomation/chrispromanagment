// =============================================================================
// PAGE RENDER CLIENT COMPONENT - Renders published Puck pages
// Follows puck-main next-ai recipe pattern
// =============================================================================

"use client";

import type {Data} from "@measured/puck";
import {Render} from "@measured/puck";
import config from "@/puck.config";

interface ClientProps {
  data: Data;
}

export function Client({ data }: ClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bridge @measured/puck config to @puckeditor/core Render
  return <Render config={config as any} data={data} />;
}

export default Client;
