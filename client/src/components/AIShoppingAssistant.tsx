import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  MessageCircle, 
  Send, 
  User, 
  Sparkles, 
  ShoppingCart,
  TrendingUp,
  Star,
  Package,
  Brain,
  Target,
  Lightbulb,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import type { Product } from "@shared/schema";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: Product[];
  actionSuggestion?: {
    type: 'add_to_cart' | 'compare' | 'save_wishlist' | 'get_quote';
    products: Product[];
    message: string;
  };
}

interface AIShoppingAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product) => void;
  onStartComparison: (products: Product[]) => void;
  currentContext?: {
    viewingCategory?: string;
    viewingProduct?: Product;
    cartItems?: Product[];
    recentSearches?: string[];
  };
}

export default function AIShoppingAssistant({ 
  isOpen, 
  onOpenChange, 
  onAddToCart,
  onStartComparison,
  currentContext 
}: AIShoppingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories/hierarchy'],
  });

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'assistant',
        content: `👋 Hi! I'm your AI Shopping Assistant for BuildMart. I can help you:

• Find the perfect construction materials for your project
• Compare products and prices
• Get personalized recommendations 
• Answer questions about specifications
• Suggest bulk discounts and deals

What construction project are you working on today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Generate AI response based on user message
  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let response = "";
    let recommendations: Product[] = [];
    let actionSuggestion;

    // Category-based responses
    if (lowerMessage.includes('cement') || lowerMessage.includes('concrete')) {
      const cementProducts = products.filter(p => 
        p.name.toLowerCase().includes('cement') || 
        p.name.toLowerCase().includes('concrete')
      );
      recommendations = cementProducts.slice(0, 3);
      response = `Great choice! Cement is fundamental for construction. Based on your needs, I found ${cementProducts.length} cement products. Here are my top recommendations:

• **UltraTech Portland Cement** - Most popular choice with 53-grade strength
• **ACC Gold Water Resistant** - Perfect for coastal areas and monsoon construction
• **Ready Mix Concrete** - Convenient for large projects

💡 **Pro Tip**: Buy in bulk (50+ bags) to get up to 15% discount!`;
      
      actionSuggestion = {
        type: 'compare' as const,
        products: recommendations,
        message: "Compare these cement options to find the best fit"
      };
    }
    
    else if (lowerMessage.includes('steel') || lowerMessage.includes('tmt') || lowerMessage.includes('iron')) {
      const steelProducts = products.filter(p => 
        p.name.toLowerCase().includes('steel') || 
        p.name.toLowerCase().includes('tmt') ||
        p.name.toLowerCase().includes('iron')
      );
      recommendations = steelProducts.slice(0, 3);
      response = `Steel is crucial for structural strength! I've found ${steelProducts.length} steel products for you:

• **TATA Steel TMT Bars** - Premium quality with earthquake resistance
• **JSW Neo Steel** - Excellent bendability and weldability
• **MS Angle Iron** - Perfect for structural frameworks

🔧 **Engineering Tip**: Fe500D grade offers better strength than Fe415 for high-rise construction.`;
      
      actionSuggestion = {
        type: 'add_to_cart' as const,
        products: recommendations.slice(0, 1),
        message: "Add TATA Steel TMT Bars to cart (most recommended)"
      };
    }
    
    else if (lowerMessage.includes('brick') || lowerMessage.includes('block')) {
      const brickProducts = products.filter(p => 
        p.name.toLowerCase().includes('brick') || 
        p.name.toLowerCase().includes('block')
      );
      recommendations = brickProducts.slice(0, 3);
      response = `Perfect for masonry work! I've curated ${brickProducts.length} brick options:

• **Red Clay Bricks** - Traditional choice with excellent thermal properties
• **AAC Blocks** - Lightweight and energy-efficient for modern construction
• **Fly Ash Bricks** - Eco-friendly option with good strength

🌱 **Eco-Friendly**: Fly ash bricks are 20% lighter and more sustainable!`;
    }
    
    else if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) {
      response = `I'd be happy to help you compare products! I can show you side-by-side comparisons with:

• **Price Analysis** - Find the best value for money
• **Specifications** - Technical details and grades
• **Stock Availability** - Real-time inventory status
• **Bulk Discounts** - Quantity-based pricing
• **Delivery Options** - Express vs standard shipping

Which specific products would you like to compare?`;
    }
    
    else if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('price')) {
      const affordableProducts = products
        .sort((a, b) => parseFloat(a.basePrice) - parseFloat(b.basePrice))
        .slice(0, 4);
      recommendations = affordableProducts;
      response = `Looking for budget-friendly options? I've found the most cost-effective materials:

💰 **Best Value Products:**
• Starting from ₹6.50 for premium red bricks
• TMT bars from ₹58/piece with bulk discounts
• Quality cement from ₹405/bag (bulk rates)

