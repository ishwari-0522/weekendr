# WEEKENDR 🗺️✈️

WEEKENDR is a modern full-stack travel planner and memory-sharing web application designed to help users plan short getaways, explore local activities, map directions, and save travel memories.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js (React Framework, App Router, JavaScript)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animation**: Framer Motion

### Backend
- **Framework**: Python Flask (Application Factory & Blueprints)
- **Database ORM**: SQLAlchemy (PostgreSQL driver)
- **Database Migrations**: Flask-Migrate (Alembic wrapper)
- **CORS**: Flask-CORS
- **Environment Management**: Python-dotenv & standard configurations

### External APIs
- **Google Maps Platfom**:
  - Google Maps API (Interactive map visualization)
  - Google Places API (Location and interest searches)
  - Google Directions API (Travel routes and timing)
- **OpenAI API**: For future smart assistant capabilities (itinerary suggestions, travel recommendations)

---

## 🏛️ Architecture Overview

The project is split into two independent folders at the root:
1. `frontend/` - Next.js client-side application.
2. `backend/` - Python Flask API serving data models, routes, and business logic.

Communication between the frontend and backend is handled via standard REST APIs, secured with CORS rules. Database interactions are abstracted using SQLAlchemy models, with schema updates managed seamlessly using Flask-Migrate.

---

## 📂 Folder Structure

```
weekendr/
├── frontend/                   # Client-side Next.js application
│   ├── app/                    # Next.js App Router (Layouts and Pages)
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # shadcn/ui low-level components
│   │   ├── layout/             # Layout components (navbar, sidebar, footers)
│   │   └── features/           # Feature-specific high-level components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Shared utility helper libraries (e.g. API client, utils.js)
│   ├── styles/                 # Global styles (globals.css, Tailwind entry)
│   ├── public/                 # Static assets
│   │   └── assets/             # Brand logos, icons, illustrations
│   ├── components.json         # shadcn/ui configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── package.json            # Node.js project manifests & scripts
│
├── backend/                    # Server-side Python Flask application
│   ├── app/                    # Main application package
│   │   ├── routes/             # API blueprints (auth, users, places, planner, memories, maps, assistant)
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── services/           # Business logic & external API wrappers (Google Maps, OpenAI)
│   │   ├── database/           # DB instance initialization & connection
│   │   ├── utils/              # Helper utilities (logging setup, validators, etc.)
│   │   ├── config/             # Config loader (env settings, production/development classes)
│   │   ├── static/             # Static files served by Flask
│   │   └── templates/          # HTML templates (if needed for emails/admin pages)
│   ├── logs/                   # Log directory for backend application logs
│   ├── requirements.txt        # Python dependency manifest
│   └── run.py                  # Entry script to start the backend dev server
│
├── .env                        # Local environment variables (git-ignored)
└── .env.example                # Example template of env files
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory. You can use the template provided in `.env.example`:

```bash
cp .env.example .env
```

Define the following environment variables:
* `DATABASE_URL`: Connection string for PostgreSQL (e.g., `postgresql://postgres:postgres@localhost:5432/weekendr`).
* `SECRET_KEY`: Private cryptographic key for session verification and JWT signing.
* `GOOGLE_MAPS_API_KEY`: API key with access to Google Maps Web SDK.
* `GOOGLE_PLACES_API_KEY`: API key for Google Places queries.
* `OPENAI_API_KEY`: Key for OpenAI GPT-based assistant features.
* `CLOUDINARY_URL`: Asset storage credentials for memory pictures.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL (running locally or remotely)

### Backend Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Installation
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 🚀 Running the Project

### Running Backend
1. Make sure your virtual environment is active in the `backend/` folder.
2. Initialize or apply database migrations (if applicable):
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```
3. Run the development server:
   ```bash
   python run.py
   ```
   The API will be available at `http://127.0.0.1:5000/`.

### Running Frontend
1. Navigate to the `frontend/` folder.
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The client application will be running at `http://localhost:3000/`.

---

## 🗺️ Future Development Roadmap

1. **Database Schema Definition**: Create database tables for users, routes, itineraries, place ratings, and memories.
2. **Authentication Flow**: Implement user signup, secure password hashing, and JWT/session authentication.
3. **Map and Location Services**: Integrate Google Maps API with auto-complete places searching.
4. **Smart Travel Assistant**: Implement an OpenAI-powered chatbot API backend that parses user trip preferences and dynamically drafts routes.
5. **Interactive Frontend Pages**: Build the dashboard, map explorer, planner, and profile views.
