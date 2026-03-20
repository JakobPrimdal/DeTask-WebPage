import React from 'react';

function EventList({ events }) {
  if (!events.length) return (
    <div className="text-[var(--text-muted)] text-center py-4">No events yet. Add one below!</div>
  );
  return (
    <div className="space-y-6 max-w-xl mx-auto mb-8">
      {events.map((event, idx) => (
        <div key={event.id || idx} className="bg-white border border-[var(--border-soft)] rounded-2xl shadow p-5 animate-fade-up-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-[1.1rem] font-medium text-[var(--text-base)]">{event.name}</h3>
            <span className="text-[0.9rem] text-[var(--text-muted)]">{event.startsAt ? new Date(event.startsAt).toLocaleString() : ''}</span>
          </div>
          <div className="text-[0.95rem] text-[var(--text-muted)] mb-1"><span className="font-medium">Status:</span> {event.status}</div>
          <div className="text-[0.95rem] text-[var(--text-muted)] mb-1"><span className="font-medium">Created By:</span> {event.createdBy}</div>
          <div className="text-[0.95rem] text-[var(--text-muted)] mb-1"><span className="font-medium">Team:</span> {event.teamId}</div>
          <div className="text-[0.95rem]">{event.description}</div>
        </div>
      ))}
    </div>
  );
}

export default EventList;
