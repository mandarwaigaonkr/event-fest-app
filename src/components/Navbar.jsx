// src/components/Navbar.jsx
// Floating neumorphic bottom navigation bar

import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  HomeIcon,
  CalendarDaysIcon,
  UserIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'

function NavItem({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? 'bg-accent/90 shadow-glow-sm px-4 py-2.5 rounded-2xl gap-2 text-white' 
            : 'w-12 h-12 rounded-full text-text-muted hover:text-white/80'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`${isActive ? 'w-5 h-5' : 'w-6 h-6'} shrink-0`} />
          {isActive && <span className="text-sm font-semibold tracking-wide">{label}</span>}
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const { isAdmin } = useAuth()

  return (
    <nav className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50 bg-bg-base/95 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5 pt-2.5 pb-4 px-4 flex items-center justify-between">
      {isAdmin ? (
        <>
          <NavItem to="/admin" label="Events" Icon={Squares2X2Icon} />
          <NavItem to="/admin/create-event" label="Create" Icon={PlusIcon} />
          <NavItem to="/profile" label="Profile" Icon={UserIcon} />
        </>
      ) : (
        <>
          <NavItem to="/dashboard" label="Home" Icon={HomeIcon} />
          <NavItem to="/my-events" label="My Events" Icon={CalendarDaysIcon} />
          <NavItem to="/profile" label="Profile" Icon={UserIcon} />
        </>
      )}

      {/* iOS Home Indicator fake */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
    </nav>
  )
}
