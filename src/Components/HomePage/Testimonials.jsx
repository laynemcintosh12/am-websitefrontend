import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { useDarkMode } from '../../contexts/DarkModeContext';

const TestimonialsSection = () => {
  const { isDarkMode } = useDarkMode();
  const testimonials = [
    {
      name: "Jennifer Anderson",
      role: "Homeowner",
      project: "Complete Roof Replacement",
      image: "https://public.readdy.ai/ai/img_res/65dba3556e8718a4a39f9d520586581c.jpg"
    },
    {
      name: "Robert Thompson",
      role: "Business Owner",
      project: "Commercial Roofing",
      image: "https://public.readdy.ai/ai/img_res/0ddd090e1e0ea1b79e18421032896fad.jpg"
    },
    {
      name: "Maria Rodriguez",
      role: "Property Manager",
      project: "Emergency Repair Service",
      image: "https://public.readdy.ai/ai/img_res/c412279b451bebeb4f558f0921188424.jpg"
    }
  ];

  return (
    <section className={`py-20 ${isDarkMode ? 'bg-black text-white' : 'bg-orange-50 text-black'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Our Story & Client Experiences</h2>
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 8000 }}
          className="video-testimonial-swiper"
        >
          <SwiperSlide>
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                <img
                  src="https://public.readdy.ai/ai/img_res/9086c2f660eab8051aee7d6f92d4aaae.jpg"
                  alt="CEO Message"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition-all duration-300">
                  <button className="w-20 h-20 flex items-center justify-center cursor-pointer mb-4 !rounded-button whitespace-nowrap group">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-95 transition-transform duration-300">
                      <i className="fas fa-play text-white text-xl ml-1"></i>
                    </div>
                  </button>
                  <h3 className="text-white text-xl font-semibold">Message from Our CEO</h3>
                  <p className="text-white text-sm mt-2">David Mitchell, Founder & CEO</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
          
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="max-w-4xl mx-auto">
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                  <img
                    src={testimonial.image}
                    alt={`${testimonial.name}'s Testimonial`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition-all duration-300">
                    <button className="w-20 h-20 flex items-center justify-center cursor-pointer mb-4 !rounded-button whitespace-nowrap group">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-95 transition-transform duration-300">
                        <i className="fas fa-play text-white text-xl ml-1"></i>
                      </div>
                    </button>
                    <h3 className="text-white text-xl font-semibold">{testimonial.name}</h3>
                    <p className="text-white text-sm mt-2">{testimonial.role}</p>
                    <p className="text-white text-sm mt-1">{testimonial.project}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;