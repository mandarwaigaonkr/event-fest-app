import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'
import { useEventsContext } from '../context/EventsContext'

function formatNotificationTime(value) {
  const date = value?.toDate?.()
  if (!date) return ''

  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'Just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getNotificationIcon(type) {
  if (type === 'team_invite' || type === 'team_invite_accepted' || type === 'team_invite_rejected') {
    return UserGroupIcon
  }
  return CheckCircleIcon
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const popupRef = useRef(null)
  const [open, setOpen] = useState(false)
  const {
    events,
    pendingInvites,
    notifications,
    notificationsLoading,
    markNotificationsRead,
  } = useEventsContext()

  const inviteNotifications = useMemo(() => {
    return pendingInvites.map((invite) => {
      const leaderName = invite.members?.find(m => m.uid === invite.leaderUid)?.name || 'Someone'
      const eventName = events.find(e => e.id === invite.eventId)?.name || 'an event'

      return {
        id: `pending-invite-${invite.eventId}-${invite.id}`,
        source: 'invite',
        type: 'team_invite',
        title: `Team invite: ${invite.name}`,
        message: `${leaderName} invited you to join for ${eventName}.`,
        link: `/event/${invite.eventId}`,
        read: false,
      }
    })
  }, [events, pendingInvites])

  const items = useMemo(() => {
    return [...inviteNotifications, ...notifications].slice(0, 12)
  }, [inviteNotifications, notifications])

  const unreadCount = inviteNotifications.length + notifications.filter(item => !item.read).length
  const unreadLabel = unreadCount > 9 ? '9+' : unreadCount

  useEffect(() => {
    if (!open) return

    const unreadStoredIds = notifications
      .filter(item => !item.read)
      .map(item => item.id)

    if (unreadStoredIds.length > 0) {
      markNotificationsRead(unreadStoredIds).catch((err) => {
        console.error('Failed to mark notifications read:', err)
      })
    }
  }, [open, notifications, markNotificationsRead])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function openNotification(item) {
    setOpen(false)
    if (item.link) navigate(item.link)
  }

  return (
    <div ref={popupRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center border pressable ${
          open
            ? 'bg-accent/10 border-accent/30 text-accent'
            : 'bg-bg-elevated border-transparent text-text-secondary hover:text-accent hover:border-accent/20'
        }`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        {open ? <BellSolidIcon className="w-5 h-5 animate-scale-in" /> : <BellIcon className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold leading-[18px] text-center shadow-soft">
            {unreadLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-12 z-[70] sm:w-[21rem] origin-top-right rounded-2xl border border-bg-border bg-bg-card/95 backdrop-blur-xl shadow-2xl animate-scale-in overflow-hidden">
          <div className="px-4 py-3 border-b border-bg-border">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-text-primary">Notifications</h2>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto scrollbar-thin">
            {notificationsLoading && items.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-bg-elevated" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-bg-elevated rounded w-2/3" />
                      <div className="h-3 bg-bg-elevated rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <BellIcon className="w-8 h-8 mx-auto text-text-muted mb-2" />
                <p className="text-sm font-semibold text-text-primary">No notifications</p>
                <p className="text-xs text-text-muted mt-1">Team updates and future alerts will appear here.</p>
              </div>
            ) : (
              <div className="py-1">
                {items.map((item) => {
                  const Icon = getNotificationIcon(item.type)
                  const isUnread = !item.read

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openNotification(item)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-bg-elevated pressable"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnread ? 'bg-accent/15 text-accent' : 'bg-bg-elevated text-text-secondary'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-text-primary line-clamp-1">
                            {item.title}
                          </p>
                          {isUnread && (
                            <span className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                        {formatNotificationTime(item.createdAt) && (
                          <p className="text-[11px] text-text-muted mt-1">
                            {formatNotificationTime(item.createdAt)}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
