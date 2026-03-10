"use client";

import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  MapPin, 
  ShieldAlert, 
  MessageSquare, 
  Clock, 
  Trash2, 
  CreditCard, 
  Smartphone, 
  Star, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Check,
  RefreshCw,
  BookOpen,
  Loader2
} from 'lucide-react';

// --- Types ---
type UserData = {
  firstName: string;
  lastName: string;
  mobile: string;
};

type StepType = 'welcome' | 'quiz' | 'consent' | 'result';
type FeedbackType = 'correct' | 'wrong' | null;

interface WelcomeScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setStep: React.Dispatch<React.SetStateAction<StepType>>;
}

interface QuizScreenProps {
  currentQuestion: number;
  onAnswerSubmit: (selectedIndices: number[]) => void;
  showFeedback: FeedbackType;
}

interface ConsentScreenProps {
  userData: UserData;
  onFinalSubmit: () => void;
  isSubmitting: boolean;
}

interface ResultScreenProps {
  score: number;
  userData: UserData;
  completionCode: string;
}
// -------------

const MODULE_NAME = "AROI ASSESSMENT 2026";
const ORIENTATION_MODULE_LINK = "https://aroi-orientation.vercel.app/";
// Replace this URL with your Google Apps Script Web App URL
const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwaypV9AE5VeImdLF5ra3Vu0LTMyzh8KPxHkQkTVLZkg_xsTJGW45ZbsIsjTWLhKSEF8A/exec"; 

const orientationData = [
  {
    id: 1,
    category: "Workplace",
    question: "Where are our primary work locations? (There are 2 correct answers)",
    options: [
      "1218 Toorak Rd, Camberwell & 435 Nepean Hwy, Frankston",
      "100 Flinders St, Melbourne & 500 Chapel St, South Yarra",
      "Only the location I applied for the job",
      "I'm open to working at any locations, but it has to be a mutual decision"
    ],
    multiple: true,
    correct: [0, 3],
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 2,
    category: "Health & Safety",
    question: "What should you do if an accident occurs at the workplace?",
    options: [
      "Wait until the end of the shift to mention it",
      "Don't waste time, only report it only if it seems serious",
      "Seek first aid, file an accident report, and notify manager",
      "Fill out the accident report form, then report to manager"
    ],
    correct: [2],
    icon: <ShieldAlert className="w-5 h-5" />
  },
  {
    id: 3,
    category: "Communication",
    question: "What is the agreed window for 'After-hours Contact' consent?",
    options: [
      "9am to 5pm",
      "10am to 10pm",
      "6pm to midnight",
      "24/7 availability"
    ],
    correct: [1],
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    id: 4,
    category: "Attendance",
    question: "What is the procedure for requesting leave?",
    options: [
      "Send an SMS to the manager",
      "Call manager and SMS at least 2 weeks in advance",
      "Tell a colleague to cover your shift",
      "Call the Director at appropriate time frame"
    ],
    correct: [1],
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 5,
    category: "Closing Tasks",
    question: "Which items require a photo confirmation during closing? (Select all that apply)",
    options: [
      "Checklist & Task list",
      "Gas / Stove / Air Conditioning",
      "Door lock / Cash control / Cash tray",
      "Staff personal belongings / Lost and Found items",
      "Kitchen faucet / Sink / Washing machine",
      "Staff meals"
    ],
    multiple: true,
    correct: [0, 1, 2, 4, 5],
    icon: <Trash2 className="w-5 h-5" />
  },
  {
    id: 6,
    category: "Mobile Policy",
    question: "What happens if an employee uses a personal mobile device during working hours without a scheduled break?",
    options: [
      "I can use mobile for personal matter anytime I want",
      "The time spent will be logged as non-pay working hours",
      "If I started early, I’m going to take a moment to make some phone calls",
      "It's fine to use your phone if we're not busy"
    ],
    correct: [1],
    icon: <Smartphone className="w-5 h-5" />
  },
  {
    id: 7,
    category: "Payment",
    question: "When is the pay date and what is the period?",
    options: [
      "Every fortnight on Sunday night (Mon-Sun cycle)",
      "Every fortnight on Monday night (Mon-Sun cycle)",
      "Every fortnight on Tuesday night (Mon-Sun cycle)",
      "Every day after my shifts"
    ],
    correct: [2],
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    id: 8,
    category: "Misconduct",
    question: "What are the consequences of serious misconduct?",
    options: [
      "Just apologise and promise it was a one-time mistake",
      "It's acceptable; the manager will issue a verbal warning",
      "Termination of employment and potential legal action are expected",
      "I am willing to pay for the damages and I promise it won't happen again"
    ],
    correct: [2],
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    id: 9,
    category: "Benefits",
    question: "What's the condition of the 30% team discount? (Select all that apply)",
    options: [
      "I can bring anyone to the restaurant and everyone gets 30% discount",
      "30% discount only applies for myself to buy any items from the restaurant",
      "My friends can enjoy this 30% discount but only they need to come with me",
      "My family can enjoy this 30% discount but only they need to come with me"
    ],
    multiple: true,
    correct: [1, 3],
    icon: <Star className="w-5 h-5" />
  },
  {
    id: 10,
    category: "Attendance",
    question: "If my roster is on a public holiday, what should I do?",
    options: [
      "It's my holiday. I can take a break without telling anyone.",
      "It's my day off, but I still need to let the manager know.",
      "I still have to work because it's on my roster."
    ],
    correct: [1],
    icon: <Clock className="w-5 h-5" />
  }
];

