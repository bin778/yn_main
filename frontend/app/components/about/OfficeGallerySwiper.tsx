'use client';

import Image from 'next/image';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { OFFICE_GALLERY_SLIDES } from '@/app/constants/aboutContent';

import 'swiper/css';

export default function OfficeGallerySwiper() {
  return (
    <section className="bg-white py-12 md:py-16" aria-label="사무소 갤러리">
      <Swiper
        modules={[Autoplay]}
        loop
        speed={5000}
        spaceBetween={20}
        slidesPerView={1.2}
        autoplay={{ delay: 0, disableOnInteraction: false }}
        breakpoints={{
          768: { slidesPerView: 2.5, spaceBetween: 70 },
        }}
        className="w-full px-6 md:px-12"
      >
        {OFFICE_GALLERY_SLIDES.map(slide => (
          <SwiperSlide key={slide.src}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
              <Image
                src={slide.src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 85vw, 40vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
