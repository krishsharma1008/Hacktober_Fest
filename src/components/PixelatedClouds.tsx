export const PixelatedClouds = () => {
  return (
    <>
      {/* Top Left Cloud */}
      <div className="absolute top-8 left-8 opacity-90 pixelated animate-float">
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#E0E7FF">
            <rect x="20" y="24" width="8" height="8"/>
            <rect x="28" y="16" width="8" height="8"/>
            <rect x="36" y="8" width="8" height="8"/>
            <rect x="44" y="8" width="8" height="8"/>
            <rect x="52" y="16" width="8" height="8"/>
            <rect x="60" y="24" width="8" height="8"/>
            <rect x="12" y="24" width="8" height="8"/>
            <rect x="68" y="24" width="8" height="8"/>
            <rect x="20" y="32" width="48" height="8"/>
          </g>
        </svg>
      </div>

      {/* Top Right Cloud */}
      <div className="absolute top-12 right-12 opacity-80 pixelated" style={{ animationDelay: '1s' }}>
        <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#E0E7FF">
            <rect x="24" y="32" width="8" height="8"/>
            <rect x="32" y="24" width="8" height="8"/>
            <rect x="40" y="16" width="8" height="8"/>
            <rect x="48" y="12" width="8" height="8"/>
            <rect x="56" y="12" width="8" height="8"/>
            <rect x="64" y="16" width="8" height="8"/>
            <rect x="72" y="24" width="8" height="8"/>
            <rect x="80" y="32" width="8" height="8"/>
            <rect x="16" y="32" width="8" height="8"/>
            <rect x="88" y="32" width="8" height="8"/>
            <rect x="24" y="40" width="64" height="8"/>
          </g>
        </svg>
      </div>

      {/* Middle Left Cloud */}
      <div className="absolute top-1/3 left-4 opacity-70 pixelated animate-float" style={{ animationDelay: '2s' }}>
        <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#C7D2FE">
            <rect x="16" y="16" width="6" height="6"/>
            <rect x="22" y="10" width="6" height="6"/>
            <rect x="28" y="6" width="6" height="6"/>
            <rect x="34" y="10" width="6" height="6"/>
            <rect x="40" y="16" width="6" height="6"/>
            <rect x="10" y="16" width="6" height="6"/>
            <rect x="46" y="16" width="6" height="6"/>
            <rect x="16" y="22" width="30" height="6"/>
          </g>
        </svg>
      </div>

      {/* Middle Right Cloud */}
      <div className="absolute top-1/2 right-8 opacity-75 pixelated" style={{ animationDelay: '0.5s' }}>
        <svg width="90" height="45" viewBox="0 0 90 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#DDD6FE">
            <rect x="20" y="28" width="8" height="8"/>
            <rect x="28" y="20" width="8" height="8"/>
            <rect x="36" y="12" width="8" height="8"/>
            <rect x="44" y="8" width="8" height="8"/>
            <rect x="52" y="12" width="8" height="8"/>
            <rect x="60" y="20" width="8" height="8"/>
            <rect x="68" y="28" width="8" height="8"/>
            <rect x="12" y="28" width="8" height="8"/>
            <rect x="76" y="28" width="8" height="8"/>
            <rect x="20" y="36" width="56" height="8"/>
          </g>
        </svg>
      </div>

      {/* Small Top Center Cloud */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 opacity-60 pixelated animate-float" style={{ animationDelay: '1.5s' }}>
        <svg width="50" height="28" viewBox="0 0 50 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#E0E7FF">
            <rect x="12" y="14" width="6" height="6"/>
            <rect x="18" y="8" width="6" height="6"/>
            <rect x="24" y="8" width="6" height="6"/>
            <rect x="30" y="14" width="6" height="6"/>
            <rect x="6" y="14" width="6" height="6"/>
            <rect x="36" y="14" width="6" height="6"/>
            <rect x="12" y="20" width="24" height="6"/>
          </g>
        </svg>
      </div>
    </>
  );
};