// Screen Components
const WelcomeScreen = ({ userData, setUserData, setStep }: WelcomeScreenProps) => {
  const isComplete = userData.firstName.trim() && userData.lastName.trim() && userData.mobile.trim();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
        <ClipboardCheck className="w-12 h-12 text-black" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">{MODULE_NAME}</h1>
      <p className="text-yellow-500 font-medium mb-8">Staff Induction Assessment 2026</p>
      
      <div className="w-full max-w-sm space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8 text-left">
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5">First Name</label>
          <input 
            type="text" 
            value={userData.firstName}
            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
            placeholder="e.g. John"
            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5">Last Name</label>
          <input 
            type="text" 
            value={userData.lastName}
            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
            placeholder="e.g. Smith"
            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5">Mobile Number</label>
          <input 
            type="tel" 
            value={userData.mobile}
            onChange={(e) => setUserData({ ...userData, mobile: e.target.value })}
            placeholder="e.g. 0400 000 000"
            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
      </div>

      <button 
        disabled={!isComplete}
        onClick={() => setStep('quiz')}
        className={`w-full max-w-sm flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-lg transition-all ${
          isComplete 
            ? 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        Start Assessment
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const QuizScreen = ({ currentQuestion, onAnswerSubmit, showFeedback }: QuizScreenProps) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const q = orientationData[currentQuestion];
  const progress = ((currentQuestion + 1) / orientationData.length) * 100;

  useEffect(() => {
    setSelectedIndices([]);
  }, [currentQuestion]);

  const toggleOption = (idx: number) => {
    if (showFeedback !== null) return;
    
    if (q.multiple) {
      if (selectedIndices.includes(idx)) {
        setSelectedIndices(selectedIndices.filter(i => i !== idx));
      } else {
        setSelectedIndices([...selectedIndices, idx]);
      }
    } else {
      setSelectedIndices([idx]);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in slide-in-from-right duration-300 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg text-yellow-500">
            {q.icon}
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{q.category}</p>
            <h2 className="text-zinc-300 font-medium">Question {currentQuestion + 1} of {orientationData.length}</h2>
          </div>
        </div>
        <div className="text-right">
           <span className="text-yellow-500 font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-10 overflow-hidden">
        <div 
          className="bg-yellow-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-tight">
        {q.question}
      </h3>

      <div className="space-y-4 mb-10">
        {q.options.map((option, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const isCorrect = q.correct.includes(idx);
          
          let statusClass = "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600";
          if (showFeedback === 'correct' && isCorrect) statusClass = 'bg-green-500/10 border-green-500 text-green-500';
          else if (showFeedback === 'wrong' && isSelected && !isCorrect) statusClass = 'bg-red-500/10 border-red-500 text-red-500';
          else if (isSelected) statusClass = 'bg-yellow-500/10 border-yellow-500 text-yellow-500';

          return (
            <button
              key={idx}
              disabled={showFeedback !== null}
              onClick={() => toggleOption(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${statusClass}`}
            >
              <span className="flex-1">{option}</span>
              <div className={`w-6 h-6 flex items-center justify-center border-2 transition-colors ${
                q.multiple ? 'rounded' : 'rounded-full'
              } ${
                isSelected || (showFeedback === 'correct' && isCorrect) ? 'border-current' : 'border-zinc-700'
              }`}>
                {(isSelected || (showFeedback === 'correct' && isCorrect)) && <Check className="w-4 h-4 stroke-[3px]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-md border-t border-zinc-900 flex justify-center">
        <button 
          disabled={selectedIndices.length === 0 || showFeedback !== null}
          onClick={() => onAnswerSubmit(selectedIndices)}
          className={`w-full max-w-2xl flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-lg transition-all ${
            selectedIndices.length > 0 && showFeedback === null
              ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {showFeedback !== null ? 'Checking...' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
};

const ConsentScreen = ({ userData, onFinalSubmit, isSubmitting }: ConsentScreenProps) => {
  const [checkedPoints, setCheckedPoints] = useState<boolean[]>([false, false, false, false]);

  const togglePoint = (idx: number) => {
    const newPoints = [...checkedPoints];
    newPoints[idx] = !newPoints[idx];
    setCheckedPoints(newPoints);
  };

  const isAllChecked = checkedPoints.every(v => v);

  const points = [
    "I acknowledge and agree to AROI PTY LTD policies on workplace monitoring, surveillance and Search activities.",
    "I consent to be contacted outside working hours between 12pm to 10pm for operational needs.",
    "I understand the strict mobile device policy and the health/safety reporting requirements.",
    "I agree that serious misconduct may lead to immediate dismissal and potential forfeiture of outstanding wages."
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 text-left">
          <ShieldAlert className="text-yellow-500" />
          Final Confirmation
        </h2>
        
        <p className="text-zinc-500 text-sm mb-6 text-left italic">Please review and check each point below to proceed:</p>

        <div className="space-y-4">
          {points.map((text, idx) => (
            <div 
              key={idx} 
              onClick={() => togglePoint(idx)}
              className={`flex gap-4 items-start p-4 rounded-xl border transition-all cursor-pointer ${
                checkedPoints[idx] ? 'bg-zinc-800/50 border-yellow-500/50' : 'bg-black border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`mt-0.5 shrink-0 w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
                checkedPoints[idx] ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-zinc-700 text-transparent'
              }`}>
                <Check className="w-4 h-4 stroke-[3px]" />
              </div>
              <p className={`text-sm leading-relaxed text-left transition-colors ${checkedPoints[idx] ? 'text-zinc-200' : 'text-zinc-500'}`}>
                {text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-left">
          <p className="text-xs text-zinc-500 mb-4 uppercase tracking-widest">Digital Signature</p>
          <div className="bg-black p-4 rounded-lg border border-zinc-700 italic text-zinc-300">
            Signed by: {userData.firstName} {userData.lastName}
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">Mobile: {userData.mobile} • Timestamp: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <button 
        disabled={!isAllChecked || isSubmitting}
        onClick={onFinalSubmit}
        className={`w-full p-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
          isAllChecked && !isSubmitting
            ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Data...
          </>
        ) : (
          'Complete & Submit Induction'
        )}
      </button>
    </div>
  );
};

