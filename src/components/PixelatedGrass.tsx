export const PixelatedGrass = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10">
      <svg 
        width="100%" 
        height="120" 
        viewBox="0 0 1920 120" 
        preserveAspectRatio="none" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="pixelated"
      >
        <g fill="#10B981">
          {/* Dense grass pattern across the bottom */}
          {Array.from({ length: 60 }).map((_, i) => {
            const x = i * 32;
            const height = Math.random() * 40 + 60;
            const yOffset = Math.random() * 20;
            return (
              <g key={i}>
                {/* Main bush/grass shape */}
                <rect x={x} y={120 - height + yOffset} width="12" height="12"/>
                <rect x={x + 12} y={120 - height + yOffset - 12} width="12" height="12"/>
                <rect x={x + 24} y={120 - height + yOffset - 20} width="12" height="12"/>
                <rect x={x + 12} y={120 - height + yOffset - 24} width="12" height="12"/>
                <rect x={x} y={120 - height + yOffset - 12} width="12" height="12"/>
                
                {/* Fill down to bottom */}
                <rect x={x} y={120 - height + yOffset + 12} width="36" height={height - 12}/>
              </g>
            );
          })}
        </g>
        
        {/* Darker green shadows */}
        <g fill="#059669">
          {Array.from({ length: 40 }).map((_, i) => {
            const x = i * 48 + 16;
            const height = Math.random() * 30 + 40;
            return (
              <rect 
                key={`shadow-${i}`}
                x={x} 
                y={120 - height} 
                width="16" 
                height={height}
                opacity="0.6"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

