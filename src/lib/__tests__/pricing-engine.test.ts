/**
 * Pricing Engine Unit Tests
 *
 * Tests for the AI-powered pricing engine including:
 * - Model initialization
 * - Model training
 * - Price prediction
 * - Forecast generation
 * - Season calculation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as tf from '@tensorflow/tfjs';
import { PricingEngine, pricingEngine, type PropertyPricingInput } from '../pricing-engine';
import { createPricingInput, createPricingInputs } from '../../test/factories';
import { supabase } from '@/integrations/supabase/client';

// Mock TensorFlow inline to avoid hoisting ReferenceError
vi.mock('@tensorflow/tfjs', () => {
  const mockSequential = vi.fn().mockReturnValue({
    add: vi.fn().mockReturnThis(),
    compile: vi.fn().mockReturnThis(),
    fit: vi.fn().mockResolvedValue({}),
    predict: vi.fn().mockReturnValue({
      data: vi.fn().mockResolvedValue(new Float32Array([250])),
    }),
  });
  return {
    sequential: mockSequential,
    tensor2d: vi.fn(),
    layers: {
      dense: vi.fn(),
    },
  };
});

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { base_price: 200 },
        error: null,
      }),
    }),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('PricingEngine', () => {
  let engine: PricingEngine;

  beforeEach(() => {
    engine = new PricingEngine();
    vi.clearAllMocks();
    // Re-apply default mock so "property not found" test doesn't poison later tests
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { base_price: 200 }, error: null }),
    });
  });

  describe('Model Initialization', () => {
    it('should initialize the model', async () => {
      await engine.initializeModel();

      expect(tf.sequential).toHaveBeenCalled();
      expect(tf.layers.dense).toHaveBeenCalledWith(
        expect.objectContaining({ units: 1, inputShape: [7] })
      );
    });

    it('should compile the model with correct configuration', async () => {
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn(),
      };

      tf.sequential.mockReturnValue(mockModel);

      await engine.initializeModel();

      expect(mockModel.compile).toHaveBeenCalledWith({
        optimizer: 'sgd',
        loss: 'meanSquaredError',
      });
    });
  });

  describe('Model Training', () => {
    it('should train the model with historical data', async () => {
      const trainingData = createPricingInputs(10);

      await engine.trainModel(trainingData);

      expect(tf.tensor2d).toHaveBeenCalledTimes(2);
      const mockModel = (tf.sequential as any).mock.results[0].value;
      expect(mockModel.fit).toHaveBeenCalled();
    });

    it('should initialize model if not already initialized', async () => {
      const trainingData = createPricingInputs(5);

      await engine.trainModel(trainingData);

      expect(tf.sequential).toHaveBeenCalled();
    });

    it('should use correct training epochs', async () => {
      const trainingData = createPricingInputs(5);

      await engine.trainModel(trainingData);

      const mockModel = (tf.sequential as any).mock.results[0].value;
      const fitCall = mockModel.fit.mock.calls[0];
      expect(fitCall[2]).toEqual(
        expect.objectContaining({ epochs: 100 })
      );
    });

    it('should handle empty training data', async () => {
      const trainingData: PropertyPricingInput[] = [];

      await expect(engine.trainModel(trainingData)).resolves.not.toThrow();
    });
  });

  describe('Price Prediction', () => {
    it('should predict price for given input', async () => {
      const input = createPricingInput({
        base_price: 200,
        occupancy_rate: 0.8,
        season: 'high',
      });

      // Mock prediction
      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([250])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      const price = await engine.predictPrice(input);

      expect(price).toBe(250);
      expect(mockModel.predict).toHaveBeenCalled();
    });

    it('should initialize model if not already initialized', async () => {
      const input = createPricingInput();

      await engine.predictPrice(input);

      expect(tf.sequential).toHaveBeenCalled();
    });

    it('should constrain price within reasonable bounds', async () => {
      const input = createPricingInput({ base_price: 100 });

      // Mock high prediction
      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([1000])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      const price = await engine.predictPrice(input);

      // Price should be constrained to 1.5x base price
      expect(price).toBeLessThanOrEqual(150);
    });

    it('should not go below minimum price', async () => {
      const input = createPricingInput({ base_price: 100 });

      // Mock low prediction
      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([10])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      const price = await engine.predictPrice(input);

      // Price should not go below 0.7x base price
      expect(price).toBeGreaterThanOrEqual(70);
    });

    it('should process feature vector correctly', async () => {
      const input = createPricingInput({
        base_price: 200,
        occupancy_rate: 0.7,
        season: 'medium',
        day_of_week: 'weekend',
        local_events: 5,
        competitor_avg_price: 220,
      });

      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([230])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      await engine.predictPrice(input);

      const tensor2dCall = vi.mocked(tf.tensor2d).mock.calls[0];
      expect(tensor2dCall[0][0][0]).toBe(200);    // base_price
      expect(tensor2dCall[0][0][1]).toBe(0.7);    // occupancy_rate
      expect(tensor2dCall[0][0][2]).toBe(1);       // season (medium = 1)
      expect(tensor2dCall[0][0][3]).toBe(1);       // day_of_week (weekend = 1)
      expect(tensor2dCall[0][0][4]).toBe(5);       // local_events
      expect(tensor2dCall[0][0][5]).toBe(220);     // competitor_avg_price
      expect(tensor2dCall[0][0][6]).toEqual(expect.any(Number)); // month
    });
  });

  describe('Forecast Generation', () => {
    it('should generate forecast for specified number of days', async () => {
      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([250])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      const forecast = await engine.generateForecast('prop_123', 30);

      expect(forecast).toHaveLength(30);
      expect(forecast[0]).toHaveProperty('date');
      expect(forecast[0]).toHaveProperty('price');
      expect(forecast[0]).toHaveProperty('occupancy_probability');
    });

    it('should fetch property base price', async () => {
      // Explicitly mock supabase.from for this test
      const mockProperty = { base_price: 200 };
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProperty,
          error: null,
        }),
      });

      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([250])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      await engine.generateForecast('prop_123', 7);

      expect(supabase.from).toHaveBeenCalledWith('guesty_properties_cache');
    });

    it('should throw error if property not found', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      await expect(engine.generateForecast('prop_123', 7)).rejects.toThrow('Property not found');
    });

    it('should generate consecutive dates', async () => {
      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([250])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      const forecast = await engine.generateForecast('prop_123', 5);

      const dates = forecast.map(f => f.date);
      expect(dates).toHaveLength(5);

      // Check that dates are consecutive
      const date1 = new Date(dates[0]);
      const date2 = new Date(dates[1]);
      const diffDays = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(1);
    });

    it('should use default days if not specified', async () => {
      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([250])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      const forecast = await engine.generateForecast('prop_123');

      expect(forecast).toHaveLength(30); // Default 30 days
    });
  });

  describe('Season Calculation', () => {
    it('should correctly identify high season', () => {
      const july = new Date(2024, 6, 15); // July
      const season = (engine as any).getSeason(july);
      expect(season).toBe('high');
    });

    it('should correctly identify low season', () => {
      const january = new Date(2024, 0, 15); // January
      const season = (engine as any).getSeason(january);
      expect(season).toBe('low');
    });

    it('should correctly identify medium season', () => {
      const april = new Date(2024, 3, 15); // April
      const season = (engine as any).getSeason(april);
      expect(season).toBe('medium');
    });

    it('should handle September as medium season', () => {
      const september = new Date(2024, 8, 15); // September
      const season = (engine as any).getSeason(september);
      expect(season).toBe('medium');
    });

    it('should handle May as medium season', () => {
      const may = new Date(2024, 4, 15); // May
      const season = (engine as any).getSeason(may);
      expect(season).toBe('medium');
    });

    it('should handle all months correctly', () => {
      const highSeasonMonths = [6, 7, 8]; // June, July, August
      const mediumSeasonMonths = [4, 5, 9, 10]; // April, May, September, October
      const lowSeasonMonths = [1, 2, 3, 11, 12]; // January, February, March, November, December

      highSeasonMonths.forEach(month => {
        const date = new Date(2024, month - 1, 1);
        expect((engine as any).getSeason(date)).toBe('high');
      });

      mediumSeasonMonths.forEach(month => {
        const date = new Date(2024, month - 1, 1);
        expect((engine as any).getSeason(date)).toBe('medium');
      });

      lowSeasonMonths.forEach(month => {
        const date = new Date(2024, month - 1, 1);
        expect((engine as any).getSeason(date)).toBe('low');
      });
    });
  });

  describe('Day of Week Calculation', () => {
    it('should correctly identify weekend in forecast', async () => {
      // Mock property fetch
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { base_price: 200 },
          error: null,
        }),
      });

      const mockPrediction = {
        data: vi.fn().mockResolvedValue(new Float32Array([250])),
      };
      const mockModel = {
        add: vi.fn().mockReturnThis(),
        compile: vi.fn(),
        fit: vi.fn(),
        predict: vi.fn().mockReturnValue(mockPrediction),
      };
      tf.sequential.mockReturnValue(mockModel);

      // Start from a Saturday (day 6)
      const saturday = new Date(2024, 0, 6);
      vi.spyOn(Date, 'now').mockReturnValue(saturday.getTime());

      await engine.generateForecast('prop_123', 3);

      expect(mockModel.predict).toHaveBeenCalled();
    });
  });
});

describe('pricingEngine (Singleton)', () => {
  it('should export a singleton instance', () => {
    expect(pricingEngine).toBeInstanceOf(PricingEngine);
  });

  it('should be the same instance across imports', async () => {
    const engine1 = pricingEngine;
    const module = await import('../pricing-engine');
    const engine2 = module.pricingEngine;
    expect(engine1).toBe(engine2);
  });
});
