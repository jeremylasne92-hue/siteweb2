import { Check } from 'lucide-react';

interface StepProgressProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}

export function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
    return (
        <div className="mb-10 mt-2">
            <div className="flex items-center justify-between relative">
                {/* Background Track */}
                <div className="absolute left-0 top-1/2 h-0.5 w-full bg-white/10 -z-10 -translate-y-1/2 rounded-full"></div>

                {/* Active Progress Track */}
                <div
                    className="absolute left-0 top-1/2 h-0.5 bg-echo-gold -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>

                {Array.from({ length: totalSteps }).map((_, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <div key={stepNum} className="flex flex-col items-center relative">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 ${isActive
                                        ? 'bg-echo-gold/20 border-echo-gold text-echo-gold shadow-[0_0_12px_rgba(255,215,0,0.3)] scale-110'
                                        : isCompleted
                                            ? 'bg-echo-gold border-echo-gold text-black'
                                            : 'bg-echo-darker border-white/20 text-white/50'
                                    }`}
                            >
                                {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNum}
                            </div>
                            {labels && labels[i] && (
                                <span className={`text-[10px] sm:text-xs mt-3 absolute -bottom-7 whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-echo-gold font-medium' : isCompleted ? 'text-white/80' : 'text-white/30'
                                    }`}>
                                    {labels[i]}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            {labels && <div className="h-4"></div>}
        </div>
    );
}
