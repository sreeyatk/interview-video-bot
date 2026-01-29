import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInterview, Interview, InterviewCategory } from '@/hooks/useInterview';
import { Dashboard } from '@/components/interview/Dashboard';
import { CategorySelector } from '@/components/interview/CategorySelector';
import { NameInput } from '@/components/interview/NameInput';
import { InterviewRoom } from '@/components/interview/InterviewRoom';
import { InterviewResults } from '@/components/interview/InterviewResults';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AppState = 'dashboard' | 'category' | 'name' | 'interview' | 'results';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    currentInterview, 
    setCurrentInterview,
    createInterview, 
    startInterview,
    saveResponse,
    completeInterview,
    getInterviewResponses,
    responses
  } = useInterview();

  const [appState, setAppState] = useState<AppState>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [interviewResponses, setInterviewResponses] = useState<any[]>([]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleStartNew = () => {
    setAppState('category');
    setSelectedCategory(null);
    setCandidateName('');
    setCurrentInterview(null);
  };

  const handleCategorySelect = (category: InterviewCategory) => {
    setSelectedCategory(category);
    setAppState('name');
  };

  const handleNameSubmit = async (name: string) => {
    setCandidateName(name);
    if (selectedCategory) {
      const interview = await createInterview(name, selectedCategory);
      if (interview) {
        await startInterview(interview.id);
        setAppState('interview');
      }
    }
  };

  const handleSaveResponse = async (
    questionNumber: number,
    questionText: string,
    difficulty: string,
    transcript: string,
    videoUrl?: string,
    duration?: number
  ) => {
    if (currentInterview) {
      await saveResponse(
        currentInterview.id,
        questionNumber,
        questionText,
        difficulty,
        transcript,
        videoUrl,
        undefined,
        duration
      );
    }
  };

  const handleInterviewComplete = async () => {
    if (currentInterview) {
      await completeInterview(currentInterview.id);
      const allResponses = await getInterviewResponses(currentInterview.id);
      setInterviewResponses(allResponses);
      setAppState('results');
    }
  };

  const handleViewInterview = async (interview: Interview) => {
    setCurrentInterview(interview);
    const allResponses = await getInterviewResponses(interview.id);
    setInterviewResponses(allResponses);
    setAppState('results');
  };

  const handleBackToDashboard = () => {
    setAppState('dashboard');
    setCurrentInterview(null);
    setInterviewResponses([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-4 md:p-8">
      <AnimatePresence mode="wait">
        {appState === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              onStartNew={handleStartNew}
              onViewInterview={handleViewInterview}
            />
          </motion.div>
        )}

        {appState === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CategorySelector onSelect={handleCategorySelect} />
          </motion.div>
        )}

        {appState === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NameInput 
              onSubmit={handleNameSubmit}
              onBack={() => setAppState('category')}
            />
          </motion.div>
        )}

        {appState === 'interview' && currentInterview && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <InterviewRoom
              interview={currentInterview}
              onSaveResponse={handleSaveResponse}
              onComplete={handleInterviewComplete}
            />
          </motion.div>
        )}

        {appState === 'results' && currentInterview && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <InterviewResults
              interview={currentInterview}
              responses={interviewResponses}
              onBack={handleBackToDashboard}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
