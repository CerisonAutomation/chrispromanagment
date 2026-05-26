import * as tf from '@tensorflow/tfjs';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyPricingInput {
  property_id: string;
  base_price: number;
  occupancy_rate: number;
  season: 'low' | 'medium' | 'high';
  day_of_week: 'weekday' | 'weekend';
  local_events: number;
  competitor_avg_price: number;
}

export interface PricingForecast {
  date: string;
  price: number;
  occupancy_probability: number;
}

export class PricingEngine {
  private model: tf.LayersModel | null = null;

  async initializeModel() {
    // Simple linear regression model for demo
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ units: 1, inputShape: [7] })); // 7 input features
    this.model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
  }

  async trainModel(historicalData: PropertyPricingInput[]) {
    if (!this.model) await this.initializeModel();

    const inputs = historicalData.map(d => [
      d.base_price,
      d.occupancy_rate,
      d.season === 'low' ? 0 : d.season === 'medium' ? 1 : 2,
      d.day_of_week === 'weekday' ? 0 : 1,
      d.local_events,
      d.competitor_avg_price,
      new Date().getMonth() + 1 // month feature
    ]);

    const labels = historicalData.map(d =>
      d.base_price * (1 + (d.occupancy_rate > 0.8 ? 0.2 : d.occupancy_rate > 0.5 ? 0.1 : -0.1))
    );

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(labels, [inputs.length, 1]);

    await this.model?.fit(xs, ys, { epochs: 100 });
  }

  async predictPrice(input: PropertyPricingInput): Promise<number> {
    if (!this.model) await this.initializeModel();

    const features = [
      input.base_price,
      input.occupancy_rate,
      input.season === 'low' ? 0 : input.season === 'medium' ? 1 : 2,
      input.day_of_week === 'weekday' ? 0 : 1,
      input.local_events,
      input.competitor_avg_price,
      new Date().getMonth() + 1
    ];

    const inputTensor = tf.tensor2d([features]);
    const prediction = this.model?.predict(inputTensor) as tf.Tensor;
    const price = (await prediction.data())[0];

    return Math.max(input.base_price * 0.7, Math.min(price, input.base_price * 1.5));
  }

  async generateForecast(propertyId: string, days: number = 30): Promise<PricingForecast[]> {
    const { data: property } = await supabase
      .from('properties')
      .select('base_price')
      .eq('id', propertyId)
      .single();

    if (!property) throw new Error('Property not found');

    const forecast: PricingForecast[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const input: PropertyPricingInput = {
        property_id: propertyId,
        base_price: property.base_price,
        occupancy_rate: 0.7, // Default, should fetch from Guesty API
        season: this.getSeason(date),
        day_of_week: date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : 'weekday',
        local_events: 0,
        competitor_avg_price: property.base_price * 1.1
      };

      const price = await this.predictPrice(input);

      forecast.push({
        date: date.toISOString().split('T')[0],
        price,
        occupancy_probability: input.occupancy_rate
      });
    }

    return forecast;
  }

  private getSeason(date: Date): 'low' | 'medium' | 'high' {
    const month = date.getMonth() + 1;
    // Simple season logic for Malta
    if (month >= 6 && month <= 8) return 'high';
    if (month >= 4 && month <= 5 || month >= 9 && month <= 10) return 'medium';
    return 'low';
  }
}

export const pricingEngine = new PricingEngine();
