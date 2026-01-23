# Code Review Prompt for Containerization Implementation

## Project Context

This is a containerization implementation for **Tillgänglighetsverktyget** (Accessibility Review Tool), a web application for managing accessibility reviews. The application has been migrated from:
- **Database:** Supabase (PostgreSQL) → Oracle XE 21c
- **API:** Supabase auto-generated → Custom Express REST API
- **Deployment:** Cloud service → Self-hosted Podman containers

## Scope of Changes

The implementation includes:

1. **Database Layer:**
   - Oracle XE database initialization scripts (`database/init/001-initial-schema.sql`)
   - Schema with `reviews` and `checks` tables, sequences, triggers, indexes
   - Database documentation

2. **Backend API:**
   - Sequelize models for Oracle (`server/src/models/`)
   - REST API controllers (`server/src/controllers/reviewController.ts`)
   - Routes and middleware (`server/src/routes/`, `server/src/app.ts`)
   - Oracle database connection configuration
   - Containerfiles for development and production

3. **Frontend:**
   - REST API client replacing Supabase (`client/app/data/apiClient.ts`)
   - Updated service layer (`client/app/data/reviewService.ts`)
   - Containerfiles for development (Vite) and production (Nginx)
   - Nginx configuration with SPA routing and API proxy

4. **Orchestration:**
   - Podman Compose files for development and production
   - Environment variable templates
   - Health checks and service dependencies

5. **Documentation:**
   - Comprehensive setup guides (in Swedish)
   - API documentation
   - Architecture documentation
   - Migration guide from Supabase

## Review Focus Areas

### 1. Security & Best Practices

**Check for:**
- Hardcoded credentials or secrets (especially in Containerfiles)
- Proper use of environment variables
- Security headers in Nginx configuration
- Non-root users in production containers
- Resource limits in production compose file
- Proper .gitignore to prevent committing secrets
- SQL injection vulnerabilities in controllers
- Input validation and sanitization
- CORS configuration appropriateness

**Files to review:**
- `server/Containerfile.prod`
- `client/Containerfile.prod`
- `compose.prod.yml`
- `server/src/controllers/reviewController.ts`
- `server/src/app.ts`
- `.gitignore`

### 2. Database Implementation

**Check for:**
- Correct Oracle SQL syntax (sequences, triggers, constraints)
- Proper handling of Oracle-specific data types (NUMBER vs INTEGER, CLOB vs VARCHAR2)
- Foreign key constraints and cascade behavior
- Index strategy for performance
- Sequence initialization and reset logic
- Character encoding (UTF-8/AL32UTF8)
- Connection string format for Oracle

**Files to review:**
- `database/init/001-initial-schema.sql`
- `server/src/database/database.ts`
- `server/src/database/CONFIG.ts`
- `server/src/models/Review.ts`
- `server/src/models/Check.ts`

### 3. API Implementation

**Check for:**
- RESTful design principles
- Proper HTTP status codes
- Error handling consistency
- Input validation
- Response format consistency
- Edge case handling (null values, empty arrays, etc.)
- Transaction handling for bulk operations
- Proper use of Sequelize methods

**Files to review:**
- `server/src/controllers/reviewController.ts`
- `server/src/routes/reviewRoutes.ts`
- `server/src/app.ts`

### 4. Container Configuration

**Check for:**
- Multi-stage builds properly implemented
- Image size optimization
- Correct base images and versions
- Oracle Instant Client installation and configuration
- Volume mounts (read-only where appropriate)
- Port exposure (only necessary ports)
- Health check implementations
- Build context optimization (.dockerignore)

**Files to review:**
- `server/Containerfile.dev`
- `server/Containerfile.prod`
- `client/Containerfile.dev`
- `client/Containerfile.prod`
- `compose.dev.yml`
- `compose.prod.yml`

### 5. Frontend Migration

**Check for:**
- Complete removal of Supabase dependencies
- API client error handling
- Proper async/await usage
- Type safety maintained
- Backward compatibility with existing components
- Environment variable usage

**Files to review:**
- `client/app/data/apiClient.ts`
- `client/app/data/reviewService.ts`
- `client/package.json`

### 6. Configuration & Environment

**Check for:**
- All required environment variables documented
- Sensible default values
- Production vs development differences
- Missing configuration options
- Environment variable naming consistency

**Files to review:**
- `.env.example`
- `server/.env.example`
- `client/.env.example`
- `compose.dev.yml`
- `compose.prod.yml`

### 7. Documentation Quality

**Check for:**
- Accuracy of instructions
- Completeness of examples
- Correct file paths and commands
- Missing critical information
- Consistency between documents
- Code examples are executable

**Files to review:**
- `docs/SETUP.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `QUICKSTART.md`
- `database/README.md`

### 8. Code Quality & Maintainability

**Check for:**
- TypeScript type safety
- Code organization and structure
- Error messages are helpful
- Logging is appropriate
- Code duplication
- Magic numbers/strings
- Comments where needed
- Consistent code style

**Files to review:**
- All TypeScript files in `server/src/`
- All TypeScript files in `client/app/data/`

## Specific Technical Concerns

1. **Oracle Compatibility:**
   - Verify Sequelize Oracle dialect configuration
   - Check Oracle Instant Client version compatibility
   - Ensure connection string format is correct
   - Verify data type mappings (boolean → NUMBER(1))

2. **Container Networking:**
   - Service name resolution in compose files
   - Port conflicts
   - Network isolation
   - Health check dependencies

3. **Data Migration:**
   - Schema transformation accuracy
   - Data type conversions
   - Sequence synchronization after import

4. **Production Readiness:**
   - Resource limits are appropriate
   - Health checks are reliable
   - Restart policies are correct
   - Logging strategy
   - Backup procedures documented

## Review Output Format

Please provide:

1. **Critical Issues:** Security vulnerabilities, data loss risks, breaking changes
2. **Major Issues:** Performance problems, incorrect implementations, missing features
3. **Minor Issues:** Code quality, documentation gaps, optimization opportunities
4. **Suggestions:** Best practices, improvements, alternative approaches

For each issue, provide:
- File and line number (if applicable)
- Description of the problem
- Suggested fix
- Priority level

## Branch Information

- **Branch:** `podman-test`
- **Base:** `ny-backend` (or main branch)
- **Commits:** 11 commits with Swedish commit messages
- **Files Changed:** ~30 new files, ~10 modified files

## Testing Considerations

While reviewing, consider:
- How would a developer test this locally?
- Are there any missing steps in the setup process?
- Would this work on different operating systems?
- Are there any race conditions in startup?
- Is error recovery handled properly?

## Questions to Answer

1. Can a developer follow the documentation and successfully run the application?
2. Are there any security vulnerabilities that need immediate attention?
3. Is the Oracle database configuration correct and production-ready?
4. Are the container images optimized and secure?
5. Is the API implementation complete and follows best practices?
6. Will the migration from Supabase work smoothly?
7. Are there any missing pieces or incomplete implementations?

---

**Note:** The documentation is in Swedish, but code, comments, and commit messages should be reviewed. Focus on technical correctness, security, and best practices rather than language.
