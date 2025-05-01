import React from 'react';

const HowItWorksSection = ({ isDarkMode }) => {
  return (
    <div className={`py-12 sm:py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div className="container mx-auto px-4 overflow-hidden">
        <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          How It Works
        </h2>
        <div className="max-w-6xl mx-auto space-y-32">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 text-center sm:text-left">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  1
                </div>
                <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sign Up</h3>
              </div>
              <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-center sm:text-left`}>
                Begin your journey by scheduling a personalized call with our dedicated sales team. We'll walk you through the program details, answer your questions, and ensure you have everything needed to get started successfully.
              </p>
            </div>
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden h-60 sm:h-80 w-full">
                <img
                  src="https://public.readdy.ai/ai/img_res/22ddcb9f343f62d6a76cfa81f10fe222.jpg"
                  alt="Sign Up Process"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 md:flex-row-reverse">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 text-center sm:text-left">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  2
                </div>
                <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Training</h3>
              </div>
              <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-center sm:text-left`}>
                Access our comprehensive training modules designed to set you up for success. Learn about our products, sales techniques, and best practices through interactive sessions and real-world examples.
              </p>
            </div>
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden h-60 sm:h-80 w-full">
                <img
                  src="https://public.readdy.ai/ai/img_res/7f5d1eaf73d7b32306b2a8d1e61059fb.jpg"
                  alt="Training Process"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 text-center sm:text-left">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  3
                </div>
                <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Start Referring</h3>
              </div>
              <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-center sm:text-left`}>
                Put your training into action by connecting with homeowners who need exterior services. We'll provide you with all the tools and support needed to identify and refer qualified prospects.
              </p>
            </div>
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden h-60 sm:h-80 w-full">
                <img
                  src="https://public.readdy.ai/ai/img_res/a16b5c80db5e7adbfdf4fe1280524b2a.jpg"
                  alt="Referral Process"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 md:flex-row-reverse">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 text-center sm:text-left">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  4
                </div>
                <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Get Paid</h3>
              </div>
              <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-center sm:text-left`}>
                Earn competitive commissions for every successful referral. Track your referrals, monitor progress, and manage your earnings through our user-friendly portal. The more you refer, the more you earn!
              </p>
            </div>
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden h-60 sm:h-80 w-full">
                <img
                  src="https://public.readdy.ai/ai/img_res/5870b844cb389de15c063e69cebf1a4e.jpg"
                  alt="Payment Process"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;