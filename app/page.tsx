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
  Loader2,
  Languages,
  User
} from 'lucide-react';

// --- Types ---
type UserData = {
  firstName: string;
  lastName: string;
  mobile: string;
};

type LanguageType = 'en' | 'th';
type StepType = 'welcome' | 'language' | 'quiz' | 'consent' | 'result';
type FeedbackType = 'correct' | 'wrong' | null;

interface WelcomeScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setStep: React.Dispatch<React.SetStateAction<StepType>>;
}

interface LanguageSelectionProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  setStep: React.Dispatch<React.SetStateAction<StepType>>;
}

interface QuizScreenProps {
  currentQuestion: number;
  onAnswerSubmit: (selectedIndices: number[]) => void;
  showFeedback: FeedbackType;
  language: LanguageType;
}

interface ConsentScreenProps {
  userData: UserData;
  onFinalSubmit: () => void;
  isSubmitting: boolean;
  language: LanguageType;
}

interface ResultScreenProps {
  score: number;
  userData: UserData;
  completionCode: string;
  language: LanguageType;
}
// -------------

const MODULE_NAME = "AROI ASSESSMENT 2026";
const ORIENTATION_MODULE_LINK = "https://aroi-orientation.vercel.app/";
const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwaypV9AE5VeImdLF5ra3Vu0LTMyzh8KPxHkQkTVLZkg_xsTJGW45ZbsIsjTWLhKSEF8A/exec"; 

const translations = {
  en: {
    start: "Start Assessment",
    submit: "Submit Answer",
    checking: "Checking...",
    next: "Next",
    back: "Back",
    correct: "Correct!",
    incorrect: "Incorrect",
    finish: "Complete & Submit Induction",
    submitting: "Submitting Data...",
    retake: "Retake this assessment",
    review: "Review Orientation Module",
    score: "scored",
    outOf: "out of",
    passed: "PASSED",
    reviewReq: "RETRY REQUIRED",
    completionCode: "Completion Code",
    support: "Support us on Google Review",
    langInstr: "Choose your preferred language to clearly understand all task expectations.",
    digitalSign: "Digital Signature",
    signedBy: "Signed by",
    timestamp: "Timestamp",
    mobile: "Mobile",
    finalConfirm: "Final Confirmation",
    confirmInstr: "Please review and check each point below to proceed:",
    passedTitle: "Assessment Completed!",
    failedTitle: "Assessment Failed",
    camberwell: "Camberwell",
    frankston: "Frankston"
  },
  th: {
    start: "เริ่มทำแบบประเมิน",
    submit: "ส่งคำตอบ",
    checking: "กำลังตรวจสอบ...",
    next: "ถัดไป",
    back: "กลับ",
    correct: "ถูกต้อง!",
    incorrect: "ไม่ถูกต้อง",
    finish: "เสร็จสิ้นและส่งข้อมูลการปฐมนิเทศ",
    submitting: "กำลังส่งข้อมูล...",
    retake: "ทำแบบประเมินอีกครั้ง",
    review: "ทบทวนบทเรียนการปฐมนิเทศ",
    score: "ได้คะแนน",
    outOf: "จาก",
    passed: "ผ่านการทดสอบ",
    reviewReq: "ต้องทำการทดสอบใหม่",
    completionCode: "รหัสการทำรายการ",
    support: "สนับสนุนเราผ่าน Google Review",
    langInstr: "โปรดเลือกภาษาที่คุณต้องการเพื่อให้เข้าใจความคาดหวังในงานทั้งหมดอย่างชัดเจน",
    digitalSign: "ลายเซ็นดิจิทัล",
    signedBy: "เซ็นชื่อโดย",
    timestamp: "วันเวลา",
    mobile: "เบอร์โทรศัพท์",
    finalConfirm: "การยืนยันขั้นตอนสุดท้าย",
    confirmInstr: "โปรดอ่านและทำเครื่องหมายในแต่ละข้อด้านล่างเพื่อดำเนินการต่อ:",
    passedTitle: "แบบประเมินเสร็จสมบูรณ์!",
    failedTitle: "แบบประเมินยังไม่เสร็จสมบูรณ์",
    camberwell: "Camberwell",
    frankston: "Frankston"
  }
};

