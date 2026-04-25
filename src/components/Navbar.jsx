// src/components/Navbar.jsx
// Bottom tab bar — solid, clean

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
        `flex flex-col items-center gap-0.5 min-w-[56px] py-1 pressable ${
          isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? <IconActive className="w-[22px] h-[22px] animate-scale-in" /> : <Icon className="w-[22px] h-[22px]" />}
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const { isAdmin } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-bg-border">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {isAdmin ? (
          <>
            <NavItem to="/admin" label="Events" Icon={Squares2X2Icon} IconActive={SquaresSolid} />
            <NavItem to="/admin/create-event" label="Create" Icon={PlusIcon} IconActive={PlusSolid} />
            <NavItem to="/profile" label="Profile" Icon={UserIcon} IconActive={UserSolid} />
          </>
        ) : (
          <>
            <NavItem to="/dashboard" label="Home" Icon={HomeIcon} IconActive={HomeIconSolid} />
            <NavItem to="/my-events" label="My Events" Icon={CalendarDaysIcon} IconActive={CalendarSolid} />
            <NavItem to="/profile" label="Profile" Icon={UserIcon} IconActive={UserSolid} />
          </>
        )}
      </div>
    </nav>
  )
}
