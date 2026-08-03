import ContactInquiryBackground from '@/app/components/contact/ContactInquiryBackground';
import ContactInquiryForm from '@/app/components/contact/ContactInquiryForm';
import { LazyReCaptchaProvider } from '@/app/components/contact/LazyReCaptchaProvider';
import { CONTACT_INQUIRY } from '@/app/constants/contactContent';

const headlineLines = CONTACT_INQUIRY.headline.split('\n');

export default function ContactInquirySection() {
  return (
    <section className="relative w-full" aria-labelledby="contact-inquiry-heading">
      <ContactInquiryBackground />
      <div className="absolute inset-0 bg-black/35" aria-hidden />

      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 py-16 md:px-12 md:py-24">
        <p className="text-center text-[15px] md:text-[17px] font-medium leading-[1.65] tracking-tight text-white/90 md:text-left md:text-xl">
          {CONTACT_INQUIRY.tagline}
        </p>

        <div className="mt-8 flex flex-col gap-10 md:mt-4 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="text-center md:max-w-[45%] md:pt-9 md:text-left">
            <h2
              id="contact-inquiry-heading"
              className="text-[30px] md:text-[45px] font-bold leading-[1.25] tracking-[-1.5px] text-white md:leading-[1.3]"
            >
              {headlineLines.map((line, index) => (
                <span key={line} className={index > 0 ? 'block' : undefined}>
                  {line}
                </span>
              ))}
            </h2>
          </div>

          <div className="md:flex-1">
            <LazyReCaptchaProvider>
              <ContactInquiryForm />
            </LazyReCaptchaProvider>
          </div>
        </div>
      </div>
    </section>
  );
}
