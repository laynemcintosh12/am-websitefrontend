import React from 'react';
import HeroSection from '../Components/JoinUs/HeroSection';
import BenefitsSection from '../Components/JoinUs/BenefitsSection';
import IdealCandidatesSection from '../Components/JoinUs/IdealCandidatesSection';
import HowItWorksSection from '../Components/JoinUs/HowItWorksSection';
import ContactFormSection from '../Components/JoinUs/ContactFormSection';
import { useDarkMode } from '../contexts/DarkModeContext';

const JoinUs = () => {
  const { isDarkMode } = useDarkMode();
  
  const benefits = [
    {
      icon: 'fa-clock',
      title: 'Flexible Schedule',
      description: 'Work whenever you want - no mandatory hours or schedules to follow',
    },
    {
      icon: 'fa-dollar-sign',
      title: 'Performance-Based Income',
      description: 'Earn substantial commissions for every successful referral',
    },
    {
      icon: 'fa-shield-alt',
      title: 'Risk-Free Earnings',
      description: 'Get paid when we succeed - no upfront costs or investments',
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description: 'Access to round-the-clock support for all your questions',
    },
    {
      icon: 'fa-graduation-cap',
      title: 'Comprehensive Training',
      description: 'Get expert training to maximize your success',
    },
    {
      icon: 'fa-tools',
      title: 'Exclusive Resources',
      description: 'Access premium marketing materials and sales tools',
    },
  ];
  
  const idealCandidates = [
    {
      icon: 'fa-home',
      title: 'Real Estate Agents',
      description: 'Perfect complement to your existing client relationships',
    },
    {
      icon: 'fa-cut',
      title: 'Hairstylists',
      description: 'Turn your daily client conversations into earning opportunities',
    },
    {
      icon: 'fa-dumbbell',
      title: 'Personal Trainers',
      description: 'Leverage your local network for additional income',
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} overflow-x-hidden pt-15`}>
      <HeroSection isDarkMode={isDarkMode} />
      <BenefitsSection benefits={benefits} isDarkMode={isDarkMode} />
      <IdealCandidatesSection candidates={idealCandidates} isDarkMode={isDarkMode} />
      <HowItWorksSection isDarkMode={isDarkMode} />
      <ContactFormSection isDarkMode={isDarkMode} />
    </div>
  );
};

export default JoinUs;