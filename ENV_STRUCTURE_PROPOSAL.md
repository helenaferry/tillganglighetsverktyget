# Environment Variables Structure - Proposed Cleanup

## Problem

Currently, the project has a confusing `.env` file structure:
- `.env.local.example` (root) contains only frontend variables - should be in `client/`
- `client/.env.example` is minimal (1 variable) when it should be comprehensive
- Unclear which file developers should use for local development

## Proposed Structure

### 1. Root `.env.example` - Container Orchestration Only

**Purpose:** Used by Podman Compose to orchestrate all services  
**Location:** `/Users/andreas/work/repos/tillganglighetsverktyget/.env.example`  
**When to use:** When running `podman compose` commands  
**Variables:**

```bash
# =================================================
# Tillgänglighetsverktyget - Podman Compose Config
# =================================================
# Copy this file to .env for container orchestration
# This file is ONLY for Podman Compose, not for local development

# =================================================
# DATABASE (Oracle Container)
# =================================================
ORACLE_PWD=                    # REQUIRED: System password for Oracle
DB_USER=tillgang_user
DB_PASSWORD=                   # REQUIRED: App database password

# =================================================
# BACKEND API (Backend Container)
# =================================================
NODE_ENV=development
BACKEND_PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# =================================================
# FRONTEND (Frontend Container)
# =================================================
VITE_API_URL=http://localhost:3000/api

# Note: For frontend-specific config (logos, titles, etc.),
# see client/.env.example
```

### 2. Server `.env.example` - Backend Development

**Purpose:** Backend service configuration  
**Location:** `/Users/andreas/work/repos/tillganglighetsverktyget/server/.env.example`  
**When to use:** When developing backend locally (without containers)  
**Current content:** ✅ Already good, keep as-is

```bash
# Database Configuration
DB_HOST=oracle-db              # Use 'localhost' for local dev
DB_PORT=1521
DB_SERVICE=XEPDB1
DB_USER=tillgang_user
DB_PASSWORD=                   # REQUIRED

# Server Configuration
NODE_ENV=development
PORT=3000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Client `.env.example` - Frontend Development (EXPANDED)

**Purpose:** Frontend service configuration + application customization  
**Location:** `/Users/andreas/work/repos/tillganglighetsverktyget/client/.env.example`  
**When to use:** When developing frontend locally (with or without containers)  
**Action needed:** Merge content from `.env.local.example` into this file

```bash
# =================================================
# Frontend Environment Variables
# =================================================
# Copy this file to .env.local for local development
# All variables prefixed with VITE_ are available in the frontend code

# =================================================
# API CONFIGURATION
# =================================================
# Backend API URL
# Development: http://localhost:3000/api
# Production: /api (nginx proxy)
VITE_API_URL=http://localhost:3000/api

# =================================================
# APPLICATION BRANDING
# =================================================
# Application title shown in UI
VITE_APPLICATION_TITLE="Granska tillgänglighet"

# Logo configuration (JSON format)
VITE_LOGO='{
    "header": {
        "mobileUrl": "/logoHeaderMobile.svg",
        "desktopUrl": "/logoHeader.svg"
    },
    "footer": {
        "mobileUrl": "/logoFooterMobile.svg",
        "desktopUrl": "/logoFooter.svg"
    }
}'

# =================================================
# LEGACY SUPABASE CONFIG (To be removed)
# =================================================
# These are no longer used but kept for reference during migration
# VITE_DATABASE_URL="DATABASE_URL_HERE"
# VITE_DATABASE_KEY="DATABASE_KEY_HERE"

# =================================================
# REQUIREMENTS CONFIGURATION
# =================================================
# Regulatory framework to use
VITE_REGULATORY_FRAMEWORK="dos"

# URL to requirements data
VITE_REQUIREMENTS_URL="REQUIREMENTS_URL_HERE"

# Additional requirements (JSON format)
VITE_REQUIREMENT_ADDITIONS='{
    "heading": "Arbetsförmedlingens tillägg",
    "items": [
        {
            "id": "jtin",
            "text": "Kravet är uppfyllt om tjänsten använder myndighetens teknik för enkel inloggning och användarautentisering, så kallad single sign-on."
        }
    ]
}'

# =================================================
# UI CONFIGURATION
# =================================================
# Footer links (JSON array format)
VITE_FOOTER_LINKS='[
    {
        "icon": "email",
        "text": "Mejla vår funktionsbrevlåda",
        "url": "mailto:designsystem@arbetsformedlingen.se"
    },
    {
        "text": "Arbetsförmedlingens designsystem (öppnas i egen flik)",
        "url": "https://designsystem.arbetsformedlingen.se/",
        "external": "true"
    }
]'

