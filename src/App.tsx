/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Code, 
  ListChecks, 
  Zap, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  X,
  Terminal,
  Trophy,
  Brain,
  Layers,
  FileBadge,
  User,
  LogOut
} from 'lucide-react';
import { generateCodingQuestions, generateMCQs } from './lib/gemini';
import { downloadMCQsAsExcel } from './lib/excelExport';
import { CodingQuestion, MCQQuestion, AppState, QuizType, Generation } from './types';
import { CodingCard } from './components/CodingCard';
import { MCQCard } from './components/MCQCard';
import { QCReport } from './components/QCReport';
import { LoginModal } from './components/LoginModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [quizType, setQuizType] = useState<QuizType>('coding');
  const [codingSource, setCodingSource] = useState<'leetcode' | 'original'>('original');
  const [codingDifficulty, setCodingDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showGenerationDetail, setShowGenerationDetail] = useState(false);
  const [showQCReport, setShowQCReport] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser.uid);
      } else {
        setGenerations([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (userId: string) => {
    const path = 'generations';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => doc.data() as Generation);
      setGenerations(history);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (!topic.trim()) return;
    setState('generating');
    try {
      let results: (CodingQuestion | MCQQuestion)[] = [];
      if (quizType === 'coding') {
        results = await generateCodingQuestions(topic, count, codingSource, codingDifficulty);
      } else {
        results = await generateMCQs(topic, count);
      }
      
      const newGen: Generation = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        topic: topic,
        type: quizType,
        questions: results
      };
      
      // Save to Firestore
      const path = 'generations';
      try {
        await addDoc(collection(db, path), {
          ...newGen,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }

      setGenerations([newGen, ...generations]);
      setActiveGeneration(newGen);
      setState('results');
      setShowGenerationDetail(false);
    } catch (error) {
      console.error(error);
      setState('idle');
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setState('idle');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden selection:bg-fuchsia-500/30">
      {showQCReport && activeGeneration && (
        <QCReport 
          topic={activeGeneration.topic} 
          questions={activeGeneration.questions} 
          type={activeGeneration.type}
          onClose={() => setShowQCReport(false)}
        />
      )}
      {showLogin && (
        <LoginModal 
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}
      {/* Header Section */}
      <nav className="h-20 bg-indigo-600 border-b-4 border-black flex items-center justify-between px-8 shrink-0 relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 border-2 border-black rounded-lg flex items-center justify-center rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-black font-black text-xl">Q!</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">QuestAi</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-black/20 px-4 py-2 rounded-full text-[10px] font-black items-center gap-2 border border-black/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
            SYSTEMS ACTIVE
          </div>
          
          <div className="flex bg-black/30 rounded-xl p-1 border-2 border-black">
            {(['coding', 'mcq'] as const).map((type) => (
              <button
                key={type}
                id={`tab-${type}`}
                onClick={() => {
                  setQuizType(type);
                  if (type === 'coding') setCount(Math.min(count, 50));
                  else setCount(Math.max(5, count));
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300",
                  quizType === type 
                    ? "bg-fuchsia-500 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                    : "text-white/60 hover:text-white"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {user ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border-2 border-black hover:bg-black/40 transition-all group"
            >
              <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-[10px] font-black group-hover:bg-fuchsia-500 transition-colors">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <span className="text-[10px] font-black text-white/80 group-hover:text-white uppercase tracking-tighter hidden sm:block">Logout</span>
              <LogOut size={14} className="text-white/40 group-hover:text-white" />
            </button>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-white text-black px-6 py-2 rounded-xl font-black text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Sidebar Configuration */}
        <aside className="hidden lg:flex w-80 bg-slate-900 border-r-4 border-black p-8 flex-col gap-8 shrink-0">
          <div>
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">Config Panel</label>
            <div className="space-y-6">
              <div className="bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Target Topic</p>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Retail Tech"
                  className="w-full bg-transparent font-bold text-white outline-none placeholder:text-slate-600 text-sm"
                />
              </div>

              <div className="bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black uppercase text-slate-500">Volume</p>
                  <span className="text-sm font-black text-fuchsia-400">{count}</span>
                </div>
                <input
                  type="range"
                  min={quizType === 'coding' ? 1 : 5}
                  max={quizType === 'coding' ? 50 : 100}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full appearance-none bg-slate-700 h-1 rounded-full accent-fuchsia-500"
                />
              </div>

              {quizType === 'coding' && (
                <>
                  <div className="bg-slate-800 border-2 border-slate-700 p-1 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex">
                    {(['original', 'leetcode'] as const).map((src) => (
                      <button
                        key={src}
                        onClick={() => setCodingSource(src)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                          codingSource === src 
                            ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                            : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {src === 'original' ? 'NON-LEETCODE' : 'LEETCODE'}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-800 border-2 border-slate-700 p-1 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex">
                    {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setCodingDifficulty(diff)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                          codingDifficulty === diff 
                            ? (diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-amber-400' : 'bg-red-500') + " text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                            : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-3 block">Quick Actions</label>
            <button
              id="generate-button"
              onClick={handleGenerate}
              disabled={state === 'generating'}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black text-sm uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
            >
              BUILD QUEST <Zap size={18} fill="currentColor" />
            </button>
          </div>

          {generations.length > 0 && (
            <div>
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 block">History</label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {generations.map((gen, idx) => (
                  <button
                    key={gen.id}
                    onClick={() => {
                      setActiveGeneration(gen);
                      setState('results');
                      setShowGenerationDetail(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border-2 transition-all group",
                      activeGeneration?.id === gen.id 
                        ? "bg-indigo-600 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white" 
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    <p className="text-[10px] font-black uppercase opacity-60">Gen {generations.length - idx}</p>
                    <p className="font-bold text-xs truncate uppercase tracking-tight">{gen.topic}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div className="bg-amber-400 border-2 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
              <p className="text-[10px] font-black uppercase opacity-60">Status Output</p>
              <p className="text-3xl font-black tracking-tight leading-none mt-1">
                {state === 'results' ? generations.length : '00'}
              </p>
              <p className="text-xs font-bold uppercase mt-1">Generations Run</p>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 bg-indigo-50 p-6 md:p-12 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto"
              >
                <div className="w-24 h-24 bg-indigo-600 border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-10 rotate-6" >
                  <Terminal size={48} className="text-white" />
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-none mb-6 italic">
                  WELCOME TO <br />
                  <span className="text-indigo-600 not-italic uppercase">QUESTAI.</span>
                </h2>
                <p className="text-slate-600 font-bold mb-10 text-lg">
                  Professional coding challenges and enterprise MCQs, built by AI in seconds.
                </p>
                
                <div className="lg:hidden w-full space-y-4 mb-8">
                   <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic..."
                    className="w-full bg-white border-4 border-black p-4 rounded-2xl text-black font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <button
                    onClick={handleGenerate}
                    className="w-full bg-yellow-400 text-black font-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase"
                  >
                    Build QUEST
                  </button>
                </div>
              </motion.div>
            )}

            {state === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-[8px] border-indigo-200 border-t-indigo-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-fuchsia-500 border-4 border-black rounded-2xl rotate-45 animate-bounce" />
                  </div>
                </div>
                <h3 className="mt-12 text-3xl font-black text-black uppercase tracking-tighter">Crafting Reality...</h3>
                <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest">Logic Engine Warming Up</p>
              </motion.div>
            )}

            {state === 'results' && activeGeneration && (
              <motion.div
                key={activeGeneration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 pb-20"
              >
                {!showGenerationDetail ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="bg-white border-[6px] border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-12 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 opacity-5 rotate-12 scale-150">
                        <Layers size={300} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                           <span className="bg-fuchsia-500 text-black text-xs font-black px-4 py-1 rounded-full border-2 border-black">GENERATION {generations.length - generations.findIndex(g => g.id === activeGeneration.id)}</span>
                           <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{new Date(activeGeneration.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <h2 className="text-6xl font-black text-black leading-none mb-6 italic tracking-tighter uppercase mr-20">
                          {activeGeneration.topic}
                        </h2>
                        
                        <p className="text-xl text-slate-600 font-bold mb-10 max-w-2xl">
                          This generation contains <span className="text-indigo-600">{activeGeneration.questions.length}</span> {activeGeneration.type === 'coding' ? 'high-fidelity coding challenges' : 'advanced logic MCQs'} with complete technical specifications and verification data.
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={() => setShowGenerationDetail(true)}
                            className="bg-indigo-600 text-white font-black px-10 py-5 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-500 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-3 text-lg"
                          >
                            OPEN QUESTION SET <ChevronRight size={24} />
                          </button>
                          <button 
                            onClick={() => setShowQCReport(true)}
                            className="bg-white text-black font-black px-10 py-5 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-3 text-lg"
                          >
                            VIEW QC DOCUMENT <FileBadge size={24} />
                          </button>
                          {activeGeneration.type === 'mcq' && (
                            <button 
                              onClick={() => downloadMCQsAsExcel(activeGeneration.questions as MCQQuestion[], activeGeneration.topic)}
                              className="bg-emerald-400 text-black font-black px-10 py-5 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-300 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-3 text-lg"
                            >
                              DOWNLOAD EXCEL <ListChecks size={24} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                  >
                    <div className="flex items-center gap-4 mb-8">
                       <button 
                        onClick={() => setShowGenerationDetail(false)}
                        className="bg-black text-white px-6 py-2 rounded-xl font-black text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                       >
                         BACK TO SUMMARY
                       </button>
                       <h2 className="text-3xl font-black text-black italic uppercase tracking-tighter">{activeGeneration.topic} / Full Set</h2>
                    </div>

                    {activeGeneration.type === 'coding' ? (
                      activeGeneration.questions.map((q, idx) => (
                        <CodingCard key={q.id} question={q as CodingQuestion} index={idx} />
                      ))
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {activeGeneration.questions.map((m, idx) => (
                          <MCQCard key={m.id} mcq={m as MCQQuestion} index={idx} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {(state === 'results' || generations.length > 0) && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => {
              setState('idle');
              setActiveGeneration(null);
            }}
            className="group bg-indigo-600 text-white w-16 h-16 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-all hover:bg-fuchsia-500 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <RefreshCw className="transition-transform group-hover:rotate-180 duration-500" />
          </button>
        </div>
      )}
    </div>
  );
}