**Money-Saving Tips:**
🎯 Order 100+ units for maximum bulk discounts
🚚 Choose standard delivery to save on shipping
📅 Plan ahead to avoid express charges`;
    }
    
    else if (lowerMessage.includes('residential') || lowerMessage.includes('house') || lowerMessage.includes('home')) {
      recommendations = products.filter(p => 
        p.name.toLowerCase().includes('cement') || 
        p.name.toLowerCase().includes('brick') ||
        p.name.toLowerCase().includes('steel')
      ).slice(0, 4);
      
      response = `Building a residential project? Here's my recommended material package:

🏠 **Essential Materials for House Construction:**
• **Foundation**: OPC 53 Grade cement + steel reinforcement
• **Walls**: Red clay bricks or AAC blocks  
• **Structure**: Fe500D TMT bars for columns & beams
• **Finishing**: Quality tiles and paints

**Estimated Quantities for 1000 sq ft:**
• Cement: 50-60 bags
• Steel: 2-3 tonnes  
• Bricks: 8,000-10,000 pieces

Would you like a detailed material estimate for your project size?`;
    }
    
    else if (lowerMessage.includes('commercial') || lowerMessage.includes('building') || lowerMessage.includes('office')) {
      recommendations = products.filter(p => 
        p.name.toLowerCase().includes('cement') || 
        p.name.toLowerCase().includes('steel')
      ).slice(0, 3);
      
      response = `Commercial construction requires premium materials! Here's what I recommend:

🏢 **Commercial-Grade Materials:**
• **High-Grade Cement**: 53 Grade OPC for superior strength
• **Structural Steel**: Fe500D TMT bars with earthquake resistance  
• **Ready Mix Concrete**: M25+ grade for consistency

**Commercial Benefits:**
✅ Faster construction with ready mix concrete
💪 Higher load-bearing capacity
🛡️ Enhanced earthquake resistance
📋 Quality certifications included

Bulk pricing available for large orders (500+ bags/tonnes).`;
    }
    
    else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = `I'm here to help with all your construction material needs! Here's what I can assist you with:

🛠️ **Product Guidance:**
• Find materials for specific projects
• Compare specifications and prices
• Recommend suitable grades and quantities

💡 **Smart Shopping:**
• Bulk discount calculations
• Delivery time optimization  
• Alternative product suggestions

📊 **Project Planning:**
• Material quantity estimation
• Cost analysis and budgeting
• Timeline planning for delivery

What specific help do you need today?`;
    }
    
    else {
      // General response with popular products
      const popularProducts = products
        .filter(p => p.stockQuantity && p.stockQuantity > 500)
        .slice(0, 3);
      recommendations = popularProducts;
      
      response = `Thanks for your question! I'd love to help you find the right construction materials.

🔍 **Popular Products Right Now:**
• Premium cement options with bulk discounts
• High-grade TMT steel bars
• Quality bricks and blocks

💬 **You can ask me about:**
• Specific materials (cement, steel, bricks, etc.)
• Project types (residential, commercial)
• Budget-friendly options
• Technical specifications
• Bulk pricing and discounts

What type of construction project are you working on?`;
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      recommendations,
      actionSuggestion
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Auto-scroll to bottom when new message is added
    setTimeout(() => {
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);

    // Generate AI response
    const aiResponse = await generateAIResponse(inputMessage);
    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);

    // Auto-scroll after AI response
    setTimeout(() => {
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionSuggestion = (action: Message['actionSuggestion']) => {
    if (!action) return;

    switch (action.type) {
      case 'add_to_cart':
        action.products.forEach(product => onAddToCart(product));
        break;
      case 'compare':
        onStartComparison(action.products);
        break;
      // Add more action handlers as needed
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-purple-500'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        
        <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
          <div className={`rounded-lg px-4 py-3 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-200'
          }`}>
            <p className="whitespace-pre-line">{message.content}</p>
          </div>
          
          {/* AI Recommendations */}
          {message.recommendations && message.recommendations.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.recommendations.map(product => (
                <Card key={product.id} className="p-3 bg-gray-50 border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-600">₹{parseFloat(product.basePrice).toLocaleString()}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onAddToCart(product)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Action Suggestion */}
          {message.actionSuggestion && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleActionSuggestion(message.actionSuggestion)}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {message.actionSuggestion.message}
              </Button>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  const quickSuggestions = [
    "Show me cement options",
    "I need steel for a house",
    "Compare brick prices", 
    "Budget materials for 1000 sq ft",
    "Best deals this week"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-600" />
            AI Shopping Assistant
          </DialogTitle>
          <DialogDescription>
            Get personalized product recommendations and expert construction advice
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 px-1 smooth-scroll-area" id="ai-chat-scroll">
            <div className="space-y-4 py-4">
              {messages.map(renderMessage)}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Enhanced Smooth Scroll Area - Auto-scroll to latest messages */}
          <style jsx>{`
            .smooth-scroll-area {
              scroll-behavior: smooth;
              transition: all 0.3s ease;
            }
            .smooth-scroll-area::-webkit-scrollbar {
              width: 8px;
            }
            .smooth-scroll-area::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }
            .smooth-scroll-area::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 4px;
            }
            .smooth-scroll-area::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
            }
          `}</style>
          
          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="py-2">
              <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map(suggestion => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about construction materials, prices, comparisons..."
              className="resize-none"
              rows={2}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Plus = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);