# Prefill requirements configuration (JSON array format)
VITE_PREFILL_REQUIREMENTS='[
    {
        "id": "1",
        "automatic": "false",
        "heading": "Valfri rubrik",
        "description": "Valfri beskrivningstext som förklarar för användaren vad förifyllnad innebär.",
        "activateText": "Text som visas i UI där användaren kan aktivera förifyllnad",
        "prefillRequirements": [
            {
                "ids": ["id1", "id2"],
                "status": "PASS",
                "comment": "Detta krav har förifyllts som godkänt eftersom ..."
            }
        ]
    },
    {
        "id": "2",
        "automatic": "true",
        "activateText": "",
        "prefillRequirements": [
            {
                "ids": ["id3","id4"],
                "status": "IRRELEVANT",
                "comment": "Detta krav har förifyllts som irrelevant eftersom ..."
            },
            {
                "ids": ["id5", "id6"],
                "status": "PASS",
                "comment": "Detta krav har förifyllts som godkänt eftersom ..."
            }
        ]
    }
]'
```

### 4. Delete `.env.local.example` from Root

**Action:** Remove this file as it's redundant and confusing.  
**Reason:** All its content belongs in `client/.env.example`

## Implementation Steps

1. **Merge frontend configs:**
   ```bash
   # Merge .env.local.example content into client/.env.example
   cat .env.local.example >> client/.env.example
   # Then manually organize and deduplicate
   ```

2. **Update root `.env.example`:**
   - Simplify to only orchestration variables
   - Add clear comments about scope
   - Add note pointing to client/.env.example for frontend config

3. **Delete `.env.local.example`:**
   ```bash
   rm .env.local.example
   ```

4. **Update documentation:**
   - Update `QUICKSTART.md` to reference correct files
   - Update `docs/SETUP.md` with new structure
   - Add section explaining which .env file to use when

## Usage Patterns

### For Container Development (Most Common)

```bash
# 1. Configure orchestration
cp .env.example .env
# Edit .env with database passwords

# 2. Configure frontend (optional, for customization)
cp client/.env.example client/.env.local
# Edit client/.env.local with branding, logos, etc.

# 3. Start containers
podman compose -f compose.dev.yml up
```

### For Local Backend Development (No Containers)

```bash
# 1. Configure backend
cd server
cp .env.example .env
# Edit server/.env with database connection

# 2. Start backend
npm run dev
```

### For Local Frontend Development (Backend in Container)

```bash
# 1. Start backend + database in containers
podman compose -f compose.dev.yml up oracle-db backend-api

# 2. Configure frontend
cd client
cp .env.example .env.local
# Edit client/.env.local

# 3. Start frontend locally
npm run dev
```

## File Summary Table

| File | Purpose | Scope | Required Variables |
|------|---------|-------|-------------------|
| `.env.example` | Container orchestration | All services | DB passwords, ports |
| `server/.env.example` | Backend development | Backend only | DB config, CORS |
| `client/.env.example` | Frontend development | Frontend only | API URL, branding, UI config |
| `.env.local.example` | ❌ TO DELETE | - | - |

## Benefits of This Structure

✅ **Clear separation of concerns:**
- Root = orchestration
- Server = backend config
- Client = frontend config

✅ **No confusion:**
- One .env.example per directory
- Each file has a single, clear purpose

✅ **Easy onboarding:**
- New developers know exactly which file to copy
- Documentation is straightforward

✅ **Environment-specific:**
- Can run frontend locally while backend is in container
- Can customize frontend without affecting orchestration

✅ **Security:**
- Sensitive data (passwords) only in orchestration file
- Frontend config is safe to share (no secrets)

## Migration Checklist

- [ ] Backup current `.env.local.example`
- [ ] Merge `.env.local.example` content into `client/.env.example`
- [ ] Add clear comments to `client/.env.example`
- [ ] Simplify root `.env.example` (remove frontend-specific variables except VITE_API_URL)
- [ ] Delete `.env.local.example`
- [ ] Update `.gitignore` if needed
- [ ] Update `QUICKSTART.md`
- [ ] Update `docs/SETUP.md`
- [ ] Test that both container and local development work
- [ ] Commit with clear message

## Example Documentation Update

Add to `QUICKSTART.md`:

```markdown
## Environment Variables

This project uses three `.env` files for different purposes:

### 1. Root `.env` (from `.env.example`)
**For:** Running with Podman Compose  
**Contains:** Database passwords, orchestration config  
```bash
cp .env.example .env
# Edit: Set ORACLE_PWD and DB_PASSWORD
```

### 2. Server `.env` (from `server/.env.example`)
**For:** Local backend development (without containers)  
**Contains:** Database connection, CORS config  
```bash
cd server && cp .env.example .env
```

### 3. Client `.env.local` (from `client/.env.example`)
**For:** Frontend customization (branding, logos, UI)  
**Contains:** Application title, logos, footer links, prefill config  
```bash
cd client && cp .env.example .env.local
```

**Note:** For most development, you only need the root `.env` file!
```
