import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';

// --- Types ---
type LineType = 'system' | 'user';

interface TerminalLine {
  id: string;
  type: LineType;
  text: string;
}

// --- Constants ---
const PROMPTS = [
  "Enter Github Repository Link",
  "Enter Team Name",
  "Enter Team Leader Name"
];

const SYSTEM_COLOR = "text-[#27c93f]"; // Python green
const USER_COLOR = "text-white";
const TYPING_SPEED = 40; // ms per char

const Terminal: React.FC = () => {
  // --- State ---
  // History of fully committed lines
  const [history, setHistory] = useState<TerminalLine[]>([]);
  
  // Current interaction state
  // 0: System typing prompt 1
  // 1: User typing input 1
  // 2: System typing prompt 2
  // 3: User typing input 2
  // 4: System typing prompt 3
  // 5: User typing input 3
  // 6: All done, button enabled
  const [step, setStep] = useState<number>(0);
  
  // Content currently being typed (either by system auto-type or user)
  const [currentText, setCurrentText] = useState<string>("");
  
  // Data collected
  const [repoLink, setRepoLink] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [leaderName, setLeaderName] = useState<string>("");
  
  // UI States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false); // Is system currently auto-typing?

  // --- Refs ---
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Effects ---

  // Auto-scroll on changes
  useEffect(() => {
    scrollToBottom();
  }, [history, currentText, step]);

  // Focus hidden input when it's user's turn
  useEffect(() => {
    if (step % 2 !== 0 && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, isLoading]);

  // Handle System Auto-Typing
  useEffect(() => {
    // Check if it's a system step (0, 2, 4)
    if (step % 2 === 0 && step < 6) {
      setIsTyping(true);
      const promptIndex = step / 2;
      const targetText = PROMPTS[promptIndex];
      let charIndex = 0;
      setCurrentText(""); // Reset current text line

      const intervalId = setInterval(() => {
        if (charIndex < targetText.length) {
          setCurrentText((prev) => prev + targetText.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
          // Move to user input step immediately after typing finishes? 
          // Requirements say: "After typing completes: Show blinking cursor on next line."
          // But usually the cursor stays on the SAME line for the input in a terminal prompt style 
          // OR the prompt is a question, and answer is on next line.
          // Based on "Show blinking cursor on next line" instruction:
          // We commit the system prompt to history, then switch to user step.
          
          setTimeout(() => {
            setHistory(prev => [
              ...prev,
              { id: Date.now().toString(), type: 'system', text: targetText }
            ]);
            setCurrentText(""); // Clear for user input
            setStep(prev => prev + 1);
          }, 300); // Slight pause before allowing input
        }
      }, TYPING_SPEED);

      return () => clearInterval(intervalId);
    }
  }, [step]);

  // --- Handlers ---

  const handleUserInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (step % 2 !== 0) {
      setCurrentText(e.target.value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isTyping && currentText.trim().length > 0) {
      // Commit user answer
      const val = currentText.trim();
      
      // Save data based on step
      if (step === 1) setRepoLink(val);
      if (step === 3) setTeamName(val);
      if (step === 5) setLeaderName(val);

      setHistory(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', text: val }
      ]);
      
      setCurrentText("");
      setStep(prev => prev + 1);
    }
  };

  const handleContainerClick = () => {
    if (step % 2 !== 0 && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRunAgent = () => {
    if (step === 6 && repoLink && teamName && leaderName) {
      setIsLoading(true);
      // Simulate loading for demo purposes
      setTimeout(() => {
        // Here you would typically trigger the actual agent or navigation
        console.log("Agent Started", { repoLink, teamName, leaderName });
        // We leave it loading to match the requirement "Show full-screen loading overlay"
      }, 3000);
    }
  };

  const isButtonEnabled = step === 6 && !isLoading && repoLink !== "" && teamName !== "" && leaderName !== "";

  // --- Render Helpers ---

  // Renders the history lines
  const renderHistory = () => {
    return history.map((line) => (
      <div key={line.id} className="mb-2 break-all">
        <span className={line.type === 'system' ? SYSTEM_COLOR : USER_COLOR}>
           {line.type === 'system' ? '> ' : '$ '}
           {line.text}
        </span>
      </div>
    ));
  };

  // Renders the current active line (System typing or User typing)
  const renderActiveLine = () => {
    if (step >= 6) return null; // Interaction done

    const isSystemStep = step % 2 === 0;
    
    return (
      <div className="flex flex-wrap items-center">
        <span className={`${isSystemStep ? SYSTEM_COLOR : USER_COLOR} mr-2`}>
          {isSystemStep ? '> ' : '$ '}
        </span>
        <span className={isSystemStep ? SYSTEM_COLOR : USER_COLOR}>
          {currentText}
        </span>
        {/* Cursor */}
        <span className="inline-block w-2.5 h-5 bg-white ml-1 cursor-blink align-middle"></span>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[700px] mx-auto">
      {/* Container */}
      <div 
        className="bg-black rounded-[20px] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col w-full h-[500px] border border-[#1a1a1a]"
        onClick={handleContainerClick}
        ref={containerRef}
      >
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0d0d0d] border-b border-[#222] select-none">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>

          {/* Run Agent Button */}
          <button
            onClick={handleRunAgent}
            disabled={!isButtonEnabled}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
              ${isButtonEnabled 
                ? 'bg-[#1a1a1a] text-white cursor-pointer border border-[#333] hover:border-[#27c93f] hover:shadow-[0_0_15px_rgba(39,201,63,0.4)] hover:text-[#27c93f]' 
                : 'bg-[#111] text-gray-500 cursor-not-allowed border border-[#222] opacity-60'}
            `}
          >
            {/* Play Icon */}
            <svg 
              className={`w-3 h-3 ${isButtonEnabled ? 'fill-current' : 'fill-gray-600'}`} 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Run Agent
          </button>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-base md:text-lg relative scrollbar-hide">
          
          {/* History Lines */}
          {renderHistory()}
          
          {/* Active Line */}
          {renderActiveLine()}

          {/* Hidden Input for capturing keystrokes on desktop & mobile */}
          {step % 2 !== 0 && !isLoading && (
            <input
              ref={inputRef}
              type="text"
              value={currentText}
              onChange={handleUserInputChange}
              onKeyDown={handleKeyDown}
              className="absolute opacity-0 top-0 left-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              autoFocus
            />
          )}

          {/* Scroll Anchor */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 rounded-[20px] flex flex-col items-center justify-center animate-fade-in">
          <div className="w-12 h-12 border-2 border-t-transparent border-white rounded-full animate-spin-slow mb-4"></div>
          <span className="text-white font-mono text-sm tracking-widest uppercase opacity-80">Loading</span>
        </div>
      )}
    </div>
  );
};

export default Terminal;