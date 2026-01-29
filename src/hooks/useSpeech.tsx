import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
    confidence: number;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to get a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || v.name.includes('Microsoft') || v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (e) => {
        setIsSpeaking(false);
        reject(e);
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!recognitionRef.current) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      setTranscript('');
      let finalTranscript = '';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        resolve(finalTranscript.trim() || transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          reject(new Error(event.error));
        } else {
          resolve(finalTranscript.trim());
        }
      };

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        reject(error);
      }
    });
  }, [transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isSpeaking,
    isListening,
    transcript,
    speak,
    stopSpeaking,
    startListening,
    stopListening
  };
}
