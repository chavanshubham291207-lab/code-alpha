# CodeAlpha_URLShortener

A professional, production-ready Backend URL Shortener service built for **CodeAlpha Backend Development Internship - Task 1**.

This application provides a REST API to shorten long URLs, redirect users via shortened links, and track usage statistics (click count) for each URL. The project utilizes a modern Model-View-Controller (MVC) architecture, MongoDB Atlas for storage, and the `nanoid` library for generating collision-resistant, short unique identifiers.

---

## 🚀 Features

- **MVC Architecture**: Structured directory layout for scalability, maintenance, and separation of concerns.
- **URL Shortening**: Generates a clean 8-character unique alphanumeric code using `nanoid`.
- **Dynamic Redirection**: Instantly redirects users to the original URL when they visit the shortened URL.
- **Analytics Tracking**: Automatically tracks the total click counts for every shortened URL.
- **Duplicate Prevention**: Reuses existing shortened URL records if the exact same URL is submitted again (optimizing database size).
- **Error Handling**: Graceful error management, including input validation for protocols (HTTP/HTTPS) and database error catching.
- **Deployment Ready**: Standard configurations (CORS, dynamic port assignment) for quick deployment on platforms like Render.
- **Interactive Developer Landing Page**: Includes a sleek, modern, glassmorphic UI landing page at the root route `/` summarizing API specifications.

---

## 📂 Project Structure

```text
CodeAlpha_URLShortener/
├── config/
│   └── db.js            # MongoDB connection configuration using Mongoose
├── controllers/
│   └── urlController.js # Handles API request logic (shorten, redirect, stats)
├── models/
│   └── Url.js           # Mongoose Schema & validation for URL records
├── routes/
│   └── urlRoutes.js     # API Route declarations
├── .env                 # Environment variables (git-ignored)
├── .env.example         # Template for required environment variables
├── package.json         # Project manifests and dependencies
├── server.js            # Main entry point of the server
└── README.md            # Project documentation and setup guide
```

---

## 🛠️ Technology Stack

- **Runtime Environment**: Node.js (ES Modules syntax)
- **Web Framework**: Express.js
- **Database Service**: MongoDB Atlas (Cloud database)
- **Object Data Modeling (ODM)**: Mongoose
- **Unique Identifier Generator**: `nanoid`
- **Other Utilities**: `dotenv` (environment variables manager), `cors` (Cross-Origin Resource Sharing middleware)

---

## 💻 Installation & Setup

Follow these steps to run the project locally:

### 1. Clone the repository or navigate to the project directory
Ensure you are in the project folder:
```bash
cd CodeAlpha_URLShortener
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
1. Copy the `.env.example` file to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and replace the `MONGO_URI` placeholder with your actual MongoDB Atlas connection string:
   ```env
   PORT=5000
   BASE_URL=http://localhost:5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/urlshortener?retryWrites=true&w=majority
   ```

### 4. Run the Server
* **Development Mode** (auto-reloads on file changes using Node's native watch mode):
  ```bash
  npm run dev
  ```
* **Production Mode**:
  ```bash
  npm start
  ```

Once started, the server will output:
```text
MongoDB Connected: cluster0-shard-00-00.mongodb.net
Server running in development mode on port 5000
Base URL configured as: http://localhost:5000
```

---

## 📡 API Endpoints & Usage Examples

### 1. Shorten a URL
* **Endpoint**: `POST /shorten`
* **Content-Type**: `application/json`
* **Body**:
  ```json
  {
    "originalUrl": "https://www.codealpha.in"
  }
  ```
* **cURL command**:
  ```bash
  curl -X POST http://localhost:5000/shorten \
    -H "Content-Type: application/json" \
    -d '{"originalUrl": "https://www.codealpha.in"}'
  ```
* **Example JSON Response**:
  ```json
  {
    "originalUrl": "https://www.codealpha.in",
    "shortCode": "k8Xp2Y9z",
    "shortUrl": "http://localhost:5000/k8Xp2Y9z",
    "clicks": 0,
    "createdAt": "2026-06-19T15:00:00.000Z"
  }
  ```

### 2. Redirect to Original URL
* **Endpoint**: `GET /:code`
* **Example**: Open the shortened URL (e.g. `http://localhost:5000/k8Xp2Y9z`) in a web browser.
* **Result**: The server records the visit (increments `clicks` by 1) and redirects you to `https://www.codealpha.in`.

### 3. Get URL Analytics / Statistics
* **Endpoint**: `GET /stats/:code`
* **Example**: `GET http://localhost:5000/stats/k8Xp2Y9z`
* **cURL command**:
  ```bash
  curl http://localhost:5000/stats/k8Xp2Y9z
  ```
* **Example JSON Response**:
  ```json
  {
    "originalUrl": "https://www.codealpha.in",
    "shortCode": "k8Xp2Y9z",
    "clicks": 1,
    "createdAt": "2026-06-19T15:00:00.000Z"
  }
  ```

---

## 🌐 Deploying on Render

To deploy this API to Render:

1. **Commit and Push**: Push your project to a GitHub repository. Keep `.env` out of your git commits (ensure it is ignored).
2. **Create Web Service**:
   - Log in to [Render](https://render.com/).
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository.
3. **Configure Service Settings**:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Configure Environment Variables**:
   - In the **Environment** tab, click **Add Environment Variable** and enter:
     - `MONGO_URI`: Your MongoDB Atlas connection string.
     - `BASE_URL`: The URL assigned to your service by Render (e.g., `https://codealpha-url-shortener.onrender.com`).
     - `NODE_ENV`: `production`
5. **Deploy**: Click **Deploy Web Service**. Render will build the service and bring it online.
