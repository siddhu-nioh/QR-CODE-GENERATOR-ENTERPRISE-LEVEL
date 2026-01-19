import React from 'react';

const TrustedByMarquee = () => {
  const companyLogos = [
    { name: 'Google', color: 'text-blue-300' },
    { name: 'Apple', color: 'text-gray-300' },
    { name: 'Microsoft', color: 'text-blue-300' },
    { name: 'Amazon', color: 'text-yellow-300' },
    { name: 'Netflix', color: 'text-red-300' },
    { name: 'Spotify', color: 'text-green-300' },
    { name: 'Adobe', color: 'text-red-300' },
    { name: 'Slack', color: 'text-purple-300' },
    { name: 'Zoom', color: 'text-blue-300' },
    { name: 'Shopify', color: 'text-green-300' },
    { name: 'Airbnb', color: 'text-pink-300' },
    { name: 'Uber', color: 'text-black' },
  ];

  // Duplicate for seamless loop
  const duplicatedLogos = [...companyLogos, ...companyLogos, ...companyLogos];

  return (
    <section className="py-12 bg-gradient-to-b from-transparent to-primary/5 overflow-hidden">
      <div className="container mx-auto px-0 md:px-0 lg:px-0">
        <div className="max-w-full mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8 tracking-widest uppercase">
            TRUSTED BY LEADING BRANDS WORLDWIDE
          </p>
          
          {/* Marquee Container */}
          <div className="relative overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
            
            {/* First marquee row */}
            <div className="flex mb-4 animate-marquee">
              {duplicatedLogos.map((logo, idx) => (
                <div 
                  key={`top-${idx}`} 
                  className="flex-shrink-0 mx-4 px-6 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className={`font-bold text-lg tracking-tight ${logo.color}`}>
                    {logo.name}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Second marquee row (reverse direction) */}
            <div className="flex animate-marquee-reverse">
              {duplicatedLogos.slice().reverse().map((logo, idx) => (
                <div 
                  key={`bottom-${idx}`} 
                  className="flex-shrink-0 mx-4 px-6 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className={`font-bold text-lg tracking-tight ${logo.color}`}>
                    {logo.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default TrustedByMarquee;