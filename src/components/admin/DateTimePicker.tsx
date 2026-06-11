'use client'

import { useRef } from 'react'

interface Props {
  value: string // "2026-04-20T13:27" 形式
  onChange: (value: string) => void
  className?: string
}

export default function DateTimePicker({ value, onChange, className = '' }: Props) {
  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)

  const datePart = value ? value.slice(0, 10) : ''
  const timePart = value ? value.slice(11, 16) : ''

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value
    const newTime = timePart || '00:00'
    onChange(newDate ? `${newDate}T${newTime}` : '')
  }
  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTime = e.target.value
    const newDate = datePart || new Date().toISOString().slice(0, 10)
    onChange(newTime ? `${newDate}T${newTime}` : '')
  }

  const inputClass =
    'rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2.5 text-sm text-[#ebe5db] ' +
    'focus:border-[#d9b86b] focus:outline-none cursor-pointer [color-scheme:dark]'

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        ref={dateRef}
        type="date"
        value={datePart}
        onChange={handleDateChange}
        onClick={() => dateRef.current?.showPicker?.()}
        className={`${inputClass} flex-1`}
      />
      <input
        ref={timeRef}
        type="time"
        value={timePart}
        onChange={handleTimeChange}
        onClick={() => timeRef.current?.showPicker?.()}
        className={`${inputClass} w-28`}
      />
    </div>
  )
}
