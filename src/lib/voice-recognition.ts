export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.stop();
  };

  return { isListening, transcript, error, startListening, stopListening };
}
