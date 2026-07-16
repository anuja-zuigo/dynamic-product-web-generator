# Architecture Document

## System Architecture Design
The application is designed using a decoupled **MERN (MongoDB, Express, React, Node.js)** architecture. 

### Data Flow Diagram
```mermaid
graph TD
    subgraph Client [Client / React Single Page App]
        AdminUI[Admin Dashboard] -->|Uploads Excel & Images| Axios[Axios API Client]
        CustomerUI[Customer Page / Chatbot] -->|Fetches Catalog & Prompts AI| Axios
    end

    subgraph Server [Server / Node & Express]
        Axios -->|REST API Requests| Express[Express Server]
        Express -->|Routes & Validation| Controller[Controllers]
        
        subgraph Services [Business Logic Services]
            Controller -->|Auth Actions| AuthService[Auth / JWT & bcrypt]
            Controller -->|Excel Upload| ExcelService[Excel Engine / SheetJS]
            Controller -->|Image Upload| Multer[Multer File System]
            Controller -->|AI Prompt| GeminiService[Gemini SDK Integration]
        end
        
        subgraph Database & Storage [Data Persistence]
            ExcelService -->|CRUD Queries| Mongoose[Mongoose ODM]
            Mongoose -->|Saves State| MongoDB[(MongoDB Atlas)]
            Multer -->|Saves Files| LocalFS[(Local File System /uploads)]
        end
    end
```

## Core Components
1. **Frontend Client (Vite + React)**:
   - Built as a client-side routing application.
   - Accesses the backend dynamically using Axios.
2. **Backend Server (Express.js)**:
   - Serves as the central API gateway.
   - Employs middleware for JWT security validation and file parsing.
3. **Database (MongoDB Atlas)**:
   - Document database used to persist product states, user profiles, and administrative logs.
4. **Excel Processing (SheetJS)**:
   - Parses spreadsheets in memory to extract structured product information.
5. **AI Chatbot (Google Gemini API)**:
   - Provides product recommendations and context-aware responses to user queries.
