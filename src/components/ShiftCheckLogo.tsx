/**
 * ShiftCheckLogo Component
 *
 * Renders the ShiftCheck camera icon logo with optional text.
 * Used on auth pages and other branded sections.
 */

interface ShiftCheckLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
}

export default function ShiftCheckLogo({
  size = 'md',
  showText = true,
  showTagline = false
}: ShiftCheckLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Camera Icon */}
      <div className={sizeClasses[size]}>
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          {/* Camera top (flash/viewfinder) */}
          <rect x="70" y="30" width="60" height="25" rx="8" fill="#435b20" />
          {/* Camera body */}
          <rect x="30" y="50" width="140" height="110" rx="15" fill="#6c8f32" />
          {/* Lens circle (white) */}
          <circle cx="100" cy="105" r="45" fill="#ffffff" />
          {/* Checkmark */}
          <path
            d="M 75 105 L 92 122 L 125 85"
            stroke="#6c8f32"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Flash dot */}
          <circle cx="150" cy="75" r="8" fill="#C55E30" />
        </svg>
      </div>

      {/* ShiftCheck Text */}
      {showText && (
        <h1 className={`${textSizes[size]} font-extrabold mt-2`}>
          <span className="text-accent-500">Shift</span>
          <span className="text-primary-700">Check</span>
        </h1>
      )}

      {/* Tagline */}
      {showTagline && (
        <p className="text-sm font-bold text-primary-700 tracking-wide mt-1">
          Proof, not promises.
        </p>
      )}
    </div>
  );
}
