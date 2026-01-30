import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export type InterviewCategory = 'java' | 'python' | 'frontend' | 'php' | 'react' | 'nodejs';
export type InterviewStatus = 'pending' | 'in_progress' | 'completed' | 'analyzed';

export interface Interview {
  id: string;
  user_id: string;
  candidate_name: string;
  category: InterviewCategory;
  status: InterviewStatus;
  total_questions: number;
  current_question: number;
  overall_score: number | null;
  ai_review: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface InterviewResponse {
  id: string;
  interview_id: string;
  question_number: number;
  question_text: string;
  difficulty: string;
  audio_transcript: string | null;
  video_url: string | null;
  audio_url: string | null;
  response_duration_seconds: number | null;
  ai_score: number | null;
  ai_feedback: string | null;
}

export function useInterview() {
  const { user } = useAuth();
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const createInterview = useCallback(async (candidateName: string, category: InterviewCategory) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          user_id: user.id,
          candidate_name: candidateName,
          category: category,
          status: 'pending',
          total_questions: 5
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentInterview(data as Interview);
      return data as Interview;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const startInterview = useCallback(async (interviewId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interviews')
        .update({ 
          status: 'in_progress', 
          started_at: new Date().toISOString(),
          current_question: 1
        })
        .eq('id', interviewId)
        .select()
        .single();

      if (error) throw error;
      setCurrentInterview(data as Interview);
      return data as Interview;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveResponse = useCallback(async (
    interviewId: string,
    questionNumber: number,
    questionText: string,
    difficulty: string,
    audioTranscript: string,
    videoUrl?: string,
    audioUrl?: string,
    durationSeconds?: number
  ) => {
    try {
      const { data, error } = await supabase
        .from('interview_responses')
        .insert({
          interview_id: interviewId,
          question_number: questionNumber,
          question_text: questionText,
          difficulty: difficulty,
          audio_transcript: audioTranscript,
          video_url: videoUrl,
          audio_url: audioUrl,
          response_duration_seconds: durationSeconds
        })
        .select()
        .single();

      if (error) throw error;
      setResponses(prev => [...prev, data as InterviewResponse]);
      
      // Update current question
      await supabase
        .from('interviews')
        .update({ current_question: questionNumber + 1 })
        .eq('id', interviewId);

      return data as InterviewResponse;
    } catch (error: any) {
      toast({ title: "Error saving response", description: error.message, variant: "destructive" });
      return null;
    }
  }, []);

  const completeInterview = useCallback(async (interviewId: string) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', interviewId)
        .select()
        .single();

      if (error) throw error;
      setCurrentInterview(data as Interview);
      return data as Interview;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  }, []);

  const getInterviewHistory = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Interview[];
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return [];
    }
  }, [user]);

  const getInterviewResponses = useCallback(async (interviewId: string) => {
    try {
      const { data, error } = await supabase
        .from('interview_responses')
        .select('*')
        .eq('interview_id', interviewId)
        .order('question_number', { ascending: true });

      if (error) throw error;
      return data as InterviewResponse[];
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return [];
    }
  }, []);

  return {
    currentInterview,
    setCurrentInterview,
    responses,
    loading,
    createInterview,
    startInterview,
    saveResponse,
    completeInterview,
    getInterviewHistory,
    getInterviewResponses
  };
}
