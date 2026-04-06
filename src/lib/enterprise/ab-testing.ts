// =============================================================================
// A/B Testing Service
// =============================================================================

import { db } from '@/lib/db';
import { createAuditLog } from './audit';
import type { ABTest, ABTestResult } from './types';

export interface ABTestConfig {
  pageId: string;
  name: string;
  description?: string;
  variantAData: any;
  variantBData: any;
  trafficSplit: number; // Percentage to variant B (0-100)
  primaryGoal: string;
}

/**
 * Create a new A/B test
 */
export async function createABTest(config: ABTestConfig): Promise<string> {
  const test = await db.aBTest.create({
    data: {
      pageId: config.pageId,
      name: config.name,
      description: config.description,
      variantAData: JSON.stringify(config.variantAData),
      variantBData: JSON.stringify(config.variantBData),
      trafficSplit: config.trafficSplit,
      primaryGoal: config.primaryGoal,
      status: 'DRAFT',
    },
  });
  
  await createAuditLog({
    action: 'AB_TEST_START',
    pageId: config.pageId,
    details: {
      testId: test.id,
      name: config.name,
      trafficSplit: config.trafficSplit,
    },
    resourceType: 'ab_test',
    resourceId: test.id,
  });
  
  return test.id;
}

/**
 * Start an A/B test
 */
export async function startABTest(testId: string): Promise<{ success: boolean; message: string }> {
  try {
    const test = await db.aBTest.update({
      where: { id: testId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });
    
    await createAuditLog({
      action: 'AB_TEST_START',
      pageId: test.pageId,
      details: { testId, name: test.name },
      resourceType: 'ab_test',
      resourceId: testId,
    });
    
    return { success: true, message: 'A/B test started' };
  } catch (error) {
    return { success: false, message: 'Failed to start A/B test' };
  }
}

/**
 * Pause an A/B test
 */
export async function pauseABTest(testId: string): Promise<{ success: boolean; message: string }> {
  try {
    const test = await db.aBTest.update({
      where: { id: testId },
      data: { status: 'PAUSED' },
    });
    
    await createAuditLog({
      action: 'AB_TEST_END',
      pageId: test.pageId,
      details: { testId, action: 'paused' },
      resourceType: 'ab_test',
      resourceId: testId,
    });
    
    return { success: true, message: 'A/B test paused' };
  } catch (error) {
    return { success: false, message: 'Failed to pause A/B test' };
  }
}

/**
 * End an A/B test and determine winner
 */
export async function endABTest(
  testId: string,
  forceWinner?: 'A' | 'B'
): Promise<{ success: boolean; winner?: 'A' | 'B' | 'NONE'; message: string }> {
  try {
    const test = await db.aBTest.findUnique({ where: { id: testId } });
    if (!test) {
      return { success: false, message: 'Test not found' };
    }
    
    // Calculate results
    const result = calculateTestResults(test);
    
    // Determine winner
    let winner: 'A' | 'B' | 'NONE' = 'NONE';
    
    if (forceWinner) {
      winner = forceWinner;
    } else if (result.confidence >= 0.95) {
      winner = result.variantB.conversionRate > result.variantA.conversionRate ? 'B' : 'A';
    }
    
    await db.aBTest.update({
      where: { id: testId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        winner,
        confidenceLevel: result.confidence,
        pValue: result.pValue,
      },
    });
    
    // Apply winner if significant
    if (winner !== 'NONE') {
      await applyWinner(test.pageId, testId, winner);
    }
    
    await createAuditLog({
      action: 'AB_TEST_WINNER',
      pageId: test.pageId,
      details: {
        testId,
        winner,
        confidence: result.confidence,
        variantARate: result.variantA.conversionRate,
        variantBRate: result.variantB.conversionRate,
      },
      resourceType: 'ab_test',
      resourceId: testId,
    });
    
    return {
      success: true,
      winner,
      message: `A/B test completed. Winner: Variant ${winner}`,
    };
  } catch (error) {
    return { success: false, message: 'Failed to end A/B test' };
  }
}

function calculateTestResults(test: any) {
  const variantA = {
    visitors: test.variantAVisitors || 0,
    conversions: test.variantAConversions || 0,
    conversionRate: test.variantAVisitors > 0 
      ? (test.variantAConversions / test.variantAVisitors) * 100 
      : 0,
  };
  
  const variantB = {
    visitors: test.variantBVisitors || 0,
    conversions: test.variantBConversions || 0,
    conversionRate: test.variantBVisitors > 0 
      ? (test.variantBConversions / test.variantBVisitors) * 100 
      : 0,
  };
  
  // Calculate statistical significance (simplified z-test)
  const { confidence, pValue } = calculateStatisticalSignificance(
    variantA.visitors,
    variantA.conversions,
    variantB.visitors,
    variantB.conversions
  );
  
  const improvement = variantA.conversionRate > 0
    ? ((variantB.conversionRate - variantA.conversionRate) / variantA.conversionRate) * 100
    : 0;
  
  return {
    variantA,
    variantB: { ...variantB, improvement },
    confidence,
    pValue,
  };
}

function calculateStatisticalSignificance(
  visitorsA: number,
  conversionsA: number,
  visitorsB: number,
  conversionsB: number
): { confidence: number; pValue: number } {
  if (visitorsA === 0 || visitorsB === 0) {
    return { confidence: 0, pValue: 1 };
  }
  
  const p1 = conversionsA / visitorsA;
  const p2 = conversionsB / visitorsB;
  
  const pooledP = (conversionsA + conversionsB) / (visitorsA + visitorsB);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/visitorsA + 1/visitorsB));
  
  if (se === 0) return { confidence: 0, pValue: 1 };
  
  const z = Math.abs(p1 - p2) / se;
  
  // Convert z-score to confidence level (simplified)
  const confidence = 1 - (2 * (1 - normalCDF(z)));
  const pValue = 2 * (1 - normalCDF(z)); // Two-tailed test
  
  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    pValue: Math.max(0, Math.min(1, pValue)),
  };
}

