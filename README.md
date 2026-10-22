# 🚗 Rent Car Local — Frontend

A responsive car rental web application built with **React.js** that provides a user-friendly interface for browsing cars, managing rental bookings, and accessing user and administrative features.

This repository contains the frontend application, which communicates with a separate backend API to handle data, authentication, and booking operations.

## 🔗 Project Repositories

- **Frontend (Current Repository):** [RENT_CAR_LOCAL_FRONTEND](https://github.com/SupainNandy/RENT_CAR_LOCAL_FRONTEND)
- **Backend API:** [RENT_CAR_LOCAL](https://github.com/SupainNandy/RENT_CAR_LOCAL)

## ✨ Features

### 👤 User Features

- User registration and login.
- Browse available cars and view car details.
- Book rental vehicles.
- View personal bookings and booking history.
- Manage user profile information, where implemented.
- Responsive interface for different screen sizes.

### 🛠️ Admin Features

- Access the administrative dashboard.
- Manage car listings.
- View and manage customer bookings.
- Review booking status and related information.
- View dashboard statistics, where implemented.

### 🎨 UI and Application Features

- Component-based React architecture.
- Client-side navigation and routing.
- API integration with the backend.
- Form handling and user input validation.
- Reusable UI components.
- Responsive layouts for desktop and mobile devices.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend UI development |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| Tailwind CSS / Bootstrap | Styling, if configured in the project |
| React Router | Client-side navigation, if configured |
| Axios | HTTP requests, if configured |
| Context API / Zustand | State management, if configured |
| Git & GitHub | Version control |

## 🏗️ Application Architecture

The frontend and backend are maintained in separate repositories.

```text
User
 │
 ▼
React Frontend
(RENT_CAR_LOCAL_FRONTEND)
 │
 │ HTTP Requests
 ▼
Express REST API
(RENT_CAR_LOCAL)
 │
 ▼
MongoDB Database
```

The frontend handles the user interface and client-side interactions. The backend handles server-side business logic, database operations, and protected API requests.

## 📋 Prerequisites

Before running the application, install:

- [Node.js](https://nodejs.org/)
- npm
- Git
- The backend API and its required database configuration

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SupainNandy/RENT_CAR_LOCAL_FRONTEND.git
cd RENT_CAR_LOCAL_FRONTEND
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Backend API URL

Configure the frontend to use your backend's local or deployed API URL.

For example, if your Vite application uses an environment variable named `VITE_API_URL`, create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Use the exact environment variable name and API URL expected by your existing code. Do not add this variable unless the frontend is configured to read it.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, commonly:

```text
http://localhost:5173
```

### 5. Start the Backend

Follow the setup instructions in the backend repository:

**[Backend Setup — RENT_CAR_LOCAL](https://github.com/SupainNandy/RENT_CAR_LOCAL)**

Ensure the backend server is running and its CORS configuration permits requests from the frontend's origin.

## 📁 Project Structure

The following is an illustrative React project structure. Refer to the actual repository for the exact files and folders.

```text
RENT_CAR_LOCAL_FRONTEND/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 🔒 Security Considerations

- Never expose private API keys, tokens, or backend secrets in frontend code.
- Keep environment-specific configuration out of committed `.env` files.
- Do not rely on frontend route protection alone to secure administrative operations.
- Validate permissions and authentication on the backend.

## 🔮 Future Enhancements

- Improve accessibility and mobile responsiveness.
- Add automated component and integration tests.
- Enhance loading states and API error handling.
- Improve search, filtering, and sorting for car listings.
- Add performance optimizations and production build checks.

## 👨‍💻 Author

**Supain Nandy**

- GitHub: [@SupainNandy](https://github.com/SupainNandy)
- Frontend Repository: [RENT_CAR_LOCAL_FRONTEND](https://github.com/SupainNandy/RENT_CAR_LOCAL_FRONTEND)
- Backend Repository: [RENT_CAR_LOCAL](https://github.com/SupainNandy/RENT_CAR_LOCAL)

## 📄 License

Add a license if one has been selected for this project.

---

⭐ If you find this project interesting, consider giving the repository a star!
