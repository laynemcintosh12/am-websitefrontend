import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const HeroSection = () => {
  const { isDarkMode } = useDarkMode();

  const scrollToContact = () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      const headerOffset = 96; // Adjust this value based on your header height
      const elementPosition = contactForm.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="pt-24 relative">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://public.readdy.ai/ai/img_res/04b6d15fcecd7fd816f16d2cc98d0319.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-32 relative">
        <div className="max-w-3xl text-white">
          <h1 className="text-6xl font-light mb-8 leading-tight">Complete Home Exterior Solutions</h1>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-award text-yellow-400 mr-2"></i>
                Why Choose Us
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-400 mr-2 mt-1"></i>
                  <span>Combined 25+ Years of Industry Experience</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-400 mr-2 mt-1"></i>
                  <span>A+ Rating on Better Business Bureau</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-400 mr-2 mt-1"></i>
                  <span>Owens Corning Certified Preferred Contractor</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-shield-alt text-blue-400 mr-2"></i>
                Our Guarantees
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-400 mr-2 mt-1"></i>
                  <span>Insurance Claims Assistance</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-400 mr-2 mt-1"></i>
                  <span>Lifetime Workmanship Warranty</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-400 mr-2 mt-1"></i>
                  <span>24/7 Emergency Service Available</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg mb-8 border border-white/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-tools text-orange-400 mr-2"></i>
              Our Process
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-clipboard-check text-xl"></i>
                </div>
                <h3 className="font-semibold mb-2">Free Inspection</h3>
                <p className="text-sm text-gray-200">Thorough evaluation of your property</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-file-contract text-xl"></i>
                </div>
                <h3 className="font-semibold mb-2">Custom Plan</h3>
                <p className="text-sm text-gray-200">Detailed proposal and insurance help</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-hammer text-xl"></i>
                </div>
                <h3 className="font-semibold mb-2">Expert Execution</h3>
                <p className="text-sm text-gray-200">Professional installation & cleanup</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={scrollToContact}
              className="bg-orange-600 text-white px-8 py-4 text-lg !rounded-button hover:bg-orange-700 transition-colors whitespace-nowrap flex items-center"
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Schedule Free Inspection
            </button>
            <button className="bg-white/20 backdrop-blur-md text-white px-8 py-4 text-lg !rounded-button hover:bg-white/30 transition-colors whitespace-nowrap flex items-center">
              <i className="fas fa-phone-alt mr-2"></i>
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;