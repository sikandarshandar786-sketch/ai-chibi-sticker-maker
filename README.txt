AI CHIBI STICKER MAKER
The ZIP root contains index.html, so it is directly suitable for WebIntoApp's web-file upload.

The frontend is free for users and has no payment system.
The included backend keeps the OpenAI API key server-side.

PUBLIC LAUNCH:
- Deploy backend/backend/server.js on an HTTPS server.
- Set OPENAI_API_KEY only as a server environment variable.
- Point the frontend /api/generate request to your backend if frontend and backend use different domains.
- Add rate limiting before public launch.
- Later, add Google AdMob to the WebIntoApp/Android version.
