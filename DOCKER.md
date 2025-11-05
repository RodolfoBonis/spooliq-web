# Docker Setup for Spooliq Web

This application has been dockerized with optimization for minimal image size and maximum performance.

## Image Optimization Details

The production Docker image uses a multi-stage build process that reduces the final image size by approximately **85%** compared to a standard approach:

- **Base image**: Node 20 Alpine (5MB vs 90MB for Debian)
- **Multi-stage build**: Separates dependencies, building, and runtime
- **Standalone output**: Next.js standalone mode reduces bundle from ~400MB to ~100MB
- **Final image size**: ~150-200MB (vs 1GB+ unoptimized)

## Quick Start

### Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

### Initial Setup

1. Create the Docker environment file:
```bash
cp .env.docker.example .env.docker
```

2. Update `.env.docker` with your actual values:
   - `NEXT_PUBLIC_API_URL`: Your API endpoint
   - `NEXT_PUBLIC_CDN_API_KEY`: Your CDN API key

## Running the Application

### Production Mode

Build and run the optimized production image:

```bash
# Build the production image
docker-compose build

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

### Development Mode (with hot reload)

For development with automatic hot reload:

```bash
# Start development server
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f web-dev

# Stop development server
docker-compose -f docker-compose.dev.yml down
```

## Docker Commands

### Building Images

```bash
# Build production image
docker build -t spooliq-web:latest .

# Build with specific platform (for M1 Macs deploying to Linux)
docker buildx build --platform linux/amd64 -t spooliq-web:latest .

# Build without cache (fresh build)
docker build --no-cache -t spooliq-web:latest .
```

### Running Containers

```bash
# Run production container
docker run -p 3000:3000 --env-file .env.docker spooliq-web:latest

# Run with custom environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-api:8080/v1 \
  -e NODE_ENV=production \
  spooliq-web:latest

# Run in detached mode with auto-restart
docker run -d --restart unless-stopped -p 3000:3000 --env-file .env.docker spooliq-web:latest
```

### Container Management

```bash
# List running containers
docker ps

# View container logs
docker logs -f [container_id]

# Enter container shell
docker exec -it [container_id] sh

# Stop container
docker stop [container_id]

# Remove container
docker rm [container_id]
```

### Image Management

```bash
# List images
docker images

# Check image size
docker images spooliq-web --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Remove image
docker rmi spooliq-web:latest

# Clean up unused images
docker image prune -a
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:8080/v1` |
| `NEXT_PUBLIC_CDN_API_KEY` | CDN API key for image uploads | - |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Application port | `3000` |
| `HOSTNAME` | Hostname for container | `0.0.0.0` |

## Health Checks

The production container includes a health check that verifies the application is responding:

```bash
# Check container health
docker inspect --format='{{json .State.Health}}' spooliq-web | jq

# Manual health check
curl http://localhost:3000/api/health
```

## Troubleshooting

### Container won't start

Check logs for errors:
```bash
docker-compose logs web
```

### Application can't connect to backend API

If your API is running on the host machine:
- Use `host.docker.internal` instead of `localhost` in the API URL
- Example: `NEXT_PUBLIC_API_URL=http://host.docker.internal:8080/v1`

### Hot reload not working in development

Ensure volumes are mounted correctly:
```bash
docker-compose -f docker-compose.dev.yml config
```

### Permission issues

If you encounter permission errors, ensure the files have correct ownership:
```bash
# Fix permissions
sudo chown -R $(whoami):$(whoami) .
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build and push Docker image
  run: |
    docker buildx build \
      --platform linux/amd64,linux/arm64 \
      --tag ghcr.io/${{ github.repository }}:${{ github.sha }} \
      --tag ghcr.io/${{ github.repository }}:latest \
      --push .
```

### Deploy to Production

```bash
# Pull latest image
docker pull spooliq-web:latest

# Stop old container
docker stop spooliq-web && docker rm spooliq-web

# Start new container
docker run -d \
  --name spooliq-web \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.docker \
  spooliq-web:latest
```

## Performance Optimization

The Docker setup includes several optimizations:

1. **Multi-stage builds**: Reduces final image size by excluding build dependencies
2. **Layer caching**: Speeds up rebuilds by caching unchanged layers
3. **Alpine Linux**: Minimal base image (5MB vs 90MB)
4. **Standalone output**: Next.js optimization that includes only necessary files
5. **Non-root user**: Runs as unprivileged user for security
6. **Resource limits**: Prevents container from consuming excessive resources

## Security Best Practices

1. **Non-root user**: Application runs as `nextjs` user, not root
2. **Minimal base image**: Alpine Linux has smaller attack surface
3. **No secrets in image**: Use environment variables or secrets management
4. **Health checks**: Automatic container restart on failure
5. **Resource limits**: Prevents resource exhaustion attacks

## Monitoring

Monitor container metrics:
```bash
# CPU and memory usage
docker stats spooliq-web

# Detailed inspection
docker inspect spooliq-web
```

## Backup and Recovery

```bash
# Export container as tar
docker export spooliq-web > spooliq-web-backup.tar

# Import from tar
docker import spooliq-web-backup.tar spooliq-web:backup

# Save image
docker save spooliq-web:latest | gzip > spooliq-web-image.tar.gz

# Load image
docker load < spooliq-web-image.tar.gz
```