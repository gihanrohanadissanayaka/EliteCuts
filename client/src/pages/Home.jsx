import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Scissors, Award, Clock, GraduationCap, CheckCircle2, X } from 'lucide-react';

const stylist = {
  name:       'Charuka Chamod',
  title:      'Senior Hair Stylist',
  experience: '12 Years Experience',
  bio:        'With over 12 years of professional expertise and a formal degree in cosmetology, Charuka brings unmatched skill and artistry to every client. Known for precision cuts and creative color work that perfectly suits every individual.',
  badges: [
    { icon: <Award className="w-4 h-4" />,          label: '12 Years Experience' },
    { icon: <GraduationCap className="w-4 h-4" />,  label: 'Degree Holder' },
    { icon: <CheckCircle2 className="w-4 h-4" />,   label: 'Certified Professional' },
  ],
  photo: '/assets/stylist.jpg',
};

const galleryImages = [
  { src: '/assets/gal1.jpg', alt: 'Gallery 1' },
  { src: '/assets/gal2.jpg', alt: 'Gallery 2' },
  { src: '/assets/gal3.jpg', alt: 'Gallery 3' },
  { src: '/assets/gal4.jpg', alt: 'Gallery 4' },
  { src: '/assets/gal5.jpg', alt: 'Gallery 5' },
];

const stats = [
  { label: 'Happy Clients',    value: '5,000+', icon: <Star className="w-5 h-5 text-gold-500" />    },
  { label: 'Expert Stylists',  value: '12',     icon: <Scissors className="w-5 h-5 text-gold-500" /> },
  { label: 'Years Experience', value: '3+',     icon: <Award className="w-5 h-5 text-gold-500" />    },
  { label: 'Avg. Service Time',value: '45 min', icon: <Clock className="w-5 h-5 text-gold-500" />    },
];

const services = [
  { title: 'Haircuts & Styling', description: 'Precision cuts tailored to your face shape and lifestyle.' },
  { title: 'Coloring & Highlights', description: 'Expert color transformations with premium products.' },
  { title: 'Beard & Shave', description: 'Classic straight-razor shaves and beard sculpting.' },
  { title: 'Scalp Treatments', description: 'Rejuvenating treatments for a healthier scalp.' },
];

export default function Home() {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setLightbox(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-dark-900">
        {/* Mobile background video (intro.mp4) — shown below md breakpoint */}
        <video
          key="mobile-video"
          className="absolute inset-0 w-full h-full object-cover md:hidden"
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/hero-poster.jpg"
        >
          <source src="/assets/intro.mp4" type="video/mp4" />
        </video>

        {/* Desktop background video (hero.mp4) — shown from md breakpoint up */}
        <video
          key="desktop-video"
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/hero-poster.jpg"
        >
          <source src="/assets/hero.webm" type="video/webm" />
          <source src="/assets/hero.mp4"  type="video/mp4"  />
        </video>

        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-dark-900/70" />

        {/* Subtle gold tint at top-right */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-400 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <span className="section-subtitle mb-4 block">Premium Salon Experience</span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Your Style,<br />
              <span className="text-gold-400">Perfected.</span>
            </h1>
            <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Salon DECO — where every visit is an experience. Book your appointment online and
              let our expert stylists transform your look.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/book" className="btn-primary text-base">
                Book Appointment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/packages" className="btn-secondary text-base">
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-dark-800 border-y border-dark-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-2">{stat.icon}</div>
                <span className="text-3xl font-bold text-white font-serif">{stat.value}</span>
                <span className="text-dark-400 text-sm mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-subtitle mb-3 block">What We Offer</span>
          <h2 className="section-title">Our Services</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.title} className="card p-6 hover:border-gold-600 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center mb-4">
                <Scissors className="w-5 h-5 text-gold-500" />
              </div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-gold-400 transition-colors">
                {s.title}
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/packages" className="btn-secondary">
            View All Packages <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Meet Our Stylist */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-subtitle mb-3 block">The Expert Behind Your Look</span>
            <h2 className="section-title">Meet Our Stylist</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12 card p-8 md:p-12">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden ring-4 ring-gold-500/30">
                <img
                  src={stylist.photo}
                  alt={stylist.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-gold-400 text-sm font-medium tracking-widest uppercase mb-2">{stylist.title}</p>
              <h3 className="font-serif text-4xl font-bold text-white mb-4">{stylist.name}</h3>
              <p className="text-dark-300 text-base leading-relaxed mb-8 max-w-lg">{stylist.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {stylist.badges.map((b) => (
                  <span
                    key={b.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium"
                  >
                    {b.icon}
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-subtitle mb-3 block">Our Work</span>
            <h2 className="section-title">Gallery</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setLightbox(i)}
                className={`group relative overflow-hidden rounded-xl ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''} aspect-square focus:outline-none focus:ring-2 focus:ring-gold-500`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/40 transition-colors duration-300 flex items-center justify-center">
                  <Scissors className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <dialog
          open
          aria-label="Image preview"
          className="fixed inset-0 z-50 w-full h-full bg-dark-900/95 flex items-center justify-center p-4 border-0"
        >
          <button
            className="absolute top-5 right-5 text-white hover:text-gold-400 transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={galleryImages[lightbox].src}
            alt={galleryImages[lightbox].alt}
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
          />
          <div className="absolute bottom-6 flex gap-3">
            {galleryImages.map((img, i) => (
              <button
                key={img.src}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightbox ? 'bg-gold-400' : 'bg-dark-500 hover:bg-dark-300'}`}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        </dialog>
      )}

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-gold-700 via-gold-600 to-gold-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl font-bold text-dark-900 mb-4">
            Ready for a New Look?
          </h2>
          <p className="text-dark-800 text-lg mb-8 max-w-xl mx-auto">
            Book your appointment in minutes and walk out looking your best.
          </p>
          <Link
            to="/book"
            className="bg-dark-900 hover:bg-dark-800 text-white font-semibold px-8 py-4 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            Book Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
