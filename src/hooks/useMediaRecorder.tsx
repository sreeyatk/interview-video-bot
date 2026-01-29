import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useMediaRecorder() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (error: any) {
      toast({ 
        title: "Camera access denied", 
        description: "Please allow camera and microphone access to continue",
        variant: "destructive" 
      });
      throw error;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startRecording = useCallback(async () => {
    if (!stream) {
      await startCamera();
    }
    
    const currentStream = stream || await startCamera();
    chunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(currentStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setIsRecording(true);
    setRecordingStartTime(Date.now());
  }, [stream, startCamera]);

  const stopRecording = useCallback(async (): Promise<{ videoUrl: string; duration: number } | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      const duration = Math.round((Date.now() - recordingStartTime) / 1000);
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        if (!user) {
          resolve(null);
          return;
        }

        try {
          const fileName = `${user.id}/${Date.now()}.webm`;
          const { error: uploadError } = await supabase.storage
            .from('interview-recordings')
            .upload(fileName, blob);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('interview-recordings')
            .getPublicUrl(fileName);

          setIsRecording(false);
          resolve({ videoUrl: publicUrl, duration });
        } catch (error: any) {
          toast({ 
            title: "Upload failed", 
            description: error.message,
            variant: "destructive" 
          });
          setIsRecording(false);
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [user, recordingStartTime]);

  return {
    isRecording,
    stream,
    videoRef,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording
  };
}
