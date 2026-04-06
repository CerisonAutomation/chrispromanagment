/**
 * CMS Adapter Registry
 * P5 External Integration - Gap #63: Pre-built CMS adapters
 * 
 * Provides unified interface for external CMS integrations:
 * - Contentful
 * - Strapi
 * - Sanity
 * - Custom APIs
 */

import type {ComponentData, Config, Data} from "@/lib/canonical-puck-types";
import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import type {CMSAdapter} from "./types";

// ============================================================================
// Types
// ============================================================================

export type AdapterType = "contentful" | "strapi" | "sanity" | "custom";

export interface AdapterConfig {
  type: AdapterType;
  baseUrl: string;
  apiKey?: string;
  spaceId?: string;
  environment?: string;
  accessToken?: string;
}

export interface AdapterResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExternalField {
  id: string;
  source: AdapterType;
  contentType: string;
  filters?: Record<string, unknown>;
  label: string;
  value?: string;
}

export interface SyncConfig {
  enabled: boolean;
  direction: "push" | "pull" | "bidirectional";
  onConflict?: "source_wins" | "target_wins" | "manual";
  debounceMs?: number;
}

// ============================================================================
// Base Adapter Interface
// ============================================================================

export interface CMSAdapter {
  readonly type: AdapterType;
  readonly config: AdapterConfig;

  // Connection
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;

  // Content Operations
  fetchContent(contentType: string, filters?: Record<string, unknown>): Promise<AdapterResult<ExternalField[]>>;
  fetchById(contentType: string, id: string): Promise<AdapterResult<ExternalField>>;
  search(query: string, contentType: string): Promise<AdapterResult<ExternalField[]>>;

  // Sync Operations
  pushToCMS(data: Data, config: Config): Promise<AdapterResult<void>>;
  pullFromCMS(contentType: string): Promise<AdapterResult<Data>>;

  // Validation
  validateConnection(): Promise<AdapterResult<boolean>>;
}

// ============================================================================
// Adapter Factory
// ============================================================================

export function createAdapter(config: AdapterConfig): CMSAdapter {
  switch (config.type) {
    case "contentful":
      return createContentfulAdapter(config);
    case "strapi":
      return createStrapiAdapter(config);
    case "sanity":
      return createSanityAdapter(config);
    default:
      return createCustomAdapter(config);
  }
}

// ============================================================================
// Contentful Adapter
// ============================================================================

