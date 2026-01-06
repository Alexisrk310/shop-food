"use client"

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
// import { useLanguage } from '@/components/LanguageProvider'

export type CalendarView = 'day' | 'month' | 'year'

export interface DatePickerProps {
  value?: Date | string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  className,
  disabled = false,
  maxDate = new Date(), // Default max date is today? User code had new Date().
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const parseDate = (dateVal: string | Date | undefined): Date | null => {
    if (!dateVal) return null
    if (dateVal instanceof Date) return dateVal

    // Check if it's in dd/mm/yyyy format
    const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = dateVal.match(ddmmyyyyRegex)

    if (match) {
      const [, day, month, year] = match
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    // Try parsing as ISO format (yyyy-mm-dd)
    const date = new Date(dateVal)
    // Fix for timezone offset often seen with yyyy-mm-dd parsing
    // But let's trust standard parsing first
    if (!isNaN(date.getTime())) {
      // If it looks like yyyy-mm-dd (length 10), treat as local date components to avoid previous day issue
      if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        const [y, m, d] = dateVal.split('-').map(Number)
        return new Date(y, m - 1, d)
      }
      return date
    }

    return null
  }

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(parseDate(value))

  // Sync internal state if prop changes
  React.useEffect(() => {
    setSelectedDate(parseDate(value))
  }, [value])

  const [view, setView] = React.useState<CalendarView>('day')
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const calendarRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Get language from context for localization
  // const { t, language } = useLanguage()
  const language = 'es-CO'

  // Generate localized arrays based on current language
  const getEncodedMonths = (lang: string) => {
    const formatter = new Intl.DateTimeFormat(lang, { month: 'long' })
    return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2023, i, 1)))
      .map(m => m.charAt(0).toUpperCase() + m.slice(1)) // Capitalize
  }

  const getEncodedWeekDays = (lang: string) => {
    const formatter = new Intl.DateTimeFormat(lang, { weekday: 'short' })
    // Start from Sunday (using 2023-01-01 which is Sunday)
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2023, 0, 1 + i)))
      .map(d => d.slice(0, 2).toUpperCase())
  }

  // Memoize to avoid recalc on every render if not needed, but cheap enough here
  const months = React.useMemo(() => getEncodedMonths(language), [language])
  const weekDays = React.useMemo(() => getEncodedWeekDays(language), [language])

  const maxYear = maxDate.getFullYear() + 10

  const effectiveMaxDate = maxDate || new Date(2100, 0, 1)

  const maxYearNum = effectiveMaxDate.getFullYear() + 50
  const minYear = 1900
  // Reverse years to show recent first in dropdown usually? Or standard ascending. 
  // User had ascending.
  const years = Array.from({ length: maxYearNum - minYear + 1 }, (_, i) => minYear + i)

  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const calendarHeight = 400
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      let top = rect.bottom + window.scrollY + 8

      // Check logic
      if (spaceBelow < calendarHeight && spaceAbove > spaceBelow) {
        top = rect.top + window.scrollY - calendarHeight - 8
      }

      setPosition({
        top,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen])

  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setView('day')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const prevMonthDays = Array.from(
      { length: startingDayOfWeek },
      (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1
    )

    const totalCells = 42
    const currentMonthDays = daysInMonth
    const nextMonthDays = totalCells - startingDayOfWeek - currentMonthDays

    return { daysInMonth, startingDayOfWeek, prevMonthDays, nextMonthDays }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    setCurrentMonth(nextMonth)
  }

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex))
    setView('day')
  }

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth()))
    setView('day')
  }

  const handleDateSelect = (day: number) => {
    // Construct date preserving local components
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
    onChange(formatDateForInput(newDate))
    setIsOpen(false)
    setView('day')
  }

  const handleClear = () => {
    setSelectedDate(null)
    onChange('')
    setIsOpen(false)
    setView('day')
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const { daysInMonth, prevMonthDays, nextMonthDays } = getDaysInMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const calendarContent =
    isOpen && mounted ? (
      <div
        ref={calendarRef}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          // width: '320px', // Responsive width?
          width: `${Math.max(position.width, 300)}px`
        }}
        className="bg-card text-card-foreground shadow-2xl border border-border z-[100] p-3 rounded-xl animate-in fade-in slide-in-from-left-5 duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            type="button"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('month')}
              className={cn(
                'px-2 py-1 rounded-md text-sm font-bold transition-colors hover:bg-muted',
                currentMonth.getMonth() === months.indexOf(months[currentMonth.getMonth()]) && 'text-primary'
              )}
              type="button"
            >
              {months[currentMonth.getMonth()]}
            </button>
            <button
              onClick={() => setView('year')}
              className={cn(
                'px-2 py-1 rounded-md text-sm font-bold transition-colors hover:bg-muted',
                currentMonth.getFullYear() === Number.parseInt(view as string) && 'text-primary'
              )}
              type="button"
            >
              {currentMonth.getFullYear()}
            </button>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            type="button"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {view === 'month' && (
          <div className="grid grid-cols-3 gap-2 p-1">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={cn(
                  'px-2 py-2 text-xs font-medium rounded-md transition-colors hover:bg-muted',
                  currentMonth.getMonth() === index && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                type="button"
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        {view === 'year' && (
          <div className="grid grid-cols-4 gap-2 p-1 max-h-[250px] overflow-y-auto custom-scrollbar">
            {years.map(year => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={cn(
                  'px-2 py-2 text-xs font-medium rounded-md transition-colors hover:bg-muted',
                  currentMonth.getFullYear() === year &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                type="button"
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {view === 'day' && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-[10px] font-bold text-muted-foreground uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {prevMonthDays.map((day, index) => (
                <div
                  key={`prev-${index}`}
                  className="h-8 flex items-center justify-center text-xs text-muted-foreground/30"
                >
                  {day}
                </div>
              ))}

              {days.map(day => (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  type="button"
                  // disabled={isAfterMaxDate(day)}
                  className={cn(
                    'h-8 w-full flex items-center justify-center text-sm rounded-md transition-all',
                    isSelected(day) && 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/30',
                    !isSelected(day) && isToday(day) && !selectedDate && 'bg-muted text-foreground font-bold border border-primary/30',
                    !isSelected(day) && (!isToday(day) || selectedDate) && 'hover:bg-muted text-foreground',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                >
                  {day}
                </button>
              ))}

              {Array.from({ length: nextMonthDays }, (_, i) => i + 1).map((day, index) => (
                <div
                  key={`next-${index}`}
                  className="h-8 flex items-center justify-center text-xs text-muted-foreground/30"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-border">
              <button
                onClick={handleClear}
                type="button"
                className="w-full text-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Limpiar Selección
              </button>
            </div>
          </>
        )}
      </div>
    ) : null

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <input
          type="text"
          value={formatDate(selectedDate)}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className={cn(
            'w-full bg-background border border-border text-foreground h-11 rounded-lg px-4 pr-10 transition-all duration-200 font-medium placeholder:text-muted-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            disabled && 'opacity-50 cursor-not-allowed bg-muted',
            className
          )}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      {mounted && calendarContent && createPortal(calendarContent, document.body)}
    </div>
  )
}