function normalCDF(z: number): number {
  // Approximation of cumulative distribution function
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);
  
  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  
  return 0.5 * (1.0 + sign * y);
}

async function applyWinner(pageId: string, testId: string, winner: 'A' | 'B') {
  const test = await db.aBTest.findUnique({ where: { id: testId } });
  if (!test) return;
  
  const winnerData = winner === 'A' ? test.variantAData : test.variantBData;
  
  await db.cmsPage.update({
    where: { id: pageId },
    data: {
      draftData: winnerData,
      publishedData: winnerData,
    },
  });
}

/**
 * Record a visitor/conversion event
 */
export async function recordTestEvent(
  testId: string,
  variant: 'A' | 'B',
  event: 'visitor' | 'conversion'
): Promise<void> {
  const incrementField = event === 'visitor' 
    ? (variant === 'A' ? 'variantAVisitors' : 'variantBVisitors')
    : (variant === 'A' ? 'variantAConversions' : 'variantBConversions');
  
  await db.aBTest.update({
    where: { id: testId },
    data: { [incrementField]: { increment: 1 } },
  });
}

/**
 * Get active tests for a page
 */
export async function getActiveTests(pageId: string) {
  const tests = await db.aBTest.findMany({
    where: {
      pageId,
      status: 'RUNNING',
    },
  });
  
  return tests.map(t => ({
    ...t,
    variantAData: JSON.parse(t.variantAData),
    variantBData: JSON.parse(t.variantBData),
  }));
}

/**
 * Get test results
 */
export async function getTestResults(testId: string): Promise<ABTestResult[] | null> {
  const test = await db.aBTest.findUnique({ where: { id: testId } });
  if (!test) return null;
  
  const result = calculateTestResults(test);
  
  return [
    {
      variant: 'A',
      visitors: result.variantA.visitors,
      conversions: result.variantA.conversions,
      conversionRate: result.variantA.conversionRate,
      improvement: 0,
    },
    {
      variant: 'B',
      visitors: result.variantB.visitors,
      conversions: result.variantB.conversions,
      conversionRate: result.variantB.conversionRate,
      improvement: result.variantB.improvement,
    },
  ];
}

/**
 * Get all A/B tests
 */
export async function getAllTests(options?: {
  status?: string;
  pageId?: string;
}) {
  const where: any = {};
  if (options?.status) where.status = options.status;
  if (options?.pageId) where.pageId = options.pageId;
  
  const tests = await db.aBTest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  
  return tests.map(t => ({
    ...t,
    variantAData: JSON.parse(t.variantAData),
    variantBData: JSON.parse(t.variantBData),
  }));
}
