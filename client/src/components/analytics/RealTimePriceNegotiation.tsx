import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Timer, 
  Zap,
  ArrowUpDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Percent,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface NegotiationSession {
  id: string;
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  originalPrice: number;
  currentPrice: number;
  targetPrice: number;
  quantity: number;
  totalValue: number;
  status: 'active' | 'accepted' | 'declined' | 'expired';
  rounds: NegotiationRound[];
  timeRemaining: number; // minutes
  savingsAchieved: number;
  marketPrice: number;
  competitorPrices: number[];
  priceHistory: PricePoint[];
  leverage: number; // 0-100
  vendorMargin: number;
  bestOffer: number;
}

interface NegotiationRound {
  id: string;
  round: number;
  proposedPrice: number;
  counterPrice?: number;
  timestamp: string;
  status: 'pending' | 'accepted' | 'countered' | 'declined';
  message?: string;
  discountPercentage: number;
}

interface PricePoint {
  timestamp: string;
  price: number;
  source: 'market' | 'negotiation' | 'competitor';
}

interface MarketAnalysis {
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceVolatility: number;
  demandIndex: number;
  supplyIndex: number;
  recommendedPrice: number;
  negotiationPotential: number;
}

export default function RealTimePriceNegotiation() {
  const [activeTab, setActiveTab] = useState('active');
  const [negotiations, setNegotiations] = useState<NegotiationSession[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<string | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number>(0);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [autoNegotiate, setAutoNegotiate] = useState(false);
  const [targetDiscount, setTargetDiscount] = useState([15]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real products and vendors
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Start negotiation mutation
  const startNegotiationMutation = useMutation({
    mutationFn: async (negotiationData: any) => {
      // Simulate API call
      return new Promise(resolve => setTimeout(() => resolve(negotiationData), 500));
    },
    onSuccess: (data: any) => {
      setNegotiations(prev => [...prev, data]);
      toast({
        title: "Negotiation Started! 🤝",
        description: `Price negotiation initiated for ${data.productName}`,
      });
    },
  });

  // Submit counter offer mutation
  const submitOfferMutation = useMutation({
    mutationFn: async (offerData: { negotiationId: string; price: number; message: string }) => {
      return new Promise(resolve => setTimeout(() => resolve(offerData), 1000));
    },
    onSuccess: (data: any) => {
      updateNegotiationRound(data.negotiationId, data.price, data.message);
      
      // Simulate vendor response
      setTimeout(() => {
        simulateVendorResponse(data.negotiationId);
      }, 2000 + Math.random() * 3000);
    },
  });

  // Generate realistic negotiations from real data
  useEffect(() => {
    if (Array.isArray(products) && Array.isArray(users) && products.length > 0 && users.length > 0) {
      const vendors = (users as any[]).filter(user => user.role === 'vendor');
      const realNegotiations = generateRealNegotiations(products as any[], vendors);
      setNegotiations(realNegotiations);
      if (realNegotiations.length > 0) {
        setSelectedNegotiation(realNegotiations[0].id);
      }
    } else {
      const mockNegotiations = generateMockNegotiations();
      setNegotiations(mockNegotiations);
      setSelectedNegotiation(mockNegotiations[0]?.id);
    }
  }, [products, users]);

  const generateRealNegotiations = (products: any[], vendors: any[]): NegotiationSession[] => {
    return products.slice(0, 5).map((product, index) => {
      const vendor = vendors[index % vendors.length];
      const originalPrice = parseFloat(product.basePrice);
      const marketVariation = 0.8 + Math.random() * 0.4; // 80% to 120% of base price
      const marketPrice = originalPrice * marketVariation;
      const currentPrice = originalPrice;
      const targetPrice = originalPrice * (0.7 + Math.random() * 0.2); // 70-90% of original
      
      const competitorPrices = Array.from({ length: 3 }, () => 
        originalPrice * (0.85 + Math.random() * 0.3)
      );

      const rounds: NegotiationRound[] = [
        {
          id: `round-${index}-1`,
          round: 1,
          proposedPrice: targetPrice,
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          status: 'pending',
          discountPercentage: ((originalPrice - targetPrice) / originalPrice) * 100,
          message: 'Initial offer based on bulk quantity and long-term partnership'
        }
      ];

      return {
        id: `neg-${product.id}`,
        productId: product.id,
        productName: product.name,
        vendorId: vendor?.id || 'vendor-1',
        vendorName: vendor ? `${vendor.firstName} ${vendor.lastName}` : 'BuildMart Vendor',
        originalPrice,
        currentPrice,
        targetPrice,
        quantity: 100 + Math.floor(Math.random() * 500),
        totalValue: currentPrice * (100 + Math.floor(Math.random() * 500)),
        status: index === 0 ? 'active' : Math.random() > 0.5 ? 'active' : 'accepted',
        rounds,
        timeRemaining: 60 + Math.random() * 120, // 1-3 hours
        savingsAchieved: Math.max(0, originalPrice - currentPrice),
        marketPrice,
        competitorPrices,
        priceHistory: generatePriceHistory(originalPrice),
        leverage: 30 + Math.random() * 40, // 30-70%
        vendorMargin: 15 + Math.random() * 25, // 15-40%
        bestOffer: targetPrice
      };
    });
  };

  const generateMockNegotiations = (): NegotiationSession[] => {
    const mockProducts = [
      { id: 'p1', name: 'Premium Portland Cement 50kg', price: 450 },
      { id: 'p2', name: 'Steel Rebar TMT Grade 500', price: 75000 },
      { id: 'p3', name: 'Red Clay Bricks (1000 pcs)', price: 8500 },
      { id: 'p4', name: 'Premium Tiles 60x60cm', price: 1200 }
    ];

    return mockProducts.map((product, index) => ({
      id: `neg-${product.id}`,
      productId: product.id,
      productName: product.name,
      vendorId: `vendor-${index + 1}`,
      vendorName: `Vendor ${index + 1}`,
      originalPrice: product.price,
      currentPrice: product.price * (0.9 + Math.random() * 0.1),
      targetPrice: product.price * 0.85,
      quantity: 100 + Math.floor(Math.random() * 500),
      totalValue: product.price * (100 + Math.floor(Math.random() * 500)),
      status: 'active',
      rounds: [],
      timeRemaining: 120 + Math.random() * 60,
      savingsAchieved: 0,
      marketPrice: product.price * (0.95 + Math.random() * 0.1),
      competitorPrices: [product.price * 0.92, product.price * 1.05, product.price * 0.88],
      priceHistory: generatePriceHistory(product.price),
      leverage: 40 + Math.random() * 30,
      vendorMargin: 20 + Math.random() * 20,
      bestOffer: product.price * 0.9
    }));
  };

  const generatePriceHistory = (basePrice: number): PricePoint[] => {
    return Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      price: basePrice * (0.9 + Math.random() * 0.2),
      source: Math.random() > 0.7 ? 'competitor' : 'market'
    }));
  };

  const updateNegotiationRound = (negotiationId: string, price: number, message: string) => {
    setNegotiations(prev => prev.map(neg => {
      if (neg.id === negotiationId) {
        const newRound: NegotiationRound = {
          id: `round-${Date.now()}`,
          round: neg.rounds.length + 1,
          proposedPrice: price,
          timestamp: new Date().toISOString(),
          status: 'pending',
          discountPercentage: ((neg.originalPrice - price) / neg.originalPrice) * 100,
          message
        };
        return {
          ...neg,
          rounds: [...neg.rounds, newRound],
          currentPrice: price
        };
      }
      return neg;
    }));
  };

  const simulateVendorResponse = (negotiationId: string) => {
    setNegotiations(prev => prev.map(neg => {
      if (neg.id === negotiationId) {
        const lastRound = neg.rounds[neg.rounds.length - 1];
        const acceptanceProbability = calculateAcceptanceProbability(neg, lastRound.proposedPrice);
        
        if (Math.random() < acceptanceProbability) {
          // Accept the offer
          return {
            ...neg,
            status: 'accepted',
            currentPrice: lastRound.proposedPrice,
            savingsAchieved: neg.originalPrice - lastRound.proposedPrice,
            rounds: neg.rounds.map(r => r.id === lastRound.id ? { ...r, status: 'accepted' } : r)
          };
        } else {
          // Counter offer
          const counterPrice = generateCounterOffer(neg, lastRound.proposedPrice);
          const updatedRounds = neg.rounds.map(r => 
            r.id === lastRound.id ? { ...r, status: 'countered', counterPrice } : r
          );
          
          return {
            ...neg,
            rounds: updatedRounds,
            currentPrice: counterPrice,
            bestOffer: Math.min(neg.bestOffer, counterPrice)
          };
        }
      }
      return neg;
    }));
  };

  const calculateAcceptanceProbability = (negotiation: NegotiationSession, proposedPrice: number): number => {
    const discountPercent = ((negotiation.originalPrice - proposedPrice) / negotiation.originalPrice) * 100;
    const marginImpact = discountPercent / negotiation.vendorMargin;
    const leverageEffect = negotiation.leverage / 100;
    
    // Higher chance of acceptance if discount is reasonable and leverage is high
    return Math.max(0.1, Math.min(0.9, 0.5 - marginImpact + leverageEffect));
  };

  const generateCounterOffer = (negotiation: NegotiationSession, proposedPrice: number): number => {
    const midpoint = (negotiation.originalPrice + proposedPrice) / 2;
    const variance = (negotiation.originalPrice - proposedPrice) * 0.1;
    return midpoint + (Math.random() - 0.5) * variance;
  };

  const submitOffer = () => {
    if (selectedNegotiation && proposedPrice > 0) {
      submitOfferMutation.mutate({
        negotiationId: selectedNegotiation,
        price: proposedPrice,
        message: negotiationMessage
      });
      setNegotiationMessage('');
    }
  };

  const selectedNegData = negotiations.find(n => n.id === selectedNegotiation);

  const activeNegotiations = negotiations.filter(n => n.status === 'active');
  const completedNegotiations = negotiations.filter(n => n.status !== 'active');

  return (
    <div className="w-full h-[700px] bg-white dark:bg-gray-900 rounded-lg border shadow-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" data-testid="tab-active">
            Active ({activeNegotiations.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedNegotiations.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="strategy" data-testid="tab-strategy">
            Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="h-[calc(100%-48px)] p-0">
          <div className="flex h-full">
            {/* Negotiations List */}
            <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-800 p-4">
              <h3 className="font-semibold mb-4">Active Negotiations</h3>
              <div className="space-y-3">
                {activeNegotiations.map((negotiation) => (
                  <motion.div
                    key={negotiation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedNegotiation === negotiation.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedNegotiation(negotiation.id)}
                    data-testid={`negotiation-${negotiation.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{negotiation.productName}</h4>
                      <Badge className={`text-xs ${
                        negotiation.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {negotiation.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Original:</span>
                        <span>₹{negotiation.originalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span className="font-medium">₹{negotiation.currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="text-green-600">₹{negotiation.targetPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Savings:</span>
                        <span className="text-green-600">
                          ₹{negotiation.savingsAchieved.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(((negotiation.originalPrice - negotiation.currentPrice) / (negotiation.originalPrice - negotiation.targetPrice)) * 100)}%</span>
                      </div>
                      <Progress 
                        value={((negotiation.originalPrice - negotiation.currentPrice) / (negotiation.originalPrice - negotiation.targetPrice)) * 100} 
                        className="h-2 mt-1" 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Timer className="h-3 w-3" />
                      <span>{Math.round(negotiation.timeRemaining)}min left</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Negotiation Interface */}
            <div className="flex-1 flex flex-col">
              {selectedNegData ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold">{selectedNegData.productName}</h2>
                        <p className="text-sm text-gray-600">Vendor: {selectedNegData.vendorName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{selectedNegData.savingsAchieved.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Savings</div>
                      </div>
                    </div>
                  </div>

                  {/* Market Analysis */}
                  <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-medium mb-3">Market Analysis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">₹{selectedNegData.marketPrice.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Market Price</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{selectedNegData.leverage}%</div>
                        <div className="text-xs text-gray-600">Your Leverage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">{selectedNegData.vendorMargin}%</div>
                        <div className="text-xs text-gray-600">Vendor Margin</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">₹{selectedNegData.bestOffer.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Best Offer</div>
                      </div>
                    </div>
                  </div>

                  {/* Negotiation History */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <h3 className="font-medium mb-3">Negotiation Rounds</h3>
                    <div className="space-y-3">
                      {selectedNegData.rounds.map((round, index) => (
                        <motion.div
                          key={round.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 border rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Round {round.round}</Badge>
                              <Badge className={`text-xs ${
                                round.status === 'accepted' ? 'bg-green-500' :
                                round.status === 'countered' ? 'bg-orange-500' :
                                round.status === 'declined' ? 'bg-red-500' : 'bg-blue-500'
                              }`}>
                                {round.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              {new Date(round.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Your Offer</div>
                              <div className="font-semibold">₹{round.proposedPrice.toLocaleString()}</div>
                              <div className="text-xs text-green-600">
                                {round.discountPercentage.toFixed(1)}% discount
                              </div>
                            </div>
                            {round.counterPrice && (
                              <div>
                                <div className="text-sm text-gray-600">Counter Offer</div>
                                <div className="font-semibold">₹{round.counterPrice.toLocaleString()}</div>
                                <div className="text-xs text-orange-600">
                                  {(((selectedNegData.originalPrice - round.counterPrice) / selectedNegData.originalPrice) * 100).toFixed(1)}% discount
                                </div>
                              </div>
                            )}
                          </div>
                          {round.message && (
                            <div className="mt-2 text-sm text-gray-600 italic">
                              "{round.message}"
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Negotiation Input */}
                  {selectedNegData.status === 'active' && (
                    <div className="p-4 border-t bg-white dark:bg-gray-900">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Proposed Price</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              value={proposedPrice || ''}
                              onChange={(e) => setProposedPrice(Number(e.target.value))}
                              placeholder="Enter your offer"
                              className="flex-1"
                              data-testid="price-input"
                            />
                            <div className="text-sm text-gray-600">
                              {proposedPrice > 0 && (
                                <span className={
                                  proposedPrice < selectedNegData.currentPrice ? 'text-green-600' : 'text-red-600'
                                }>
                                  {proposedPrice < selectedNegData.currentPrice ? '↓' : '↑'} 
                                  {Math.abs(((selectedNegData.currentPrice - proposedPrice) / selectedNegData.currentPrice) * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Message (Optional)</label>
                          <Input
                            value={negotiationMessage}
                            onChange={(e) => setNegotiationMessage(e.target.value)}
                            placeholder="Add a message to strengthen your offer..."
                            className="mt-1"
                            data-testid="message-input"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={submitOffer}
                            disabled={!proposedPrice || submitOfferMutation.isPending}
                            className="flex-1"
                            data-testid="submit-offer"
                          >
                            {submitOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
                          </Button>
                          <Button variant="outline" className="flex-1" data-testid="auto-negotiate">
                            Auto-Negotiate
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a negotiation to view details
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="h-[calc(100%-48px)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedNegotiations.map((negotiation) => (
              <Card key={negotiation.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{negotiation.productName}</CardTitle>
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${
                      negotiation.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {negotiation.status}
                    </Badge>
                    <div className="text-lg font-bold text-green-600">
                      ₹{negotiation.savingsAchieved.toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original:</span>
                      <span>₹{negotiation.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Final:</span>
                      <span className="font-medium">₹{negotiation.currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">
                        {(((negotiation.originalPrice - negotiation.currentPrice) / negotiation.originalPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rounds:</span>
                      <span>{negotiation.rounds.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[calc(100%-48px)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{negotiations.reduce((sum, n) => sum + n.savingsAchieved, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((negotiations.filter(n => n.status === 'accepted').length / negotiations.length) * 100)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {(negotiations.reduce((sum, n) => sum + ((n.originalPrice - n.currentPrice) / n.originalPrice * 100), 0) / negotiations.length).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {activeNegotiations.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="h-[calc(100%-48px)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Smart Negotiation Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-sm">Leverage Market Data</h4>
                  <p className="text-xs text-gray-600 mt-1">Use competitor prices and market trends to strengthen your position</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-sm">Bundle for Better Deals</h4>
                  <p className="text-xs text-gray-600 mt-1">Combine multiple products or increase quantities for volume discounts</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-medium text-sm">Time Your Negotiations</h4>
                  <p className="text-xs text-gray-600 mt-1">End-of-month and quarter periods often yield better results</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-Negotiation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Target Discount (%)</label>
                  <Slider
                    value={targetDiscount}
                    onValueChange={setTargetDiscount}
                    max={30}
                    min={5}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-600 mt-1">Current: {targetDiscount[0]}%</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Auto-Negotiation</span>
                  <Button 
                    variant={autoNegotiate ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setAutoNegotiate(!autoNegotiate)}
                  >
                    {autoNegotiate ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}