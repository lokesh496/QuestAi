import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  FileCode,
  Copy,
  Check,
  Play,
  HelpCircle,
  User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CodingQuestion } from '../types';
import { cn } from '../App';

interface CodingCardProps {
  question: CodingQuestion;
  index: number;
}

export function CodingCard({ question, index }: CodingCardProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof CodingQuestion['solutions']>('python');
  const [showCode, setShowCode] = useState(false);
  const [showTestCases, setShowTestCases] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: number; total: number; results: boolean[] } | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(question.solutions[selectedLanguage]);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const simulateRun = () => {
    setIsRunning(true);
    setTestResults(null);
    // Simulate per-testcase processing
    setTimeout(() => {
      setIsRunning(false);
      setTestResults({ 
        passed: 15, 
        total: 15, 
        results: Array(15).fill(true) 
      });
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border-[6px] border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10 flex flex-col relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none rotate-12 scale-150">
        <Code2 size={200} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                CODING LEVEL {index + 1}
              </span>
              <span className={cn(
                "text-black text-[10px] font-black px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase",
                question.difficulty === 'Easy' ? 'bg-emerald-400' : 
                question.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-500'
              )}>
                {question.difficulty}
              </span>
              {question.leetcodeNumber && (
                <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase flex items-center gap-1">
                  LEETCODE #{question.leetcodeNumber}
                </span>
              )}
              <span className="bg-slate-200 text-black text-[10px] font-black px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                {question.topic}
              </span>
              <span className="bg-white text-indigo-600 text-[10px] font-black px-3 py-1 rounded-lg border-2 border-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase flex items-center gap-1">
                <User size={12} /> {question.recommendedFor}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black leading-none mb-6 tracking-tight italic uppercase">
              {question.title}
            </h2>
            <div className="text-slate-600 font-bold leading-relaxed prose prose-slate max-w-none prose-sm">
                <ReactMarkdown>{question.description}</ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button 
              onClick={simulateRun}
              disabled={isRunning}
              className="bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-black px-8 py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="animate-spin" size={20} /> : <Play fill="currentColor" size={20} />}
              RUN ON {selectedLanguage.toUpperCase()}
            </button>
            <button 
              onClick={() => setShowCode(!showCode)}
              className="bg-slate-100 hover:bg-slate-200 text-black font-black px-8 py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Terminal size={20} /> {showCode ? 'HIDE CODE' : 'VIEW SOLUTION'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Constraints & Rules</h4>
               <div className="grid grid-cols-1 gap-3">
                 <div className="bg-white p-3 rounded-xl border-2 border-slate-100 font-bold text-black text-xs flex justify-between">
                   <span className="text-slate-400 uppercase">Input Format</span>
                   <span className="text-right">{question.inputFormat}</span>
                 </div>
                 <div className="bg-white p-3 rounded-xl border-2 border-slate-100 font-bold text-black text-xs flex justify-between">
                   <span className="text-slate-400 uppercase">Output Format</span>
                   <span className="text-right">{question.outputFormat}</span>
                 </div>
                 <div className="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-100 font-mono text-sm text-indigo-700 mt-2">
                   {question.constraints}
                 </div>
               </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200 relative">
              <div className="absolute top-4 right-4 text-amber-300">
                <HelpCircle size={24} />
              </div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Sample Test Case</h4>
                <button 
                  onClick={() => setShowTestCases(!showTestCases)}
                  className="bg-white px-3 py-1 rounded-lg border-2 border-black text-[10px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {showTestCases ? 'HIDE ALL CASES' : 'VIEW ALL 15 CASES'}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black text-amber-600/50 uppercase mb-1">Standard Input</p>
                   <pre className="bg-white p-4 rounded-xl border-2 border-amber-100 font-mono text-sm text-black">{question.sampleInput}</pre>
                </div>
                <div>
                   <p className="text-[10px] font-black text-amber-600/50 uppercase mb-1">Standard Output</p>
                   <pre className="bg-white p-4 rounded-xl border-2 border-amber-100 font-mono text-sm text-black">{question.sampleOutput}</pre>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-slate-900 rounded-[32px] border-4 border-black p-6 flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                   <Cpu size={14} /> Validation Suite
                 </h4>
                 {testResults && (
                   <div className="flex items-center gap-2 text-[10px] font-black text-white bg-emerald-500 px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                     <CheckCircle2 size={12} /> {testResults.passed}/{testResults.total} PASSED
                   </div>
                 )}
               </div>
               
               <div className="grid grid-cols-5 gap-3 flex-1 mb-6">
                 {question.testCases.map((tc, tcIdx) => (
                   <div 
                    key={tcIdx}
                    className={cn(
                      "h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 border-black transition-all",
                      isRunning ? "animate-pulse bg-slate-800 text-slate-600" :
                      testResults ? (testResults.results[tcIdx] ? "bg-emerald-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-red-400 text-black") :
                      "bg-white text-slate-300"
                    )}
                   >
                     {tcIdx + 1 < 10 ? `0${tcIdx + 1}` : tcIdx + 1}
                   </div>
                 ))}
               </div>

               <div className="mt-auto p-4 bg-black/40 rounded-2xl border-2 border-white/5 flex flex-wrap justify-between gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                 <span className="flex items-center gap-1"><Terminal size={12} /> COMPILER: {selectedLanguage.toUpperCase()}</span>
                 <span className="hidden sm:block">Memory: 256MB</span>
                 <span className="text-slate-400">Time: 1.2s</span>
               </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showTestCases && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black mb-6 italic uppercase">Full Test Suite (15 Cases)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {question.testCases.map((tc, idx) => (
                    <div key={idx} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded">CASE #{idx + 1}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{!tc.isHidden ? 'Public' : 'Hidden'}</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Input</p>
                          <pre className="text-xs bg-white border border-slate-200 p-2 rounded-lg text-black font-mono overflow-x-auto">{tc.input}</pre>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Expected Output</p>
                          <pre className="text-xs bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-emerald-700 font-mono overflow-x-auto">{tc.output}</pre>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-12 overflow-hidden"
            >
              <div className="bg-slate-900 rounded-[40px] border-4 border-black overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center justify-between p-6 bg-slate-800 border-b-4 border-black">
                  <div className="flex gap-2 mb-4 sm:mb-0">
                    {(['python', 'cpp', 'java', 'c'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={cn(
                          "px-5 py-2 rounded-xl text-xs font-black uppercase transition-all border-2 border-black",
                          selectedLanguage === lang 
                            ? "bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" 
                            : "bg-slate-700 text-slate-400 hover:text-white"
                        )}
                      >
                        {lang === 'cpp' ? 'C++' : lang}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={copyToClipboard}
                      className="bg-white text-black font-black px-6 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-2 text-xs"
                    >
                      {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      {isCopied ? 'COPIED!' : 'COPY CODE'}
                    </button>
                  </div>
                </div>
                <div className="p-8 bg-slate-950 font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar">
                  <pre className="text-blue-300">
                    {question.solutions[selectedLanguage]}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
