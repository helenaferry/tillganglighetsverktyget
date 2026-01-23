-- =====================================================
-- Tillgänglighetsverktyget - Oracle Database Schema
-- =====================================================
-- This script initializes the database for the accessibility review tool
-- It creates the necessary user, tablespace, tables, sequences, and indexes

-- Set session parameters for better compatibility
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF';

-- =====================================================
-- 1. CREATE APPLICATION USER
-- =====================================================
-- Note: The tablespace USERS should already exist in Oracle XE
-- We create a dedicated user for the application (not using SYSTEM)

-- Create user if it doesn't exist (Oracle 12c+ syntax)
-- NOTE: Password should be set via DB_PASSWORD environment variable
-- This script expects the user to be created externally or password to be changed immediately
DECLARE
  user_exists INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_exists FROM dba_users WHERE username = 'TILLGANG_USER';
  IF user_exists = 0 THEN
    -- User will be created by container entrypoint or must be created manually
    -- If creating manually: CREATE USER tillgang_user IDENTIFIED BY <secure-password>
    -- For development, you can set a password via environment variable
    NULL; -- User creation handled externally
  END IF;
END;
/

-- NOTE: If user doesn't exist, you must create it manually before running this script:
-- CREATE USER tillgang_user IDENTIFIED BY "<your-secure-password>" 
--   DEFAULT TABLESPACE users TEMPORARY TABLESPACE temp QUOTA UNLIMITED ON users;

-- Grant necessary privileges
GRANT CONNECT, RESOURCE TO tillgang_user;
GRANT CREATE SESSION TO tillgang_user;
GRANT CREATE TABLE TO tillgang_user;
GRANT CREATE SEQUENCE TO tillgang_user;
GRANT CREATE VIEW TO tillgang_user;

-- =====================================================
-- 2. CONNECT AS APPLICATION USER
-- =====================================================
ALTER SESSION SET CURRENT_SCHEMA = tillgang_user;

-- =====================================================
-- 3. CREATE SEQUENCES FOR AUTO-INCREMENT
-- =====================================================

-- Sequence for reviews table
BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE reviews_seq';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

CREATE SEQUENCE reviews_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

-- Sequence for checks table
BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE checks_seq';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

CREATE SEQUENCE checks_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

-- =====================================================
-- 4. CREATE TABLES
-- =====================================================

-- Drop tables if they exist (for clean re-initialization)
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

-- Create trigger for auto-increment on reviews
CREATE OR REPLACE TRIGGER reviews_bir
BEFORE INSERT ON "reviews"
FOR EACH ROW
BEGIN
  IF :new."id" IS NULL THEN
    SELECT reviews_seq.NEXTVAL INTO :new."id" FROM dual;
  END IF;
END;
/

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

-- Create trigger for auto-increment on checks
CREATE OR REPLACE TRIGGER checks_bir
BEFORE INSERT ON "checks"
FOR EACH ROW
BEGIN
  IF :new."id" IS NULL THEN
    SELECT checks_seq.NEXTVAL INTO :new."id" FROM dual;
  END IF;
END;
/

-- Create trigger for updating updated_at on checks
CREATE OR REPLACE TRIGGER checks_bur
BEFORE UPDATE ON "checks"
FOR EACH ROW
BEGIN
  :new."updated_at" := CURRENT_TIMESTAMP;
END;
/

-- =====================================================
-- 5. CREATE INDEXES
-- =====================================================

-- Index on foreign key for better join performance
CREATE INDEX idx_checks_review ON "checks"("review");

-- Index on requirement for faster lookups
CREATE INDEX idx_checks_requirement ON "checks"("requirement");

-- Index on status for filtering
CREATE INDEX idx_checks_status ON "checks"("status");

-- Index on created_at for sorting
CREATE INDEX idx_reviews_created_at ON "reviews"("created_at");

-- =====================================================
-- 6. INSERT TEST DATA (Optional - for development)
-- =====================================================

-- Uncomment the following to insert sample data for testing
/*
-- Sample review
INSERT INTO reviews (title, excluded_content_types, object_type, regulatory_framework, selected_prefill_ids)
VALUES ('Test Granskning 1', 'video;audio', 'web', 'WCAG 2.2 AA', 'prefill1;prefill2');

-- Sample checks
INSERT INTO checks (review, requirement, status, comment, flag)
VALUES (1, 'req-1.1.1', 1, 'Alla bilder har alt-text', 0);

INSERT INTO checks (review, requirement, status, comment, flag)
VALUES (1, 'req-1.2.1', 0, 'Vissa videor saknar undertexter', 1);

INSERT INTO checks (review, requirement, status, comment, flag)
VALUES (1, 'req-1.3.1', 3, NULL, 0);

COMMIT;
*/

-- =====================================================
-- 7. GRANT PERMISSIONS TO APPLICATION USER
-- =====================================================

-- Grant select, insert, update, delete on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO tillgang_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON checks TO tillgang_user;

-- Grant usage on sequences
GRANT SELECT ON reviews_seq TO tillgang_user;
GRANT SELECT ON checks_seq TO tillgang_user;

-- Commit all changes
COMMIT;

-- Display success message
BEGIN
  DBMS_OUTPUT.PUT_LINE('==============================================');
  DBMS_OUTPUT.PUT_LINE('Schema initialization completed successfully!');
  DBMS_OUTPUT.PUT_LINE('==============================================');
  DBMS_OUTPUT.PUT_LINE('User: tillgang_user');
  DBMS_OUTPUT.PUT_LINE('Tables: reviews, checks');
  DBMS_OUTPUT.PUT_LINE('Sequences: reviews_seq, checks_seq');
  DBMS_OUTPUT.PUT_LINE('==============================================');
END;
/
