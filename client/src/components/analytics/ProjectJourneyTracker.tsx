import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Clock, DollarSign, Package, CheckCircle2, AlertCircle, MapPin, Calendar, TrendingUp, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface ProjectJourney {
  id: string;
  projectName: string;
  projectType: string;
  estimatedArea: number;
  currentPhase: string;
  materialsOrdered: any[];
  timeline: any;
  budget: number;
  spentAmount: number;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

const projectPhases = [
  { key: 'planning', name: 'Planning & Design', icon: MapPin, color: '#3b82f6' },
  { key: 'foundation', name: 'Foundation', icon: Building2, color: '#f59e0b' },
  { key: 'structure', name: 'Structure', icon: Building2, color: '#10b981' },
  { key: 'finishing', name: 'Finishing', icon: Package, color: '#8b5cf6' },
  { key: 'completed', name: 'Completed', icon: CheckCircle2, color: '#06b6d4' }
];

export default function ProjectJourneyTracker() {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectJourney | null>(null);
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectType: 'residential',
    estimatedArea: '',
    budget: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/project-journeys'],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      return apiRequest('POST', '/api/project-journeys', projectData);
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "Your construction project has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/project-journeys'] });
      setShowCreateProject(false);
      setNewProject({ projectName: '', projectType: 'residential', estimatedArea: '', budget: '' });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest('PUT', `/api/project-journeys/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Project Updated",
        description: "Project progress has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/project-journeys'] });
    },
  });

  const createProject = () => {
    if (!newProject.projectName || !newProject.estimatedArea || !newProject.budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const projectData = {
      ...newProject,
      estimatedArea: parseFloat(newProject.estimatedArea),
      budget: parseFloat(newProject.budget),
      timeline: {
        planning: { startDate: new Date(), estimatedDuration: 15 },
        foundation: { estimatedDuration: 30 },
        structure: { estimatedDuration: 60 },
        finishing: { estimatedDuration: 45 },
        completed: { estimatedDuration: 0 }
      },
      materialsOrdered: []
    };

    createProjectMutation.mutate(projectData);
  };

  const updateProjectPhase = (projectId: string, newPhase: string, completionPercentage: number) => {
    updateProjectMutation.mutate({
      id: projectId,
      updates: {
        currentPhase: newPhase,
        completionPercentage
      }
    });
  };

  const getPhaseProgress = (project: ProjectJourney) => {
    const phases = ['planning', 'foundation', 'structure', 'finishing', 'completed'];
    const currentIndex = phases.indexOf(project.currentPhase);
    return Math.round(((currentIndex + 1) / phases.length) * 100);
  };

  const getProjectStats = () => {
    if (projects.length === 0) return { active: 0, completed: 0, totalBudget: 0, totalSpent: 0 };
    
    return {
      active: projects.filter((p: ProjectJourney) => p.currentPhase !== 'completed').length,
      completed: projects.filter((p: ProjectJourney) => p.currentPhase === 'completed').length,
      totalBudget: projects.reduce((sum: number, p: ProjectJourney) => sum + p.budget, 0),
      totalSpent: projects.reduce((sum: number, p: ProjectJourney) => sum + p.spentAmount, 0)
    };
  };

  const stats = getProjectStats();

  // Mock timeline data for charts
  const timelineData = [
    { month: 'Jan', projects: 2, completion: 15 },
    { month: 'Feb', projects: 3, completion: 30 },
    { month: 'Mar', projects: 4, completion: 45 },
    { month: 'Apr', projects: 3, completion: 65 },
    { month: 'May', projects: 5, completion: 80 },
    { month: 'Jun', projects: 6, completion: 95 }
  ];

  const budgetData = projects.map((project: ProjectJourney) => ({
    name: project.projectName.slice(0, 10) + '...',
    budget: project.budget,
    spent: project.spentAmount,
    remaining: project.budget - project.spentAmount
  }));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-purple-600">₹{stats.totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Construction Project Journey Tracker</h2>
        <Button onClick={() => setShowCreateProject(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project: ProjectJourney) => {
              const currentPhaseIndex = projectPhases.findIndex(p => p.key === project.currentPhase);
              const CurrentPhaseIcon = projectPhases[currentPhaseIndex]?.icon || Building2;
              
              return (
                <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedProject(project)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{project.projectName}</span>
                      <Badge variant={project.currentPhase === 'completed' ? 'default' : 'secondary'}>
                        {project.currentPhase}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CurrentPhaseIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600 capitalize">
                        {projectPhases[currentPhaseIndex]?.name || project.currentPhase}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{project.completionPercentage}%</span>
                      </div>
                      <Progress value={project.completionPercentage} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Area</p>
                        <p className="font-medium">{project.estimatedArea} sq ft</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium capitalize">{project.projectType}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-medium">₹{project.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent</span>
                        <span className="font-medium text-orange-600">₹{project.spentAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="completion" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Budget Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, '']} />
                      <Bar dataKey="budget" fill="#3b82f6" />
                      <Bar dataKey="spent" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Phase Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Project Phase Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {projectPhases.map((phase) => {
                  const count = projects.filter((p: ProjectJourney) => p.currentPhase === phase.key).length;
                  const IconComponent = phase.icon;
                  
                  return (
                    <div key={phase.key} className="text-center p-4 border rounded-lg">
                      <IconComponent className="w-8 h-8 mx-auto mb-2" style={{ color: phase.color }} />
                      <p className="text-sm font-medium">{phase.name}</p>
                      <p className="text-2xl font-bold" style={{ color: phase.color }}>{count}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.map((project: ProjectJourney) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{project.projectName}</h3>
                      <Badge>{project.completionPercentage}% Complete</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {projectPhases.map((phase, index) => {
                        const isActive = phase.key === project.currentPhase;
                        const isCompleted = projectPhases.findIndex(p => p.key === project.currentPhase) > index;
                        const IconComponent = phase.icon;
                        
                        return (
                          <div key={phase.key} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-100 text-green-600' :
                              isActive ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-400'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <p className="text-xs mt-2 text-center max-w-16">{phase.name}</p>
                            {index < projectPhases.length - 1 && (
                              <div className={`h-1 w-16 mt-1 ${
                                isCompleted ? 'bg-green-300' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Construction Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="e.g., My Dream Home"
                value={newProject.projectName}
                onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Project Type</label>
              <Select value={newProject.projectType} onValueChange={(value) => setNewProject({...newProject, projectType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Estimated Area (sq ft)</label>
              <Input
                type="number"
                placeholder="e.g., 1500"
                value={newProject.estimatedArea}
                onChange={(e) => setNewProject({...newProject, estimatedArea: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Budget (₹)</label>
              <Input
                type="number"
                placeholder="e.g., 2500000"
                value={newProject.budget}
                onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
              />
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                Cancel
              </Button>
              <Button onClick={createProject} disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}