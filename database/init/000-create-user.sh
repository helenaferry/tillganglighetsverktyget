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

# Wait for database to be ready
until echo "SELECT 1 FROM DUAL;" | sqlplus -s system/${ORACLE_PWD}@FREEPDB1 > /dev/null 2>&1; do
  echo "Waiting for database to be ready..."
  sleep 5
done

# Create user if it doesn't exist
sqlplus -s system/${ORACLE_PWD}@FREEPDB1 <<EOF
SET HEADING OFF
SET FEEDBACK OFF
SET VERIFY OFF

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

echo "User creation completed"

# Now create the schema as the application user
echo "Creating database schema..."

sqlplus -s tillgang_user/${DB_PASSWORD}@FREEPDB1 <<'SCHEMA_EOF'
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

echo "Schema creation completed"
