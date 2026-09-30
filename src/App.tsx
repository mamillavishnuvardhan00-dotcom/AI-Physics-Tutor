/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { QuestionInput } from './components/QuestionInput';
import { ProcessingState } from './components/ProcessingState';
import { PhysicsResultView } from './components/PhysicsResultView';
import { Sidebar } from './components/Sidebar';
import { PhysicsProblemResponse, ConversationItem } from './types/physics';
import { Atom, AlertCircle, PanelLeft } from 'lucide-react';

const STORAGE_KEY = 'ai_physics_tutor_conversations_v1';

const INITIAL_SAMPLE_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'sample-1',
    title: 'Find equivalent resistance of 3 resistors...',
    timestamp: Date.now() - 1000 * 60 * 20,
    questionText: 'Find the equivalent resistance of three resistors (3Ω, 6Ω, and 9Ω) connected in parallel to a 12V battery.',
    imageBase64: null,
    mimeType: null,
    result: null,
  },
  {
    id: 'sample-2',
    title: 'Explain projectile launched at 30 m/s at 45°...',
    timestamp: Date.now() - 1000 * 60 * 120,
    questionText: 'A projectile is launched from ground level at 30 m/s at an angle of 45°. Calculate its total range and time of flight.',
    imageBase64: null,
    mimeType: null,
    result: null,
  },
  {
    id: 'sample-3',
    title: 'Ball thrown vertically upward at 20 m/s...',
    timestamp: Date.now() - 1000 * 60 * 360,
    questionText: 'A ball is thrown vertically upward with a speed of 20 m/s. Find the maximum height reached and the time taken to reach it.',
    imageBase64: null,
    mimeType: null,
    result: null,
  },
  {
    id: 'sample-4',
    title: "What is Newton's second law with examples...",
    timestamp: Date.now() - 1000 * 60 * 1440,
    questionText: "What is Newton's second law of motion? Explain F = ma with real world examples.",
    imageBase64: null,
    mimeType: null,
    result: null,
  },
  {
    id: 'sample-5',
    title: "Ohm's law and circuit resistance...",
    timestamp: Date.now() - 1000 * 60 * 2880,
    questionText: "State Ohm's law and calculate current through a 10 ohm resistor with 5V potential difference.",
    imageBase64: null,
    mimeType: null,
    result: null,
  },
];

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicsProblemResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Sidebar and Conversations state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load conversations from localStorage:', e);
    }
    return INITIAL_SAMPLE_CONVERSATIONS;
  });

  const [lastSubmission, setLastSubmission] = useState<{
    questionText: string;
    imageBase64: string | null;
    mimeType: string | null;
  } | null>(null);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save conversations to localStorage:', e);
    }
  }, [conversations]);

  // Adjust sidebar on initial mobile screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Keyboard shortcut: Cmd+N or Ctrl+N to start New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortenTitle = (text: string): string => {
    const clean = text.replace(/[\n\r]+/g, ' ').trim();
    if (!clean) return 'Physics Problem';
    return clean.length > 36 ? `${clean.substring(0, 36)}...` : clean;
  };

  const handleSolve = async (
    questionText: string,
    imageBase64: string | null,
    mimeType: string | null
  ) => {
    setIsLoading(true);
    setError(null);
    setLastSubmission({ questionText, imageBase64, mimeType });

    try {
      const response = await fetch('/api/solve-physics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionText,
          imageBase64,
          mimeType,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to analyze and solve question.');
      }

      const solutionData: PhysicsProblemResponse = resData.data;
      setResult(solutionData);

      // Save/update in Recents history
      const title = shortenTitle(questionText || solutionData.understand?.question || 'Physics Problem');
      const convId = activeConversationId || `chat-${Date.now()}`;
      setActiveConversationId(convId);

      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === convId);
        const updatedItem: ConversationItem = {
          id: convId,
          title,
          timestamp: Date.now(),
          questionText,
          imageBase64,
          mimeType,
          result: solutionData,
        };

        if (existingIdx >= 0) {
          // Move updated conversation to top
          const copy = [...prev];
          copy.splice(existingIdx, 1);
          return [updatedItem, ...copy];
        } else {
          // New conversation at top of Recents
          return [updatedItem, ...prev];
        }
      });

      // Smooth scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Solve error:', err);
      let msg = err.message || 'An unexpected error occurred while solving the problem.';
      try {
        if (msg.startsWith('{') && msg.includes('"message"')) {
          const parsed = JSON.parse(msg);
          msg = parsed.error?.message || parsed.message || msg;
        }
      } catch (_) {}
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastSubmission) {
      handleSolve(lastSubmission.questionText, lastSubmission.imageBase64, lastSubmission.mimeType);
    }
  };

  // Clicking "+ New Chat" starts a fresh conversation while preserving all Recents
  const handleNewChat = () => {
    setActiveConversationId(null);
    setResult(null);
    setLastSubmission(null);
    setError(null);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Clicking a recent conversation opens the complete previous conversation
  const handleSelectConversation = (id: string) => {
    const selected = conversations.find((c) => c.id === id);
    if (!selected) return;

    setActiveConversationId(selected.id);
    setResult(selected.result);
    setLastSubmission({
      questionText: selected.questionText,
      imageBase64: selected.imageBase64,
      mimeType: selected.mimeType,
    });
    setError(null);

    // If it's a sample question without pre-calculated result, trigger auto-solve
    if (!selected.result && selected.questionText) {
      handleSolve(selected.questionText, selected.imageBase64, selected.mimeType);
    }

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      handleNewChat();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 font-sans flex">
      {/* ─────────────────────────────────────────────────────────────
          LEFT CHATGPT-STYLE SIDEBAR
      ───────────────────────────────────────────────────────────── */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA (Original site untouched & preserved)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200">
        {/* HEADER */}
        <header className="border-b border-slate-800/80 bg-[#0d1322]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle button (when collapsed or on mobile) */}
              {(!isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
                  aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}

              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Atom className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none">
                  AI PHYSICS TUTOR
                </h1>
                <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                  Sequential Learning & Problem Solver
                </span>
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500 hidden sm:block">
              Text • Image • Voice
            </div>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          {/* Input Card */}
          <section className="mb-8">
            <QuestionInput
              key={activeConversationId || 'new'}
              onSubmit={handleSolve}
              isLoading={isLoading}
              initialQuestionText={lastSubmission?.questionText || ''}
              initialImageBase64={lastSubmission?.imageBase64 || null}
              initialMimeType={lastSubmission?.mimeType || null}
            />
          </section>

          {/* Error Callout with Retry */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-rose-100">Temporary Service Notice</strong>
                  <p className="mt-0.5 text-rose-300 leading-relaxed">
                    {error.includes('demand') || error.includes('UNAVAILABLE') || error.includes('503')
                      ? 'The model experienced a brief traffic spike. Our automatic multi-model failover is ready. Please click Try Again.'
                      : error}
                  </p>
                </div>
              </div>
              {lastSubmission && (
                <button
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="shrink-0 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Progress State during Processing */}
          {isLoading && <ProcessingState />}

          {/* Sequential 7-Section Solution Output */}
          {result && (
            <div ref={resultRef} className="mt-4">
              <PhysicsResultView data={result} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
