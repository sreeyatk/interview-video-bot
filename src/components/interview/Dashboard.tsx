import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useInterview, Interview, InterviewCategory } from '@/hooks/useInterview';
import { getCategoryLabel } from '@/lib/questions';
import { 
  Plus, LogOut, Clock, Trophy, MessageSquare, 
  ChevronRight, Calendar, User, Sparkles
} from 'lucide-react';

interface DashboardProps {
  onStartNew: () => void;
  onViewInterview: (interview: Interview) => void;
}

export function Dashboard({ onStartNew, onViewInterview }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { getInterviewHistory } = useInterview();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    const data = await getInterviewHistory();
    setInterviews(data);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onStartNew} className="gap-2">
            <Plus className="w-4 h-4" />
            New Interview
          </Button>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{interviews.length}</p>
              <p className="text-sm text-muted-foreground">Total Interviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {interviews.filter(i => i.status === 'analyzed').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {interviews.length > 0 
                  ? Math.round(interviews.filter(i => i.overall_score).reduce((acc, i) => acc + (i.overall_score || 0), 0) / interviews.filter(i => i.overall_score).length) || 0
                  : 0
                }%
              </p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interview History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Interview History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No interviews yet</h3>
                <p className="text-muted-foreground mb-4">Start your first interview to see your progress</p>
                <Button onClick={onStartNew}>Start Your First Interview</Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {interviews.map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                        onClick={() => onViewInterview(interview)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(interview.status)}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{interview.candidate_name}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <Badge variant="outline">
                                    {getCategoryLabel(interview.category as InterviewCategory)}
                                  </Badge>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(interview.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {interview.overall_score !== null && (
                                <span className={`text-xl font-bold ${
                                  interview.overall_score >= 80 ? 'text-green-500' :
                                  interview.overall_score >= 60 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                  {interview.overall_score}%
                                </span>
                              )}
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
