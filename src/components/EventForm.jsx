import React, { useState } from 'react';
import ModernDatePicker from './ModernDatePicker';


function EventForm({ onAddEvent }) {
  const [name, setName] = useState('');
  const [startsAt, setStartsAt] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [teamId, setTeamId] = useState(1); // Numeric teamId for backend compatibility
  const [createdBy, setCreatedBy] = useState(1); // Numeric userId for backend compatibility

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !startsAt || !location || !description) return;
    onAddEvent({
      // id is assigned by backend
      teamId,
      name,
      description,
      startsAt: startsAt instanceof Date ? startsAt.toISOString() : startsAt,
      status,
      createdBy,
      location
    });
    setName('');
    setStartsAt(null);
    setLocation('');
    setDescription('');
    setStatus('scheduled');
    // teamId and createdBy remain the same
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-xl bg-white/70 border border-[var(--border-soft)] shadow-2xl rounded-3xl p-8 flex flex-col gap-6 max-w-xl mx-auto animate-fade-up-2"
      style={{ boxShadow: '0 8px 32px 0 rgba(60, 60, 90, 0.12), 0 1.5px 8px 0 rgba(124,158,143,0.08)' }}
    >
      <h2 className="font-display text-[1.35rem] font-semibold text-[var(--sage-deep)] mb-1 tracking-tight text-center">Create New Event</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          className="rounded-xl border-0 bg-[var(--cream)]/80 shadow-inner px-4 py-3 text-[1.08rem] text-center appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--sage)] transition-all placeholder:text-[var(--text-muted)]"
          type="text"
          placeholder="Event Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <ModernDatePicker
          value={startsAt}
          onChange={date => setStartsAt(date)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          className="rounded-xl border-0 bg-[var(--cream)]/80 shadow-inner px-4 py-3 text-[1.08rem] text-center focus:outline-none focus:ring-2 focus:ring-[var(--sage)] transition-all placeholder:text-[var(--text-muted)]"
          type="text"
          placeholder="Event Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <textarea
          className="rounded-xl border-0 bg-[var(--cream)]/80 shadow-inner px-4 py-3 text-[1.08rem] text-center focus:outline-none focus:ring-2 focus:ring-[var(--sage)] transition-all placeholder:text-[var(--text-muted)] resize-none min-h-[48px]"
          placeholder="Event Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          rows={1}
        />
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-[var(--sage)] to-[var(--sage-deep)] text-white font-semibold rounded-xl px-6 py-3 mt-2 shadow-lg hover:scale-[1.03] hover:shadow-xl transition-all duration-150"
      >
        Add Event
      </button>
    </form>
  );
}

export default EventForm;
