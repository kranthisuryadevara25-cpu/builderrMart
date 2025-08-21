import { storage } from "./storage";
import type { Product } from "@shared/schema";

interface PricingContext {
  quantity: number;
  location?: string;
  deliveryDate?: Date;
  userType?: 'retail' | 'wholesale' | 'contractor';
  paymentMethod?: 'cash' | 'credit' | 'online';
  urgency?: 'standard' | 'urgent' | 'express';
}

interface PricingBreakdown {
  basePrice: number;
  quantityDiscount: number;
  locationSurcharge: number;
  urgencyCharge: number;
  deliveryCharge: number;
  loadingCharge: number;
  taxAmount: number;
  finalPrice: number;
  totalAmount: number;
  savings: number;
}

interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  specifications: string;
  company: string;
  brand: string;
  pricing: PricingBreakdown;
}

interface Quotation {
  id: string;
  items: QuotationItem[];
  totalAmount: number;
  totalSavings: number;
  validUntil: Date;
  deliveryEstimate: string;
  terms: string[];
  createdAt: Date;
}

export class DynamicPricingEngine {
  
  async calculateProductPricing(
    productId: string, 
    context: PricingContext
  ): Promise<PricingBreakdown> {
    try {
      const product = await storage.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const basePrice = parseFloat(product.basePrice);
      
      // Calculate quantity-based pricing
      const { unitPrice, quantityDiscount } = this.calculateQuantityPricing(
        product, 
        context.quantity
      );
      
      // Calculate dynamic charges
      const dynamicCharges = this.calculateDynamicCharges(
        product, 
        context
      );
      
      // Calculate location-based surcharges
      const locationSurcharge = this.calculateLocationSurcharge(
        basePrice, 
        context.location || 'local'
      );
      
      // Calculate urgency charges
      const urgencyCharge = this.calculateUrgencyCharge(
        basePrice, 
        context.urgency || 'standard'
      );
      
      // Calculate taxes
      const taxAmount = this.calculateTax(
        unitPrice, 
        product, 
        context.quantity
      );
      
      const subtotal = unitPrice * context.quantity;
      const totalCharges = dynamicCharges.loading + dynamicCharges.delivery + 
                          locationSurcharge + urgencyCharge;
      const finalPrice = subtotal + totalCharges + taxAmount;
      
      const savings = (basePrice - unitPrice) * context.quantity + quantityDiscount;
      
      return {
        basePrice: basePrice,
        quantityDiscount: quantityDiscount,
        locationSurcharge: locationSurcharge,
        urgencyCharge: urgencyCharge,
        deliveryCharge: dynamicCharges.delivery,
        loadingCharge: dynamicCharges.loading,
        taxAmount: taxAmount,
        finalPrice: unitPrice,
        totalAmount: finalPrice,
        savings: Math.max(savings, 0)
      };
      
    } catch (error) {
      console.error('Error calculating pricing:', error);
      throw error;
    }
  }
  
  private calculateQuantityPricing(product: Product, quantity: number): { 
    unitPrice: number; 
    quantityDiscount: number 
  } {
    const basePrice = parseFloat(product.basePrice);
    const quantitySlabs = product.quantitySlabs as any;
    
    if (!quantitySlabs) {
      return { unitPrice: basePrice, quantityDiscount: 0 };
    }
    
    // Find the appropriate slab
    const slabKeys = Object.keys(quantitySlabs).sort((a, b) => {
      const aMin = this.parseSlabRange(a).min;
      const bMin = this.parseSlabRange(b).min;
      return aMin - bMin;
    });
    
    let applicableSlab = slabKeys[0];
    
    for (const slab of slabKeys) {
      const { min, max } = this.parseSlabRange(slab);
      if (quantity >= min && (max === Infinity || quantity <= max)) {
        applicableSlab = slab;
        break;
      }
    }
    
    const unitPrice = quantitySlabs[applicableSlab] || basePrice;
    const quantityDiscount = (basePrice - unitPrice) * quantity;
    
    return { unitPrice, quantityDiscount };
  }
  
  private parseSlabRange(slab: string): { min: number; max: number } {
    if (slab.includes('+')) {
      const min = parseInt(slab.replace('+', ''));
      return { min, max: Infinity };
    }
    
    if (slab.includes('-')) {
      const [minStr, maxStr] = slab.split('-');
      return { 
        min: parseInt(minStr), 
        max: parseInt(maxStr) 
      };
    }
    
    const num = parseInt(slab);
    return { min: num, max: num };
  }
  
