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
  onresult: (event: { results: Iterable<{ 0: { transcript: string }; length: number }> }) => void;
  onerror: (event: { error: string }) => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
}

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

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setCurrentTranscript(text);
      transcriptRef.current = text;
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
    setCurrentTranscript('');
    transcriptRef.current = '';
    setErrorMessage(null);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn('Speech recognition start failed', e);
    }
  }, []);

  const pause = useCallback(() => {
    const current = transcriptRef.current;
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    const nextFull = fullTranscriptRef.current ? `${fullTranscriptRef.current} ${current}` : current;
    fullTranscriptRef.current = nextFull;
    setFullTranscript(nextFull);
    setCurrentTranscript('');
    transcriptRef.current = '';
  }, []);

  const stop = useCallback((): string => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    const current = transcriptRef.current;
    const final = fullTranscriptRef.current ? `${fullTranscriptRef.current} ${current}` : current;
    fullTranscriptRef.current = '';
    transcriptRef.current = '';
    setFullTranscript('');
    setCurrentTranscript('');
    return final;
  }, []);

  const reset = useCallback(() => {
    fullTranscriptRef.current = '';
    setFullTranscript('');
    setCurrentTranscript('');
    transcriptRef.current = '';
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
