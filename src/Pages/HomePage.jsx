import React from 'react';
import HeroSection from '../Components/HomePage/HeroSection';
import ContactForm from '../Components/HomePage/ContactForm';
import TestimonialsSection from '../Components/HomePage/Testimonials';
import 'swiper/css';
import 'swiper/css/pagination';

const HomePage = () => {
    return (
        <div className="home-page">
            <HeroSection />
            <ContactForm />
            <TestimonialsSection />
        </div>
    );
};

export default HomePage;