# NGINX Architecture Guide

This document outlines the role of NGINX in the Meshwork Studio infrastructure and explains why it is an essential component of our production deployment.

## What is NGINX?
NGINX is a high-performance web server, reverse proxy, and caching layer. While our Node.js (Express) backend is incredibly powerful at handling complex business logic and database transactions, it is not optimized for serving static assets concurrently to thousands of users. NGINX addresses this limitation by acting as the **"Front Door"** to our application.

## Core Responsibilities in Meshwork Studio

Our `docker-compose.yml` and `nginx.conf` define four critical responsibilities for the `emnesh-frontend` NGINX container:

### 1. High-Speed Static File Serving
Instead of forcing our Node.js backend to serve every HTML, CSS, JavaScript, and asset file, NGINX completely handles the delivery of our compiled React frontend (`dist/public`). Because NGINX is built in C and specifically optimized for static delivery, it can serve thousands of concurrent requests rapidly without impacting backend performance.

### 2. Reverse Proxy (Traffic Routing)
NGINX acts as a traffic controller for incoming requests. It intelligently parses the incoming URL and routes the traffic to the correct internal Docker container:
- If a request begins with `/api/` (e.g., retrieving workspace data) or `/auth/` (e.g., logging in), NGINX securely forwards the request to the `emnesh-backend` container running on port 5000.
- If a request is for a static asset, NGINX intercepts it and delivers the file directly without ever contacting the backend.

### 3. Single Page Application (SPA) Routing
React applications handle routing natively on the client using the Browser History API. However, if a user directly visits a deeply nested route (like `meshworkstudio.com/workspace/123`) or hits refresh, the server will attempt to find a physical folder named `workspace/123` and fail with a 404 error.

Our `nginx.conf` solves this automatically using the `try_files` directive:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
This instructs NGINX to gracefully fall back and serve the root `index.html` file for any unknown route, allowing React Router to successfully take over the rendering process.

### 4. Performance & Caching
Our NGINX configuration heavily optimizes network delivery:
- **GZIP Compression:** NGINX zips all plain-text responses (HTML, CSS, JS) before sending them over the network, drastically reducing payload sizes and accelerating initial load times.
- **Aggressive Caching:** We instruct the browser to aggressively cache static assets (like images and fonts) locally `(expires 1y;)` so returning users do not have to re-download heavy files, drastically reducing bandwidth and improving perceived performance.

---

**Summary:** By utilizing NGINX, we establish a robust security layer that natively handles compression, heavy asset delivery, and SPA routing, allowing our Node.js backend to remain 100% focused on executing complex database operations and secure API requests.
