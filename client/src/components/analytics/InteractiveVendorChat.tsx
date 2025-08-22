import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceSearchInput } from '@/components/ui/voice-search-input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  Star, 
  Clock, 
  MapPin, 
  Package,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Users,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'vendor' | 'system';
  message: string;
  timestamp: string;
  messageType: 'text' | 'quote' | 'product' | 'order';
  attachments?: any[];
  status: 'sent' | 'delivered' | 'read';
}

interface VendorChat {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorLocation: string;
  vendorSpecialty: string[];
  chatStatus: 'active' | 'pending' | 'offline';
  lastMessage: string;
  lastActivity: string;
  unreadCount: number;
  messages: ChatMessage[];
  responseTime: number; // average minutes
  onlineStatus: boolean;
}

interface NegotiationOffer {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  proposedPrice: number;
  quantity: number;
  validUntil: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  terms: string;
  discount: number;
}

export default function InteractiveVendorChat() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [messageInput, setMessageInput] = useState('');
  const [chatFilter, setChatFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorChats, setVendorChats] = useState<VendorChat[]>([]);
  const [currentUser] = useState({ id: 'current-user', name: 'You', type: 'customer' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real vendors and users from API
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { chatId: string; message: string; type: string }) => {
      // Simulate real-time message sending
      return new Promise(resolve => setTimeout(() => resolve(messageData), 500));
    },
    onSuccess: (data: any) => {
      // Update local chat state
      setVendorChats(prev => prev.map(chat => {
        if (chat.id === data.chatId) {
          const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderType: currentUser.type as 'customer',
            message: data.message,
            timestamp: new Date().toISOString(),
            messageType: data.type as 'text',
            status: 'sent'
          };
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: data.message,
            lastActivity: new Date().toISOString()
          };
        }
        return chat;
      }));
      setMessageInput('');
      
      // Simulate vendor response after a delay
      setTimeout(() => {
        simulateVendorResponse(data.chatId);
      }, 2000 + Math.random() * 3000);
    },
  });

  // Generate realistic vendor chats from real users with immediate fallback
  useEffect(() => {
    // Always ensure we have chat data available
    let chatsToSet: VendorChat[] = [];
    
    if (Array.isArray(users) && users.length > 0 && Array.isArray(products)) {
      const vendorUsers = (users as any[]).filter(user => user.role === 'vendor');
      
      if (vendorUsers.length > 0) {
        chatsToSet = generateRealVendorChats(vendorUsers, products as any[]);
      }
    }
    
    // Always fallback to mock data if no real vendor data available
    if (chatsToSet.length === 0) {
      chatsToSet = generateMockVendorChats();
    }
    
    // Update state only if data has changed
    setVendorChats(prev => {
      if (JSON.stringify(prev.map(c => c.id)) !== JSON.stringify(chatsToSet.map(c => c.id))) {
        return chatsToSet;
      }
      return prev;
    });
    
    // Auto-select first chat if none selected
    if (chatsToSet.length > 0 && !selectedChat) {
      setSelectedChat(chatsToSet[0].id);
    }
  }, [Array.isArray(users) ? users.length : 0, Array.isArray(products) ? products.length : 0]); // Only depend on array lengths to avoid infinite loops

  // Initialize with mock data immediately on component mount
  useEffect(() => {
    if (vendorChats.length === 0) {
      const initialMockChats = generateMockVendorChats();
      setVendorChats(initialMockChats);
      if (!selectedChat && initialMockChats.length > 0) {
        setSelectedChat(initialMockChats[0].id);
      }
    }
  }, []);

  const generateRealVendorChats = (vendors: any[], products: any[]): VendorChat[] => {
    return vendors.map((vendor, index) => {
      const vendorProducts = products.filter(p => Math.random() > 0.7); // Random vendor specialties
      const specialties = Array.from(new Set(vendorProducts.map(p => p.categoryName).filter(Boolean))).slice(0, 3);
      
      const messages: ChatMessage[] = [
        {
          id: `msg-${index}-1`,
          senderId: vendor.id,
          senderName: vendor.firstName + ' ' + vendor.lastName,
          senderType: 'vendor',
          message: `Hello! I'm ${vendor.firstName}, your dedicated vendor for ${specialties.join(', ')}. How can I help you today?`,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          messageType: 'text',
          status: 'read'
        },
        {
          id: `msg-${index}-2`,
          senderId: 'current-user',
          senderName: 'You',
          senderType: 'customer',
          message: 'Hi! I\'m looking for quality construction materials for my upcoming project.',
          timestamp: new Date(Date.now() - Math.random() * 43200000).toISOString(),
          messageType: 'text',
          status: 'read'
        },
        {
          id: `msg-${index}-3`,
          senderId: vendor.id,
          senderName: vendor.firstName + ' ' + vendor.lastName,
          senderType: 'vendor',
          message: 'Perfect! I have excellent materials in stock. What specific items do you need and what\'s your timeline?',
          timestamp: new Date(Date.now() - Math.random() * 21600000).toISOString(),
          messageType: 'text',
          status: 'read'
        }
      ];

      return {
        id: `chat-${vendor.id}`,
        vendorId: vendor.id,
        vendorName: vendor.firstName + ' ' + vendor.lastName,
        vendorRating: 4.2 + Math.random() * 0.8,
        vendorLocation: 'Mumbai, India', // Could be from vendor profile
        vendorSpecialty: specialties,
        chatStatus: Math.random() > 0.3 ? 'active' : 'offline',
        lastMessage: messages[messages.length - 1].message,
        lastActivity: messages[messages.length - 1].timestamp,
        unreadCount: Math.floor(Math.random() * 5),
        messages,
        responseTime: 5 + Math.random() * 15,
        onlineStatus: Math.random() > 0.4
      };
    });
  };

  const generateMockVendorChats = (): VendorChat[] => {
    const mockVendors = [
      { id: 'v1', name: 'Rajesh Kumar', specialty: ['Cement', 'Steel'], location: 'Mumbai', rating: 4.8 },
      { id: 'v2', name: 'Priya Industries', specialty: ['Bricks', 'Tiles'], location: 'Delhi', rating: 4.6 },
      { id: 'v3', name: 'BuildMax Solutions', specialty: ['Paint', 'Hardware'], location: 'Bangalore', rating: 4.7 },
      { id: 'v4', name: 'GreenBuild Co.', specialty: ['Eco Materials'], location: 'Pune', rating: 4.9 }
    ];

    return mockVendors.map((vendor, index) => ({
      id: `chat-${vendor.id}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorRating: vendor.rating,
      vendorLocation: vendor.location,
      vendorSpecialty: vendor.specialty,
      chatStatus: index < 2 ? 'active' : 'offline',
      lastMessage: 'Thanks for your interest! Let me prepare a quote for you.',
      lastActivity: new Date(Date.now() - index * 3600000).toISOString(),
      unreadCount: index === 0 ? 2 : 0,
      messages: [
        {
          id: `msg-${index}-1`,
          senderId: vendor.id,
          senderName: vendor.name,
          senderType: 'vendor',
          message: `Hello! I'm from ${vendor.name}. We specialize in ${vendor.specialty.join(', ')}. How can I assist you?`,
          timestamp: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
          messageType: 'text',
          status: 'read'
        }
      ],
      responseTime: 5 + Math.random() * 10,
      onlineStatus: index < 3
    }));
  };

  const simulateVendorResponse = (chatId: string) => {
    const responses = [
      'Thank you for your message! Let me check our current inventory for you.',
      'Great! I can offer you a special discount on bulk orders. What quantity are you looking for?',
      'We have those materials in stock. I\'ll prepare a detailed quote with competitive pricing.',
      'Perfect timing! We just received a fresh shipment. The quality is excellent.',
      'I understand your requirements. Let me connect you with our technical expert for detailed specifications.',
      'Absolutely! We can arrange site delivery within 24-48 hours. What\'s your project location?'
    ];

    setVendorChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const vendorResponse: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: chat.vendorId,
          senderName: chat.vendorName,
          senderType: 'vendor',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
          messageType: 'text',
          status: 'sent'
        };
        return {
          ...chat,
          messages: [...chat.messages, vendorResponse],
          lastMessage: vendorResponse.message,
          lastActivity: new Date().toISOString(),
          unreadCount: chat.unreadCount + 1
        };
      }
      return chat;
    }));
  };

  const sendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      sendMessageMutation.mutate({
        chatId: selectedChat,
        message: messageInput,
        type: 'text'
      });
    }
  };

  const selectedChatData = vendorChats.find(chat => chat.id === selectedChat);

  const filteredChats = vendorChats.filter(chat => {
    // Filter by search term
    let matchesSearch = true;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      matchesSearch = chat.vendorName.toLowerCase().includes(search) ||
                     chat.vendorLocation.toLowerCase().includes(search) ||
                     chat.vendorSpecialty.some(specialty => specialty.toLowerCase().includes(search)) ||
                     chat.lastMessage.toLowerCase().includes(search);
    }
    
    // Filter by chat status
    let matchesFilter = true;
    if (chatFilter === 'active') matchesFilter = chat.chatStatus === 'active';
    else if (chatFilter === 'unread') matchesFilter = chat.unreadCount > 0;
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatData?.messages]);

  return (
    <div className="w-full h-[600px] bg-white dark:bg-gray-900 rounded-lg border shadow-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chats" className="flex items-center gap-2" data-testid="tab-chats">
            <MessageCircle className="h-4 w-4" />
            Vendor Chats
          </TabsTrigger>
          <TabsTrigger value="online" className="flex items-center gap-2" data-testid="tab-online">
            <Users className="h-4 w-4" />
            Online Vendors
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2" data-testid="tab-support">
            <Zap className="h-4 w-4" />
            Quick Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="h-[calc(100%-48px)] p-0">
          <div className="flex h-full">
            {/* Chat List */}
            <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-800">
              <div className="p-4 border-b space-y-3">
                <VoiceSearchInput
                  placeholder="Search vendors by name, location, or specialty..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  testId="input-search-chat-vendors"
                />
                <Select value={chatFilter} onValueChange={setChatFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter chats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chats</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[calc(100%-140px)]">
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedChat === chat.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedChat(chat.id)}
                    data-testid={`chat-item-${chat.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-500 text-white">
                            {chat.vendorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {chat.onlineStatus && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{chat.vendorName}</h4>
                          <div className="flex items-center gap-1">
                            {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center">
                                {chat.unreadCount}
                              </Badge>
                            )}
                            <Badge className={`text-xs ${chat.chatStatus === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                              {chat.chatStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {chat.vendorRating.toFixed(1)}
                          <span>• {chat.vendorLocation}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Clock className="h-3 w-3" />
                          Avg: {Math.round(chat.responseTime)}min
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {chat.vendorSpecialty.slice(0, 2).map(specialty => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col">
              {selectedChatData ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white dark:bg-gray-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {selectedChatData.vendorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedChatData.vendorName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {selectedChatData.vendorLocation}
                          <span>•</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {selectedChatData.vendorRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" data-testid="call-vendor">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" data-testid="video-call-vendor">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-4">
                      <AnimatePresence>
                        {selectedChatData.messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === currentUser.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                                {message.senderId === currentUser.id && (
                                  <CheckCircle2 className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                        data-testid="message-input"
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        data-testid="send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                  <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select a Vendor to Start Chatting
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    Choose a vendor from the list on the left to start a conversation, negotiate prices, and get instant support.
                  </p>
                  {filteredChats.length === 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Loading vendor chats... If this persists, we'll connect you with our support team.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="online" className="h-[calc(100%-48px)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorChats.filter(chat => chat.onlineStatus).map((vendor) => (
              <Card key={vendor.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => { setActiveTab('chats'); setSelectedChat(vendor.id); }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-green-500 text-white">
                          {vendor.vendorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{vendor.vendorName}</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {vendor.vendorRating.toFixed(1)}
                        <span>• Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {vendor.vendorSpecialty.map(specialty => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Response time:</span>
                      <span className="font-medium">{Math.round(vendor.responseTime)} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="h-[calc(100%-48px)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="request-quote">
                  <Package className="h-4 w-4 mr-2" />
                  Request Bulk Quote
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="emergency-order">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Emergency Order
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="technical-support">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Technical Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Chats</span>
                  <Badge>{vendorChats.filter(c => c.chatStatus === 'active').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Online Vendors</span>
                  <Badge variant="secondary">{vendorChats.filter(c => c.onlineStatus).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-medium">
                    {Math.round(vendorChats.reduce((acc, chat) => acc + chat.responseTime, 0) / vendorChats.length)} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}