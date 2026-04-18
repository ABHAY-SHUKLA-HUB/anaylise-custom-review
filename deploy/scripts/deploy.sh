#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/pulsereview"
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"

if [[ -z "${GHCR_OWNER:-}" || -z "${IMAGE_NAME:-}" || -z "${IMAGE_TAG:-}" ]]; then
  echo "GHCR_OWNER, IMAGE_NAME, and IMAGE_TAG must be set"
  exit 1
fi

cd "$APP_DIR"

echo "Pulling image ghcr.io/${GHCR_OWNER}/${IMAGE_NAME}:${IMAGE_TAG}"
docker compose -f "$COMPOSE_FILE" pull

echo "Starting updated containers"
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "Pruning old images"
docker image prune -f

echo "Deployment finished"
