import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Gift, 
  Target, 
  Award, 
  Crown, 
  Zap, 
  ShoppingBag,
  Users,
  Calendar,
  TrendingUp,
  Coins,
  Medal,
  Gem,
  Flame,
  Lock,
  CheckCircle
} from "lucide-react";

interface LoyaltyPoints {
  total: number;
  available: number;
  lifetime: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  nextTierPoints: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  completed: boolean;
  points: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: Date;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'discount' | 'free_shipping' | 'exclusive_access' | 'cash_back';
  icon: React.ReactNode;
  available: boolean;
  expiresAt?: Date;
}

interface LoyaltyProgramProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userPurchases?: number;
  totalSpent?: number;
}

export default function LoyaltyProgram({ 
  isOpen, 
  onOpenChange, 
  userPurchases = 0,
  totalSpent = 0 
}: LoyaltyProgramProps) {
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints>({
    total: Math.max(1250, Math.floor(totalSpent * 0.01)),
    available: Math.max(850, Math.floor(totalSpent * 0.007)),
    lifetime: Math.max(1250, Math.floor(totalSpent * 0.01)),
    tier: totalSpent > 500000 ? 'Diamond' : totalSpent > 200000 ? 'Platinum' : totalSpent > 100000 ? 'Gold' : totalSpent > 50000 ? 'Silver' : 'Bronze',
    nextTierPoints: totalSpent > 500000 ? 0 : totalSpent > 200000 ? 500000 - totalSpent : totalSpent > 100000 ? 200000 - totalSpent : totalSpent > 50000 ? 100000 - totalSpent : 50000 - totalSpent
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_purchase',
      name: 'First Steps',
      description: 'Make your first purchase',
      icon: <ShoppingBag className="w-5 h-5" />,
      progress: userPurchases > 0 ? 1 : 0,
      maxProgress: 1,
      completed: userPurchases > 0,
      points: 100,
      rarity: 'Common',
      unlockedAt: userPurchases > 0 ? new Date() : undefined
    },
    {
      id: 'big_spender',
      name: 'Big Spender',
      description: 'Spend ₹50,000 in total',
      icon: <Coins className="w-5 h-5" />,
      progress: Math.min(totalSpent, 50000),
      maxProgress: 50000,
      completed: totalSpent >= 50000,
      points: 500,
      rarity: 'Rare',
      unlockedAt: totalSpent >= 50000 ? new Date() : undefined
    },
    {
      id: 'cement_master',
      name: 'Cement Master',
      description: 'Purchase 100 bags of cement',
      icon: <Award className="w-5 h-5" />,
      progress: Math.floor(Math.random() * 85) + (userPurchases * 5),
      maxProgress: 100,
      completed: false,
      points: 750,
      rarity: 'Epic'
    },
    {
      id: 'steel_champion',
      name: 'Steel Champion', 
      description: 'Buy 1 tonne of steel',
      icon: <Medal className="w-5 h-5" />,
      progress: Math.floor(Math.random() * 750) + (userPurchases * 50),
      maxProgress: 1000,
      completed: false,
      points: 1000,
      rarity: 'Epic'
    },
    {
      id: 'bulk_buyer',
      name: 'Bulk Buyer',
      description: 'Make a single order worth ₹1,00,000',
      icon: <TrendingUp className="w-5 h-5" />,
      progress: Math.max(0, Math.floor(totalSpent * 0.6)),
      maxProgress: 100000,
      completed: false,
      points: 2000,
      rarity: 'Legendary'
    },
    {
      id: 'loyal_customer',
      name: 'Loyal Customer',
      description: 'Make 50 purchases',
      icon: <Crown className="w-5 h-5" />,
      progress: userPurchases,
      maxProgress: 50,
      completed: userPurchases >= 50,
      points: 1500,
      rarity: 'Epic'
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Share 10 products',
      icon: <Users className="w-5 h-5" />,
      progress: Math.floor(Math.random() * 8),
      maxProgress: 10,
      completed: false,
      points: 300,
      rarity: 'Common'
    },
    {
      id: 'review_writer',
      name: 'Review Writer',
      description: 'Write 20 product reviews',
      icon: <Star className="w-5 h-5" />,
      progress: Math.floor(Math.random() * 15),
      maxProgress: 20,
      completed: false,
      points: 400,
      rarity: 'Rare'
    }
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 'discount_5',
      name: '5% Discount Coupon',
      description: 'Get 5% off on your next order',
      cost: 500,
      type: 'discount',
      icon: <Gem className="w-5 h-5" />,
      available: true
    },
    {
      id: 'free_shipping',
      name: 'Free Shipping',
      description: 'Free delivery on any order',
      cost: 300,
      type: 'free_shipping',
      icon: <Zap className="w-5 h-5" />,
      available: true
    },
    {
      id: 'discount_10',
      name: '10% Discount Coupon',
      description: 'Get 10% off on orders above ₹10,000',
      cost: 1000,
      type: 'discount',
      icon: <Flame className="w-5 h-5" />,
      available: true
    },
    {
      id: 'priority_support',
      name: 'Priority Support',
      description: '24/7 priority customer support for 30 days',
      cost: 750,
      type: 'exclusive_access',
      icon: <Crown className="w-5 h-5" />,
      available: true
    },
    {
      id: 'discount_15',
      name: '15% Mega Discount',
      description: 'Get 15% off on orders above ₹25,000',
      cost: 2000,
      type: 'discount',
      icon: <Trophy className="w-5 h-5" />,
      available: loyaltyPoints.tier === 'Gold' || loyaltyPoints.tier === 'Platinum' || loyaltyPoints.tier === 'Diamond'
    },
    {
      id: 'cashback_1000',
      name: '₹1,000 Cashback',
      description: 'Direct cashback to your wallet',
      cost: 5000,
      type: 'cash_back',
      icon: <Coins className="w-5 h-5" />,
      available: loyaltyPoints.tier === 'Platinum' || loyaltyPoints.tier === 'Diamond'
    }
  ]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-600 bg-amber-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      case 'Diamond': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-gray-300 bg-gray-50';
      case 'Rare': return 'border-blue-300 bg-blue-50';
      case 'Epic': return 'border-purple-300 bg-purple-50';
      case 'Legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || !reward.available || loyaltyPoints.available < reward.cost) {
      return;
    }

    setLoyaltyPoints(prev => ({
      ...prev,
      available: prev.available - reward.cost
    }));

    // Simulate reward redemption
    alert(`Successfully redeemed: ${reward.name}! Check your account for the reward.`);
  };

  const completedAchievements = achievements.filter(a => a.completed);
  const inProgressAchievements = achievements.filter(a => !a.completed);
  const nextTierProgress = loyaltyPoints.nextTierPoints > 0 ? 
    ((loyaltyPoints.lifetime) / (loyaltyPoints.lifetime + loyaltyPoints.nextTierPoints)) * 100 : 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
            Loyalty Rewards Program
          </DialogTitle>
          <DialogDescription>
            Earn points, unlock achievements, and redeem exclusive rewards
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Tier Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Status</span>
                  <Badge className={getTierColor(loyaltyPoints.tier)}>
                    <Crown className="w-4 h-4 mr-1" />
                    {loyaltyPoints.tier} Tier
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{loyaltyPoints.available.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Available Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{loyaltyPoints.lifetime.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Lifetime Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{completedAchievements.length}</p>
                    <p className="text-sm text-gray-600">Achievements</p>
                  </div>
                </div>

                {loyaltyPoints.nextTierPoints > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to next tier</span>
                      <span>{loyaltyPoints.nextTierPoints.toLocaleString()} points to go</span>
                    </div>
                    <Progress value={nextTierProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedAchievements.slice(0, 4).map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.points} points
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Rewards Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.filter(r => r.available && loyaltyPoints.available >= r.cost).slice(0, 3).map(reward => (
                    <div key={reward.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          {reward.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{reward.name}</h3>
                          <p className="text-xs text-gray-600">{reward.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600">{reward.cost} pts</span>
                        <Button 
                          size="sm" 
                          onClick={() => redeemReward(reward.id)}
                        >
                          Redeem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Completed Achievements */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Completed ({completedAchievements.length})
                </h3>
                <div className="space-y-3">
                  {completedAchievements.map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.points} points
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress Achievements */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  In Progress ({inProgressAchievements.length})
                </h3>
                <div className="space-y-3">
                  {inProgressAchievements.map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-100 rounded-full opacity-75">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              +{achievement.points} points
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress.toLocaleString()} / {achievement.maxProgress.toLocaleString()}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(reward => (
                <Card key={reward.id} className={`${reward.available ? '' : 'opacity-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-full ${reward.available ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {reward.available ? reward.icon : <Lock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{reward.name}</h3>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-green-600">{reward.cost}</span>
                        <span className="text-sm text-gray-600 ml-1">points</span>
                      </div>
                      <Button 
                        size="sm"
                        disabled={!reward.available || loyaltyPoints.available < reward.cost}
                        onClick={() => redeemReward(reward.id)}
                      >
                        {!reward.available ? 'Locked' : 
                         loyaltyPoints.available < reward.cost ? 'Not Enough Points' : 
                         'Redeem'}
                      </Button>
                    </div>

                    {reward.expiresAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Expires: {reward.expiresAt.toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Medal className="w-5 h-5 mr-2" />
                  Top Builders This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "Raj Construction Co.", points: 15420, tier: "Diamond" },
                    { rank: 2, name: "Modern Builders", points: 12350, tier: "Platinum" },
                    { rank: 3, name: "City Contractors", points: 9870, tier: "Gold" },
                    { rank: 4, name: "You", points: loyaltyPoints.total, tier: loyaltyPoints.tier },
                    { rank: 5, name: "Prime Constructions", points: 8150, tier: "Gold" }
                  ].map((entry, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        entry.name === "You" ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        entry.rank === 1 ? 'bg-yellow-500' :
                        entry.rank === 2 ? 'bg-gray-400' :
                        entry.rank === 3 ? 'bg-amber-600' :
                        'bg-gray-500'
                      }`}>
                        {entry.rank <= 3 ? '🏆' : entry.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{entry.name}</p>
                        <p className="text-sm text-gray-600">{entry.points.toLocaleString()} points</p>
                      </div>
                      <Badge className={getTierColor(entry.tier)}>
                        {entry.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}