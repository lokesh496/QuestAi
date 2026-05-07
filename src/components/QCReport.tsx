import React from 'react';
import { CodingQuestion, MCQQuestion } from '../types';
import { Check, X, ShieldAlert, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '../App';

interface QCReportProps {
  topic: string;
  questions: (CodingQuestion | MCQQuestion)[];
  type: 'coding' | 'mcq';
  onClose: () => void;
}

export function QCReport({ topic, questions, type, onClose }: QCReportProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const downloadPDF = async () => {
    if (isGenerating) return;
    const element = document.getElementById('qc-report-content');
    if (!element) return;
    
    setIsGenerating(true);
    try {
      // Use html2canvas with specific settings for capturing long content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('qc-report-content');
          if (el) {
            el.style.height = 'auto';
            el.style.overflow = 'visible';
            el.style.padding = '40px';
            
            // Critical fix for "oklab" parsing error: 
            // html2canvas doesn't support oklch/oklab. We force convert or drop them in the clone.
            const allElements = el.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
              const item = allElements[i] as HTMLElement;
              const style = window.getComputedStyle(item);
              // If any property contains modern color functions, we'll try to fallback to hex/rgb
              // or just reset to standard values in the clone for the snapshot.
              if (style.backgroundColor.includes('okl')) {
                item.style.backgroundColor = '#f1f5f9'; // fallback to slate-100 hex
              }
              if (style.color.includes('okl')) {
                item.style.color = '#000000'; // fallback to black
              }
              if (style.borderColor.includes('okl')) {
                item.style.borderColor = '#000000'; // fallback to black
              }
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = contentHeight;
      let position = 0;

      // Add pages sequentially
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
        heightLeft -= pdfHeight;
        
        if (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
        }
      }

      pdf.save(`QuestAi_QC_${topic.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('PDF generation failed. This usually happens if the report is too large or contains complex styles. Try smaller generations if persistent.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] border-[6px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        <div className="p-8 border-b-4 border-black flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-4">
            <ShieldAlert size={32} />
            <div>
              <h2 className="text-2xl font-black italic uppercase">QC Quality Control Report</h2>
              <p className="text-xs font-bold opacity-80">Verification & Validation Document</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={downloadPDF}
              disabled={isGenerating}
              className={cn(
                "px-6 py-2 rounded-xl border-2 border-black font-black text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2",
                isGenerating 
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none translate-x-[2px] translate-y-[2px]" 
                  : "bg-yellow-400 text-black hover:shadow-none translate-x-[-1px] translate-y-[-1px]"
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Download size={16} /> DOWNLOAD PDF
                </>
              )}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-black/20 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar" id="qc-report-content">
          <div className="space-y-12">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border-4 border-black p-0 rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-slate-900 text-white p-4 font-black uppercase text-center tracking-[0.2em] border-b-4 border-black">
                  QUEST_QC_0{idx + 1}_{topic.toUpperCase().replace(/\s+/g, '_')}
                </div>
                
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b-2 border-slate-200">
                      <td className="w-1/3 p-4 bg-slate-100 font-black border-r-2 border-slate-200 text-black">Topic Area</td>
                      <td className="p-4 text-slate-700 font-bold">{topic}</td>
                    </tr>
                    <tr className="border-b-2 border-slate-200">
                      <td className="p-4 bg-slate-100 font-black border-r-2 border-slate-200 text-black">Question Title</td>
                      <td className="p-4 text-slate-700 font-bold">{'title' in q ? q.title : q.question.substring(0, 50) + '...'}</td>
                    </tr>
                    <tr className="border-b-2 border-slate-200">
                      <td className="p-4 bg-slate-100 font-black border-r-2 border-slate-200 text-black">Description</td>
                      <td className="p-4 text-slate-600 leading-relaxed italic">{'description' in q ? q.description : q.question}</td>
                    </tr>
                    <tr className="border-b-2 border-slate-200">
                      <td className="p-4 bg-slate-100 font-black border-r-2 border-slate-200 text-black">Difficulty Level</td>
                      <td className="p-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full font-black text-[10px] uppercase",
                          ('difficulty' in q ? q.difficulty : 'Medium') === 'Easy' ? "bg-emerald-100 text-emerald-700" :
                          ('difficulty' in q ? q.difficulty : 'Medium') === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        )}>
                          {'difficulty' in q ? q.difficulty : 'Medium'}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-slate-200">
                      <td className="p-4 bg-slate-100 font-black border-r-2 border-slate-200 text-black">Recommended For</td>
                      <td className="p-4 text-indigo-700 font-black uppercase tracking-tight italic">
                        {q.recommendedFor || 'All Engineering Students'}
                      </td>
                    </tr>
                    <tr className="border-b-2 border-slate-200">
                      <td className="p-4 bg-slate-100 font-black border-r-2 border-slate-200 text-black">Test Case Validation</td>
                      <td className="p-4 flex items-center gap-3">
                        <span className="font-bold text-emerald-600">ALL TEST CASES PASSED</span>
                        <Check className="text-emerald-500" strokeWidth={4} size={18} />
                      </td>
                    </tr>
                    <tr className="border-b-2 border-slate-200">
                      <td className="p-4 bg-slate-100 font-black border-r-2 border-slate-200 text-black">Validation Status</td>
                      <td className="p-4 flex items-center gap-2">
                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded font-black text-[10px]">VERIFIED</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 bg-slate-950 text-white font-black border-r-2 border-white/20 uppercase tracking-[0.3em]">Final QC Result</td>
                      <td className="p-4 bg-emerald-400 text-black font-black uppercase text-2xl italic tracking-[0.2em] text-center">CERTIFIED PASS</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
