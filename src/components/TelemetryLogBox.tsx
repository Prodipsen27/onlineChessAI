/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { TelemetryLog } from '../types';
import { Terminal, Cpu, Clock, RefreshCw } from 'lucide-react';

interface TelemetryLogBoxProps {
  logs: TelemetryLog[];
  onClearLogs: () => void;
}

export const TelemetryLogBox: React.FC<TelemetryLogBoxProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom upon every new move entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#131c2e] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
            Telemetry Event Log
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-mono text-[10px] text-indigo-400 font-bold tracking-wider uppercase">
              LIVE FEED
            </span>
          </div>
          <button
            onClick={onClearLogs}
            title="Reset Terminal Logs"
            className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded transition-all duration-150"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Status Bar */}
      <div className="grid grid-cols-3 px-4 py-2 bg-[#0f172a] border-b border-slate-800 font-mono text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-slate-600" />
          <span>ENGINE: Stockfish 16.1</span>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <Clock className="w-3 h-3 text-slate-600" />
          <span>UTC: {new Date().toISOString().slice(11, 19)}</span>
        </div>
        <div className="text-right text-indigo-400 font-bold">
          STATUS: ACTIVE
        </div>
      </div>

      {/* Scrolling Log Stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs text-indigo-300 space-y-2.5 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
        style={{ minHeight: '220px', maxHeight: '420px' }}
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 italic text-center py-6">
            No telemetry records detected. Make a move on the board to initiate.
          </div>
        ) : (
          logs.map((log) => {
            const isSystem = log.text.startsWith('>');
            const isError = log.text.includes('Error') || log.text.includes('Invalid');
            const isSuccess = log.text.includes('CHECKMATE') || log.text.includes('Success') || log.text.includes('Brilliant');

            let textColor = 'text-indigo-300';
            if (isSystem) textColor = 'text-slate-400';
            if (isError) textColor = 'text-rose-400 font-semibold';
            if (isSuccess) textColor = 'text-white font-bold';

            return (
              <div key={log.id} className="flex gap-2.5 items-start hover:bg-slate-900/40 p-1 rounded transition-colors duration-100">
                <span className="text-slate-600 font-semibold select-none text-[10px] pt-0.5">
                  [{log.timestamp}]
                </span>
                <span className={`break-words ${textColor}`}>{log.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Console Footer */}
      <div className="px-4 py-2.5 bg-[#0f172a] border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>Active Log Count: {logs.length}</span>
        <span className="text-slate-600">Stateful Matrix: Active</span>
      </div>
    </div>
  );
};
