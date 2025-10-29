interface PumpkinIconProps {
  className?: string;
  size?: number;
}

export const PumpkinIcon = ({ className = "", size = 48 }: PumpkinIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pixelated ${className}`}
    >
      {/* Stem */}
      <g fill="#059669">
        <rect x="28" y="4" width="8" height="4"/>
        <rect x="28" y="8" width="8" height="4"/>
        <rect x="24" y="8" width="4" height="4"/>
      </g>
      
      {/* Pumpkin body - Orange */}
      <g fill="#FF6B00">
        {/* Top row */}
        <rect x="20" y="12" width="8" height="4"/>
        <rect x="28" y="12" width="8" height="4"/>
        <rect x="36" y="12" width="8" height="4"/>
        
        {/* Second row */}
        <rect x="16" y="16" width="8" height="4"/>
        <rect x="24" y="16" width="8" height="4"/>
        <rect x="32" y="16" width="8" height="4"/>
        <rect x="40" y="16" width="8" height="4"/>
        
        {/* Third row */}
        <rect x="12" y="20" width="8" height="4"/>
        <rect x="20" y="20" width="8" height="4"/>
        <rect x="28" y="20" width="8" height="4"/>
        <rect x="36" y="20" width="8" height="4"/>
        <rect x="44" y="20" width="8" height="4"/>
        
        {/* Middle rows - widest part */}
        <rect x="12" y="24" width="8" height="4"/>
        <rect x="20" y="24" width="8" height="4"/>
        <rect x="28" y="24" width="8" height="4"/>
        <rect x="36" y="24" width="8" height="4"/>
        <rect x="44" y="24" width="8" height="4"/>
        
        <rect x="12" y="28" width="8" height="4"/>
        <rect x="20" y="28" width="8" height="4"/>
        <rect x="28" y="28" width="8" height="4"/>
        <rect x="36" y="28" width="8" height="4"/>
        <rect x="44" y="28" width="8" height="4"/>
        
        <rect x="12" y="32" width="8" height="4"/>
        <rect x="20" y="32" width="8" height="4"/>
        <rect x="28" y="32" width="8" height="4"/>
        <rect x="36" y="32" width="8" height="4"/>
        <rect x="44" y="32" width="8" height="4"/>
        
        {/* Lower rows - narrowing */}
        <rect x="12" y="36" width="8" height="4"/>
        <rect x="20" y="36" width="8" height="4"/>
        <rect x="28" y="36" width="8" height="4"/>
        <rect x="36" y="36" width="8" height="4"/>
        <rect x="44" y="36" width="8" height="4"/>
        
        <rect x="16" y="40" width="8" height="4"/>
        <rect x="24" y="40" width="8" height="4"/>
        <rect x="32" y="40" width="8" height="4"/>
        <rect x="40" y="40" width="8" height="4"/>
        
        <rect x="20" y="44" width="8" height="4"/>
        <rect x="28" y="44" width="8" height="4"/>
        <rect x="36" y="44" width="8" height="4"/>
        
        <rect x="24" y="48" width="8" height="4"/>
        <rect x="32" y="48" width="8" height="4"/>
      </g>
      
      {/* Jack-o'-lantern face - Happy */}
      <g fill="#1F1F1F">
        {/* Left eye - friendly triangle */}
        <rect x="22" y="24" width="4" height="4"/>
        <rect x="26" y="20" width="4" height="4"/>
        <rect x="22" y="20" width="4" height="4"/>
        
        {/* Right eye - friendly triangle */}
        <rect x="38" y="24" width="4" height="4"/>
        <rect x="34" y="20" width="4" height="4"/>
        <rect x="38" y="20" width="4" height="4"/>
        
        {/* Happy curved smile using stepped pixels */}
        <rect x="20" y="38" width="4" height="4"/>
        <rect x="24" y="40" width="4" height="4"/>
        <rect x="28" y="42" width="4" height="4"/>
        <rect x="32" y="42" width="4" height="4"/>
        <rect x="36" y="40" width="4" height="4"/>
        <rect x="40" y="38" width="4" height="4"/>
      </g>
      
      {/* Highlights - lighter orange */}
      <g fill="#FFA500" opacity="0.6">
        <rect x="16" y="20" width="4" height="4"/>
        <rect x="20" y="24" width="4" height="4"/>
        <rect x="16" y="28" width="4" height="4"/>
      </g>
    </svg>
  );
};


