# WebSockets Skill

## Purpose
Implement real-time disaster alerts and status updates with FastAPI WebSockets.

## Rules
- Use WebSockets for real-time delivery; use REST for normal CRUD/query operations.
- Maintain a connection manager that handles connect, disconnect, broadcast, and targeted sends.
- Authenticate WebSocket connections.
- Never trust a client-supplied user ID or role.
- Send structured JSON messages.
- Validate outgoing message payloads with Pydantic where practical.
- Handle disconnects without crashing the server.
- Support reconnecting clients and missed-alert recovery through a REST endpoint or alert cursor.
- Avoid blocking work inside the WebSocket loop.
- Do not send sensitive data to unauthorized users.

## SIH alert flow
New alert -> geographic targeting -> authorized connected users -> WebSocket delivery -> delivery/audit record -> reconnect recovery.

## Testing
Test connection, authentication, targeted alerts, broadcast, disconnect, reconnect, and unauthorized access.
