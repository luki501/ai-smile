# AI-Smile

A web application for tracking and analyzing the impact of medications on multiple sclerosis (MS) progression. This personal project enables systematic documentation of medications, symptoms, side effects, and health parameters, then uses artificial intelligence to analyze correlations between therapy and patient health status.

**Dedicated to Kwiatuszek** 🌸

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

AI-Smile is a comprehensive health tracking application designed for managing multiple sclerosis treatment. The application allows users to:

- **Manage Medications**: Add, edit, and track all medications with active substance dosages
- **Daily Reports**: Document daily health status including symptoms, side effects, mood, weight, and blood pressure
- **AI Analysis**: Generate intelligent insights using GPT-4/GPT-4o or Claude 3.5 Sonnet to identify correlations between medications and symptoms
- **Visualizations**: View interactive charts tracking weight and blood pressure trends over time
- **Timeline View**: Browse historical reports in chronological order

This is a single-user application built as a personal/academic project without commercial aspirations, intended for local use.

## Tech Stack

### Frontend
- **Astro 5** - Modern web framework for building fast, content-focused websites
- **React 19** - UI library for interactive components
- **TypeScript 5** - Static type checking
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn/ui** - Accessible React component library

### Backend
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Astro API Endpoints** - Server-side API routes

### AI Integration
- **OpenRouter.ai** - Unified API access to multiple AI models
  - OpenAI GPT-4 / GPT-4o
  - Anthropic Claude 3.5 Sonnet

### Visualization
- **Recharts** or **Chart.js** - Interactive data visualization

### Additional Libraries
- **React Hook Form** - Form state management with validation
- **Zod** - TypeScript-first schema validation
- **Date-fns** - Date utility library
- **Sonner** - Toast notifications
- **React Markdown** - Markdown rendering for AI analysis

## Getting Started Locally

### Prerequisites

- **Node.js**: v22.14.0 (specified in `.nvmrc`)
- **npm** or **yarn** package manager
- **Supabase account** and project
- **OpenRouter.ai API key** (or direct OpenAI/Anthropic API keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AI-Smile.git
   cd AI-Smile
   ```

2. **Install Node.js version**
   ```bash
   # If using nvm
   nvm install
   nvm use
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Supabase Configuration
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI API Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key
   # OR direct API keys:
   # OPENAI_API_KEY=your_openai_api_key
   # ANTHROPIC_API_KEY=your_anthropic_api_key
   
   # User ID (MVP uses hard-coded user)
   USER_ID=your_user_uuid
   ```

5. **Database Setup**
   
   Set up your Supabase database with the required tables:
   - `users`
   - `medications`
   - `daily_reports`
   - `ai_analyses`
   
   *(Database schema documentation to be added)*

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:4321`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the production-ready application |
| `npm run preview` | Preview the production build locally |
| `npm run astro` | Run Astro CLI commands |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Run ESLint and automatically fix issues |
| `npm run format` | Format code using Prettier |

## Project Scope

### MVP Features (Included)

#### Medication Management
- Add, edit, and delete medications
- Track medication name and active substance dosage
- View list of all medications

#### Daily Reports
- Create daily health reports with customizable fields
- Track medications taken, symptoms, side effects
- Record severity levels (1-4 scale)
- Log mood using emoji scale (😞 😐 🙂 😊)
- Monitor weight and blood pressure
- Edit and delete historical reports
- Timeline view of all reports

#### AI Analysis
- Generate analyses using multiple AI models (GPT-4o, GPT-4, Claude 3.5 Sonnet)
- Identify correlations between medications and symptoms
- View analysis history
- Requires minimum 7 days of data

#### Visualizations & Dashboard
- Interactive weight tracking chart
- Blood pressure monitoring (systolic/diastolic)
- Quick stats overview
- Recent reports preview

#### User Experience
- Responsive design (mobile, tablet, desktop)
- Loading states and skeleton loaders
- Toast notifications for user feedback
- Form validation with helpful error messages
- Accessibility features (ARIA labels, keyboard navigation)

### Not Included in MVP

The following features are explicitly out of scope for the MVP:

- Import/Export functionality (CSV, JSON, PDF)
- Multi-user authentication system
- Data sharing with doctors or other users
- External integrations (Apple Health, Google Fit, medical devices)
- Mobile native applications (iOS/Android)
- Progressive Web App (PWA) with offline mode
- Push notifications and reminders
- Advanced analytics and predictions
- Dark mode and theme customization
- Automated testing (unit, integration, e2e)
- CI/CD pipeline
- Production deployment configuration

## Project Status

**Current Status**: 🚧 **MVP Development**

### Completed
- Project setup and tech stack configuration
- Requirements documentation (PRD)
- Database schema design

### In Progress
- Core features implementation
- UI component development
- API endpoints creation

### Planned
- AI integration
- Data visualization components
- End-to-end testing with end user
- Performance optimization

### Success Metrics

The MVP will be considered complete when:
- All P0 and P1 user stories are implemented and tested
- End user has created ≥7 daily reports
- End user has generated ≥1 AI analysis
- No critical bugs in core functionality
- Application meets minimum performance requirements
- End user expresses satisfaction with the application

## License

This is a personal/academic project created for individual use. No license is currently specified.

---

**Note**: This application is designed for personal health tracking and is not a substitute for professional medical advice. Always consult with healthcare professionals regarding medical decisions.

