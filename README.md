# Chatstarter

## Overview

This project is a chat application that allows users to add friends and send direct messages. It utilizes Convex for serverless functions and Clerk for authentication.

## Features

- **Direct Messaging**: Users can send and receive direct messages with other users.
- **Friend Management**: Users can send friend requests, accept or decline them, and view their friends list.
- **User Authentication**: Secure user authentication is handled through Clerk, allowing users to sign up and log in.
- **User Profiles**: Users can create and update their profiles, including usernames and profile images.
- **Real-time Updates**: The application provides real-time updates for messages and friend requests.

## Installation

To set up the project, ensure you have Node.js installed on your machine. Then, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the required packages:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:

   ```plaintext
   CONVEX_DEPLOYMENT=<your_convex_deployment>
   NEXT_PUBLIC_CONVEX_URL=<your_convex_url>
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
   CLERK_SECRET_KEY=<your_clerk_secret_key>
   ```

4. Start the Convex server:

   ```bash
   npx convex dev
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. Sign up or log in using your Google account.
2. Use the "Add Friend" button to send friend requests to other users.
3. View your pending and accepted friend requests in the friends list.
4. Start direct messages with your friends by clicking on their names.
5. Send and receive messages in real-time.

## File Descriptions

- **convex/functions/**: Contains serverless functions for handling messages, direct messages, friends, and user management.
- **src/app/(dashboard)/\_components/**: Contains React components for the dashboard, including friend lists and direct message functionality.
- **src/app/(dashboard)/page.tsx**: The Friends page of the application. It displays a list of accepted and pending friend requests.
- **src/app/(dashboard)/dms/[id]/page.tsx**: The DMs page displaying all the messages in a direct message thread between you and a particular user.
- **convex/auth.config.ts**: Configuration for Clerk authentication.

## Dependencies

- **Convex**: For serverless functions and database management.
- **Clerk**: For user authentication and management.
- **React**: For building the user interface.
- **Next.js**: For server-side rendering and routing.
- **Tailwind CSS**: For styling the application.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.