function createContentfulAdapter(config: AdapterConfig): CMSAdapter {
  const baseHeaders = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  return {
    type: "contentful",
    config,

    async connect(): Promise<boolean> {
      try {
        const response = await fetch(
          `https://api.contentful.com/spaces/${config.spaceId}`,
          { headers: baseHeaders }
        );
        return response.ok;
      } catch {
        return false;
      }
    },

    async disconnect(): Promise<void> {
      // Contentful doesn't require explicit disconnect
    },

    async fetchContent(
      contentType: string,
      filters?: Record<string, unknown>
    ): Promise<AdapterResult<ExternalField[]>> {
      try {
        const params = new URLSearchParams({
          content_type: contentType,
          ...Object.fromEntries(
            Object.entries(filters || {}).map(([k, v]) => [k, String(v)])
          ),
        });

        const response = await fetch(
          `https://api.contentful.com/entries?${params}`,
          { headers: baseHeaders }
        );

        if (!response.ok) {
          return { success: false, error: `Contentful API error: ${response.status}` };
        }

        const json = await response.json();
        const fields: ExternalField[] = json.items.map((item: any) => ({
          id: item.sys.id,
          source: "contentful" as const,
          contentType,
          label: item.fields?.title || item.fields?.name || item.sys.id,
          value: item.sys.id,
        }));

        return { success: true, data: fields };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async fetchById(
      contentType: string,
      id: string
    ): Promise<AdapterResult<ExternalField>> {
      try {
        const response = await fetch(
          `https://api.contentful.com/entries/${id}`,
          { headers: baseHeaders }
        );

        if (!response.ok) {
          return { success: false, error: `Not found: ${id}` };
        }

        const item = await response.json();
        return {
          success: true,
          data: {
            id: item.sys.id,
            source: "contentful" as const,
            contentType,
            label: item.fields?.title || item.fields?.name || id,
            value: item.sys.id,
          },
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async search(
      query: string,
      contentType: string
    ): Promise<AdapterResult<ExternalField[]>> {
      return this.fetchContent(contentType, { query });
    },

    async pushToCMS(data: Data, config: Config): Promise<AdapterResult<void>> {
      // Transform Puck data to Contentful format
      const entries = data.content.map((component) => ({
        fields: component.props,
        contentType: component.type,
      }));

      try {
        for (const entry of entries) {
          await fetch("https://api.contentful.com/entries", {
            method: "POST",
            headers: baseHeaders,
            body: JSON.stringify(entry),
          });
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async pullFromCMS(contentType: string): Promise<AdapterResult<Data>> {
      const result = await this.fetchContent(contentType);
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const content: ComponentData[] = result.data.map((field) => ({
        id: field.id,
        type: field.contentType,
        props: {},
      }));

      return {
        success: true,
        data: { content, root: { props: {} } },
      };
    },

    async validateConnection(): Promise<AdapterResult<boolean>> {
      const connected = await this.connect();
      return { success: true, data: connected };
    },
  };
}

// ============================================================================
// Strapi Adapter
// ============================================================================

function createStrapiAdapter(config: AdapterConfig): CMSAdapter {
  const getHeaders = () => ({
    Authorization: `Bearer ${config.accessToken}`,
    "Content-Type": "application/json",
  });

  return {
    type: "strapi",
    config,

    async connect(): Promise<boolean> {
      try {
        const response = await fetch(`${config.baseUrl}/api`, {
          headers: getHeaders(),
        });
        return response.ok;
      } catch {
        return false;
      }
    },

    async disconnect(): Promise<void> {
      // Strapi doesn't require explicit disconnect
    },

    async fetchContent(
      contentType: string,
      filters?: Record<string, unknown>
    ): Promise<AdapterResult<ExternalField[]>> {
      try {
        const params = filters
          ? `?${new URLSearchParams(filters as Record<string, string>)}`
          : "";

        const response = await fetch(
          `${config.baseUrl}/api/${contentType}${params}`,
          { headers: getHeaders() }
        );

        if (!response.ok) {
          return { success: false, error: `Strapi API error: ${response.status}` };
        }

        const json = await response.json();
        const fields: ExternalField[] = json.data.map((item: any) => ({
          id: String(item.id),
          source: "strapi" as const,
          contentType,
          label: item.attributes?.title || item.attributes?.name || String(item.id),
          value: String(item.id),
        }));

        return { success: true, data: fields };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async fetchById(
      contentType: string,
      id: string
    ): Promise<AdapterResult<ExternalField>> {
      try {
        const response = await fetch(
          `${config.baseUrl}/api/${contentType}/${id}`,
          { headers: getHeaders() }
        );

        if (!response.ok) {
          return { success: false, error: `Not found: ${id}` };
        }

        const item = (await response.json()).data;
        return {
          success: true,
          data: {
            id: String(item.id),
            source: "strapi" as const,
            contentType,
            label: item.attributes?.title || item.attributes?.name || id,
            value: String(item.id),
          },
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async search(
      query: string,
      contentType: string
    ): Promise<AdapterResult<ExternalField[]>> {
      return this.fetchContent(contentType, { "filters[$containsi]": query });
    },

    async pushToCMS(data: Data, config: Config): Promise<AdapterResult<void>> {
      try {
        for (const component of data.content) {
          await fetch(`${config.baseUrl}/api/${component.type}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ data: component.props }),
          });
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async pullFromCMS(contentType: string): Promise<AdapterResult<Data>> {
      const result = await this.fetchContent(contentType);
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const content: ComponentData[] = result.data.map((field) => ({
        id: field.id,
        type: field.contentType,
        props: {},
      }));

      return {
        success: true,
        data: { content, root: { props: {} } },
      };
    },

    async validateConnection(): Promise<AdapterResult<boolean>> {
      const connected = await this.connect();
      return { success: true, data: connected };
    },
  };
}

// ============================================================================
// Sanity Adapter
// ============================================================================

function createSanityAdapter(config: AdapterConfig): CMSAdapter {
  return {
    type: "sanity",
    config,

    async connect(): Promise<boolean> {
      // Sanity uses GROQ, basic connectivity check
      try {
        const response = await fetch(`${config.baseUrl}/api/grat`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: "1+1" }),
        });
        return response.ok;
      } catch {
        return false;
      }
    },

    async disconnect(): Promise<void> {},

    async fetchContent(
      contentType: string,
      filters?: Record<string, unknown>
    ): Promise<AdapterResult<ExternalField[]>> {
      try {
        const filterStr = filters
          ? Object.entries(filters)
              .map(([k, v]) => `${k} == "${v}"`)
              .join(" && ")
          : "";

        const query = `*[_type == "${contentType}"${filterStr ? ` && ${filterStr}` : ""}]{
          _id,
          title,
          name
        }`;

        const response = await fetch(`${config.baseUrl}/api/grat`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const json = await response.json();
        const fields: ExternalField[] = (json.result || []).map((item: any) => ({
          id: item._id,
          source: "sanity" as const,
          contentType,
          label: item.title || item.name || item._id,
          value: item._id,
        }));

        return { success: true, data: fields };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async fetchById(
      contentType: string,
      id: string
    ): Promise<AdapterResult<ExternalField>> {
      const result = await this.fetchContent(contentType, { _id: id });
      if (!result.success || !result.data?.length) {
        return { success: false, error: `Not found: ${id}` };
      }
      return { success: true, data: result.data[0] };
    },

    async search(
      query: string,
      contentType: string
    ): Promise<AdapterResult<ExternalField[]>> {
      return this.fetchContent(contentType, { title: { $contains: query } });
    },

    async pushToCMS(data: Data, config: Config): Promise<AdapterResult<void>> {
      return { success: true }; // Sanity uses different push mechanism
    },

    async pullFromCMS(contentType: string): Promise<AdapterResult<Data>> {
      const result = await this.fetchContent(contentType);
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const content: ComponentData[] = result.data.map((field) => ({
        id: field.id,
        type: field.contentType,
        props: {},
      }));

      return {
        success: true,
        data: { content, root: { props: {} } },
      };
    },

    async validateConnection(): Promise<AdapterResult<boolean>> {
      const connected = await this.connect();
      return { success: true, data: connected };
    },
  };
}

// ============================================================================
// Custom Adapter
// ============================================================================

function createCustomAdapter(config: AdapterConfig): CMSAdapter {
  return {
    type: "custom",
    config,

    async connect(): Promise<boolean> {
      try {
        const response = await fetch(config.baseUrl);
        return response.ok;
      } catch {
        return false;
      }
    },

    async disconnect(): Promise<void> {},

    async fetchContent(
      contentType: string,
      filters?: Record<string, unknown>
    ): Promise<AdapterResult<ExternalField[]>> {
      try {
        const response = await fetch(`${config.baseUrl}/${contentType}`, {
          headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
        });

        if (!response.ok) {
          return { success: false, error: `API error: ${response.status}` };
        }

        const json = await response.json();
        const items = Array.isArray(json) ? json : json.data || [];

        const fields: ExternalField[] = items.map((item: any) => ({
          id: item.id || String(Math.random()),
          source: "custom" as const,
          contentType,
          label: item.title || item.name || item.id || "Untitled",
          value: item.id || item._id,
        }));

        return { success: true, data: fields };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async fetchById(
      contentType: string,
      id: string
    ): Promise<AdapterResult<ExternalField>> {
      try {
        const response = await fetch(`${config.baseUrl}/${contentType}/${id}`);
        if (!response.ok) {
          return { success: false, error: `Not found: ${id}` };
        }

        const item = await response.json();
        return {
          success: true,
          data: {
            id: item.id,
            source: "custom" as const,
            contentType,
            label: item.title || item.name || id,
            value: item.id,
          },
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async search(
      query: string,
      contentType: string
    ): Promise<AdapterResult<ExternalField[]>> {
      return this.fetchContent(contentType, { q: query });
    },

    async pushToCMS(data: Data, config: Config): Promise<AdapterResult<void>> {
      try {
        await fetch(`${config.baseUrl}/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify(data),
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    async pullFromCMS(contentType: string): Promise<AdapterResult<Data>> {
      const result = await this.fetchContent(contentType);
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const content: ComponentData[] = result.data.map((field) => ({
        id: field.id,
        type: field.contentType,
        props: {},
      }));

      return {
        success: true,
        data: { content, root: { props: {} } },
      };
    },

    async validateConnection(): Promise<AdapterResult<boolean>> {
      const connected = await this.connect();
      return { success: true, data: connected };
    },
  };
}

// ============================================================================
// Adapter Registry
// ============================================================================

class AdapterRegistry {
  private adapters: Map<string, CMSAdapter> = new Map();

  register(id: string, adapter: CMSAdapter): void {
    this.adapters.set(id, adapter);
  }

  unregister(id: string): void {
    this.adapters.delete(id);
  }

  get(id: string): CMSAdapter | undefined {
    return this.adapters.get(id);
  }

  getAll(): CMSAdapter[] {
    return Array.from(this.adapters.values());
  }

  async connectAll(): Promise<void> {
    await Promise.all(this.adapters.values().map((a) => a.connect()));
  }

  async disconnectAll(): Promise<void> {
    await Promise.all(this.adapters.values().map((a) => a.disconnect()));
  }
}

export const adapterRegistry = new AdapterRegistry();

// ============================================================================
// React Hook
// ============================================================================

interface AdapterContextValue {
  adapters: Map<string, CMSAdapter>;
  register: (id: string, config: AdapterConfig) => Promise<void>;
  unregister: (id: string) => void;
  getAdapter: (id: string) => CMSAdapter | undefined;
  isConnected: (id: string) => boolean;
}

const AdapterContext = createContext<AdapterContextValue | null>(null);

interface AdapterProviderProps {
  children: ReactNode;
  initialConfigs?: AdapterConfig[];
}

export function AdapterProvider({ children, initialConfigs = [] }: AdapterProviderProps) {
  const [adapters, setAdapters] = useState<Map<string, CMSAdapter>>(new Map());
  const [connections, setConnections] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const init = async () => {
      for (const config of initialConfigs) {
        await registerAdapter(config.id || config.type, config);
      }
    };
    init();
  }, [initialConfigs]);

  const registerAdapter = async (id: string, config: AdapterConfig) => {
    const adapter = createAdapter(config);
    const connected = await adapter.connect();

    setAdapters((prev) => {
      const next = new Map(prev);
      next.set(id, adapter);
      return next;
    });

    setConnections((prev) => {
      const next = new Map(prev);
      next.set(id, connected);
      return next;
    });
  };

  const unregisterAdapter = (id: string) => {
    const adapter = adapters.get(id);
    if (adapter) {
      adapter.disconnect();
    }

    setAdapters((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    setConnections((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const getAdapter = (id: string) => adapters.get(id);

  const isConnected = (id: string) => connections.get(id) ?? false;

  return (
    <AdapterContext.Provider
      value={{
        adapters,
        register: registerAdapter,
        unregister: unregisterAdapter,
        getAdapter,
        isConnected,
      }}
    >
      {children}
    </AdapterContext.Provider>
  );
}

export function useAdapters() {
  const ctx = useContext(AdapterContext);
  if (!ctx) throw new Error("useAdapters must be used within AdapterProvider");
  return ctx;
}

export function useAdapter(id: string) {
  const { getAdapter, isConnected } = useAdapters();
  return {
    adapter: getAdapter(id),
    isConnected: isConnected(id),
  };
}
