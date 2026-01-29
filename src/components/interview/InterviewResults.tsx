import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Interview, InterviewResponse, InterviewCategory } from '@/hooks/useInterview';
import { getCategoryLabel } from '@/lib/questions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { 
  Trophy, Star, CheckCircle, XCircle, Clock, 
  MessageSquare, ArrowLeft, RefreshCw, Loader2,
  Video, PlayCircle
} from 'lucide-react';

interface InterviewResultsProps {
  interview: Interview;
  responses: InterviewResponse[];
  onBack: () => void;
}

export function InterviewResults({ interview, responses, onBack }: InterviewResultsProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReview, setAiReview] = useState<string | null>(interview.ai_review);
  const [overallScore, setOverallScore] = useState<number | null>(interview.overall_score);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!interview.ai_review && responses.length > 0) {
      analyzeInterview();
    }
  }, [interview.ai_review, responses]);

  const analyzeInterview = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-interview', {
        body: {
          interviewId: interview.id,
          category: interview.category,
          candidateName: interview.candidate_name,
          responses: responses.map(r => ({
            question: r.question_text,
            answer: r.audio_transcript,
            difficulty: r.difficulty
          }))
        }
      });

      if (error) throw error;

      setAiReview(data.review);
      setOverallScore(data.score);

      // Update the interview in database
      await supabase
        .from('interviews')
        .update({
          ai_review: data.review,
          overall_score: data.score,
          status: 'analyzed'
        })
        .eq('id', interview.id);

    } catch (error: any) {
      toast({ 
        title: "Analysis failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          {!analyzing && !aiReview && (
            <Button onClick={analyzeInterview} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Analyze Interview
            </Button>
          )}
        </div>

        {/* Summary Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{interview.candidate_name}</h1>
                <p className="text-muted-foreground">
                  {getCategoryLabel(interview.category as InterviewCategory)} Interview
                </p>
              </div>
              {overallScore !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="text-center"
                >
                  <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">{getScoreLabel(overallScore)}</div>
                </motion.div>
              )}
              {analyzing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{responses.length} Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {responses.reduce((acc, r) => acc + (r.response_duration_seconds || 0), 0)} seconds total
                </span>
              </div>
              <Badge variant={interview.status === 'analyzed' ? 'default' : 'secondary'}>
                {interview.status}
              </Badge>
            </div>
          </div>
        </Card>

        {/* AI Review */}
        {analyzing ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ) : aiReview ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                AI Analysis & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{aiReview}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Response Details */}
        <Card>
          <CardHeader>
            <CardTitle>Question-by-Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {responses.map((response, index) => (
                  <motion.div
                    key={response.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {response.question_number}
                        </span>
                        <Badge variant={
                          response.difficulty === 'beginner' ? 'secondary' :
                          response.difficulty === 'intermediate' ? 'default' : 'destructive'
                        }>
                          {response.difficulty}
                        </Badge>
                      </div>
                      {response.video_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVideo(response.video_url)}
                          className="gap-1"
                        >
                          <PlayCircle className="w-3 h-3" />
                          Watch
                        </Button>
                      )}
                    </div>

                    <p className="font-medium text-foreground mb-2">{response.question_text}</p>
                    
                    <div className="bg-muted/50 rounded p-3 mb-3">
                      <p className="text-sm text-muted-foreground italic">
                        "{response.audio_transcript || 'No response captured'}"
                      </p>
                    </div>

                    {response.response_duration_seconds && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {response.response_duration_seconds}s
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Video Modal */}
        {selectedVideo && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardContent className="p-4">
                  <video
                    src={selectedVideo}
                    controls
                    autoPlay
                    className="w-full rounded-lg"
                  />
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => setSelectedVideo(null)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
