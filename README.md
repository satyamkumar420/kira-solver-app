# KIRA SOLVER 🚀

KIRA SOLVER is a powerful desktop application built with Electron, React, and TypeScript, designed to assist users with various AI-powered tasks. It leverages the Google Gemini API to provide intelligent features like code generation, multiple-choice question creation, and interactive chat.

## ✨ Key Features

- **Multi-View Interface**: Seamlessly switch between different views:
  - **Code View**: Generate or analyze code snippets.
  - **MCQ View**: Create multiple-choice questions.
  - **Chat View**: Engage in an interactive chat with the AI.
- **AI-Powered**: Integrates with the Google Gemini API for state-of-the-art responses.
- **Global Shortcuts**: Access application features quickly using global keyboard shortcuts.
- **Modern Tech Stack**: Built with Vite for a fast development experience, React for a reactive UI, and Tailwind CSS for styling.

## 🛠️ Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/)
- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Google Gemini API](https://ai.google.dev/)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/ai-job-cracker.git
    cd ai-job-cracker
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

### Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the Vite development server and launch the Electron application.

## 📦 Building for Production

You can build the application for different platforms using the following scripts:

- **Build for all platforms:**
  ```bash
  npm run build
  ```
- **Build for Windows:**
  ```bash
  npm run build:win
  ```
- **Build for macOS:**
  ```bash
  npm run build:mac
  ```
- **Build for Linux:**
  ```bash
  npm run build:linux
  ```

The packaged application will be available in the `release` directory.

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run build:win`: Builds the application for Windows.
- `npm run build:mac`: Builds the application for macOS.
- `npm run build:linux`: Builds the application for Linux.
