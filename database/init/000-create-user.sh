#!/bin/bash
# Script to create Oracle application user with password from environment variable
# This runs before the SQL initialization scripts

set -e

echo "Creating application user tillgang_user..."

# Use DB_PASSWORD from environment, or fail if not set
if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: DB_PASSWORD environment variable is not set"
  exit 1
fi

# Check ORACLE_PWD is set
if [ -z "$ORACLE_PWD" ]; then
  echo "ERROR: ORACLE_PWD environment variable is not set"
  exit 1
fi

# Wait for database to be ready (with timeout)
echo "Waiting for Oracle database and FREEPDB1 to be ready..."
MAX_WAIT=300  # 5 minutes max
WAITED=0

# Wait for Oracle instance and FREEPDB1 to be ready
# Oracle Free should automatically open FREEPDB1, but it may take time
while [ $WAITED -lt $MAX_WAIT ]; do
  # Try to connect to FREEPDB1 directly first
  if echo "SELECT 1 FROM DUAL;" | sqlplus -s system/${ORACLE_PWD}@FREEPDB1 > /dev/null 2>&1; then
    echo "FREEPDB1 is ready!"
    break
  fi
  
  # FREEPDB1 is not ready yet
  # Oracle Free should automatically open FREEPDB1 during initialization
  # Listener registration can take additional time after PDB is open
  echo "Waiting for FREEPDB1 to be available... (${WAITED}s/${MAX_WAIT}s)"
  
  # After 90 seconds, try to help by opening FREEPDB1 if it's not open
  if [ $WAITED -ge 90 ]; then
    # Try to open FREEPDB1 via local connection (using ORACLE_SID)
    echo "Checking if FREEPDB1 needs to be opened..."
    export ORACLE_SID=FREE
    PDB_OPEN_MODE=$(echo "SELECT open_mode FROM v\$pdbs WHERE name='FREEPDB1';" | sqlplus -s / as sysdba 2>/dev/null | grep -iE "READ WRITE|MOUNTED" || echo "")
    
    if echo "$PDB_OPEN_MODE" | grep -qi "MOUNTED"; then
      echo "Opening FREEPDB1..."
      echo "ALTER PLUGGABLE DATABASE FREEPDB1 OPEN;" | sqlplus -s / as sysdba > /dev/null 2>&1 || true
      sleep 5  # Give listener time to register the service
    fi
    unset ORACLE_SID
  fi
  
  sleep 5
  WAITED=$((WAITED + 5))
done

# Final check
if ! echo "SELECT 1 FROM DUAL;" | sqlplus -s system/${ORACLE_PWD}@FREEPDB1 > /dev/null 2>&1; then
  echo "ERROR: FREEPDB1 did not become available within ${MAX_WAIT} seconds"
  echo "Diagnostic information:"
  echo "Checking PDB status..."
  export ORACLE_SID=FREE
  echo "SELECT name, open_mode FROM v\$pdbs;" | sqlplus -s / as sysdba 2>/dev/null || echo "Could not check PDB status"
  unset ORACLE_SID
  echo ""
  echo "Check Oracle logs for more details:"
  echo "  podman compose -f compose.dev.yml logs oracle-db | grep -E 'FREEPDB1|listener|DATABASE IS READY'"
  exit 1
fi

echo "Database is ready. Creating user..."

# Create user if it doesn't exist
# Capture output for debugging
sqlplus -S system/${ORACLE_PWD}@FREEPDB1 <<EOF > /tmp/user-creation.log 2>&1
SET HEADING OFF
SET FEEDBACK OFF
SET VERIFY OFF
SET SERVEROUTPUT ON

DECLARE
  user_exists INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_exists FROM dba_users WHERE username = 'TILLGANG_USER';
  IF user_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE USER tillgang_user IDENTIFIED BY "${DB_PASSWORD}"';
    EXECUTE IMMEDIATE 'GRANT CONNECT, RESOURCE TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE TABLE TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE SEQUENCE TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE VIEW TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT UNLIMITED TABLESPACE TO tillgang_user';
    DBMS_OUTPUT.PUT_LINE('User tillgang_user created successfully');
  ELSE
    DBMS_OUTPUT.PUT_LINE('User tillgang_user already exists');
  END IF;
END;
/

EXIT;
EOF

# Check if user creation was successful
SQL_EXIT_CODE=$?
if [ $SQL_EXIT_CODE -ne 0 ]; then
  echo "ERROR: sqlplus failed with exit code $SQL_EXIT_CODE"
  echo "Output:"
  cat /tmp/user-creation.log
  exit 1
fi

# Check for Oracle errors in output
if grep -qi "ORA-" /tmp/user-creation.log || grep -qi "ERROR" /tmp/user-creation.log; then
  echo "ERROR: Oracle errors detected during user creation:"
  cat /tmp/user-creation.log
  exit 1
