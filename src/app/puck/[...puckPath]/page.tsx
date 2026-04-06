// =============================================================================
// PUCK EDITOR SERVER COMPONENT - AI Demo Pattern
// Renders the Puck editor with AI capabilities at /puck/[...puckPath]
// Middleware rewrites any path ending in /edit to this route
// Follows puck-main next-ai recipe pattern
// =============================================================================

import {Client} from "./client";
import {Metadata} from "next";
import {getPage} from "@/lib/get-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;

  return {
    title: `Puck Editor: ${path}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;
  const data = getPage(path);

  return <Client path={path} data={data || {}} />;
}

// Dynamic rendering required for editor
export const dynamic = "force-dynamic";
