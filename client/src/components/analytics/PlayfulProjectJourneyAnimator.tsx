import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Building2, 
  Package, 
  CheckCircle2, 
  Clock, 
  Star,
  Sparkles,
  Rocket,
  Trophy,
  Zap,
  Heart,
  Target,
  Palette,
  Home,
  Wrench,
  Hammer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectJourney {
  id: string;
  projectName: string;
  projectType: string;
  estimatedArea: number;
  currentPhase: string;
  materialsOrdered: MaterialOrder[];
  timeline: PhaseTimeline[];
  budget: number;
  spentAmount: number;
  completionPercentage: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface MaterialOrder {
  material: string;
  quantity: number;
  price: number;
  phase: string;
  status: 'ordered' | 'delivered' | 'used';
  emoji: string;
}

interface PhaseTimeline {
  phase: string;
  startDate: string;
  endDate?: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  duration: number;
  achievements: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt?: string;
  emoji: string;
  celebration: boolean;
}

const projectPhases = [
  { 
    key: 'planning', 
    name: 'Planning & Design', 
    icon: MapPin, 
    color: '#3b82f6',
    emoji: '📐',
    description: 'Blueprints and permits',
    motivationalMessage: 'Every great structure starts with a dream!' 
  },
  { 
    key: 'foundation', 
    name: 'Foundation', 
    icon: Building2, 
    color: '#f59e0b',
    emoji: '🏗️',
    description: 'Building the base',
    motivationalMessage: 'Strong foundations create lasting homes!'
  },
  { 
    key: 'structure', 
    name: 'Structure', 
    icon: Building2, 
    color: '#10b981',
    emoji: '🔨',
    description: 'Walls and framework',
    motivationalMessage: 'Watch your vision take shape!'
  },
  { 
    key: 'finishing', 
    name: 'Finishing', 
    icon: Package, 
    color: '#8b5cf6',
    emoji: '🎨',
    description: 'Paint and final touches',
    motivationalMessage: 'The magic is in the details!'
  },
  { 
    key: 'completed', 
    name: 'Completed', 
    icon: CheckCircle2, 
    color: '#06b6d4',
    emoji: '🏠',
    description: 'Move-in ready!',
    motivationalMessage: 'Welcome to your dream home!'
  }
];

const celebrationAnimations = [
  { name: 'confetti', emoji: '🎉' },
  { name: 'party', emoji: '🎊' },
  { name: 'sparkles', emoji: '✨' },
  { name: 'celebration', emoji: '🥳' },
  { name: 'trophy', emoji: '🏆' }
];

// Mock project journey data
const generateMockProjectData = (): ProjectJourney[] => {
  const projects = [
    { name: 'Dream Villa Project', type: 'residential', area: 2500 },
    { name: 'Office Complex Build', type: 'commercial', area: 5000 },
    { name: 'Eco-Friendly Home', type: 'residential', area: 1800 },
    { name: 'Shopping Mall Extension', type: 'commercial', area: 8000 }
  ];

  return projects.map((project, index) => {
    const phases = ['planning', 'foundation', 'structure', 'finishing', 'completed'];
    const currentPhaseIndex = Math.floor(Math.random() * phases.length);
    const currentPhase = phases[currentPhaseIndex];
    const completionPercentage = (currentPhaseIndex / (phases.length - 1)) * 100;

    return {
      id: `project-${index}`,
      projectName: project.name,
      projectType: project.type,
      estimatedArea: project.area,
      currentPhase,
      completionPercentage,
      budget: Math.floor(Math.random() * 5000000) + 1000000,
      spentAmount: Math.floor(Math.random() * 3000000) + 500000,
      materialsOrdered: [
        { material: 'Cement', quantity: 100, price: 45000, phase: 'foundation', status: 'delivered', emoji: '🏗️' },
        { material: 'Steel', quantity: 50, price: 85000, phase: 'structure', status: 'ordered', emoji: '⚡' },
        { material: 'Bricks', quantity: 5000, price: 25000, phase: 'structure', status: 'delivered', emoji: '🧱' },
        { material: 'Paint', quantity: 20, price: 15000, phase: 'finishing', status: 'ordered', emoji: '🎨' }
      ],
      timeline: phases.slice(0, currentPhaseIndex + 1).map((phase, idx) => ({
        phase,
        startDate: new Date(Date.now() - (phases.length - idx) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: idx < currentPhaseIndex ? new Date(Date.now() - (phases.length - idx - 1) * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        status: idx < currentPhaseIndex ? 'completed' : idx === currentPhaseIndex ? 'in_progress' : 'upcoming',
        duration: 30,
        achievements: [
          'Phase completed on time!', 
          'Budget maintained within limits', 
          'Quality standards exceeded'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      })),
      milestones: [
        { id: '1', title: 'Foundation Laid', description: 'Strong foundation completed!', achievedAt: currentPhaseIndex > 0 ? new Date().toISOString() : undefined, emoji: '🏗️', celebration: true },
        { id: '2', title: 'Walls Up', description: 'Structure taking shape!', achievedAt: currentPhaseIndex > 1 ? new Date().toISOString() : undefined, emoji: '🧱', celebration: true },
        { id: '3', title: 'Roof Completed', description: 'Protected from the elements!', achievedAt: currentPhaseIndex > 2 ? new Date().toISOString() : undefined, emoji: '🏠', celebration: true },
        { id: '4', title: 'Interior Finished', description: 'Ready for the final touches!', achievedAt: currentPhaseIndex > 3 ? new Date().toISOString() : undefined, emoji: '🎨', celebration: true }
      ],
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
};

export default function PlayfulProjectJourneyAnimator() {
  const [projects, setProjects] = useState<ProjectJourney[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectType: 'residential',
    estimatedArea: '',
    budget: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real products to calculate material costs
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Fetch real users to simulate project owners
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      // Simulate API call for creating projects
      const newProjectData = {
        ...projectData,
        id: `project-${Date.now()}`,
        currentPhase: 'planning',
        completionPercentage: 0,
        spentAmount: 0,
        materialsOrdered: [],
        timeline: [],
        milestones: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real app, this would be an API call
      // return apiRequest('POST', '/api/project-journeys', projectData);
      return Promise.resolve(newProjectData);
    },
    onSuccess: (newProject) => {
      setProjects(prev => [...prev, newProject]);
      toast({
        title: "Project Created! 🚀",
        description: `${newProject.projectName} journey has begun!`,
      });
      setShowCreateProject(false);
      setNewProject({ projectName: '', projectType: 'residential', estimatedArea: '', budget: '' });
    },
  });

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      // Generate realistic project data based on real products and users
      const realProjects = generateRealProjectData(products as any[], users as any[]);
      setProjects(realProjects);
    } else {
      const data = generateMockProjectData();
      setProjects(data);
    }
  }, [products, users]);

  const generateRealProjectData = (products: any[], users: any[]): ProjectJourney[] => {
    const projectTypes = [
      { name: 'Modern Villa Construction', type: 'residential', area: 2500 },
      { name: 'Office Building Project', type: 'commercial', area: 5000 },
      { name: 'Eco-Smart Home', type: 'residential', area: 1800 },
      { name: 'Retail Complex Development', type: 'commercial', area: 8000 },
      { name: 'Industrial Warehouse', type: 'industrial', area: 12000 }
    ];

    return projectTypes.map((project, index) => {
      const phases = ['planning', 'foundation', 'structure', 'finishing', 'completed'];
      const currentPhaseIndex = Math.floor(Math.random() * phases.length);
      const currentPhase = phases[currentPhaseIndex];
      const completionPercentage = (currentPhaseIndex / (phases.length - 1)) * 100;

      // Calculate realistic material orders based on real products
      const relevantProducts = products.filter((p: any) => 
        ['cement', 'steel', 'brick', 'paint'].some(material => 
          p.name?.toLowerCase().includes(material)
        )
      ).slice(0, 4);

      const materialsOrdered: MaterialOrder[] = relevantProducts.map((product: any, idx: number) => ({
        material: product.name,
        quantity: Math.floor(project.area * (0.1 + Math.random() * 0.2)),
        price: parseFloat(product.basePrice) * Math.floor(project.area * (0.1 + Math.random() * 0.2)),
        phase: phases[Math.min(idx + 1, phases.length - 1)],
        status: Math.random() > 0.5 ? 'delivered' : 'ordered' as 'ordered' | 'delivered' | 'used',
        emoji: ['🏗️', '⚡', '🧱', '🎨'][idx] || '📦'
      }));

      return {
        id: `real-project-${index}`,
        projectName: project.name,
        projectType: project.type,
        estimatedArea: project.area,
        currentPhase,
        completionPercentage,
        budget: Math.floor(project.area * 2000 + Math.random() * 1000000),
        spentAmount: Math.floor((project.area * 2000 + Math.random() * 1000000) * (completionPercentage / 100)),
        materialsOrdered,
        timeline: phases.slice(0, currentPhaseIndex + 1).map((phase, idx) => ({
          phase,
          startDate: new Date(Date.now() - (phases.length - idx) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: idx < currentPhaseIndex ? new Date(Date.now() - (phases.length - idx - 1) * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          status: idx < currentPhaseIndex ? 'completed' : idx === currentPhaseIndex ? 'in_progress' : 'upcoming',
          duration: 30 + Math.floor(Math.random() * 20),
          achievements: [
            'Phase completed ahead of schedule! ⚡', 
            'Budget maintained within 95% limits 💰', 
            'Quality standards exceeded by 15% 🏆',
            'Zero safety incidents recorded 🛡️',
            'Client satisfaction: 98% 😊'
          ].slice(0, Math.floor(Math.random() * 3) + 2)
        })),
        milestones: [
          { id: '1', title: 'Foundation Excellence', description: 'Rock-solid foundation completed!', achievedAt: currentPhaseIndex > 0 ? new Date().toISOString() : undefined, emoji: '🏗️', celebration: true },
          { id: '2', title: 'Structure Marvel', description: 'Amazing structure taking perfect shape!', achievedAt: currentPhaseIndex > 1 ? new Date().toISOString() : undefined, emoji: '🧱', celebration: true },
          { id: '3', title: 'Roof Master', description: 'Weather protection fully secured!', achievedAt: currentPhaseIndex > 2 ? new Date().toISOString() : undefined, emoji: '🏠', celebration: true },
          { id: '4', title: 'Finishing Artist', description: 'Interior beauty brought to life!', achievedAt: currentPhaseIndex > 3 ? new Date().toISOString() : undefined, emoji: '🎨', celebration: true }
        ],
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const createProject = () => {
    const newProjectData: ProjectJourney = {
      id: `project-${Date.now()}`,
      projectName: newProject.projectName,
      projectType: newProject.projectType,
      estimatedArea: parseInt(newProject.estimatedArea),
      currentPhase: 'planning',
      completionPercentage: 0,
      budget: parseInt(newProject.budget),
      spentAmount: 0,
      materialsOrdered: [],
      timeline: [{
        phase: 'planning',
        startDate: new Date().toISOString(),
        status: 'in_progress',
        duration: 30,
        achievements: []
      }],
      milestones: [
        { id: '1', title: 'Project Started!', description: 'Your journey begins now!', achievedAt: new Date().toISOString(), emoji: '🚀', celebration: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, newProjectData]);
    setSelectedProject(newProjectData.id);
    setShowCreateProject(false);
    setNewProject({ projectName: '', projectType: 'residential', estimatedArea: '', budget: '' });
    setCelebrationMode(true);
    setTimeout(() => setCelebrationMode(false), 3000);
  };

  const getPhaseProgress = (project: ProjectJourney) => {
    const phaseIndex = projectPhases.findIndex(p => p.key === project.currentPhase);
    return ((phaseIndex + 1) / projectPhases.length) * 100;
  };

  const getNextMilestone = (project: ProjectJourney) => {
    return project.milestones.find(m => !m.achievedAt);
  };

  const triggerCelebration = () => {
    setCelebrationMode(true);
    setTimeout(() => setCelebrationMode(false), 2000);
  };

  const FloatingEmoji = ({ emoji, delay = 0 }: { emoji: string; delay?: number }) => (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.5 }}
      animate={{ 
        y: [-10, -60, -10], 
        opacity: [0, 1, 0], 
        scale: [0.5, 1.2, 0.8],
        rotate: [0, 360, 720]
      }}
      transition={{ 
        duration: 3,
        delay,
        repeat: Infinity,
        repeatType: "loop"
      }}
      className="absolute text-2xl pointer-events-none"
      style={{
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 90}%`
      }}
    >
      {emoji}
    </motion.div>
  );

  return (
    <Card className="w-full relative overflow-hidden">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {celebrationMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 z-10 pointer-events-none"
          >
            {celebrationAnimations.map((animation, index) => (
              <FloatingEmoji 
                key={`${animation.name}-${index}`} 
                emoji={animation.emoji} 
                delay={index * 0.2} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Rocket className="h-6 w-6 text-purple-600" />
          </motion.div>
          Playful Construction Project Journey Animator
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Track your construction dreams with delightful animations and motivational insights!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selection and Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Project:</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-64" data-testid="project-selector">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <span>{projectPhases.find(p => p.key === project.currentPhase)?.emoji}</span>
                      {project.projectName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => setShowCreateProject(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            data-testid="create-project-button"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start New Journey
          </Button>

          {selectedProjectData && (
            <Button 
              onClick={triggerCelebration}
              variant="outline"
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              data-testid="celebrate-button"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Celebrate Progress!
            </Button>
          )}
        </div>

        {/* Create Project Modal */}
        <AnimatePresence>
          {showCreateProject && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowCreateProject(false)}
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-purple-600" />
                  Start Your Construction Journey! 🚀
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={newProject.projectName}
                      onChange={(e) => setNewProject(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="My Dream Home"
                      data-testid="project-name-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectType">Project Type</Label>
                    <Select 
                      value={newProject.projectType} 
                      onValueChange={(value) => setNewProject(prev => ({ ...prev, projectType: value }))}
                    >
                      <SelectTrigger data-testid="project-type-selector">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">🏠 Residential</SelectItem>
                        <SelectItem value="commercial">🏢 Commercial</SelectItem>
                        <SelectItem value="industrial">🏭 Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedArea">Estimated Area (sq ft)</Label>
                    <Input
                      id="estimatedArea"
                      type="number"
                      value={newProject.estimatedArea}
                      onChange={(e) => setNewProject(prev => ({ ...prev, estimatedArea: e.target.value }))}
                      placeholder="2500"
                      data-testid="project-area-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="budget">Budget (₹)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="2500000"
                      data-testid="project-budget-input"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={createProject}
                      disabled={!newProject.projectName || !newProject.estimatedArea || !newProject.budget}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                      data-testid="create-project-submit"
                    >
                      🚀 Launch Project!
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateProject(false)}
                      data-testid="cancel-create-project"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Journey Display */}
        {selectedProjectData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Project Header with Fun Stats */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      {projectPhases.find(p => p.key === selectedProjectData.currentPhase)?.emoji}
                      {selectedProjectData.projectName}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      {projectPhases.find(p => p.key === selectedProjectData.currentPhase)?.motivationalMessage}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedProjectData.completionPercentage.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div 
                    className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-xl font-bold text-green-600">
                      ₹{(selectedProjectData.budget / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-600">Total Budget</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-xl font-bold text-blue-600">
                      {selectedProjectData.estimatedArea.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Sq. Ft.</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-xl font-bold text-orange-600">
                      {selectedProjectData.materialsOrdered.filter(m => m.status === 'delivered').length}
                    </div>
                    <div className="text-xs text-gray-600">Materials Delivered</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-xl font-bold text-purple-600">
                      {selectedProjectData.milestones.filter(m => m.achievedAt).length}
                    </div>
                    <div className="text-xs text-gray-600">Milestones Achieved</div>
                  </motion.div>
                </div>

                {/* Progress Bar with Animation */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Journey Progress</span>
                    <span className="text-sm text-gray-600">{selectedProjectData.completionPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={selectedProjectData.completionPercentage} className="h-3" />
                    <motion.div
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedProjectData.completionPercentage}%` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Animated Phase Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Project Timeline Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
                  
                  <div className="space-y-8">
                    {projectPhases.map((phase, index) => {
                      const phaseData = selectedProjectData.timeline.find(t => t.phase === phase.key);
                      const isActive = selectedProjectData.currentPhase === phase.key;
                      const isCompleted = phaseData?.status === 'completed';
                      const isUpcoming = !phaseData || phaseData.status === 'upcoming';
                      
                      return (
                        <motion.div
                          key={phase.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="relative flex items-center gap-4"
                          data-testid={`phase-${phase.key}`}
                        >
                          {/* Phase Icon */}
                          <motion.div
                            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                              isCompleted ? 'bg-green-500' :
                              isActive ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            animate={isActive ? { 
                              scale: [1, 1.1, 1],
                              boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 10px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
                            } : {}}
                            transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                          >
                            {isCompleted ? '✅' : phase.emoji}
                          </motion.div>
                          
                          {/* Phase Content */}
                          <div className="flex-1">
                            <motion.div
                              className={`p-4 rounded-lg border-2 ${
                                isCompleted ? 'border-green-200 bg-green-50 dark:bg-green-900/20' :
                                isActive ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' :
                                'border-gray-200 bg-gray-50 dark:bg-gray-800'
                              }`}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-lg">{phase.name}</h4>
                                <Badge 
                                  variant={isCompleted ? 'default' : isActive ? 'secondary' : 'outline'}
                                  className={
                                    isCompleted ? 'bg-green-500' :
                                    isActive ? 'bg-blue-500 text-white' : ''
                                  }
                                >
                                  {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Upcoming'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                              
                              {isActive && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-sm font-medium text-blue-800 dark:text-blue-200"
                                >
                                  💪 {phase.motivationalMessage}
                                </motion.div>
                              )}
                              
                              {phaseData?.achievements && phaseData.achievements.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium mb-1">Achievements:</div>
                                  <div className="space-y-1">
                                    {phaseData.achievements.map((achievement, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300"
                                      >
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        {achievement}
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones & Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Milestones & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProjectData.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        milestone.achievedAt 
                          ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' 
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                      }`}
                      data-testid={`milestone-${milestone.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${milestone.achievedAt ? 'animate-bounce' : 'opacity-50'}`}>
                          {milestone.emoji}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{milestone.title}</h4>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                          {milestone.achievedAt && (
                            <Badge className="mt-1 bg-yellow-500 text-white">
                              Achieved! 🎉
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Next Milestone */}
                {getNextMilestone(selectedProjectData) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-dashed border-purple-300"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                          Next Milestone: {getNextMilestone(selectedProjectData)!.title}
                        </h4>
                        <p className="text-sm text-purple-600 dark:text-purple-300">
                          {getNextMilestone(selectedProjectData)!.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Materials Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  Materials Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedProjectData.materialsOrdered.map((material, index) => (
                    <motion.div
                      key={`${material.material}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        material.status === 'delivered' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' :
                        material.status === 'ordered' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' :
                        'border-gray-200 bg-gray-50 dark:bg-gray-800'
                      }`}
                      data-testid={`material-${material.material}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{material.emoji}</div>
                        <h4 className="font-semibold">{material.material}</h4>
                        <p className="text-sm text-gray-600">Qty: {material.quantity}</p>
                        <p className="text-sm font-medium">₹{material.price.toLocaleString()}</p>
                        <Badge 
                          className="mt-2"
                          variant={
                            material.status === 'delivered' ? 'default' :
                            material.status === 'ordered' ? 'secondary' : 'outline'
                          }
                        >
                          {material.status === 'delivered' ? '✅ Delivered' :
                           material.status === 'ordered' ? '🚚 Ordered' : '⏳ Pending'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}