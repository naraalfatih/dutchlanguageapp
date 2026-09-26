import { BookOpen, ChartLine, Dumbbell, Home, Landmark, MessagesSquare, UserRound } from 'lucide-react';
import { NavLink } from 'react-router';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/talk', label: 'Talk', icon: MessagesSquare, aria: 'AI Conversations' },
  { to: '/culture', label: 'Culture', icon: Landmark },
  { to: '/progress', label: 'Progress', icon: ChartLine },
  { to: '/profile', label: 'Profile', icon: UserRound },
] as const;

/** Seven destinations as specified (see docs/03-ux-design.md for the sizing rationale). */
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <ul>
        {ITEMS.map(({ to, label, icon: Icon, ...rest }) => (
          <li key={to}>
            <NavLink to={to} end={'end' in rest} aria-label={'aria' in rest ? rest.aria : label}>
              <Icon size={22} strokeWidth={1.75} aria-hidden />
              <span className="label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
