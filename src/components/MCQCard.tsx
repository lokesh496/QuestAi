import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Info,
  ChevronRight,
  BrainCircuit,
  Lightbulb,
  User
} from 'lucide-react';
import { MCQQuestion } from '../types';
import { cn } from '../App';

interface MCQCardProps {
  mcq: MCQQuestion;
  index: number;
}

export function MCQCard({ mcq, index }: MCQCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selectedOption === mcq.correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-white border-[4px] border-black rounded-[32px] p-8 transition-all duration-300 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        selectedOption !== null 
          ? (isCorrect ? "bg-emerald-50 border-emerald-500 shadow-emerald-500/20" : "bg-red-50 border-red-500 shadow-red-500/20")
          : "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
      )}
    >
      <div className="absolute -top-4 -right-4 opacity-[0.05] rotate-12 scale-125">
        <BrainCircuit size={100} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {index + 1}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
            Logic Assessment
          </span>
        </div>

        <h3 className="text-xl font-black leading-tight mb-8 text-black uppercase italic tracking-tight">
          {mcq.question}
        </h3>

        <div className="space-y-4">
          {mcq.options.map((option, optIdx) => {
            const isOptionSelected = selectedOption === optIdx;
            const isOptionCorrect = mcq.correctAnswer === optIdx;
            
            let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";
            
            if (selectedOption !== null) {
              if (isOptionCorrect) btnStyle = "bg-green-400 border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
              else if (isOptionSelected) btnStyle = "bg-red-400 border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
              else btnStyle = "bg-white border-slate-100 text-slate-300 opacity-50";
            }

            return (
              <button
                key={optIdx}
                disabled={selectedOption !== null}
                onClick={() => setSelectedOption(optIdx)}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group font-bold",
                  btnStyle
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2",
                    isOptionSelected ? "bg-white/20 border-black" : "bg-white border-black/10"
                  )}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
                {selectedOption !== null && isOptionCorrect && (
                  <CheckCircle2 size={20} className="text-black shrink-0" />
                )}
                {selectedOption !== null && isOptionSelected && !isOptionCorrect && (
                  <XCircle size={20} className="text-black shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <div className="bg-slate-100 px-3 py-1.5 rounded-lg border-2 border-slate-200 flex items-center gap-2">
            <User size={12} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Recommended: {mcq.recommendedFor}</span>
          </div>
          {selectedOption !== null && (
            <div className="bg-emerald-100 px-3 py-1.5 rounded-lg border-2 border-emerald-500 flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-700" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Correct Ans: {String.fromCharCode(65 + mcq.correctAnswer)}</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-8 border-t-2 border-black/5 pt-6"
            >
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="bg-yellow-400 text-black px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-yellow-300 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Info size={14} /> {showExplanation ? "Hide Logic" : "View Explanation"}
              </button>
              
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-5 bg-indigo-50 rounded-2xl border-2 border-indigo-100 relative"
                >
                  <p className="text-xs text-indigo-900 leading-relaxed font-bold italic">
                    {mcq.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
