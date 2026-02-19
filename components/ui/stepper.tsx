import { cn } from "@/lib/utils";
import React from "react";

export interface Step {
    title: string;
    value: string;
    icon: React.ElementType;
}

interface StepperProps {
    steps: Step[];
    currentStep: string;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    const currentStepIndex = steps.findIndex((step) => step.value === currentStep);

    return (
        <div className={cn("flex w-full justify-between select-none", className)}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.value} className={cn("relative flex flex-col items-center flex-1")}>
                        {/* Connector Line */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "absolute top-6 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-[2px] -z-10 transition-colors duration-200",
                                    index <= currentStepIndex ? "bg-black" : "bg-gray-200"
                                )
                                }
                            />
                        )}

                        {/* Icon Circle */}
                        <div
                            className={cn(
                                "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200",
                                isActive || isCompleted
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 bg-white text-gray-400"
                            )}
                        >
                            <step.icon className="h-5 w-5" />
                        </div>

                        {/* Title */}
                        <span
                            className={cn(
                                "mt-2 text-sm font-medium",
                                isActive || isCompleted ? "text-black" : "text-gray-500"
                            )}
                        >
                            {step.title}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
