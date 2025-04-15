# ProAutoFill

ProAutoFill is a modern web application that provides automation capabilities for various tasks. The project consists of a FastAPI backend and a Next.js frontend, with a focus on user profiles, automation, and secure authentication.

## Project Structure

```
ProAutoFill/
├── backend/              # FastAPI backend application
│   ├── app/             # Main application code
│   ├── migrations/      # Database migrations
│   ├── mainModule.py    # Application entry point
│   └── Dockerfile       # Backend container configuration
├── landingpage/         # Next.js frontend application
├── nginx/               # Nginx configuration
├── package/             # Additional packages
└── docker-compose.yml   # Docker Compose configuration
```

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Profile Management**: Create and manage user profiles
- **Automation**: Run automated tasks and processes
- **Diagnosis**: System diagnosis and monitoring capabilities
- **Payment Integration**: Stripe integration for payment processing
- **API Documentation**: Auto-generated API documentation

## Technology Stack

### Backend
- FastAPI (Python web framework)
- Tortoise ORM (Database ORM)
- PostgreSQL (Database)
- JWT Authentication
- Stripe API Integration

### Frontend
- Next.js 14
- Material UI
- TypeScript

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.8+ (for local backend development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ProAutoFill.git
cd ProAutoFill
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
# Edit the .env file with your configuration
```

3. Start the application using Docker Compose:
```bash
docker-compose up -d
```

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn mainModule:app --reload
```

#### Frontend
```bash
cd landingpage
npm install
npm run dev
```

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms specified in the LICENSE.md file.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

# <a href="https://modernize-nextjs-free.vercel.app/?ref=5">Modernize-nextjs-free</a>
Modernize Free Next.js 14 Admin Template with Material Ui + Typescript 
<!-- Place this tag where you want the button to render. -->
<a class="github-button" href="https://github.com/adminmart/Modernize-Nextjs-Free" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" aria-label="Star adminmart/Modernize-Nextjs-Free on GitHub">Give a Star</a>
<!-- Main image of Template -->

  <img src="https://adminmart.com/wp-content/uploads/2023/03/modernize-free-next-js-admin-template.png" />



# Installation 👨🏻‍💻

> We recommend you use npm

1. Install all packages

```
npm i
```

2. Run Development Server

```
npm run dev
```

3. Build your project

```
npm run build
```



