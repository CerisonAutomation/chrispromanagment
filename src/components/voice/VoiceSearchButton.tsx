// @ts-nocheck
import { Mic } from 'lucide-react';
import { useEffect } from 'react';
import { useVoiceRecognition } from '@/lib/voice-recognition';
import { Button } from '@/components/ui/button';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceSearchButton({ onTranscript }: VoiceSearchButtonProps) {
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={isListening ? stopListening : startListening}
      className={isListening ? 'text-red-500 border-red-500' : ''}
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
}
