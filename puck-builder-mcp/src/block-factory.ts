/**
 * @fileoverview Factory that generates validated Puck block objects with sane defaults.
 * Works across all 40 unified blocks (12 puck demo + 28 chrispropmanagment).
 */

import type { PuckBlockType } from "./puck-schema.js";
import { BLOCK_SCHEMAS } from "./puck-schema.js";
import { generatePuckId } from "./id.js";
import { z } from "zod";

export interface PuckBlock {
  type: string;
  props: Record<string, unknown> & { id: string };
}

export function buildBlock(
  type: PuckBlockType,
  partialProps: Record<string, unknown> = {}
): PuckBlock {
  const schema = BLOCK_SCHEMAS[type];
  if (!schema) throw new Error(`Unknown Puck block type: "${type}"`);

  const props = (schema as z.ZodObject<z.ZodRawShape>).parse({
    ...partialProps,
    id: (partialProps.id as string) ?? generatePuckId(type),
  });

  return { type, props: props as Record<string, unknown> & { id: string } };
}

export function buildBlocks(
  specs: Array<{ type: PuckBlockType; props?: Record<string, unknown> }>
): PuckBlock[] {
  return specs.map(({ type, props = {} }) => buildBlock(type, props));
}