const orientationData = [
  {
    id: 1,
    category: { en: "Workplace", th: "สถานที่ทำงาน" },
    question: { 
      en: "Where are our primary work locations? (There are 2 correct answers)", 
      th: "สถานที่ทำงานหลักของเราคือที่ไหน? (มี 2 คำตอบที่ถูกต้อง)" 
    },
    options: {
      en: [
        "1218 Toorak Rd, Camberwell & 435 Nepean Hwy, Frankston",
        "100 Flinders St, Melbourne & 500 Chapel St, South Yarra",
        "Only the location I applied for the job",
        "I'm open to working at any locations, but it has to be a mutual decision"
      ],
      th: [
        "1218 Toorak Rd, Camberwell และ 435 Nepean Hwy, Frankston",
        "100 Flinders St, Melbourne และ 500 Chapel St, South Yarra",
        "เฉพาะสาขาที่ฉันสมัครงานเท่านั้น",
        "ฉันยินดีทำงานในทุกสาขา แต่ต้องเป็นการตัดสินใจร่วมกันของทั้งสองฝ่าย"
      ]
    },
    multiple: true,
    correct: [0, 3],
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 2,
    category: { en: "Health & Safety", th: "สุขภาพและความปลอดภัย" },
    question: { 
      en: "What should you do if an accident occurs at the workplace?", 
      th: "หากเกิดอุบัติเหตุในที่ทำงาน คุณควรทำอย่างไร?" 
    },
    options: {
      en: [
        "Wait until the end of the shift to mention it",
        "Don't waste time, only report it only if it seems serious",
        "Seek first aid, file an accident report, and notify manager",
        "Fill out the accident report form, then report to manager"
      ],
      th: [
        "รอจนกว่าจะจบกะแล้วค่อยแจ้งผู้จัดการ",
        "ไม่ต้องเสียเวลา กรอกฟอร์มเฉพาะกรณีที่ดูรุนแรงเท่านั้น",
        "ปฐมพยาบาลเบื้องต้น กรอกฟอร์ม Incident Report และแจ้งผู้จัดการ",
        "กรอกแบบฟอร์ม Incident Report แล้วจึงแจ้งผู้จัดการ"
      ]
    },
    correct: [2],
    icon: <ShieldAlert className="w-5 h-5" />
  },
  {
    id: 3,
    category: { en: "Communication", th: "การสื่อสาร" },
    question: { 
      en: "What is the agreed window for 'After-hours Contact' consent?", 
      th: "ช่วงเวลาที่อนุญาตให้ติดต่อนอกเวลางานคือช่วงใด?" 
    },
    options: {
      en: [
        "9am to 5pm",
        "10am to 10pm",
        "6pm to midnight",
        "24/7 availability"
      ],
      th: [
        "9:00 น. ถึง 17:00 น.",
        "10:00 น. ถึง 22:00 น.",
        "18:00 น. ถึง เที่ยงคืน",
        "สามารถติดต่อได้ตลอด 24 ชั่วโมง"
      ]
    },
    correct: [1],
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    id: 4,
    category: { en: "Attendance", th: "เวลาปฏิบัติงาน" },
    question: { 
      en: "What is the procedure for requesting leave?", 
      th: "ขั้นตอนการขอลาหยุดคืออะไร?" 
    },
    options: {
      en: [
        "Send an SMS to the manager",
        "Call manager and SMS at least 2 weeks in advance",
        "Tell a colleague to cover your shift",
        "Call the Director at appropriate time frame"
      ],
      th: [
        "ส่ง SMS หาผู้จัดการ",
        "โทรหาผู้จัดการและส่ง SMS ล่วงหน้าอย่างน้อย 2 สัปดาห์",
        "บอกเพื่อนร่วมงานให้มาทำงานแทน",
        "โทรหา Director ในช่วงเวลาที่เหมาะสม"
      ]
    },
    correct: [1],
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 5,
    category: { en: "Closing Tasks", th: "งานปิดร้าน" },
    question: { 
      en: "Which items require a photo confirmation during closing? (Select all that apply)", 
      th: "สิ่งใดที่ต้องถ่ายรูปยืนยันตอนปิดร้าน? (เลือกทุกข้อที่เกี่ยวข้อง)" 
    },
    options: {
      en: [
        "Checklist & Task list",
        "Gas / Stove / Air Conditioning",
        "Door lock / Cash control / Cash tray",
        "Staff personal belongings / Lost and Found items",
        "Kitchen faucet / Sink / Dish Washing machine",
        "Staff meals"
      ],
      th: [
        "Checklist และ Task list",
        "แก๊ส / เตา / แอร์",
        "ล็อคประตู / การคุมยอดเงิน / ถาดเงินสด",
        "ทรัพย์สินส่วนตัวของพนักงาน / ของลูกค้าที่ลืมไว้",
        "ก๊อกน้ำ / ซิงค์ล้างจาน / เครื่องล้างจาน",
        "Staff meals"
      ]
    },
    multiple: true,
    correct: [0, 1, 2, 4, 5],
    icon: <Trash2 className="w-5 h-5" />
  },
  {
    id: 6,
    category: { en: "Mobile Policy", th: "นโยบายการใช้โทรศัพท์" },
    question: { 
      en: "What happens if an employee uses a personal mobile device during working hours without a scheduled break?", 
      th: "จะเกิดอะไรขึ้นหากพนักงานใช้โทรศัพท์มือถือส่วนตัวในเวลาทำงานโดยไม่ได้แจ้งล่วงหน้า?" 
    },
    options: {
      en: [
        "I can use mobile for personal matter anytime I want",
        "The time spent will be logged as non-pay working hours",
        "If I started early, I’m going to take a moment to make some phone calls",
        "It's fine to use your phone if we're not busy"
      ],
      th: [
        "ฉันสามารถใช้โทรศัพท์ส่วนตัวตอนไหนก็ได้ตามต้องการ",
        "เวลาที่ใช้โทรศัพท์จะถูกบันทึกเป็นชั่วโมงทำงานที่ไม่ได้รับค่าจ้าง",
        "หากฉันมาทำงานเร็ว ฉันสามารถใช้โทรศัพท์ได้",
        "ใช้ได้ถ้าตอนนั้นร้านไม่ยุ่ง"
      ]
    },
    correct: [1],
    icon: <Smartphone className="w-5 h-5" />
  },
  {
    id: 7,
    category: { en: "Payment", th: "การจ่ายเงิน" },
    question: { 
      en: "When is the pay date and what is the period?", 
      th: "วันจ่ายเงินเดือนและรอบการจ่ายคือเมื่อไหร่?" 
    },
    options: {
      en: [
        "Every fortnight on Sunday night (Mon-Sun cycle)",
        "Every fortnight on Monday night (Mon-Sun cycle)",
        "Every fortnight on Tuesday night (Mon-Sun cycle)",
        "Every day after my shifts"
      ],
      th: [
        "ทุก 2 สัปดาห์ ในคืนวันอาทิตย์ (รอบ จันทร์-อาทิตย์)",
        "ทุก 2 สัปดาห์ ในคืนวันจันทร์ (รอบ จันทร์-อาทิตย์)",
        "ทุก 2 สัปดาห์ ในคืนวันอังคาร (รอบ จันทร์-อาทิตย์)",
        "จ่ายทุกวันหลังเลิกงาน"
      ]
    },
    correct: [2],
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    id: 8,
    category: { en: "Misconduct", th: "การประพฤติผิดทางวินัย" },
    question: { 
      en: "What are the consequences of serious misconduct?", 
      th: "ผลที่ตามมาของการประพฤติผิดร้ายแรงคืออะไร?" 
    },
    options: {
      en: [
        "Just apologise and promise it was a one-time mistake",
        "It's acceptable; the manager will issue a verbal warning",
        "Termination of employment and potential legal action are expected",
        "I am willing to pay for the damages and I promise it won't happen again"
      ],
      th: [
        "แค่ขอโทษและสัญญาว่าจะไม่ทำอีก",
        "เป็นเรื่องที่ยอมรับได้ ผู้จัดการจะเตือนด้วยวาจา",
        "เลิกจ้างทันทีและอาจมีการดำเนินคดีตามกฎหมาย",
        "ฉันยินดีจ่ายค่าชดเชยและสัญญาว่าจะไม่ให้เกิดขึ้นอีก"
      ]
    },
    correct: [2],
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    id: 9,
    category: { en: "Benefits", th: "สิทธิประโยชน์" },
    question: { 
      en: "What's the condition of the 30% team discount? (Select all that apply)", 
      th: "เงื่อนไขของส่วนลดทีมงาน 30% คืออะไร? (เลือกทุกข้อที่เกี่ยวข้อง)" 
    },
    options: {
      en: [
        "I can bring anyone to the restaurant and everyone gets 30% discount",
        "30% discount only applies for myself to buy any items from the restaurant",
        "My friends can enjoy this 30% discount but only they need to come with me",
        "My family can enjoy this 30% discount but only they need to come with me"
      ],
      th: [
        "ฉันสามารถพาใครมาก็ได้และทุกคนจะได้ส่วนลด 30%",
        "ส่วนลด 30% ใช้ได้เฉพาะตัวฉันเองในการซื้อสินค้าในร้าน",
        "เพื่อนของฉันใช้ส่วนลดนี้ได้ แต่ต้องมาพร้อมกับฉันเท่านั้น",
        "ครอบครัวของฉันใช้ส่วนลดนี้ได้ แต่ต้องมาพร้อมกับฉันเท่านั้น"
      ]
    },
    multiple: true,
    correct: [1, 3],
    icon: <Star className="w-5 h-5" />
  },
  {
    id: 10,
    category: { en: "Attendance", th: "เวลาปฏิบัติงาน" },
    question: { 
      en: "If my roster is on a public holiday, what should I do?", 
      th: "หากมีชื่อในตารางเวรวันหยุดนักขัตฤกษ์ คุณควรทำอย่างไร?" 
    },
    options: {
      en: [
        "It's my holiday. I can take a break without telling anyone",
        "It's my day off, but I still need to notify my absence with manager",
        "I still have to work because it's on my roster"
      ],
      th: [
        "มันเป็นวันหยุดของฉัน ฉันสามารถหยุดได้โดยไม่ต้องบอกใคร",
        "เป็นวันหยุดของฉัน แต่ฉันยังต้องแจ้งการหยุดงานกับผู้จัดการ",
        "ฉันยังคงต้องมาทำงานตามปกติเพราะมีชื่อในตารางทำงาน"
      ]
    },
    correct: [1],
    icon: <Clock className="w-5 h-5" />
  }
];

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
          <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <User className="w-3 h-3" /> First Name
          </label>
          <input 
            type="text" 
            value={userData.firstName}
            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
            placeholder="e.g. John"
            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <User className="w-3 h-3" /> Last Name
          </label>
          <input 
            type="text" 
            value={userData.lastName}
            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
            placeholder="e.g. Smith"
            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Smartphone className="w-3 h-3" /> Mobile Number
          </label>
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
        onClick={() => setStep('language')}
        className={`w-full max-w-sm flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-lg transition-all ${
          isComplete 
            ? 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        Next Step
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const LanguageSelectionScreen = ({ language, setLanguage, setStep }: LanguageSelectionProps) => {
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 max-w-lg mx-auto">
      <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mb-8">
        <Languages className="w-10 h-10 text-yellow-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">Language Selection</h2>
      <p className="text-zinc-400 text-sm mb-10 leading-relaxed italic">
        {t.langInstr}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
        <button
          onClick={() => setLanguage('en')}
          className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
            language === 'en' 
            ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/10' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <span className="text-3xl font-black">EN</span>
          <span className="font-bold">English</span>
        </button>

        <button
          onClick={() => setLanguage('th')}
          className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
            language === 'th' 
            ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/10' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <span className="text-3xl font-black">TH</span>
          <span className="font-bold">ภาษาไทย</span>
        </button>
      </div>

      <button 
        onClick={() => setStep('quiz')}
        className="w-full bg-white text-black p-4 rounded-xl font-bold text-lg hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {t.start}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const QuizScreen = ({ currentQuestion, onAnswerSubmit, showFeedback, language }: QuizScreenProps) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const q = orientationData[currentQuestion];
  const progress = ((currentQuestion + 1) / orientationData.length) * 100;
  const t = translations[language];

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
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{q.category[language]}</p>
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
        {q.question[language]}
      </h3>

      <div className="space-y-4 mb-10">
        {q.options[language].map((option, idx) => {
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
          {showFeedback !== null ? t.checking : t.submit}
        </button>
      </div>
    </div>
  );
};

const ConsentScreen = ({ userData, onFinalSubmit, isSubmitting, language }: ConsentScreenProps) => {
  const [checkedPoints, setCheckedPoints] = useState<boolean[]>([false, false, false, false, false]);
  const t = translations[language];

  const togglePoint = (idx: number) => {
    const newPoints = [...checkedPoints];
    newPoints[idx] = !newPoints[idx];
    setCheckedPoints(newPoints);
  };

  const isAllChecked = checkedPoints.every(v => v);

  const points = {
    en: [
      "I acknowledge and agree to AROI PTY LTD policies on workplace monitoring, surveillance and Search activities.",
      "I consent to be contacted outside working hours between 10am to 10pm for operational needs.",
      "I understand the strict mobile device policy and the health/safety reporting requirements.",
      "I agree that serious misconduct may lead to immediate dismissal and potential forfeiture of outstanding wages.",
      "I consent to the recording of my responses for quality and training improvement."
    ],
    th: [
      "ข้าพเจ้ารับทราบและยินยอมตามนโยบายของ AROI PTY LTD เกี่ยวกับการตรวจสอบสถานที่ทำงาน การใช้กล้องวงจรปิด และการตรวจสอบต่างๆ",
      "ข้าพเจ้ายินยอมให้ติดต่อได้นอกเวลาทำงานระหว่าง 10:00 น. ถึง 22:00 น. เพื่อความจำเป็นในการดำเนินงาน",
      "ข้าพเจ้าเข้าใจนโยบายการใช้โทรศัพท์มือถือที่เข้มงวดและข้อกำหนดในการรายงานสุขภาพและความปลอดภัย",
      "ข้าพเจ้ายอมรับว่าการประพฤติผิดร้ายแรงอาจนำไปสู่การเลิกจ้างทันทีและอาจถูกริบค่าจ้างที่ค้างจ่ายได้",
      "ข้าพเจ้ายินยอมให้บันทึกคำตอบเพื่อวัตถุประสงค์ด้านคุณภาพและการปรับปรุงการฝึกอบรม"
    ]
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 text-left">
          <ShieldAlert className="text-yellow-500" />
          {t.finalConfirm}
        </h2>
        
        <p className="text-zinc-500 text-sm mb-6 text-left italic">{t.confirmInstr}</p>

        <div className="space-y-4">
          {points[language].map((text, idx) => (
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
          <p className="text-xs text-zinc-500 mb-4 uppercase tracking-widest">{t.digitalSign}</p>
          <div className="bg-black p-4 rounded-lg border border-zinc-700 italic text-zinc-300">
            {t.signedBy}: {userData.firstName} {userData.lastName}
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">{t.mobile}: {userData.mobile} • {t.timestamp}: {new Date().toLocaleString()}</p>
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
            {t.submitting}
          </>
        ) : (
          t.finish
        )}
      </button>
    </div>
  );
};

const ResultScreen = ({ score, userData, completionCode, language }: ResultScreenProps) => {
  const passed = score >= (orientationData.length * 0.8);
  const t = translations[language];
  
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center animate-in zoom-in duration-300">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
        {passed ? <Award className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-2">
        {passed ? t.passedTitle : t.failedTitle}
      </h2>
      <p className="text-zinc-400 mb-8 max-w-xs">
        Thank you, <span className="text-white font-bold">{userData.firstName}</span>. You {t.score} {score} {t.outOf} {orientationData.length}.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm mb-8 text-left">
         <div className="flex justify-between items-center mb-4">
           <span className="text-zinc-500">Status:</span>
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${passed ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
             {passed ? t.passed : t.reviewReq}
           </span>
         </div>
         <div className="flex justify-between items-center text-sm">
           <span className="text-zinc-500">{t.completionCode}:</span>
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
              {t.support}
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
              {t.retake}
            </button>
            <a 
              href={ORIENTATION_MODULE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-4 rounded-xl font-bold hover:bg-zinc-800 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              {t.review}
            </a>
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState<StepType>('welcome');
  const [language, setLanguage] = useState<LanguageType>('en');
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
      
      const selectedOptionsText = selectedIndices.map((idx: number) => q.options.en[idx]).join(", ");
      
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
      language: language.toUpperCase(),
      ...flatQuizData // Spread the individual question columns here
    };

    await sendDataToGoogleSheet(submissionData);
    
    setIsSubmitting(false);
    setStep('result');
  };

  const t = translations[language];

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
            V 2603101615
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
        {step === 'language' && (
          <LanguageSelectionScreen 
            language={language}
            setLanguage={setLanguage}
            setStep={setStep}
          />
        )}
        {step === 'quiz' && (
          <QuizScreen 
            currentQuestion={currentQuestion} 
            onAnswerSubmit={handleAnswerSubmit} 
            showFeedback={showFeedback} 
            language={language}
          />
        )}
        {step === 'consent' && (
          <ConsentScreen 
            userData={userData} 
            onFinalSubmit={onFinalSubmit}
            isSubmitting={isSubmitting}
            language={language}
          />
        )}
        {step === 'result' && (
          <ResultScreen 
            score={score} 
            userData={userData} 
            completionCode={completionCode}
            language={language}
          />
        )}
      </main>

      {/* Footer Branding */}
      {step === 'welcome' && (
        <footer className="mt-auto p-8 border-t border-zinc-900">
           <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4 text-center">
             <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-tighter">{t.camberwell}</p>
                <p className="text-white text-[10px] font-medium uppercase">Maruay Thai</p>
             </div>
             <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-tighter">{t.frankston}</p>
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
            <><CheckCircle2 className="w-5 h-5" /> {t.correct}</>
          ) : (
            <><AlertTriangle className="w-5 h-5" /> {t.incorrect}</>
          )}
        </div>
      )}
    </div>
  );
};

export default App;