import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Star,
  Zap,
  Target,
  BookOpen,
  Award,
  Users,
  Clock,
  CheckCircle2,
  PlayCircle,
  Gift,
  Flame,
  Crown,
  Medal,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'materials' | 'safety' | 'techniques' | 'sustainability' | 'business';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  points: number;
  prerequisites: string[];
  completed: boolean;
  progress: number;
  badge?: string;
  certification: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
}

interface UserStats {
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  streak: number;
  modulesCompleted: number;
  certificationsEarned: number;
  rank: number;
  percentile: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  reward: number;
  deadline: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

interface Leaderboard {
  position: number;
  username: string;
  points: number;
  level: number;
  badge: string;
  isCurrentUser: boolean;
}

const learningModules: LearningModule[] = [
  {
    id: 'cement-basics',
    title: 'Cement Types and Applications',
    description: 'Learn about different types of cement and their specific uses in construction',
    category: 'materials',
    difficulty: 'beginner',
    duration: 25,
    points: 100,
    prerequisites: [],
    completed: false,
    progress: 0,
    badge: 'cement-expert',
    certification: true
  },
  {
    id: 'steel-strength',
    title: 'Steel Grade Selection',
    description: 'Master the art of selecting the right steel grades for different structural needs',
    category: 'materials',
    difficulty: 'intermediate',
    duration: 40,
    points: 200,
    prerequisites: ['cement-basics'],
    completed: false,
    progress: 0,
    badge: 'steel-master',
    certification: true
  },
  {
    id: 'safety-protocols',
    title: 'Construction Site Safety',
    description: 'Essential safety protocols and best practices for construction sites',
    category: 'safety',
    difficulty: 'beginner',
    duration: 30,
    points: 150,
    prerequisites: [],
    completed: true,
    progress: 100,
    badge: 'safety-champion',
    certification: true
  },
  {
    id: 'sustainable-construction',
    title: 'Green Building Techniques',
    description: 'Sustainable construction methods and eco-friendly material choices',
    category: 'sustainability',
    difficulty: 'advanced',
    duration: 60,
    points: 300,
    prerequisites: ['cement-basics', 'steel-strength'],
    completed: false,
    progress: 25,
    badge: 'eco-warrior',
    certification: true
  },
  {
    id: 'cost-estimation',
    title: 'Project Cost Estimation',
    description: 'Learn accurate cost estimation techniques for construction projects',
    category: 'business',
    difficulty: 'intermediate',
    duration: 45,
    points: 250,
    prerequisites: ['cement-basics'],
    completed: false,
    progress: 60,
    badge: 'cost-guru',
    certification: true
  }
];

const achievements: Achievement[] = [
  {
    id: 'first-module',
    title: 'Learning Begins',
    description: 'Complete your first learning module',
    icon: BookOpen,
    rarity: 'common',
    points: 50,
    unlocked: true,
    unlockedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: Flame,
    rarity: 'rare',
    points: 200,
    unlocked: false,
    progress: 3,
    maxProgress: 7
  },
  {
    id: 'materials-master',
    title: 'Materials Expert',
    description: 'Complete all materials-related modules',
    icon: Crown,
    rarity: 'epic',
    points: 500,
    unlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Score 100% on 5 module assessments',
    icon: Target,
    rarity: 'legendary',
    points: 1000,
    unlocked: false,
    progress: 2,
    maxProgress: 5
  }
];

const challenges: Challenge[] = [
  {
    id: 'daily-quiz',
    title: 'Daily Knowledge Quiz',
    description: 'Answer 5 construction knowledge questions',
    type: 'daily',
    reward: 50,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    progress: 3,
    maxProgress: 5,
    completed: false
  },
  {
    id: 'weekly-modules',
    title: 'Weekly Learning Goal',
    description: 'Complete 2 learning modules this week',
    type: 'weekly',
    reward: 300,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 1,
    maxProgress: 2,
    completed: false
  },
  {
    id: 'sustainability-month',
    title: 'Sustainability Focus',
    description: 'Complete all sustainability modules this month',
    type: 'monthly',
    reward: 1000,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    maxProgress: 2,
    completed: false
  }
];

export default function GamifiedLearningHub() {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 5,
    totalPoints: 1250,
    pointsToNextLevel: 250,
    streak: 3,
    modulesCompleted: 2,
    certificationsEarned: 1,
    rank: 47,
    percentile: 78
  });
  const [activeTab, setActiveTab] = useState('modules');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  // Fetch user data
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  useEffect(() => {
    // Generate leaderboard with loop prevention
    if (Array.isArray(users) && users.length > 0) {
      const mockLeaderboard = generateLeaderboard(users as any[]);
      setLeaderboard(prev => {
        // Only update if the data has actually changed
        if (JSON.stringify(prev.map(l => l.id)) !== JSON.stringify(mockLeaderboard.map(l => l.id))) {
          return mockLeaderboard;
        }
        return prev;
      });
    } else if (leaderboard.length === 0) {
      // Only set mock data if leaderboard is empty
      setLeaderboard(generateMockLeaderboard());
    }
  }, [Array.isArray(users) ? users.length : 0]); // Only depend on array length to avoid infinite loops

  const generateLeaderboard = (users: any[]): Leaderboard[] => {
    return users.slice(0, 10).map((user, index) => ({
      position: index + 1,
      username: user.firstName ? `${user.firstName} ${user.lastName?.charAt(0) || ''}` : user.username,
      points: 2000 - index * 150,
      level: 8 - Math.floor(index / 2),
      badge: ['🏆', '🥇', '🥈', '🥉', '⭐', '💎', '🔥', '🌟', '🎯', '🏅'][index],
      isCurrentUser: index === 3 // Mock current user position
    }));
  };

  const generateMockLeaderboard = (): Leaderboard[] => {
    const mockUsers = ['Raj Kumar', 'Priya S.', 'Amit P.', 'You', 'Sunita G.', 'Vijay M.', 'Ravi T.', 'Neha K.'];
    
    return mockUsers.map((username, index) => ({
      position: index + 1,
      username,
      points: 2000 - index * 150,
      level: 8 - Math.floor(index / 2),
      badge: ['🏆', '🥇', '🥈', '🥉', '⭐', '💎', '🔥', '🌟'][index],
      isCurrentUser: username === 'You'
    }));
  };

  const startModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      // Simulate starting a module
      await new Promise(resolve => setTimeout(resolve, 1000));
      return moduleId;
    },
    onSuccess: (moduleId) => {
      const module = learningModules.find(m => m.id === moduleId);
      if (module) {
        setSelectedModule(module);
        toast({
          title: "🎯 Module Started!",
          description: `You've started "${module.title}"`,
        });
      }
    },
  });

  const completeModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      // Simulate completing a module
      await new Promise(resolve => setTimeout(resolve, 2000));
      return moduleId;
    },
    onSuccess: (moduleId) => {
      const module = learningModules.find(m => m.id === moduleId);
      if (module) {
        module.completed = true;
        module.progress = 100;
        
        setUserStats(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + module.points,
          modulesCompleted: prev.modulesCompleted + 1,
          certificationsEarned: module.certification ? prev.certificationsEarned + 1 : prev.certificationsEarned
        }));
        
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        
        toast({
          title: "🎉 Module Completed!",
          description: `You earned ${module.points} points and unlocked "${module.badge}" badge!`,
        });
      }
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'materials': return <Target className="w-4 h-4" />;
      case 'safety': return <CheckCircle2 className="w-4 h-4" />;
      case 'techniques': return <Zap className="w-4 h-4" />;
      case 'sustainability': return <BookOpen className="w-4 h-4" />;
      case 'business': return <TrendingUp className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'rare': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'epic': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white p-8 rounded-lg text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">Congratulations!</h3>
              <p className="text-gray-600">You've completed another module!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Gamified Learning Hub for Construction Professionals
          </h2>
          <p className="text-gray-600">Level up your construction knowledge with interactive learning</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Crown className="w-4 h-4 mr-2" />
          Level {userStats.level}
        </Badge>
      </div>

      {/* User Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-xl font-bold text-yellow-600">{userStats.totalPoints.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{userStats.pointsToNextLevel} to next level</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Learning Streak</p>
                <p className="text-xl font-bold text-orange-600">{userStats.streak} days</p>
                <p className="text-xs text-gray-500">Keep it going!</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Certifications</p>
                <p className="text-xl font-bold text-purple-600">{userStats.certificationsEarned}</p>
                <p className="text-xs text-gray-500">{userStats.modulesCompleted} modules done</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Global Rank</p>
                <p className="text-xl font-bold text-blue-600">#{userStats.rank}</p>
                <p className="text-xs text-gray-500">Top {userStats.percentile}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Level {userStats.level} Progress</span>
            <span className="text-sm text-gray-500">
              {userStats.totalPoints % 500} / 500 XP
            </span>
          </div>
          <Progress value={(userStats.totalPoints % 500) / 5} className="h-3" />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningModules.map((module) => (
              <Card key={module.id} className={`hover:shadow-lg transition-shadow ${module.completed ? 'border-green-200 bg-green-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(module.category)}
                      <div>
                        <h3 className="font-semibold">{module.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{module.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getDifficultyColor(module.difficulty)}>
                        {module.difficulty}
                      </Badge>
                      {module.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {module.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {module.points} pts
                        </span>
                      </div>
                      {module.certification && (
                        <Badge variant="secondary">
                          <Award className="w-3 h-3 mr-1" />
                          Certificate
                        </Badge>
                      )}
                    </div>

                    {module.progress > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm text-gray-500">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    )}

                    {module.prerequisites.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {module.prerequisites.map((prereq) => (
                            <Badge key={prereq} variant="outline" className="text-xs">
                              {learningModules.find(m => m.id === prereq)?.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {!module.completed ? (
                        <Button
                          onClick={() => startModuleMutation.mutate(module.id)}
                          disabled={module.prerequisites.some(p => !learningModules.find(m => m.id === p)?.completed)}
                          className="flex-1 gap-1"
                        >
                          <PlayCircle className="w-4 h-4" />
                          {module.progress > 0 ? 'Continue' : 'Start Learning'}
                        </Button>
                      ) : (
                        <Button variant="secondary" className="flex-1 gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </Button>
                      )}
                      
                      {module.progress > 0 && module.progress < 100 && (
                        <Button
                          variant="outline"
                          onClick={() => completeModuleMutation.mutate(module.id)}
                          className="gap-1"
                        >
                          <Target className="w-4 h-4" />
                          Finish
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`border-2 ${getRarityColor(achievement.rarity)} ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                      <achievement.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm text-gray-500">
                            {achievement.progress} / {achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium text-yellow-600">
                          {achievement.points} points
                        </span>
                        {achievement.unlocked && (
                          <Badge variant="secondary">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className={challenge.completed ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <Badge variant={challenge.type === 'daily' ? 'default' : challenge.type === 'weekly' ? 'secondary' : 'outline'}>
                          {challenge.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm text-gray-500">
                              {challenge.progress} / {challenge.maxProgress}
                            </span>
                          </div>
                          <Progress value={(challenge.progress / challenge.maxProgress) * 100} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-600 font-medium">
                            Reward: {challenge.reward} points
                          </span>
                          <span className="text-gray-500">
                            Ends: {new Date(challenge.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {challenge.completed ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1" />
                          <span className="text-xs text-green-600">Completed</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                          <span className="text-xs text-blue-600">In Progress</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Global Construction Learning Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.position}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.position <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.position <= 3 ? entry.badge : entry.position}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.username}</p>
                        <p className="text-sm text-gray-600">Level {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.points.toLocaleString()} pts</p>
                      {entry.isCurrentUser && (
                        <Badge variant="default" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Gift className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Premium Course Access</h3>
                <p className="text-sm text-gray-600 mb-4">Unlock advanced construction courses</p>
                <div className="text-yellow-600 font-bold mb-4">1,000 points</div>
                <Button className="w-full">Redeem</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Medal className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Digital Certificate</h3>
                <p className="text-sm text-gray-600 mb-4">Official construction expertise certificate</p>
                <div className="text-yellow-600 font-bold mb-4">500 points</div>
                <Button variant="outline" className="w-full">Redeem</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">VIP Status</h3>
                <p className="text-sm text-gray-600 mb-4">Get priority support and exclusive content</p>
                <div className="text-yellow-600 font-bold mb-4">2,000 points</div>
                <Button variant="outline" className="w-full">Redeem</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}