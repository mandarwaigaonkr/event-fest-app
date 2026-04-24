// src/components/Navbar.jsx
// Floating glass bottom tab bar — iOS-inspired

import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  HomeIcon,
  CalendarDaysIcon,
  UserIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarSolid,
  UserIcon as UserSolid,
  PlusIcon as PlusSolid,
  Squares2X2Icon as SquaresSolid,
} from '@heroicons/react/24/solid'

function NavItem({ to, label, Icon, IconActive }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200 ${
          isActive
            ? 'text-accent'
            : 'text-text-muted hover:text-text-secondary'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <>
              <IconActive className="w-[22px] h-[22px]" />
              <div className="w-1 h-1 rounded-full bg-accent" />
            </>
          ) : (
            <>
              <Icon className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const { isAdmin } = useAuth()

  return (
    <nav className="fixed bottom-5 left-5 right-5 z-50 max-w-md mx-auto">
      <div className="glass rounded-3xl shadow-glass-lg px-2 py-2 flex items-center justify-around safe-area-bottom">
        {isAdmin ? (
          <>
            <NavItem to="/admin" label="Events" Icon={Squares2X2Icon} IconActive={SquaresSolid} />
            <NavItem to="/admin/create-event" label="Create" Icon={PlusIcon} IconActive={PlusSolid} />
            <NavItem to="/profile" label="Profile" Icon={UserIcon} IconActive={UserSolid} />
          </>
        ) : (
          <>
            <NavItem to="/dashboard" label="Home" Icon={HomeIcon} IconActive={HomeIconSolid} />
            <NavItem to="/my-events" label="Events" Icon={CalendarDaysIcon} IconActive={CalendarSolid} />
            <NavItem to="/profile" label="Profile" Icon={UserIcon} IconActive={UserSolid} />
          </>
        )}
      </div>
    </nav>
  )
}