const ResultScreen = ({ score, userData, completionCode }: ResultScreenProps) => {
  const passed = score >= (orientationData.length * 0.8);
  
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center animate-in zoom-in duration-300">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
        {passed ? <Award className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-2">
        {passed ? 'Assessment Completed!' : 'Assessment Failed'}
      </h2>
      <p className="text-zinc-400 mb-8 max-w-xs">
        Thank you, <span className="text-white font-bold">{userData.firstName}</span>. You scored {score} out of {orientationData.length}.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm mb-8 text-left">
         <div className="flex justify-between items-center mb-4">
           <span className="text-zinc-500">Status:</span>
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${passed ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
             {passed ? 'PASSED' : 'RETRY REQUIRED'}
           </span>
         </div>
         <div className="flex justify-between items-center text-sm">
           <span className="text-zinc-500">Completion Code:</span>
           <span className="text-white font-mono">
             {passed ? completionCode : 'N/A'}
           </span>
         </div>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        {passed ? (
          <>
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              className="flex items-center justify-center gap-3 w-full bg-white text-black p-4 rounded-xl font-bold hover:bg-zinc-200 transition-all"
            >
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              Support us on Google Review
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="w-full text-zinc-500 text-sm hover:text-white transition-colors"
            >
              Restart Assessment
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-3 w-full bg-yellow-500 text-black p-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
            >
              <RefreshCw className="w-5 h-5" />
              Retake this assessment
            </button>
            <a 
              href={ORIENTATION_MODULE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-4 rounded-xl font-bold hover:bg-zinc-800 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Review Orientation Module
            </a>
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState<StepType>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [score, setScore] = useState<number>(0);
  const [completionCode, setCompletionCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    mobile: ''
  });
  const [showFeedback, setShowFeedback] = useState<FeedbackType>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendDataToGoogleSheet = async (data: any) => {
    if (!GOOGLE_SHEET_SCRIPT_URL) {
      console.warn("Google Sheet Script URL is not configured.");
      return;
    }

    try {
      await fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleAnswerSubmit = (selectedIndices: number[]) => {
    const q = orientationData[currentQuestion];
    
    const isCorrect = 
      selectedIndices.length === q.correct.length && 
      selectedIndices.every((idx: number) => q.correct.includes(idx));

    setShowFeedback(isCorrect ? 'correct' : 'wrong');
    
    const updatedAnswers = { ...answers, [currentQuestion]: selectedIndices };
    setAnswers(updatedAnswers);
    
    setTimeout(() => {
      setShowFeedback(null);
      if (currentQuestion < orientationData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        const finalScore = Object.entries(updatedAnswers)
          .reduce((acc, [qIdx, sIndices]) => {
            const question = orientationData[Number(qIdx)];
            const indices = sIndices as number[];
            const correct = 
              indices.length === question.correct.length && 
              indices.every((idx: number) => question.correct.includes(idx));
            return acc + (correct ? 1 : 0);
          }, 0);
        setScore(finalScore);
        setStep('consent');
      }
    }, 1200);
  };

  const onFinalSubmit = async () => {
    setIsSubmitting(true);
    const code = `AROI-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setCompletionCode(code);

    // Create a flattened object for Google Sheets columns
    const flatQuizData: Record<string, string> = {};
    orientationData.forEach((q, index) => {
      const selectedIndices = answers[index] || [];
      const isCorrect = 
        selectedIndices.length === q.correct.length && 
        selectedIndices.every((idx: number) => q.correct.includes(idx));
      
      const selectedOptionsText = selectedIndices.map((idx: number) => q.options[idx]).join(", ");
      
      // Explicitly naming columns q1_response, q1_result etc.
      flatQuizData[`q${index + 1}_response`] = selectedOptionsText;
      flatQuizData[`q${index + 1}_result`] = isCorrect ? "Correct" : "Incorrect";
    });

    const submissionData = {
      timestamp: new Date().toLocaleString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      mobile: userData.mobile,
      score: score,
      totalQuestions: orientationData.length,
      passed: score >= (orientationData.length * 0.8),
      completionCode: code,
      module: MODULE_NAME,
      ...flatQuizData // Spread the individual question columns here
    };

    await sendDataToGoogleSheet(submissionData);
    
    setIsSubmitting(false);
    setStep('result');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <nav className="border-b border-zinc-900 p-4 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-black text-black text-sm">A</div>
            <span className="font-bold tracking-tighter text-lg uppercase">{MODULE_NAME}</span>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono hidden sm:block">
            V 2603101537
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8">
        {step === 'welcome' && (
          <WelcomeScreen 
            userData={userData} 
            setUserData={setUserData} 
            setStep={setStep} 
          />
        )}
        {step === 'quiz' && (
          <QuizScreen 
            currentQuestion={currentQuestion} 
            onAnswerSubmit={handleAnswerSubmit} 
            showFeedback={showFeedback} 
          />
        )}
        {step === 'consent' && (
          <ConsentScreen 
            userData={userData} 
            onFinalSubmit={onFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 'result' && (
          <ResultScreen 
            score={score} 
            userData={userData} 
            completionCode={completionCode}
          />
        )}
      </main>

      {/* Footer Branding */}
      {step === 'welcome' && (
        <footer className="mt-auto p-8 border-t border-zinc-900">
           <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4 text-center">
             <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-tighter">Camberwell</p>
                <p className="text-white text-[10px] font-medium uppercase">Maruay Thai</p>
             </div>
             <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-tighter">Frankston</p>
                <p className="text-white text-[10px] font-medium uppercase">Pad Thai Food</p>
             </div>
           </div>
        </footer>
      )}

      {/* Toast-like feedback */}
      {showFeedback && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce flex items-center gap-2 z-[100] ${
          showFeedback === 'correct' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
        }`}>
          {showFeedback === 'correct' ? (
            <><CheckCircle2 className="w-5 h-5" /> Correct!</>
          ) : (
            <><AlertTriangle className="w-5 h-5" /> Incorrect</>
          )}
        </div>
      )}
    </div>
  );
};

export default App;