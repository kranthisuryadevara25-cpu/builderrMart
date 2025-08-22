import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Brain, 
  Heart, 
  Zap, 
  Leaf, 
  DollarSign, 
  Star, 
  UserCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalityProfile {
  personalityType: 'analytical' | 'creative' | 'practical' | 'environmentalist' | 'budget_conscious';
  preferences: {
    qualityOverPrice: number;
    sustainabilityImportance: number;
    speedOfDelivery: number;
    brandLoyalty: number;
    innovationAppeal: number;
  };
  projectStyle: 'modern' | 'traditional' | 'industrial' | 'eco_friendly';
  riskTolerance: 'low' | 'medium' | 'high';
  communicationStyle: 'casual' | 'professional' | 'technical';
  aiPersonality: 'helpful' | 'enthusiastic' | 'analytical' | 'friendly';
  profileAccuracy: number;
}

interface MaterialRecommendation {
  id: string;
  productName: string;
  category: string;
  brand: string;
  price: number;
  matchScore: number;
  reasonsForRecommendation: string[];
  personalityMatch: string;
  sustainabilityScore: number;
  qualityRating: number;
  aiInsight: string;
}

const personalityTypes = [
  {
    type: 'analytical',
    name: 'The Analyzer',
    icon: Brain,
    color: 'bg-purple-100 text-purple-800',
    description: 'Data-driven, thorough researcher who values detailed specifications',
    aiPersonality: 'analytical',
    traits: ['Detail-oriented', 'Research-focused', 'Quality-driven', 'Specification-heavy']
  },
  {
    type: 'creative',
    name: 'The Innovator',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-800',
    description: 'Aesthetic-focused, values unique and innovative materials',
    aiPersonality: 'enthusiastic',
    traits: ['Design-conscious', 'Trend-aware', 'Aesthetically-driven', 'Innovation-seeking']
  },
  {
    type: 'practical',
    name: 'The Pragmatist',
    icon: Shield,
    color: 'bg-blue-100 text-blue-800',
    description: 'Efficiency-focused, values durability and proven solutions',
    aiPersonality: 'helpful',
    traits: ['Efficiency-focused', 'Durability-conscious', 'Proven solutions', 'No-nonsense']
  },
  {
    type: 'environmentalist',
    name: 'The Eco-Warrior',
    icon: Leaf,
    color: 'bg-green-100 text-green-800',
    description: 'Sustainability-first, values eco-friendly and green materials',
    aiPersonality: 'friendly',
    traits: ['Sustainability-focused', 'Eco-conscious', 'Long-term thinking', 'Impact-aware']
  },
  {
    type: 'budget_conscious',
    name: 'The Value Seeker',
    icon: DollarSign,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Cost-effective, values best bang for buck without compromising quality',
    aiPersonality: 'helpful',
    traits: ['Cost-conscious', 'Value-driven', 'Budget-aware', 'ROI-focused']
  }
];

const profileQuestions = [
  {
    id: 'decision_factor',
    question: 'What\'s most important when choosing construction materials?',
    options: [
      { value: 'quality', label: 'Highest quality available', personality: 'analytical' },
      { value: 'design', label: 'Aesthetic appeal and innovation', personality: 'creative' },
      { value: 'reliability', label: 'Proven track record and durability', personality: 'practical' },
      { value: 'sustainability', label: 'Environmental impact and sustainability', personality: 'environmentalist' },
      { value: 'cost', label: 'Best value for money', personality: 'budget_conscious' }
    ]
  },
  {
    id: 'research_style',
    question: 'How do you typically research before making a purchase?',
    options: [
      { value: 'deep', label: 'Extensive research, compare all specifications', personality: 'analytical' },
      { value: 'visual', label: 'Look at designs, trends, and visual appeal', personality: 'creative' },
      { value: 'reviews', label: 'Read reviews and proven case studies', personality: 'practical' },
      { value: 'certifications', label: 'Check environmental certifications', personality: 'environmentalist' },
      { value: 'quick', label: 'Quick comparison of prices and basics', personality: 'budget_conscious' }
    ]
  },
  {
    id: 'project_approach',
    question: 'How would you describe your project approach?',
    options: [
      { value: 'meticulous', label: 'Meticulous planning with detailed specifications', personality: 'analytical' },
      { value: 'creative', label: 'Creative exploration with unique elements', personality: 'creative' },
      { value: 'systematic', label: 'Systematic execution with proven methods', personality: 'practical' },
      { value: 'sustainable', label: 'Sustainable development with minimal impact', personality: 'environmentalist' },
      { value: 'efficient', label: 'Efficient completion within budget', personality: 'budget_conscious' }
    ]
  }
];

