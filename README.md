# Rent Car Local — Frontend

A responsive car rental web application built with **React.js** that provides a user-friendly interface for browsing cars, managing rental bookings, and accessing user and administrative features.

This repository contains the frontend application, which communicates with a separate backend API to handle data, authentication, and booking operations.

## Project Repositories

- **Frontend:** [RENT_CAR_LOCAL_FRONTEND](https://github.com/SupainNandy/RENT_CAR_LOCAL_FRONTEND)
- **Backend API:** [RENT_CAR_LOCAL](https://github.com/SupainNandy/RENT_CAR_LOCAL)

## Features

### User Features

- User registration and login.
- Browse available cars and view car details.
- Book rental vehicles.
- View personal bookings and booking history.
- Manage user profile information.
- Responsive interface for different screen sizes.

### Admin Features

- Access the administrative dashboard.
- Manage car listings.
- View and manage customer bookings.
- Review booking statuses and related information.
- View dashboard statistics.

### UI and Application Features

- Component-based React architecture.
- Client-side navigation and routing.
- Backend API integration.
- Form handling and user input validation.
- Reusable UI components.
- Responsive layouts for desktop and mobile devices.

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend UI development |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| Tailwind CSS and Bootstrap | Styling and responsive layouts |
| React Router | Client-side navigation |
| Axios | HTTP requests and API integration |
| Context API and Zustand | State management |
| Git and GitHub | Version control |

## Application Architecture

The frontend and backend are maintained in separate repositories.

```text
User
  |
  v
React Frontend
(RENT_CAR_LOCAL_FRONTEND)
  |
  | HTTP Requests
  v
Express REST API
(RENT_CAR_LOCAL)
  |
  v
MongoDB Database
```

The frontend manages the user interface, navigation, and client-side interactions. The backend handles business logic, authentication, booking operations, and database interactions.

## Prerequisites

Before running the application, install:

- [Node.js](https://nodejs.org/)
- npm
- Git
- MongoDB

## Getting Started

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

Create a `.env` file in the frontend root directory and configure the backend API URL.

```env
VITE_API_URL=http://localhost:5000
```

Ensure the environment variable matches the name used in the frontend source code.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 5. Start the Backend

Clone and configure the backend repository by following its setup instructions:

**[RENT_CAR_LOCAL — Backend Repository](https://github.com/SupainNandy/RENT_CAR_LOCAL)**

Ensure the backend server is running, MongoDB is configured, and CORS allows requests from the frontend origin.

## Project Structure

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

## Security Considerations

- Never expose private API keys, tokens, or backend secrets in frontend code.
- Keep environment-specific configuration out of committed `.env` files.
- Protect administrative operations using backend authentication and authorization.
- Validate user input on both the frontend and backend.
- Store sensitive credentials securely using environment variables.

## Future Enhancements

- Improve accessibility and mobile responsiveness.
- Add automated component and integration tests.
- Enhance loading states and API error handling.
- Improve car search, filtering, and sorting.
- Optimize application performance and production builds.

## Author

**Supain Nandy**

- GitHub: [@SupainNandy](https://github.com/SupainNandy)
- Frontend Repository: [RENT_CAR_LOCAL_FRONTEND](https://github.com/SupainNandy/RENT_CAR_LOCAL_FRONTEND)
- Backend Repository: [RENT_CAR_LOCAL](https://github.com/SupainNandy/RENT_CAR_LOCAL)

## License

This project does not currently specify a license.

---

If you find this project interesting, consider giving the repository a star!
