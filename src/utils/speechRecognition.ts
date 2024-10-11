export interface SpeechRecognitionResult {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionResult) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export const startSpeechRecognition = (
  onResult: (transcript: string) => void,
  onEnd: () => void
): SpeechRecognition | null => {
  const SpeechRecognition = (window as Window).SpeechRecognition || (window as Window).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition: SpeechRecognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: SpeechRecognitionResult) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join('');
    onResult(transcript);
  };

  recognition.onend = onEnd;

  recognition.start();
  return recognition;
};