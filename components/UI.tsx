import React from 'react';
import { BrainCircuit, CheckCircle2, AlertTriangle, Wine } from 'lucide-react';

export const VisualLoader = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center gap-6 p-8 animate-fadeIn">
    <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
      {/* Rotating Rings */}
      <div className="absolute inset-0 border-4 border-gray-300/30 border-t-gray-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-2 border-4 border-gray-300/30 border-b-gray-400 rounded-full animate-spin-reverse" style={{ animationDuration: '2s' }}></div>
      <div className="absolute inset-4 border-4 border-gray-300/30 border-l-gray-600 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
      
      {/* Central Icon */}
      <div className="relative z-10 animate-pulse">
        <BrainCircuit size={32} className="text-gray-600" />
      </div>
    </div>
    
    <div className="space-y-2 text-center">
      <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-600 uppercase animate-pulse">
        {message}
      </p>
      <div className="flex justify-center gap-1">
         <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
         <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
         <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export const ConcreteOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply" 
       style={{
         backgroundImage: `url("https://www.transparenttextures.com/patterns/concrete-wall-2.png")`,
         backgroundSize: '400px 400px'
       }}>
  </div>
);

export const NoiseOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.08] mix-blend-overlay" 
       style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}>
  </div>
);

export const LightingOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 mix-blend-soft-light"></div>
);

export const GlitchOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-50 animate-glitch mix-blend-difference bg-white/5"></div>
);

export const GlitchBorder = () => (
  <div className="absolute -inset-[1px] pointer-events-none rounded-sm z-0">
    <div className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-gray-300/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
  </div>
);

export const CheersOverlay = () => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn pointer-events-none">
    <div className="relative flex flex-col items-center">
      <div className="flex gap-4">
        <Wine className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-clink-left" strokeWidth={1.5} />
        <Wine className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-clink-right -scale-x-100" strokeWidth={1.5} />
      </div>
      <h2 className="text-4xl md:text-6xl font-bold text-white tracking-[0.5em] mt-8 animate-zoom-in drop-shadow-md">
        CHEERS
      </h2>
    </div>
  </div>
);

export const ArchitecturalCard: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = "" }) => (
    <div className={`relative bg-[#e0e0e0]/80 backdrop-blur-md p-6 md:p-8 rounded-sm border border-white/40 shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] ${className}`}>
      <div className="absolute inset-0 border-[0.5px] border-gray-400/20 pointer-events-none rounded-sm m-1"></div>
      {children}
    </div>
);

export const ArchitecturalButton: React.FC<{children: React.ReactNode, onClick: () => void, disabled?: boolean, className?: string, variant?: 'primary' | 'secondary' | 'disabled'}> = ({ children, onClick, disabled, className = "", variant = "primary" }) => {
    const baseStyle = "relative overflow-hidden group transition-all duration-300 rounded-sm font-bold tracking-[0.2em] text-xs md:text-sm flex items-center justify-center gap-2 py-3 px-4 active:scale-[0.98]";
    const variants = {
      primary: `bg-[#4a4a4a] text-[#e0e0e0] hover:bg-[#3a3a3a] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-inner border border-[#3a3a3a]`,
      secondary: `bg-[#e0e0e0] text-[#4a4a4a] hover:bg-[#d4d4d4] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-inner border border-white/50`,
      disabled: `bg-transparent text-gray-400 cursor-not-allowed border border-dashed border-gray-400 shadow-none`
    };

    return (
      <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${disabled ? variants.disabled : variants[variant]} ${className}`}>
        <span className="relative z-10">{children}</span>
        {!disabled && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
      </button>
    );
};

export const NotificationToast = ({ notification }: { notification: {msg: string, type: 'success'|'error'} }) => (
    <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-[200] w-full max-w-sm px-4 toast-enter pointer-events-none">
        <div className={`p-4 rounded-sm shadow-[8px_8px_16px_rgba(0,0,0,0.15)] border border-white/60 backdrop-blur-xl flex items-center gap-3 ${notification.type === 'success' ? 'bg-[#e0e0e0]/95 text-green-900' : 'bg-red-100/95 text-red-900'}`}>
            {notification.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertTriangle size={18} className="shrink-0" />}
            <span className="text-xs font-bold tracking-wider leading-relaxed">{notification.msg}</span>
        </div>
    </div>
);

export const BaseContainer: React.FC<{children: React.ReactNode, className?: string, glitchEffect: boolean, isFadingOut: boolean, isLoadingAI: boolean, notification: {msg: string, type: 'success'|'error'} | null }> = ({ children, className = "", glitchEffect, isFadingOut, isLoadingAI, notification }) => {
    const fontStyle = {
      fontFamily: '"I.Ming Variant", "I.Ming", "PMingLiU", "Noto Serif TC", "Songti SC", serif',
    };
    
    return (
      <div className={`min-h-screen bg-[#d4d4d4] text-[#4a4a4a] relative overflow-x-hidden selection:bg-gray-300 ${className}`} style={fontStyle}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes fadeOutToBlack { from { opacity: 0; } to { opacity: 1; } }
          @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); } to { transform: rotate(0deg); }
          }
          @keyframes clink-left {
            0% { transform: translateX(-50px) rotate(-15deg); opacity: 0; }
            50% { transform: translateX(0) rotate(0deg); opacity: 1; }
            70% { transform: rotate(10deg); }
            100% { transform: translateX(0) rotate(0deg); opacity: 1; }
          }
          @keyframes clink-right {
            0% { transform: translateX(-50px) rotate(-15deg) scaleX(-1); opacity: 0; }
            50% { transform: translateX(0) rotate(0deg) scaleX(-1); opacity: 1; }
            70% { transform: rotate(10deg) scaleX(-1); }
            100% { transform: translateX(0) rotate(0deg) scaleX(-1); opacity: 1; }
          }
          @keyframes zoom-in {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-spin-reverse { animation: spin-reverse linear infinite; }
          .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fadeOutToBlack { animation: fadeOutToBlack 2s ease-in-out forwards; }
          .animate-glitch { animation: glitch 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
          .animate-shimmer { background-size: 200% 100%; animation: shimmer 2s infinite linear; }
          .animate-clink-left { animation: clink-left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          .animate-clink-right { animation: clink-right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          .animate-zoom-in { animation: zoom-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          .scrollbar-thin::-webkit-scrollbar { width: 6px; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #a0a0a0; border-radius: 3px; }
          .scrollbar-track-transparent::-webkit-scrollbar-track { background-color: transparent; }
          
          .hazatic-image {
            filter: grayscale(100%) contrast(1.1) brightness(0.95);
            transition: filter 0.5s ease, transform 0.5s ease;
          }
          .hazatic-image:hover {
            filter: grayscale(0%) contrast(1) brightness(1);
            transform: scale(1.05);
          }
  
          .toast-enter {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}</style>
        <ConcreteOverlay />
        <NoiseOverlay />
        <LightingOverlay />
        {glitchEffect && <GlitchOverlay />}
        
        {isFadingOut && (
          <div className="fixed inset-0 bg-black z-[100] animate-fadeOutToBlack pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/50 font-mono text-xs tracking-[0.5em] animate-pulse">SAVING SYSTEM DATA...</p>
              </div>
          </div>
        )}
  
        {isLoadingAI && (
            <div className="fixed inset-0 z-50 bg-[#d4d4d4]/90 backdrop-blur-sm flex items-center justify-center">
              <VisualLoader message="PROCESSING DATA..." />
            </div>
        )}
  
        {children}

        {notification && <NotificationToast notification={notification} />}
      </div>
    );
  };