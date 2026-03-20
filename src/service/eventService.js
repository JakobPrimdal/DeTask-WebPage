// eventService.js
// Service for interacting with backend event API

const API_URL = "http://localhost:8080/api/events";

export async function fetchEvents() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch events");
  return await response.json();
}

export async function createEvent(eventData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData)
  });
  if (!response.ok) throw new Error("Failed to create event");
  return await response.json();
}
