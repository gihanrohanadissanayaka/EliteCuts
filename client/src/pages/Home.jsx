import { Link } from 'react-router-dom';
import { ArrowRight, Star, Scissors, Award, Clock } from 'lucide-react';

const stats = [
  { label: 'Happy Clients',    value: '5,000+', icon: <Star className="w-5 h-5 text-gold-500" />    },
  { label: 'Expert Stylists',  value: '12',     icon: <Scissors className="w-5 h-5 text-gold-500" /> },
  { label: 'Years Experience', value: '10+',    icon: <Award className="w-5 h-5 text-gold-500" />    },
  { label: 'Avg. Service Time',value: '45 min', icon: <Clock className="w-5 h-5 text-gold-500" />    },
];

const services = [
  { title: 'Haircuts & Styling', description: 'Precision cuts tailored to your face shape and lifestyle.' },
  { title: 'Coloring & Highlights', description: 'Expert color transformations with premium products.' },
  { title: 'Beard & Shave', description: 'Classic straight-razor shaves and beard sculpting.' },
  { title: 'Scalp Treatments', description: 'Rejuvenating treatments for a healthier scalp.' },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-dark-900">
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/assets/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/hero-poster.jpg"
        >
          {/* webm source for better browser support */}
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
              EliteCuts — where every visit is an experience. Book your appointment online and
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
