import { useState, useEffect } from 'react';
import { Mail, GraduationCap, Clock, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface ProfileData {
  name: string;
  email: string;
  department: string;
  role: string;
  created_at: string;
  stats: { posts: number; comments: number };
}

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/profile.php?id=${user?.id}`);
      if (res.data.success) {
        setProfileData(res.data.user);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading profile...</div>;
  if (!profileData) return <div className="container" style={{ padding: '2rem' }}>Please log in to view your profile.</div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ position: 'relative', height: '120px', backgroundColor: 'var(--primary)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
          <div style={{ position: 'absolute', bottom: '-40px', left: '2rem', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', border: '4px solid white' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{profileData.name.charAt(0)}</span>
          </div>
        </div>
        
        <div className="card-body" style={{ paddingTop: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{profileData.name}</h2>
              <span className="badge badge-blue">{profileData.department} Department</span>
            </div>
            <button className="btn btn-outline" disabled>
              <Edit size={16} /> Edit Profile
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ backgroundColor: 'rgba(10, 37, 64, 0.05)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
                <div style={{ color: 'var(--text-main)' }}>{profileData.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ backgroundColor: 'rgba(10, 37, 64, 0.05)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Joined</div>
                <div style={{ color: 'var(--text-main)' }}>{new Date(profileData.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ backgroundColor: 'rgba(10, 37, 64, 0.05)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Role</div>
                <div style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{profileData.role}</div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{profileData.stats.posts}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Posts Created</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{profileData.stats.comments}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Comments Made</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
