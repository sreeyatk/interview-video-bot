import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSpeech } from '@/hooks/useSpeech';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { Interview, InterviewCategory } from '@/hooks/useInterview';
import { getQuestions, getCategoryLabel } from '@/lib/questions';
import { 
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX, 
  Play, Square, ArrowRight, CheckCircle, Loader2, AlertCircle 
} from 'lucide-react';

interface InterviewRoomProps {
  interview: Interview;
  onSaveResponse: (
    questionNumber: number,
    questionText: string,
    difficulty: string,
    transcript: string,
    videoUrl?: string,
    duration?: number
  ) => Promise<void>;
  onComplete: () => void;
}

export function InterviewRoom({ interview, onSaveResponse, onComplete }: InterviewRoomProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<'speaking' | 'listening' | 'processing' | 'ready'>('ready');
  const [savedTranscript, setSavedTranscript] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const questions = getQuestions(interview.category as InterviewCategory);
  const currentQuestion = questions[currentQuestionIndex];
  
  const { speak, isSpeaking, startListening, stopListening, isListening, transcript } = useSpeech();
  const { isRecording, stream, videoRef, startCamera, stopCamera, startRecording, stopRecording } = useMediaRecorder();
  
  const hasStartedRef = useRef(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const askQuestion = useCallback(async () => {
    if (!currentQuestion) return;
    
    setPhase('speaking');
    try {
      await speak(currentQuestion.text);
      setPhase('ready');
    } catch (error) {
      console.error('Speech error:', error);
      setPhase('ready');
    }
  }, [currentQuestion, speak]);

  useEffect(() => {
    if (stream && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setTimeout(askQuestion, 1000);
    }
  }, [stream, askQuestion]);

  const handleStartAnswer = async () => {
    setPhase('listening');
    setSavedTranscript('');
    await startRecording();
    startListening();
  };

  const handleStopAnswer = async () => {
    setPhase('processing');
    stopListening();
    
    const result = await stopRecording();
    const finalTranscript = transcript || savedTranscript || 'No response captured';
    
    await onSaveResponse(
      currentQuestionIndex + 1,
      currentQuestion.text,
      currentQuestion.difficulty,
      finalTranscript,
      result?.videoUrl,
      result?.duration
    );

    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTransitioning(false);
        setSavedTranscript('');
        setPhase('ready');
        setTimeout(askQuestion, 500);
      }, 1000);
    } else {
      onComplete();
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getCategoryLabel(interview.category as InterviewCategory)} Interview
            </h1>
            <p className="text-muted-foreground">Candidate: {interview.candidate_name}</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Question {currentQuestionIndex + 1} / {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video Feed */}
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative aspect-video bg-muted">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-white"
                />
                <span className="text-sm font-medium">Recording</span>
              </motion.div>
            )}

            {/* Status indicators */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant={stream ? "default" : "secondary"}>
                  {stream ? <Video className="w-3 h-3 mr-1" /> : <VideoOff className="w-3 h-3 mr-1" />}
                  Camera
                </Badge>
                <Badge variant={isListening ? "default" : "secondary"}>
                  {isListening ? <Mic className="w-3 h-3 mr-1" /> : <MicOff className="w-3 h-3 mr-1" />}
                  Mic
                </Badge>
              </div>
              <Badge variant={isSpeaking ? "default" : "secondary"}>
                {isSpeaking ? <Volume2 className="w-3 h-3 mr-1" /> : <VolumeX className="w-3 h-3 mr-1" />}
                AI Speaking
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Question & Controls */}
        <div className="space-y-6">
          {/* Current Question */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={
                  currentQuestion?.difficulty === 'beginner' ? 'secondary' :
                  currentQuestion?.difficulty === 'intermediate' ? 'default' : 'destructive'
                }>
                  {currentQuestion?.difficulty}
                </Badge>
                {isSpeaking && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="flex items-center gap-1 text-primary"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Speaking...</span>
                  </motion.div>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-medium text-foreground leading-relaxed"
                >
                  {currentQuestion?.text}
                </motion.p>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Live Transcript */}
          {(isListening || transcript) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">Your Response</span>
                  </div>
                  <p className="text-foreground min-h-[60px]">
                    {transcript || 'Start speaking...'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex flex-col gap-4">
            {phase === 'ready' && !isSpeaking && (
              <Button 
                size="lg" 
                onClick={handleStartAnswer}
                className="w-full h-14 text-lg gap-2"
              >
                <Play className="w-5 h-5" />
                Start Your Answer
              </Button>
            )}

            {phase === 'speaking' && (
              <Button size="lg" disabled className="w-full h-14 text-lg gap-2">
                <Volume2 className="w-5 h-5 animate-pulse" />
                Listen to the Question...
              </Button>
            )}

            {phase === 'listening' && (
              <Button 
                size="lg" 
                variant="destructive"
                onClick={handleStopAnswer}
                className="w-full h-14 text-lg gap-2"
              >
                <Square className="w-5 h-5" />
                Finish Answer
              </Button>
            )}

            {phase === 'processing' && (
              <Button size="lg" disabled className="w-full h-14 text-lg gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </Button>
            )}

            {isTransitioning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-primary"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Answer saved! Next question coming up...</span>
              </motion.div>
            )}
          </div>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Tips for a great interview:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Speak clearly and at a moderate pace</li>
                    <li>Take a moment to think before answering</li>
                    <li>Provide specific examples when possible</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