fi

# Verify user was created
USER_EXISTS=$(echo "SELECT COUNT(*) FROM all_users WHERE username='TILLGANG_USER';" | sqlplus -s system/${ORACLE_PWD}@FREEPDB1 | grep -E '^\s*1\s*$' || echo "0")
if [ "$USER_EXISTS" != "1" ]; then
  echo "ERROR: User tillgang_user was not created successfully"
  echo "User creation log:"
  cat /tmp/user-creation.log
  exit 1
fi

echo "User creation completed successfully"

# Now create the schema as the application user
echo "Creating database schema..."

sqlplus -S tillgang_user/${DB_PASSWORD}@FREEPDB1 <<'SCHEMA_EOF' > /tmp/schema-creation.log 2>&1
SET SERVEROUTPUT ON

-- Create sequences (drop if exists first for idempotency)
BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE reviews_seq';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/
CREATE SEQUENCE reviews_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE checks_seq';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/
CREATE SEQUENCE checks_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- Drop tables if they exist (for idempotency)
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE checks CASCADE CONSTRAINTS';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE reviews CASCADE CONSTRAINTS';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

-- Create reviews table (quoted lowercase for Sequelize compatibility)
CREATE TABLE "reviews" (
  "id" NUMBER PRIMARY KEY,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "title" VARCHAR2(500),
  "excluded_content_types" VARCHAR2(4000),
  "object_type" VARCHAR2(100),
  "regulatory_framework" VARCHAR2(100),
  "selected_prefill_ids" VARCHAR2(4000)
);

-- Create checks table (quoted lowercase for Sequelize compatibility)
CREATE TABLE "checks" (
  "id" NUMBER PRIMARY KEY,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP,
  "review" NUMBER NOT NULL,
  "requirement" VARCHAR2(100),
  "status" NUMBER,
  "check_comment" CLOB,
  "flag" NUMBER(1) DEFAULT 0,
  CONSTRAINT fk_checks_review FOREIGN KEY ("review") REFERENCES "reviews"("id") ON DELETE CASCADE,
  CONSTRAINT uq_checks_review_req UNIQUE ("review", "requirement")
);

-- Create triggers
CREATE OR REPLACE TRIGGER reviews_bir
BEFORE INSERT ON "reviews"
FOR EACH ROW
BEGIN
  IF :new."id" IS NULL THEN
    SELECT reviews_seq.NEXTVAL INTO :new."id" FROM dual;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER checks_bir
BEFORE INSERT ON "checks"
FOR EACH ROW
BEGIN
  IF :new."id" IS NULL THEN
    SELECT checks_seq.NEXTVAL INTO :new."id" FROM dual;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER checks_bur
BEFORE UPDATE ON "checks"
FOR EACH ROW
BEGIN
  :new."updated_at" := CURRENT_TIMESTAMP;
END;
/

-- Create indexes (drop if exists first for idempotency)
BEGIN
  EXECUTE IMMEDIATE 'DROP INDEX idx_checks_review';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP INDEX idx_checks_requirement';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP INDEX idx_checks_status';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP INDEX idx_reviews_created_at';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

CREATE INDEX idx_checks_review ON "checks"("review");
CREATE INDEX idx_checks_requirement ON "checks"("requirement");
CREATE INDEX idx_checks_status ON "checks"("status");
CREATE INDEX idx_reviews_created_at ON "reviews"("created_at");

COMMIT;

DBMS_OUTPUT.PUT_LINE('Schema created successfully');

EXIT;
SCHEMA_EOF

# Check if schema creation was successful
SCHEMA_EXIT_CODE=$?
if [ $SCHEMA_EXIT_CODE -ne 0 ]; then
  echo "ERROR: sqlplus failed with exit code $SCHEMA_EXIT_CODE"
  echo "Schema creation output:"
  cat /tmp/schema-creation.log
  exit 1
fi

# Check for Oracle errors in output
if grep -qi "ORA-" /tmp/schema-creation.log || grep -qi "ERROR" /tmp/schema-creation.log; then
  echo "ERROR: Oracle errors detected during schema creation:"
  cat /tmp/schema-creation.log
  exit 1
fi

# Verify tables were created
TABLES_COUNT=$(echo "SELECT COUNT(*) FROM user_tables WHERE table_name IN ('REVIEWS', 'CHECKS');" | sqlplus -s tillgang_user/${DB_PASSWORD}@FREEPDB1 | grep -E '^\s*2\s*$' || echo "0")
if [ "$TABLES_COUNT" != "2" ]; then
  echo "ERROR: Tables were not created successfully. Found $TABLES_COUNT tables instead of 2"
  echo "Schema creation log:"
  cat /tmp/schema-creation.log
  exit 1
fi

echo "Schema creation completed successfully"
