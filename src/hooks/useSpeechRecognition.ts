import { useState, useEffect, useRef, useCallback } from 'react';
import type { PermissionState } from '@/types';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onstart: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Throttle utility function
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

// Constants for optimization
const THROTTLE_MS = 200; // Update UI max 5 times per second

export function useSpeechRecognition(options?: { lang?: string }) {
  const lang = options?.lang ?? 'th-TH';
  const [fullTranscript, setFullTranscript] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef('');
  const fullTranscriptRef = useRef('');
  
  // Optimization: accumulated final transcripts (resultIndex approach)
  const accumulatedFinalRef = useRef('');
  const interimRef = useRef('');

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionState('granted');
      setErrorMessage(null);
      return true;
    } catch {
      setPermissionState('denied');
      setErrorMessage('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบการตั้งค่า');
      return false;
    }
  }, []);

  // Throttled update function for UI (แนวทาง 2)
  const throttledUpdateRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    // Create throttled function once
    throttledUpdateRef.current = throttle((text: string) => {
      setCurrentTranscript(text);
      transcriptRef.current = text;
    }, THROTTLE_MS);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMessage('อุปกรณ์นี้ไม่รองรับการถอดเสียงแบบ Real-time');
      return () => {};
    }
    setIsSupported(true);
    const recognition = new SR() as SpeechRecognitionInstance;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    // แนวทาง 1: ใช้ resultIndex - อ่านเฉพาะ result ใหม่ (O(1) แทน O(n))
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let newFinalTranscript = '';
      let newInterimTranscript = '';

      // เริ่มจาก resultIndex (result ใหม่ที่ยังไม่เคยประมวลผล)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          // Final result - เก็บถาวร
          newFinalTranscript += transcript;
        } else {
          // Interim result - แสดงชั่วคราว
          newInterimTranscript += transcript;
        }
      }

      // สะสม final transcripts
      if (newFinalTranscript) {
        accumulatedFinalRef.current += newFinalTranscript;
      }
      
      // เก็บ interim ล่าสุด
      interimRef.current = newInterimTranscript;

      // รวม final + interim สำหรับแสดงผล
      const displayText = accumulatedFinalRef.current + interimRef.current;
      
      // แนวทาง 2: ใช้ throttle เพื่อลด re-render
      if (throttledUpdateRef.current) {
        throttledUpdateRef.current(displayText);
      }
      
      setErrorMessage(null);
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed') {
        setPermissionState('denied');
        setErrorMessage('กรุณาอนุญาตการใช้ไมโครโฟนในเบราว์เซอร์ของคุณ');
      } else if (event.error !== 'no-speech') {
        setErrorMessage(`เกิดข้อผิดพลาด: ${event.error}`);
      }
    };

    recognition.onstart = () => {
      setPermissionState('granted');
      setErrorMessage(null);
    };

    recognition.onend = () => {
      // อัพเดท final transcript เมื่อ recognition หยุด
      const finalText = accumulatedFinalRef.current + interimRef.current;
      if (finalText) {
        transcriptRef.current = finalText;
        setCurrentTranscript(finalText);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    // Reset all refs for new session
    setCurrentTranscript('');
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    interimRef.current = '';
    setErrorMessage(null);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn('Speech recognition start failed', e);
    }
  }, []);

  const pause = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    // รวม accumulated + interim เป็น current
    const current = accumulatedFinalRef.current + interimRef.current;
    transcriptRef.current = current;
    
    // เก็บเข้า fullTranscript
    const nextFull = fullTranscriptRef.current 
      ? `${fullTranscriptRef.current} ${current}` 
      : current;
    fullTranscriptRef.current = nextFull;
    setFullTranscript(nextFull);
    
    // Reset current session
    setCurrentTranscript('');
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    interimRef.current = '';
  }, []);

  const stop = useCallback((): string => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    // รวม accumulated + interim
    const current = accumulatedFinalRef.current + interimRef.current;
    const final = fullTranscriptRef.current 
      ? `${fullTranscriptRef.current} ${current}` 
      : current;
    
    // Reset all refs
    fullTranscriptRef.current = '';
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    interimRef.current = '';
    setFullTranscript('');
    setCurrentTranscript('');
    
    return final;
  }, []);

  const reset = useCallback(() => {
    fullTranscriptRef.current = '';
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    interimRef.current = '';
    setFullTranscript('');
    setCurrentTranscript('');
    setErrorMessage(null);
  }, []);

  return {
    isSupported,
    permissionState,
    setPermissionState,
    errorMessage,
    setErrorMessage,
    fullTranscript,
    currentTranscript,
    requestPermission,
    start,
    pause,
    stop,
    reset
  };
}
