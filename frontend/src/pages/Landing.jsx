import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses } from '../hooks/useCourses';
import { CardSkeleton } from '../components/Skeleton';
import { ArrowRight, Zap, Shield, TrendingUp, Users, Star, BookOpen, Award, ChevronRight } from 'lucide-react';

const categories = ['Tech', 'Design', 'Business', 'Marketing', 'Data Science', 'Leadership'];

export default function Landing() {
  const { courses, loading } = useCourses();

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber/20 bg-amber/5 text-amber text-sm mb-6">
              <Zap size={14} /> Premium Learning Platform
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Elevate Your <span className="gradient-text">Career</span> to New Heights
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-lg">
              Master in-demand skills with expert-led courses. Transform your professional journey with NCC Upscale&apos;s curated learning experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary inline-flex items-center gap-2">
                Start Free Trial
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Users size={16} className="text-amber" /> 10K+ Learners</div>
              <div className="flex items-center gap-2"><BookOpen size={16} className="text-amber" /> 50+ Courses</div>
              <div className="flex items-center gap-2"><Award size={16} className="text-amber" /> Certificates</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
            <div className="relative">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                  className="glass-card p-4 mb-4"
                  style={{ marginLeft: i * 30 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-amber/20 text-amber' : i === 1 ? 'bg-purple/20 text-purple' : 'bg-green-500/20 text-green-400'}`}>
                      {i === 0 ? <BookOpen size={20} /> : i === 1 ? <TrendingUp size={20} /> : <Award size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{['Web Development', 'Data Analytics', 'Leadership'][i]}</p>
                      <p className="text-xs text-gray-400">{['12 Courses', '8 Courses', '6 Courses'][i]}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-4 border-y border-gray-200 bg-gray-50 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...categories, ...categories, ...categories].map((cat, i) => (
            <span key={i} className="text-gray-300 font-display text-lg px-4">{cat}</span>
          ))}
        </motion.div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-4">Featured Courses</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Handpicked courses designed to accelerate your growth</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />) :
            courses.slice(0, 6).map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/courses/${course.id}`} className="glass-card block overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium">{course.category}</div>
                    <div className="absolute top-3 right-3 px-3 py-1 bg-amber/90 text-white rounded-full text-xs font-bold">{course.level}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-amber transition-colors">{course.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-amber">₹{course.price}</span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Star size={14} className="text-amber fill-amber" /> 4.8
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          }
        </div>
        <div className="text-center mt-10">
          <Link to="/courses" className="btn-secondary inline-flex items-center gap-2">
            View All Courses <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 gradient-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">Why NCC Upscale?</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Expert-Led', desc: 'Learn from industry professionals with real-world experience' },
              { icon: Shield, title: 'Certified', desc: 'Earn certificates recognized by top companies worldwide' },
              { icon: TrendingUp, title: 'Career Growth', desc: 'Track your progress and advance your career potential' },
              { icon: Users, title: 'Community', desc: 'Join a network of ambitious professionals and learners' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber/10 flex items-center justify-center">
                  <item.icon size={24} className="text-amber" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-4">What Our Learners Say</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah Mitchell', role: 'Software Engineer', text: 'NCC Upscale transformed my career. The courses are incredibly well-structured and practical.' },
            { name: 'James Rodriguez', role: 'UX Designer', text: 'The design courses here are top-notch. I landed my dream job after completing just two courses.' },
            { name: 'Priya Sharma', role: 'Data Scientist', text: 'Best investment in my career. The data science track is comprehensive and industry-relevant.' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="text-amber fill-amber" />)}
              </div>
              <p className="text-sm text-gray-600 mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-purple flex items-center justify-center font-bold text-white text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber/10 to-purple/10" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold mb-4">Ready to Elevate Your Skills?</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">Join thousands of professionals who are transforming their careers with NCC Upscale.</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg !px-8 !py-4">
              Get Started Today <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber to-purple flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold">NCC Upscale</span>
          </div>
          <p className="text-sm text-gray-400">&copy; 2026 NCC Upscale. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
