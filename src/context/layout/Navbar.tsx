import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <GraduationCap className="nav-icon" size={28} />
          <span>SRCB Connect</span>
        </Link>

        {user ? (
          <div className="nav-menu">
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link btn-ghost">
                <LayoutDashboard size={18} />
                <span className="hide-mobile">Dashboard</span>
              </Link>
            )}
            <Link to="/profile" className="nav-link btn-ghost">
              <User size={18} />
              <span className="hide-mobile">{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
              <LogOut size={16} />
              <span className="hide-mobile">Logout</span>
            </button>
          </div>
        ) : (
          <div className="nav-menu">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-accent">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
