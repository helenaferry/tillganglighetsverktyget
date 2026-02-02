#!/usr/bin/env bash
# Start dev stack and wait until Database, API, and Client are actually ready.
# Run from repo root, or from any directory (script will cd to repo root).
# Requires: podman compose, curl, nc (netcat).

set -e

COMPOSE_FILE="compose.dev.yml"
TIMEOUT_SEC=300
POLL_INTERVAL=3

# Repo root = directory containing compose.dev.yml (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: $COMPOSE_FILE not found in $REPO_ROOT" >&2
  exit 1
fi

check_dependencies() {
  local missing=()
  for cmd in curl nc; do
    if ! command -v "$cmd" &>/dev/null; then
      missing+=("$cmd")
    fi
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "Error: Required command(s) not found in PATH: ${missing[*]}" >&2
    echo "Install them (e.g. curl, netcat-openbsd or nmap-ncat) and try again." >&2
    exit 1
  fi
  if ! podman compose version &>/dev/null; then
    echo "Error: podman compose failed or not found. Install Podman and try again." >&2
    exit 1
  fi
}

check_db() {
  nc -z localhost 1521 >/dev/null 2>&1
}

check_api() {
  curl -sf -o /dev/null --max-time 2 http://localhost:3000/health >/dev/null 2>&1
}

check_client() {
  curl -sf -o /dev/null --max-time 2 http://localhost:5173/ >/dev/null 2>&1
}

check_dependencies

# Compose-style output: spinner when waiting, green checkmark when ready (only if stdout is a TTY)
if [[ -t 1 ]]; then
  GREEN='\033[32m'
  RESET='\033[0m'
  CHECKMARK='✓'
  SPINNER_CHARS='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
else
  GREEN=''
  RESET=''
  CHECKMARK='✓'
  SPINNER_CHARS="|/-\\"
fi

echo "Starting services (podman compose -f $COMPOSE_FILE up -d)..."
podman compose -f "$COMPOSE_FILE" up -d

echo ""
echo "Waiting for services to become ready (timeout ${TIMEOUT_SEC}s)..."
echo ""

start=$(date +%s)
db_ready=0
api_ready=0
client_ready=0

while true; do
  now=$(date +%s)
  elapsed=$((now - start))
  if [[ $elapsed -ge $TIMEOUT_SEC ]]; then
    echo ""
    echo "Timeout (${TIMEOUT_SEC}s). Not all services became ready:" >&2
    printf "  Database:  %s\n" "$([ $db_ready -eq 1 ] && echo 'Ready' || echo 'Not ready')" >&2
    printf "  API:       %s\n" "$([ $api_ready -eq 1 ] && echo 'Ready' || echo 'Not ready')" >&2
    printf "  Client:    %s\n" "$([ $client_ready -eq 1 ] && echo 'Ready' || echo 'Not ready')" >&2
    echo "" >&2
    echo "Check logs: podman compose -f $COMPOSE_FILE logs -f" >&2
    exit 1
  fi

  if [[ $db_ready -eq 0 ]] && check_db; then db_ready=1; fi
  if [[ $api_ready -eq 0 ]] && check_api; then api_ready=1; fi
  if [[ $client_ready -eq 0 ]] && check_client; then client_ready=1; fi

  # Status: one line per service (never horizontal); overwrite previous block each poll.
  # Pad status to fixed width so overwriting doesn't leave leftover text from longer lines.
  STATUS_WIDTH=21
  spinner_idx=$(( (elapsed / POLL_INTERVAL) % ${#SPINNER_CHARS} ))
  spinner_char="${SPINNER_CHARS:spinner_idx:1}"

  print_status_line() {
    local ready=$1
    local label=$2
    local waiting_msg=$3
    if [[ $ready -eq 1 ]]; then
      printf "  %b%s%b  %-12s%b%-${STATUS_WIDTH}s%b\n" "$GREEN" "$CHECKMARK" "$RESET" "${label}:" "$GREEN" "Ready" "$RESET"
    else
      printf "  %s  %-12s%-${STATUS_WIDTH}s\n" "$spinner_char" "${label}:" "$waiting_msg"
    fi
  }

  if [[ $db_ready -eq 0 || $api_ready -eq 0 || $client_ready -eq 0 ]]; then
    [[ -t 1 && $elapsed -gt 0 ]] && printf '\033[4A'  # move up 4 lines to overwrite (blank + 3 status lines)
    printf "\n"
    print_status_line "$db_ready" "Database" "Waiting for Oracle..."
    print_status_line "$api_ready" "API" "Waiting for backend..."
    print_status_line "$client_ready" "Client" "Waiting for Vite..."
  fi

  if [[ $db_ready -eq 1 && $api_ready -eq 1 && $client_ready -eq 1 ]]; then
    [[ -t 1 && $elapsed -gt 0 ]] && printf '\033[4A'
    printf "\n"
    print_status_line 1 "Database" ""
    print_status_line 1 "API" ""
    print_status_line 1 "Client" ""
    echo ""
    printf "%bAll services are ready.%b\n" "$GREEN" "$RESET"
    echo ""
    echo "  Client:         http://localhost:5173"
    echo "  Backend health: http://localhost:3000/health"
    echo ""
    echo "  Stop services:  podman compose -f $COMPOSE_FILE down"
    echo "  (stop only:     podman compose -f $COMPOSE_FILE stop)"
    echo ""
    exit 0
  fi

  sleep "$POLL_INTERVAL"
done
