// =============================================================================
// PAGE RENDER CLIENT COMPONENT - Renders published Puck pages
// Follows puck-main next-ai recipe pattern
// =============================================================================

"use client";

import type {Data} from "@puckeditor/core";
import {Render} from "@puckeditor/core";
import config from "@/puck.config";

interface ClientProps {
  data: Data;
}

export function Client({ data }: ClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bridge @measured/puck config to @puckeditor/core Render
  return <Render config={config as any} data={data} />;
}

export default Client;
