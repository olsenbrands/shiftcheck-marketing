import { ArrowRight, Calendar, Clock, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "5 Signs Your Restaurant Needs Better Accountability Systems",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    author: "ShiftCheck Team",
    date: "Dec 1, 2024",
    readTime: "5 min read",
    category: "Operations",
    image: "bg-gradient-to-br from-primary-400 to-primary-600"
  },
  {
    id: "2",
    title: "How Photo Verification Changed Our Closing Procedures",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    author: "ShiftCheck Team",
    date: "Nov 28, 2024",
    readTime: "4 min read",
    category: "Case Study",
    image: "bg-gradient-to-br from-purple-400 to-purple-600"
  },
  {
    id: "3",
    title: "The Real Cost of Employee Turnover in Restaurants",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    author: "ShiftCheck Team",
    date: "Nov 20, 2024",
    readTime: "7 min read",
    category: "Industry Insights",
    image: "bg-gradient-to-br from-orange-400 to-orange-600"
  },
  {
    id: "4",
    title: "Building a Culture of Accountability: A Step-by-Step Guide",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    author: "ShiftCheck Team",
    date: "Nov 15, 2024",
    readTime: "8 min read",
    category: "Best Practices",
    image: "bg-gradient-to-br from-success-400 to-success-600"
  },
  {
    id: "5",
    title: "Why Paper Checklists Are Failing Your Restaurant",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    author: "ShiftCheck Team",
    date: "Nov 10, 2024",
    readTime: "5 min read",
    category: "Operations",
    image: "bg-gradient-to-br from-red-400 to-red-600"
  },
  {
    id: "6",
    title: "Performance Reviews That Actually Work for Hourly Staff",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    author: "ShiftCheck Team",
    date: "Nov 5, 2024",
    readTime: "6 min read",
    category: "HR & Management",
    image: "bg-gradient-to-br from-blue-400 to-blue-600"
  }
];

const BlogPage = () => {
  const categories = Array.from(new Set(blogPosts.map(p => p.category)));

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              The ShiftCheck <span className="text-primary-500">Blog</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Insights, best practices, and stories from the world of restaurant operations.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-primary-500 text-white">
              All Posts
            </button>
            {categories.map(category => (
              <button
                key={category}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:border-primary-300 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="grid lg:grid-cols-2">
                <div className={`${blogPosts[0].image} min-h-[300px] lg:min-h-[400px]`}></div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold">
                      {blogPosts[0].category}
                    </span>
                    <span className="text-gray-400 text-sm">Featured</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <User size={14} />
                      {blogPosts[0].author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar size={14} />
                      {blogPosts[0].date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={14} />
                      {blogPosts[0].readTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map(post => (
              <article key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`${post.image} h-48`}></div>
                <div className="p-6">
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-8">
              Get the latest restaurant operations tips and ShiftCheck updates delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                Subscribe
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
