'use client';

import Image from 'next/image';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { CERTIFICATE_SLIDES } from '@/app/constants/aboutContent';

import 'swiper/css';

export default function CertificatesSwiper() {
  return (
    <section className="bg-white py-12 md:py-16" aria-labelledby="certificates-heading">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2 id="certificates-heading" className="sr-only">
          자격 및 증명서
        </h2>
        <Swiper
          modules={[Autoplay]}
          loop
          speed={800}
          spaceBetween={20}
          slidesPerView={1.15}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2.5, spaceBetween: 32 },
            1024: { slidesPerView: 3.5, spaceBetween: 40 },
          }}
          className="w-full"
        >
          {CERTIFICATE_SLIDES.map(slide => (
            <SwiperSlide key={slide.src}>
              <figure className="text-center">
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-sm bg-[#f5f7fa]">
                  <Image
                    src={slide.src}
                    alt={slide.label}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 85vw, 280px"
                  />
                </div>
                <figcaption className="mt-3 text-base font-medium text-[#555]">
                  {slide.label}
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
