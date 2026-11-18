interface AutoSenseLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function AutoSenseLogo({ size = 'md', showWordmark = true }: AutoSenseLogoProps) {
  const dim = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <div className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dim} shrink-0`}
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="9" fill="#0F172A" stroke="#1E3A8A" strokeWidth="1.5" />
        <path
          d="M8.5 23.5L13.2 12.2C13.6 11.2 14.5 10.6 15.6 10.6H20.4C21.5 10.6 22.4 11.2 22.8 12.2L27.5 23.5"
          stroke="#F8FAFC"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.2 19.2H15.2L16.8 15.8L19.4 22.2L21.2 19.2H24.8"
          stroke="#3B82F6"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className={`font-display font-bold tracking-tight text-white ${textSize}`}>
          Auto<span className="text-blue-400">Sense</span>
        </span>
      )}
    </div>
  );
}
