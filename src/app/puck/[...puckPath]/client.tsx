// =============================================================================
// PUCK EDITOR CLIENT COMPONENT - AI Demo Pattern
// Uses official @puckeditor/core and @puckeditor/plugin-ai
// Follows puck-main next-ai recipe pattern
// =============================================================================

"use client";

import type {Data} from "@puckeditor/core";
import {Puck} from "@puckeditor/core";
import {createAiPlugin} from "@puckeditor/plugin-ai";

// Import Puck CSS
import "@puckeditor/core/puck.css";
import "@puckeditor/plugin-ai/styles.css";

// Import your existing config
import config from "@/puck.config";

// Create the AI plugin instance
const aiPlugin = createAiPlugin();

interface ClientProps {
  path: string;
  data: Partial<Data>;
}

export function Client({ path, data }: ClientProps) {
  return (
    <Puck
      plugins={[aiPlugin]}
      config={config as any}
      data={data}
      onPublish={async (data: Data) => {
        await fetch("/api/pages", {
          method: "POST",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}

export default Client;
