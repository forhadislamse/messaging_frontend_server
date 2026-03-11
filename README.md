# Messaging Application Frontend (WhatsApp Connector)

A modern, responsive messaging application frontend built with **Next.js 16** and **Tailwind CSS 4**. This project provides a robust interface for managing WhatsApp connections, viewing chats, and sending real-time messages.

##  Features

- **Authentication**: Secure user login and registration powered by **NextAuth.js**.
- **WhatsApp Integration**:
  - Real-time status monitoring (QR Code generation for linking, connection status).
  - Fetch and display active WhatsApp chats.
  - View message history for specific chats.
  - Send messages directly from the dashboard.
- **State Management**: Scalable state handling using **Redux Toolkit** and **RTK Query**.
- **Real-time Communication**: Integrated with **Socket.io** for live updates.
- **Modern UI**: Styled with **Tailwind CSS 4** for a premium, responsive look.

## Tech Stack

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching**: [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Lottie](https://airbnb.io/lottie/)

##  Getting Started

### Prerequisites

- **Node.js**: 18.x or later
- **Backend**: Ensure the [Messaging Backend Server](https://github.com/forhadislamse/messaging_backend_server) is running.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/forhadislamse/messaging_frontend_server.git
    cd messaging_frontend_server
    ```

2.  Install dependencies:
    ```bash
    npm install
    # NOTE: If you encounter peer dependency issues with NextAuth, 
    # the project is configured with .npmrc to handle them automatically.
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    NEXT_PUBLIC_BASE_URL=http://localhost:13077/api/v1/
    NEXT_PUBLIC_SOCKET_URL=http://localhost:13077
    ```

### Running Locally

```bash
npm run dev
```
Open [http://localhost:3000/whatsapp](http://localhost:3000/whatsapp) to see the application.

## Scripts

- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Creates an optimized production build.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.


---
Developed by [Muhammad Forhad](https://github.com/forhadislamse)