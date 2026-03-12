# Docker Setup Guide

This application has been dockerized for production-like environments using Next.js standalone output.

## Prerequisites

- Docker installed
- Docker Compose installed

## Getting Started

1.  **Environment Variables**: Ensure you have a `.env.local` file in the root directory. You can use `.env.example` as a template.
2.  **Build and Run**: Use Docker Compose to build and start the application.

    ```bash
    docker-compose up --build
    ```

3.  **Access the Application**: Once the build is complete and the container is running, access the application at:
    [http://localhost:3000](http://localhost:3000)

## Docker Specifics

- **Multi-stage Build**: The `Dockerfile` uses a multi-stage build (Deps -> Builder -> Runner) to keep the final image size small.
- **Standalone Output**: `next.config.ts` is configured with `output: 'standalone'`, which only includes necessary files for production.
- **Compose Management**: `docker-compose.yml` manages the production container build and environment.
