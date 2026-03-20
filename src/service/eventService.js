// eventService.js
// Service for interacting with backend event API
// Event schema: { id, teamId, name, description, startsAt, status, createdBy }

const API_URL = "http://localhost:8080/api/v1/events";

export async function fetchEvents() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch events");
  return await response.json();
}

export async function createEvent(eventData) {
  // Only send the fields backend expects
  const eventToSend = {
    teamId: eventData.teamId,
    name: eventData.name,
    description: eventData.description,
    startsAt: eventData.startsAt,
    createdBy: eventData.createdBy
    // id is assigned by backend
  };
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventToSend)
  });
  if (!response.ok) throw new Error("Failed to create event");
  return await response.json();
}
