import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ThumbsUp, ShieldAlert } from 'lucide-react';
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
}

interface Comment {
  id: number;
  author: string | null;
  dept: string;
  created_at: string;
  content: string;
}

const PostDetail = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPostAndComments = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/read.php?id=${id}`),
        api.get(`/comments/read.php?post_id=${id}`)
      ]);
      
      if (postRes.data.success) {
        setPost(postRes.data.post);
      }
      if (commentsRes.data.success) {
        setComments(commentsRes.data.comments);
      }
    } catch (error) {
      console.error("Failed to load post details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddComment = async () => {
    if (!comment.trim() || !user) return;
    try {
      const res = await api.post('/comments/create.php', {
        post_id: id,
        user_id: user.id,
        content: comment
      });
      if (res.data.success) {
        setComment('');
        fetchPostAndComments();
      }
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleVote = async (type: number) => {
    if (!user) return;
    try {
      const res = await api.post('/votes/toggle.php', {
        post_id: id,
        user_id: user.id,
        vote_type: type
      });
      if (res.data.success && post) {
        setPost({ ...post, votes: res.data.total_votes });
      }
    } catch (error) {
      console.error("Failed to vote", error);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading post...</div>;
  if (!post) return <div className="container" style={{ padding: '2rem' }}>Post not found.</div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Discussion Board
      </Link>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span className="badge badge-blue">{post.department}</span>
            <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--text-muted)' }} title="Report Post">
              <ShieldAlert size={16} />
            </button>
          </div>

          <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{post.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {post.author ? post.author.charAt(0) : '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{post.author}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted {new Date(post.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '2rem' }}>
            {post.content}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button onClick={() => handleVote(1)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--border-light)' }}>
              <ThumbsUp size={16} /> {post.votes}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <MessageSquare size={16} /> {comments.length} Comments
            </span>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Discussion</h3>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <textarea 
              className="form-input" 
              placeholder="Add to the discussion..." 
              rows={3} 
              style={{ resize: 'vertical', marginBottom: '0.75rem' }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" disabled={!comment.trim()} onClick={handleAddComment}>Post Comment</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-light)' }}>
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0E6ED', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              {c.author ? c.author.charAt(0) : '?'}
            </div>
            <div style={{ flex: 1, backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', marginRight: '0.5rem' }}>{c.author}</span>
                  <span className="badge badge-gray" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{c.dept}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{c.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet. Be the first to start the discussion!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
