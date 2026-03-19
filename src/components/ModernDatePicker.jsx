import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ModernDatePicker({ value, onChange }) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      showTimeSelect
      dateFormat="Pp"
      className="rounded-xl border-0 bg-[var(--cream)]/80 shadow-inner px-4 py-3 text-[1.08rem] text-center focus:outline-none focus:ring-2 focus:ring-[var(--sage)] transition-all placeholder:text-[var(--text-muted)] w-full"
      popperPlacement="auto"
      popperClassName="modern-datepicker-popper"
      calendarClassName="rounded-2xl shadow-xl border-0"
      wrapperClassName="w-full"
    />
  );
}

export default ModernDatePicker;