  private calculateDynamicCharges(product: Product, context: PricingContext): {
    loading: number;
    delivery: number;
  } {
    const dynamicCharges = product.dynamicCharges as any;
    
    if (!dynamicCharges) {
      return { loading: 0, delivery: 0 };
    }
    
    let loading = dynamicCharges.loading || 0;
    let delivery = dynamicCharges.delivery || 0;
    
    // Apply urgency multipliers
    if (context.urgency === 'urgent') {
      delivery *= 1.5;
    } else if (context.urgency === 'express') {
      delivery *= 2.0;
    }
    
    return { loading, delivery };
  }
  
  private calculateLocationSurcharge(basePrice: number, location: string): number {
    const locationMultipliers: { [key: string]: number } = {
      'local': 0,
      'city': 0.02,
      'suburban': 0.05,
      'rural': 0.08,
      'remote': 0.12
    };
    
    const multiplier = locationMultipliers[location.toLowerCase()] || 0.03;
    return basePrice * multiplier;
  }
  
  private calculateUrgencyCharge(basePrice: number, urgency: string): number {
    const urgencyMultipliers: { [key: string]: number } = {
      'standard': 0,
      'urgent': 0.15,
      'express': 0.25
    };
    
    const multiplier = urgencyMultipliers[urgency] || 0;
    return basePrice * multiplier;
  }
  
  private calculateTax(unitPrice: number, product: Product, quantity: number): number {
    const dynamicCharges = product.dynamicCharges as any;
    const taxRate = (dynamicCharges?.tax || 12) / 100; // Default 12% GST
    
    return unitPrice * quantity * taxRate;
  }
  
  async generateQuotation(items: {
    productId: string;
    quantity: number;
    specifications?: string;
    company?: string;
    brand?: string;
  }[], context: Omit<PricingContext, 'quantity'> & {
    customerName?: string;
    customerEmail?: string;
    deliveryAddress?: string;
  }): Promise<Quotation> {
    
    const quotationItems: QuotationItem[] = [];
    let totalAmount = 0;
    let totalSavings = 0;
    
    for (const item of items) {
      const product = await storage.getProduct(item.productId);
      if (!product) continue;
      
      const pricing = await this.calculateProductPricing(
        item.productId,
        { ...context, quantity: item.quantity }
      );
      
      quotationItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        specifications: item.specifications || 'As per standard specifications',
        company: item.company || 'Standard',
        brand: item.brand || 'Premium',
        pricing: pricing
      });
      
      totalAmount += pricing.totalAmount;
      totalSavings += pricing.savings;
    }
    
    // Generate quotation ID
    const quotationId = this.generateQuotationId();
    
    // Calculate delivery estimate
    const deliveryDays = this.calculateDeliveryTime(context.urgency || 'standard');
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    
    // Set validity (30 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    
    return {
      id: quotationId,
      items: quotationItems,
      totalAmount: totalAmount,
      totalSavings: totalSavings,
      validUntil: validUntil,
      deliveryEstimate: `${deliveryDays} business days`,
      terms: [
        'Prices are inclusive of all taxes',
        'Delivery charges as applicable',
        'Quotation valid for 30 days',
        'Payment terms: Net 30 days',
        'Material subject to availability'
      ],
      createdAt: new Date()
    };
  }
  
  private generateQuotationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `QUO-${timestamp}-${random}`.toUpperCase();
  }
  
  private calculateDeliveryTime(urgency: string): number {
    const deliveryTimes: { [key: string]: number } = {
      'standard': 7,
      'urgent': 3,
      'express': 1
    };
    
    return deliveryTimes[urgency] || 7;
  }
  
  async getMarketPriceAnalysis(productId: string): Promise<{
    averageMarketPrice: number;
    ourPrice: number;
    competitiveness: 'competitive' | 'above_market' | 'below_market';
    savings: number;
    priceHistory: { date: Date; price: number }[];
  }> {
    try {
      const product = await storage.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      const ourPrice = parseFloat(product.basePrice);
      
      // Mock market analysis (in real implementation, this would come from market data APIs)
      const averageMarketPrice = ourPrice * (0.95 + Math.random() * 0.1); // ±5% variation
      
      let competitiveness: 'competitive' | 'above_market' | 'below_market' = 'competitive';
      if (ourPrice < averageMarketPrice * 0.95) {
        competitiveness = 'below_market';
      } else if (ourPrice > averageMarketPrice * 1.05) {
        competitiveness = 'above_market';
      }
      
      // Mock price history
      const priceHistory = [];
      for (let i = 30; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = 0.95 + Math.random() * 0.1;
        priceHistory.push({
          date,
          price: ourPrice * variation
        });
      }
      
      return {
        averageMarketPrice,
        ourPrice,
        competitiveness,
        savings: Math.max(averageMarketPrice - ourPrice, 0),
        priceHistory
      };
      
    } catch (error) {
      console.error('Error in market price analysis:', error);
      throw error;
    }
  }
}