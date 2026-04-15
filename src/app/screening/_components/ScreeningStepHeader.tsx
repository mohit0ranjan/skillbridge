type ScreeningStepHeaderProps = {
  current: 1 | 2 | 3;
};

const steps = [
  { id: 1, label: "Apply" },
  { id: 2, label: "Test" },
  { id: 3, label: "Result" },
] as const;

export default function ScreeningStepHeader({ current }: ScreeningStepHeaderProps) {
  return (
    <div className="mb-7">
      <div className="mt-4 flex items-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isActive = step.id === current;
          const isPast = step.id < current;
          const dotClass = isActive
            ? "border-green-500 bg-green-50 text-green-700"
            : isPast
              ? "border-gray-300 bg-gray-100 text-gray-700"
              : "border-gray-300 bg-white text-gray-500";

          return (
            <div key={step.id} className="flex items-center gap-2 sm:gap-3">
              <div className={`h-8 w-8 rounded-full border text-xs font-bold flex items-center justify-center ${dotClass}`}>
                {step.id}
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && <div className="h-px w-5 sm:w-10 bg-gray-300" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
