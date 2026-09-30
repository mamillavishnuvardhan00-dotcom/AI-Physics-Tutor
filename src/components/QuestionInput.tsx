import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  UploadCloud,
  X,
  Loader2,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

interface QuestionInputProps {
  onSubmit: (questionText: string, imageBase64: string | null, mimeType: string | null) => void;
  isLoading: boolean;
  initialQuestionText?: string;
  initialImageBase64?: string | null;
  initialMimeType?: string | null;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  isLoading,
  initialQuestionText = '',
  initialImageBase64 = null,
  initialMimeType = null,
}) => {
  const [questionText, setQuestionText] = useState(initialQuestionText);
  const [imageBase64, setImageBase64] = useState<string | null>(initialImageBase64);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialImageBase64 ? `data:${initialMimeType || 'image/jpeg'};base64,${initialImageBase64}` : null
  );
  const [imageMimeType, setImageMimeType] = useState<string | null>(initialMimeType);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Synchronize when active conversation changes
  useEffect(() => {
    setQuestionText(initialQuestionText || '');
    setImageBase64(initialImageBase64 || null);
    setImagePreviewUrl(
      initialImageBase64 ? `data:${initialMimeType || 'image/jpeg'};base64,${initialImageBase64}` : null
    );
    setImageMimeType(initialMimeType || null);
  }, [initialQuestionText, initialImageBase64, initialMimeType]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setQuestionText((prev) => {
              const trimmed = prev.trim();
              if (!trimmed) return currentTranscript;
              // Check if we should append
              return `${trimmed} ${currentTranscript}`;
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
          setIsRecording(false);
          setVoiceNotice(null);
        };

        recognition.onend = () => {
          setIsRecording(false);
          setVoiceNotice(null);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition setup error:', e);
      }
    }
  }, []);

  // Handle File Upload (Image)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
      setImagePreviewUrl(dataUrl);
      setImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Handle Paste Event (allows pasting screenshots directly into text box)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        processImageFile(file);
      }
    }
  };

  const removeImage = () => {
    setImageBase64(null);
    setImagePreviewUrl(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Toggle Voice Input
  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn(e);
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setVoiceNotice(null);
      return;
    }

    // Start recording
    setVoiceNotice('Listening... Speak your physics question clearly.');

    // 1. Try native Web Speech API first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        return;
      } catch (err) {
        console.warn('SpeechRecognition start failed, falling back to MediaRecorder:', err);
      }
    }

    // 2. Fallback to MediaRecorder + Gemini server-side transcription
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        setIsTranscribing(true);
        setVoiceNotice('Transcribing audio via AI...');

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const res = await fetch('/api/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.transcript) {
              setQuestionText((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
            }
          } catch (transcribeErr) {
            console.error('Transcription failed:', transcribeErr);
          } finally {
            setIsTranscribing(false);
            setVoiceNotice(null);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (micErr) {
      console.error('Microphone access denied:', micErr);
      setVoiceNotice('Microphone access was denied or is not supported.');
      setTimeout(() => setVoiceNotice(null), 4000);
      setIsRecording(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() && !imageBase64) return;
    onSubmit(questionText.trim(), imageBase64, imageMimeType);
  };

  const handleSampleSelect = (sampleText: string) => {
    setQuestionText(sampleText);
  };

  return (
    <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 transition-all hover:border-slate-700">
      <form onSubmit={handleFormSubmit}>
        {/* Main Input Text Area */}
        <div className="relative">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Enter your physics question (e.g. A ball is thrown vertically upward with a speed of 20 m/s...)"
            rows={4}
            disabled={isLoading}
            className="w-full resize-y rounded-xl border border-slate-800 bg-[#0b1120] p-4 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-[#0e1628] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
          />

          {/* Voice Listening Banner */}
          {isRecording && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-rose-950/80 text-rose-300 px-3 py-1.5 rounded-full border border-rose-800 text-xs font-semibold animate-pulse shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              {voiceNotice || 'Listening...'}
            </div>
          )}

          {isTranscribing && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-indigo-950/80 text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-800 text-xs font-semibold shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              Transcribing speech...
            </div>
          )}
        </div>

        {/* Uploaded Image Preview */}
        {imagePreviewUrl && (
          <div className="mt-3 relative inline-block rounded-xl border border-slate-700 bg-[#0b1120] p-2 shadow-xs animate-fadeIn">
            <div className="relative flex items-center gap-3">
              <img
                src={imagePreviewUrl}
                alt="Physics Question Upload"
                className="h-20 w-auto rounded-lg object-contain bg-slate-900 border border-slate-800 shadow-2xs"
              />
              <div className="text-xs text-slate-300 pr-8">
                <span className="font-semibold block text-slate-100">Image Attached</span>
                <span className="text-[11px] text-slate-400">
                  AI will read printed text, handwriting, and equations.
                </span>
              </div>
              <button
                type="button"
                onClick={removeImage}
                title="Remove image"
                className="absolute top-0 right-0 w-6 h-6 rounded-full bg-slate-800 hover:bg-rose-900/60 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Left: Input format buttons (Image & Voice) */}
          <div className="flex items-center gap-2">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Upload question photo (diagrams, printed, or handwritten equations)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-[#1e293b] hover:bg-slate-700 active:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Image</span>
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              disabled={isLoading || isTranscribing}
              title={isRecording ? 'Stop listening' : 'Speak your physics question'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-200 bg-[#1e293b] hover:bg-slate-700 active:bg-slate-800 border border-slate-700/80'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span>Voice</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Submit Button [ Solve ] */}
          <button
            type="submit"
            disabled={isLoading || (!questionText.trim() && !imageBase64)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Solving...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Solve</span>
              </>
            )}
          </button>
        </div>

        {/* Clean Sample Question Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Try an example question:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'A ball is thrown vertically upward with a speed of 20 m/s. Find the maximum height and the time to reach it.',
              'A 5 kg block is pushed across a horizontal surface with a force of 35 N against friction (μ = 0.2). What is its acceleration?',
              'A projectile is launched from ground level at 30 m/s at an angle of 45°. Calculate its total range and time of flight.',
              'Find the equivalent resistance of three resistors (3Ω, 6Ω, and 9Ω) connected in parallel to a 12V battery.',
            ].map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSampleSelect(sample)}
                disabled={isLoading}
                className="text-left text-xs bg-[#0b1120] hover:bg-[#1a233a] hover:text-blue-300 hover:border-slate-700 text-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                {sample.length > 55 ? `${sample.slice(0, 52)}...` : sample}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
