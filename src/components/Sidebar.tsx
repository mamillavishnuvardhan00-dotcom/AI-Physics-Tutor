import React from 'react';
import { ConversationItem } from '../types/physics';
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  Trash2,
  Atom,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  isOpen,
  onToggle,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 h-screen bg-[#0b1120] border-r border-slate-800/90 flex flex-col transition-all duration-300 ease-in-out select-none ${
          isOpen
            ? 'w-72 sm:w-64 translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 overflow-hidden'
        }`}
      >
        {/* Top Header inside Sidebar: Tutor branding + Collapse toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Atom className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">
              Physics Tutor
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 flex flex-col flex-1 min-h-0">
          {/* ─────────────────────────────────────────────────────────────
              1. + New Chat (First option at the top)
          ───────────────────────────────────────────────────────────── */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 hover:border-slate-600 active:bg-slate-800 text-slate-100 font-semibold text-xs transition-all shadow-xs cursor-pointer group shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="font-bold tracking-wide">+ New Chat</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/50">
              ⌘N
            </span>
          </button>

          {/* ─────────────────────────────────────────────────────────────
              2. Recents Section Header
          ───────────────────────────────────────────────────────────── */}
          <div className="px-1.5 pt-4 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Recents</span>
            </div>
            {conversations.length > 0 && (
              <span className="text-[10px] font-normal text-slate-500 bg-slate-800/70 px-1.5 py-0.5 rounded">
                {conversations.length}
              </span>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. Recent Physics Questions List
          ───────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
            {conversations.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-slate-500">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
                <p>No recent questions yet.</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Ask a physics question to start your history!
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-indigo-950/60 border-indigo-600/60 text-white font-medium shadow-xs'
                        : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 hover:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive
                            ? 'text-indigo-400'
                            : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      />
                      <span className="truncate leading-snug">{conv.title}</span>
                    </div>

                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => onDeleteConversation(conv.id, e)}
                      title="Delete from recents"
                      aria-label="Delete from recents"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-slate-700/80 text-slate-500 hover:text-rose-400 transition-all shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom subtle status / info */}
          <div className="pt-3 border-t border-slate-800/80 shrink-0 text-center">
            <span className="text-[10px] text-slate-500">
              Conversations saved locally
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
