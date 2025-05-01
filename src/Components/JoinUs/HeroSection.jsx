import React from 'react';

const HeroSection = ({ isDarkMode }) => {
  const scrollToContact = () => {
    const element = document.getElementById('join-form');
    if (element) {
      const offsetPosition = element.offsetTop - 90;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative h-[600px] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://readdy.ai/api/search-image?query=modern&width=1440&height=600&seq=4&orientation=landscape&flag=04df582b92165cb06b51b627d3c0fe88)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-opacity-50"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            The Elevate Program
          </h1>
          <p className="text-lg sm:text-xl text-white mb-8">
            Transform your network into a powerful income stream. Join our exclusive affiliate program and earn substantial commissions by connecting homeowners with premium roofing solutions.
          </p>
          <button
            onClick={scrollToContact}
            className={`rounded-lg ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white px-8 py-4 text-xl font-bold transition-all cursor-pointer whitespace-nowrap`}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;