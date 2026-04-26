// src/components/DateTimePicker.jsx
// Unified date picker (mini calendar) and time picker (column selector)
// Single trigger → single panel for each

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  CalendarDaysIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_HEADER = ['Su','Mo','Tu','We','Th','Fr','Sa']

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay() }

// ─── Shared: click-outside hook ─────────────────────────────────────
function useClickOutside(ref, onClose) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [ref, onClose])
}

// ─── DatePicker ─────────────────────────────────────────────────────
// Single button → mini calendar dropdown

export function DatePicker({ date, onChange, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  // Parse current value
  const selected = useMemo(() => {
    if (!date) return null
    const [y, m, d] = date.split('-').map(Number)
    if (!y || !m || !d) return null
    return { year: y, month: m - 1, day: d }
  }, [date])

  // Calendar view state (which month/year is being displayed)
  const now = new Date()
  const [viewYear, setViewYear] = useState(selected?.year || now.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.month ?? now.getMonth())

  // Sync view when selected changes externally
  useEffect(() => {
    if (selected) {
      setViewYear(selected.year)
      setViewMonth(selected.month)
    }
  }, [selected])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days = []
    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [daysInMonth, firstDay])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(d) {
    const m = String(viewMonth + 1).padStart(2, '0')
    const day = String(d).padStart(2, '0')
    onChange(`${viewYear}-${m}-${day}`)
    setOpen(false)
  }

  const isToday = (d) => {
    return d === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear()
  }

  const isSelected = (d) => {
    return selected && d === selected.day && viewMonth === selected.month && viewYear === selected.year
  }

  // Format display
  const displayText = selected
    ? `${selected.day} ${MONTH_SHORT[selected.month]} ${selected.year}`
    : ''

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
        Date <span className="text-danger">*</span>
      </label>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full h-12 px-4 rounded-xl bg-bg-elevated border text-sm text-left flex items-center gap-2.5 transition-all pressable
          ${error ? 'border-danger/60' : open ? 'border-accent' : 'border-bg-border'}
          ${displayText ? 'text-text-primary' : 'text-text-muted'}`}
      >
        <CalendarDaysIcon className="w-4 h-4 text-text-muted shrink-0" />
        <span className="flex-1 truncate">{displayText || 'Select date'}</span>
        <ChevronRightIcon className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>

      {/* Calendar Panel */}
      {open && (
        <div className="absolute z-50 mt-2 left-0 w-[280px] bg-bg-card border border-bg-border rounded-2xl shadow-xl shadow-black/20 p-3 animate-dropdown">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-bg-elevated pressable">
              <ChevronLeftIcon className="w-4 h-4 text-text-secondary" />
            </button>
            <span className="text-sm font-semibold text-text-primary">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-bg-elevated pressable">
              <ChevronRightIcon className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_HEADER.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-text-muted uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((d, i) => {
              if (d === null) return <div key={`e-${i}`} />
              const sel = isSelected(d)
              const today = isToday(d)
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={`w-full aspect-square flex items-center justify-center rounded-lg text-sm transition-colors pressable
                    ${sel
                      ? 'bg-accent text-white font-semibold'
                      : today
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-text-primary hover:bg-bg-elevated'
                    }`}
                >
                  {d}
                </button>
              )
            })}
          </div>

          {/* Today shortcut */}
          <button
            type="button"
            onClick={() => {
              setViewYear(now.getFullYear())
              setViewMonth(now.getMonth())
              selectDay(now.getDate())
            }}
            className="w-full mt-2 py-1.5 text-xs font-medium text-accent hover:bg-accent/5 rounded-lg pressable"
          >
            Today
          </button>
        </div>
      )}

      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  )
}

// ─── TimePicker ─────────────────────────────────────────────────────
// Single button → unified panel with 3 scrollable columns

function ScrollColumn({ options, value, onChange }) {
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current && value) {
      const el = listRef.current.querySelector('[data-selected="true"]')
      if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' })
    }
  }, [value])

  return (
    <div
      ref={listRef}
      className="flex-1 max-h-[200px] overflow-y-auto scrollbar-thin py-1"
    >
      {options.map(opt => {
        const sel = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            data-selected={sel}
            onClick={() => onChange(opt.value)}
            className={`w-full py-2 text-center text-sm rounded-lg transition-colors pressable
              ${sel
                ? 'bg-accent/10 text-accent font-semibold'
                : 'text-text-primary hover:bg-bg-elevated'
              }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function TimePicker({ time, onChange, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const { hour24, minute } = useMemo(() => {
    if (!time) return { hour24: '', minute: '' }
    const [h, m] = time.split(':')
    return { hour24: h || '', minute: m || '' }
  }, [time])

  const { displayHour, period } = useMemo(() => {
    if (!hour24) return { displayHour: '', period: 'AM' }
    const h = parseInt(hour24)
    return {
      displayHour: String(h === 0 ? 12 : h > 12 ? h - 12 : h),
      period: h >= 12 ? 'PM' : 'AM',
    }
  }, [hour24])

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1), label: String(i + 1),
  }))

  const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i * 5).padStart(2, '0'),
    label: String(i * 5).padStart(2, '0'),
  }))

  const periodOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ]

  const buildTime = useCallback((dh, min, per) => {
    if (!dh || min === '') return ''
    let h = parseInt(dh)
    if (per === 'PM' && h !== 12) h += 12
    if (per === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${min}`
  }, [])

  // Format display
  const displayText = (displayHour && minute !== '')
    ? `${displayHour}:${minute} ${period}`
    : ''

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
        Time <span className="text-danger">*</span>
      </label>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full h-12 px-4 rounded-xl bg-bg-elevated border text-sm text-left flex items-center gap-2.5 transition-all pressable
          ${error ? 'border-danger/60' : open ? 'border-accent' : 'border-bg-border'}
          ${displayText ? 'text-text-primary' : 'text-text-muted'}`}
      >
        <ClockIcon className="w-4 h-4 text-text-muted shrink-0" />
        <span className="flex-1 truncate">{displayText || 'Select time'}</span>
        <ChevronRightIcon className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>

      {/* Time Panel */}
      {open && (
        <div className="absolute z-50 mt-2 left-0 w-[240px] bg-bg-card border border-bg-border rounded-2xl shadow-xl shadow-black/20 p-3 animate-dropdown">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 text-center">
            Select Time
          </p>

          {/* 3-column layout */}
          <div className="flex gap-1">
            {/* Hour column */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] text-text-muted font-medium mb-1">HR</span>
              <ScrollColumn
                options={hourOptions}
                value={displayHour}
                onChange={(v) => onChange(buildTime(v, minute || '00', period))}
              />
            </div>

            {/* Divider */}
            <div className="w-px bg-bg-border my-4" />

            {/* Minute column */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] text-text-muted font-medium mb-1">MIN</span>
              <ScrollColumn
                options={minuteOptions}
                value={minute}
                onChange={(v) => onChange(buildTime(displayHour || '12', v, period))}
              />
            </div>

            {/* Divider */}
            <div className="w-px bg-bg-border my-4" />

            {/* AM/PM column */}
            <div className="w-14 flex flex-col items-center">
              <span className="text-[10px] text-text-muted font-medium mb-1">&nbsp;</span>
              <ScrollColumn
                options={periodOptions}
                value={period}
                onChange={(v) => onChange(buildTime(displayHour || '12', minute || '00', v))}
              />
            </div>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-2 py-2 text-xs font-semibold text-white bg-accent rounded-lg hover:bg-accent-light pressable"
          >
            Done
          </button>
        </div>
      )}

      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  )
}
