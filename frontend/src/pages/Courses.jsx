import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses } from '../hooks/useCourses';
import { CardSkeleton } from '../components/Skeleton';
import { Search, Filter, Star } from 'lucide-react';

const categories = ['All', 'Tech', 'Design', 'Business', 'Marketing', 'Data Science', 'Leadership'];
const levels = ['All', 'beginner', 'intermediate', 'advanced'];

export default function Courses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [page, setPage] = useState(1);
  const { courses, loading, totalPages, fetchCourses } = useCourses();

  const handleFilter = (newCat, newLevel, newSearch, newPage) => {
    const c = newCat ?? category;
    const l = newLevel ?? level;
    const s = newSearch ?? search;
    const p = newPage ?? 1;
    setCategory(c);
    setLevel(l);
    setSearch(s);
    setPage(p);
    fetchCourses({
      category: c === 'All' ? '' : c,
      level: l === 'All' ? '' : l,
      search: s,
      page: p,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold mb-2">Course Catalog</h1>
        <p className="text-gray-500 mb-8">Discover courses that match your goals</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleFilter(null, null, e.target.value, 1)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter size={18} className="text-gray-400" />
          <select
            value={category}
            onChange={(e) => handleFilter(e.target.value, null, null, 1)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-amber/50"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={level}
            onChange={(e) => handleFilter(null, e.target.value, null, 1)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-amber/50"
          >
            {levels.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ?
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />) :
          courses.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-400 text-lg">No courses found matching your criteria</p>
            </div>
          ) :
          courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleFilter(null, null, null, i + 1)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${page === i + 1 ? 'bg-amber text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
