import React from 'react';
import Terminal from './components/Terminal';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#111] flex items-center justify-center p-4">
      {/* Background decoration or context can go here */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            TBO Nexus <span className="text-[#27c93f]">Copilot</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Initialize your AI Agent environment
          </p>
        </div>
        
        <Terminal />
      </div>
    </div>
  );
};

export default App;