// Mock material recommendations based on personality
const generatePersonalizedRecommendations = (profile: PersonalityProfile): MaterialRecommendation[] => {
  const baseRecommendations = [
    {
      id: 'rec-1',
      productName: 'Ultra-High Performance Concrete',
      category: 'Concrete',
      brand: 'TechCrete',
      price: 450,
      sustainabilityScore: 75,
      qualityRating: 95
    },
    {
      id: 'rec-2',
      productName: 'Bamboo Composite Panels',
      category: 'Panels',
      brand: 'EcoPanel',
      price: 320,
      sustainabilityScore: 95,
      qualityRating: 85
    },
    {
      id: 'rec-3',
      productName: 'Recycled Steel Beams',
      category: 'Steel',
      brand: 'GreenSteel',
      price: 280,
      sustainabilityScore: 90,
      qualityRating: 88
    },
    {
      id: 'rec-4',
      productName: 'Smart Glass Panels',
      category: 'Glass',
      brand: 'InnoGlass',
      price: 650,
      sustainabilityScore: 80,
      qualityRating: 92
    },
    {
      id: 'rec-5',
      productName: 'Standard Portland Cement',
      category: 'Cement',
      brand: 'ValueBuild',
      price: 180,
      sustainabilityScore: 60,
      qualityRating: 82
    }
  ];

  return baseRecommendations.map(material => {
    let matchScore = 50;
    let reasonsForRecommendation: string[] = [];
    let personalityMatch = '';
    let aiInsight = '';

    switch (profile.personalityType) {
      case 'analytical':
        matchScore = material.qualityRating * 0.8 + material.sustainabilityScore * 0.2;
        reasonsForRecommendation = [
          'Exceptional technical specifications',
          'Detailed performance data available',
          'High-quality standards met'
        ];
        personalityMatch = 'Perfect for detail-oriented analysis';
        aiInsight = 'Based on your analytical nature, this material offers the comprehensive data and proven performance you value.';
        break;
      case 'creative':
        matchScore = (material.qualityRating * 0.6) + (material.productName.includes('Smart') || material.productName.includes('Bamboo') ? 30 : 0);
        reasonsForRecommendation = [
          'Innovative design possibilities',
          'Aesthetic appeal',
          'Trendy and modern solution'
        ];
        personalityMatch = 'Aligns with creative vision';
        aiInsight = 'Your creative spirit will appreciate the innovative design potential and aesthetic possibilities this material offers.';
        break;
      case 'practical':
        matchScore = material.qualityRating * 0.7 + (material.price < 400 ? 20 : 0);
        reasonsForRecommendation = [
          'Proven durability',
          'Reliable performance',
          'Practical application'
        ];
        personalityMatch = 'Practical and reliable choice';
        aiInsight = 'This material aligns with your practical approach, offering reliable performance and proven durability.';
        break;
      case 'environmentalist':
        matchScore = material.sustainabilityScore * 0.8 + material.qualityRating * 0.2;
        reasonsForRecommendation = [
          'High sustainability score',
          'Eco-friendly production',
          'Reduced environmental impact'
        ];
        personalityMatch = 'Environmentally responsible';
        aiInsight = 'Your environmental consciousness is perfectly matched with this material\'s sustainable production and minimal impact.';
        break;
      case 'budget_conscious':
        matchScore = ((1000 - material.price) / 10) + material.qualityRating * 0.3;
        reasonsForRecommendation = [
          'Excellent value for money',
          'Cost-effective solution',
          'Good quality at reasonable price'
        ];
        personalityMatch = 'Great value proposition';
        aiInsight = 'This material offers the optimal balance of quality and cost that aligns with your value-focused approach.';
        break;
    }

    return {
      ...material,
      matchScore: Math.min(100, matchScore),
      reasonsForRecommendation,
      personalityMatch,
      aiInsight
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

export default function AIPersonalityMatcher() {
  const [step, setStep] = useState<'quiz' | 'profile' | 'recommendations'>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [recommendations, setRecommendations] = useState<MaterialRecommendation[]>([]);
  const [preferences, setPreferences] = useState({
    qualityOverPrice: 70,
    sustainabilityImportance: 60,
    speedOfDelivery: 50,
    brandLoyalty: 40,
    innovationAppeal: 55
  });

  // Fetch real products from API
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const analyzePersonality = () => {
    const personalityScores: Record<string, number> = {
      analytical: 0,
      creative: 0,
      practical: 0,
      environmentalist: 0,
      budget_conscious: 0
    };

    // Score based on answers
    Object.values(answers).forEach(answer => {
      const question = profileQuestions.find(q => 
        q.options.some(opt => opt.value === answer)
      );
      const option = question?.options.find(opt => opt.value === answer);
      if (option) {
        personalityScores[option.personality]++;
      }
    });

    // Find dominant personality
    const dominantPersonality = Object.entries(personalityScores)
      .sort(([,a], [,b]) => b - a)[0][0] as PersonalityProfile['personalityType'];

    const personalityData = personalityTypes.find(p => p.type === dominantPersonality)!;

    const profile: PersonalityProfile = {
      personalityType: dominantPersonality,
      preferences,
      projectStyle: dominantPersonality === 'environmentalist' ? 'eco_friendly' : 
                   dominantPersonality === 'creative' ? 'modern' :
                   dominantPersonality === 'practical' ? 'traditional' : 'modern',
      riskTolerance: dominantPersonality === 'analytical' ? 'low' :
                    dominantPersonality === 'creative' ? 'high' : 'medium',
      communicationStyle: dominantPersonality === 'analytical' ? 'technical' :
                         dominantPersonality === 'creative' ? 'casual' : 'professional',
      aiPersonality: personalityData.aiPersonality as PersonalityProfile['aiPersonality'],
      profileAccuracy: 85 + Math.random() * 10
    };

    setPersonalityProfile(profile);
    setRecommendations(generatePersonalizedRecommendations(profile));
    setStep('profile');
  };

  const currentPersonalityType = personalityProfile ? personalityTypes.find(p => p.type === personalityProfile.personalityType) : null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Brain className="h-6 w-6 text-purple-600" />
          </motion.div>
          AI Material Matchmaker with Personality
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Discover your construction personality and get personalized material recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: step === 'quiz' ? `${((currentQuestion + 1) / profileQuestions.length) * 100}%` :
                     step === 'profile' ? '66%' : '100%'
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personality Quiz */}
          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Question {currentQuestion + 1} of {profileQuestions.length}
                </h3>
                <p className="text-gray-600">
                  {profileQuestions[currentQuestion].question}
                </p>
              </div>

              <RadioGroup
                value={answers[profileQuestions[currentQuestion].id] || ''}
                onValueChange={(value) => setAnswers(prev => ({
                  ...prev,
                  [profileQuestions[currentQuestion].id]: value
                }))}
                className="space-y-3"
              >
                {profileQuestions[currentQuestion].options.map((option, index) => (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setAnswers(prev => ({
                      ...prev,
                      [profileQuestions[currentQuestion].id]: option.value
                    }))}
                    data-testid={`quiz-option-${option.value}`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    if (currentQuestion < profileQuestions.length - 1) {
                      setCurrentQuestion(prev => prev + 1);
                    } else {
                      analyzePersonality();
                    }
                  }}
                  disabled={!answers[profileQuestions[currentQuestion].id]}
                  data-testid={currentQuestion === profileQuestions.length - 1 ? "analyze-personality" : "next-question"}
                >
                  {currentQuestion === profileQuestions.length - 1 ? 'Analyze Personality' : 'Next'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Personality Profile */}
          {step === 'profile' && personalityProfile && currentPersonalityType && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`w-20 h-20 rounded-full ${currentPersonalityType.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <currentPersonalityType.icon className="h-10 w-10" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">{currentPersonalityType.name}</h3>
                <p className="text-gray-600 mb-4">{currentPersonalityType.description}</p>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-4">
                    {personalityProfile.profileAccuracy.toFixed(0)}% accuracy
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentPersonalityType.traits.map((trait, index) => (
                  <motion.div
                    key={trait}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
                  >
                    <div className="text-sm font-medium">{trait}</div>
                  </motion.div>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fine-tune Your Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(preferences).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Label>
                        <span className="text-sm text-gray-600">{value}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => setPreferences(prev => ({
                          ...prev,
                          [key]: newValue
                        }))}
                        max={100}
                        min={0}
                        step={10}
                        className="w-full"
                        data-testid={`preference-slider-${key}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  onClick={() => {
                    const updatedProfile = { ...personalityProfile, preferences };
                    setPersonalityProfile(updatedProfile);
                    setRecommendations(generatePersonalizedRecommendations(updatedProfile));
                    setStep('recommendations');
                  }}
                  className="px-8"
                  data-testid="get-recommendations"
                >
                  Get My Personalized Recommendations
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Personalized Recommendations */}
          {step === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Your Personalized Material Recommendations</h3>
                <p className="text-gray-600">
                  Based on your {currentPersonalityType?.name} personality profile
                </p>
              </div>

              <div className="space-y-4">
                {recommendations.slice(0, 5).map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 border rounded-lg ${
                      index === 0 ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200'
                    }`}
                    data-testid={`recommendation-card-${index}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-purple-600' : index === 1 ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{recommendation.productName}</h4>
                          <p className="text-gray-600">{recommendation.brand} • {recommendation.category}</p>
                          <Badge className="mt-1" variant="secondary">
                            {recommendation.personalityMatch}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {recommendation.matchScore.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Match Score</div>
                        <div className="text-lg font-semibold text-gray-800 mt-1">
                          ₹{recommendation.price}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {recommendation.sustainabilityScore}
                        </div>
                        <div className="text-sm text-gray-600">Sustainability</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {recommendation.qualityRating}
                        </div>
                        <div className="text-sm text-gray-600">Quality Rating</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Why this matches your personality:</h5>
                      <ul className="space-y-1">
                        {recommendation.reasonsForRecommendation.map((reason, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-blue-600" />
                        AI Insight
                      </h5>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {recommendation.aiInsight}
                      </p>
                    </div>

                    {index === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 flex gap-2"
                      >
                        <Button size="sm" className="flex-1" data-testid="add-to-cart">
                          Add to Cart
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Get Quote
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('quiz');
                    setCurrentQuestion(0);
                    setAnswers({});
                    setPersonalityProfile(null);
                  }}
                  data-testid="retake-quiz"
                >
                  Retake Personality Quiz
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}