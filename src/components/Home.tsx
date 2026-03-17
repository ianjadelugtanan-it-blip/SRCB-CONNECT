import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Clock, Filter, Search, PlusCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: number;
  department: string;
  title: string;
  content: string;
  created_at: string;
  author: string | null;
  votes: number;
  comments_count: number;
}

const Home = () => {
  const [filterDept, setFilterDept] = useState('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const { user } = useAuth(); // Need user to post

  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDept]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint = filterDept === 'All' ? '/posts/read.php' : `/posts/read.php?department=${filterDept}`;
      const response = await api.get(endpoint);
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const response = await api.post('/posts/create.php', {
        user_id: user.id,
        title: newTitle,
        content: newContent,
        department: user.department
      });
      
      if (response.data.success) {
        setNewTitle('');
        setNewContent('');
        setShowCreate(false);
        fetchPosts(); // Refresh list
      }
    } catch (error) {
      console.error("Error creating post", error);
      alert("Failed to create post");
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>SRCB Discussion Board</h2>
          <p style={{ color: 'var(--text-muted)' }}>Connect with students across all departments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <PlusCircle size={18} />
          {showCreate ? 'Cancel' : 'Create Post'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3>Start a new discussion</h3>
          </div>
          <form className="card-body" onSubmit={handleCreatePost}>
            <div className="form-group">
              <input 
                type="text" 
                className="form-input" 
                placeholder="Post Title..." 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                style={{ fontWeight: 600, fontSize: '1.1rem' }}
              />
            </div>
            <div className="form-group">
              <textarea 
                className="form-input" 
                placeholder="What's on your mind?..." 
                rows={4}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Publish to {user?.department} Board</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} />
                Search
              </h4>
            </div>
            <div className="card-body">
              <input type="text" className="form-input" placeholder="Search keywords..." />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} />
                Filter by Department
              </h4>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['All', 'IT', 'CS', 'BSBA', 'Education', 'Nursing'].map(dept => (
                <button 
                  key={dept}
                  className={`btn ${filterDept === dept ? 'btn-accent' : 'btn-ghost'}`} 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setFilterDept(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Loading discussion threads...</p>
          ) : posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No posts found for this department. Break the ice and start a discussion!</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className={`badge badge-blue`}>{post.department}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <Clock size={14} />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>
                    <Link to={`/post/${post.id}`} style={{ color: 'inherit' }}>{post.title}</Link>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {post.author ? post.author.charAt(0) : '?'}
                      </div>
                      <span><strong style={{ color: 'var(--text-main)' }}>{post.author}</strong></span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ThumbsUp size={16} />
                        {post.votes}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MessageSquare size={16} />
                        {post.comments_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
