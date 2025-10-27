# AI-Smile

AI-Smile is a web application designed to help Multiple Sclerosis (MS) patients effectively monitor and log their symptoms. This tool aims to simplify the process of tracking the disease's progression, facilitating better communication with healthcare providers and providing patients with a clearer understanding of their health status.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

Patients with Multiple Sclerosis often experience a wide variety of symptoms that change over time. Traditional methods of tracking these symptoms, like manual notes, are often inefficient, prone to errors, and make it difficult to analyze patterns or trends. AI-Smile addresses this by providing a dedicated, user-friendly platform for structured symptom logging. Users can quickly record symptom type, location, and add notes, creating a valuable dataset to support their treatment and rehabilitation.

## Tech Stack

The project is built with a modern tech stack focused on performance, developer experience, and scalability.

| Category      | Technology                                                                                                                                                                                          |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Frontend**  | [Astro 5](https://astro.build/), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/) |
| **Backend**   | [Supabase](https://supabase.io/) (PostgreSQL, Authentication, BaaS)                                                                                                                                 |
| **AI**        | [Openrouter.ai](https://openrouter.ai/) for access to various AI models                                                                                                                             |
| **CI/CD & Hosting** | [GitHub Actions](https://github.com/features/actions), [DigitalOcean](https://www.digitalocean.com/) (Docker)                                                                                                                                |

## Getting Started Locally

To set up and run the project on your local machine, follow these steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (it's recommended to use the version specified in the `.nvmrc` file, if available)
-   [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-smile.git
    cd ai-smile
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the new `.env` file and add your Supabase project URL and Anon Key. You can get these from your Supabase project dashboard.
    ```env
    PUBLIC_SUPABASE_URL="your-supabase-url"
    PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on [http://localhost:4321](http://localhost:4321).

## Available Scripts

In the project directory, you can run the following commands:

| Script      | Description                               |
|-------------|-------------------------------------------|
| `npm run dev` | Runs the app in development mode.         |
| `npm run start` | An alias for `npm run dev`.               |
| `npm run build` | Builds the app for production.            |
| `npm run preview` | Serves the production build locally.      |

## Project Scope

### Key Features (MVP)

The initial version of the application focuses on core functionalities:

-   **User Account Management:** Secure registration, login, password reset, and account deletion.
-   **Symptom CRUD:** Full create, read, update, and delete operations for symptom entries.
-   **Chronological Sorting:** Symptoms are displayed in a timeline, from newest to oldest.
-   **Data Filtering:** Filter symptoms by date range, symptom type, and body part.
-   **Responsive Web App:** A fully functional web application accessible from any modern browser.

### Future Features (Post-MVP)

The following features are planned for future releases:

-   Data visualization (charts, body maps)
-   Data import and export capabilities
-   Ability to share data with doctors or other users
-   Integrations with external health platforms
-   Dedicated mobile applications (iOS/Android)
-   Advanced accessibility (a11y) features
-   A guided onboarding process for new users

## Project Status

**In Development:** The project is currently in the development phase, focusing on delivering the MVP features.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
