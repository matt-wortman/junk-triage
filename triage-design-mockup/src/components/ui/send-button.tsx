import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Send } from 'lucide-react';

interface SendButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function SendButton({ onClick, children = 'Send', className = '' }: SendButtonProps) {
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Animate the send icon flying away and returning
    await controls.start({
      x: [0, -8, '50vw', '-50vw', 0],
      y: [0, 8, '-50vh', '50vh', 0],
      transition: {
        times: [0, 0.2, 0.5, 0.5, 1],
        duration: 1.1,
        ease: 'easeInOut'
      }
    });

    setIsAnimating(false);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isAnimating}
      className={`
        relative flex items-center
        bg-transparent border-none
        rounded-full
        text-2xl font-medium
        cursor-pointer
        transition-transform duration-400 ease-out
        disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        color: '#353535',
        boxShadow: '9px 9px 16px 0px #a3b1c6, -9px -9px 16px 0px rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Text */}
      <span className="h-[4.5rem] px-4 pl-8 flex items-center">
        {children}
      </span>

      {/* Icon Container */}
      <span
        className="
          flex items-center justify-center
          w-[4.5rem] h-[4.5rem]
          rounded-full
          overflow-hidden
        "
        style={{
          boxShadow: '9px 9px 16px 0px #a3b1c6, -9px -9px 16px 0px rgba(255, 255, 255, 0.6)',
        }}
      >
        <motion.div
          animate={controls}
          className="flex items-center justify-center"
        >
          <Send className="w-8 h-8" />
        </motion.div>
      </span>
    </button>
  );
}
