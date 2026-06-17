# Telemediscribe Docker Deployment

This document provides instructions for deploying the Telemediscribe application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:5000`

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t telemediscribe .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 -v $(pwd)/instance:/app/instance telemediscribe
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:5000`

## Environment Variables

You can customize the application by setting environment variables:

- `PORT`: The port on which the application runs (default: 5000)
- `FLASK_ENV`: Environment mode (production/development)

## Data Persistence

The SQLite database is stored in the `./instance` directory and is mounted as a volume to ensure data persistence across container restarts.

## Health Check

The application includes a health check that verifies the service is running properly. You can check the health status with:

```bash
docker-compose ps
```

## Troubleshooting

1. **Port already in use:**
   - Change the port mapping in `docker-compose.yml` or use a different port when running with Docker directly

2. **Permission issues:**
   - Ensure the `instance` directory has proper read/write permissions

3. **Build failures:**
   - Check that all files are present in the project directory
   - Verify that `requirements.txt` contains all necessary dependencies

## Production Deployment

For production deployment, consider:

1. Using a reverse proxy (nginx) in front of the Flask application
2. Setting up SSL/TLS certificates
3. Using environment variables for sensitive configuration
4. Implementing proper logging and monitoring
5. Using a production-grade database instead of SQLite

## Development

To run the application in development mode:

1. Modify the `FLASK_ENV` environment variable in `docker-compose.yml`
2. Set `debug=True` in `backend/app.py`
3. Rebuild and run the container 