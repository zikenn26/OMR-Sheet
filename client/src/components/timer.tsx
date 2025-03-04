import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  timeLimit: number;
  onTimeUp: () => void;
}

export default function Timer({ timeLimit, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={cn(
      "flex items-center space-x-2 text-lg font-mono",
      timeLeft < 300 && "text-destructive animate-pulse"
    )}>
      <Clock className="h-5 w-5" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
