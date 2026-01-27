-- =====================================================
-- Tillgänglighetsverktyget - Oracle Database Schema
-- =====================================================
-- This script is a REFERENCE/STANDALONE version of the schema
-- NOTE: The actual schema is created by 000-create-user.sh
-- This file can be used for manual schema recreation or reference
--
-- To use this script manually:
--   sqlplus tillgang_user/<password>@FREEPDB1 @001-initial-schema.sql
--
-- This script is IDEMPOTENT - safe to run multiple times
-- =====================================================

-- Set session parameters for better compatibility
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF';

-- =====================================================
-- 1. CREATE SEQUENCES FOR AUTO-INCREMENT
-- =====================================================

-- Sequence for reviews table (drop if exists, then create)
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

-- Sequence for checks table (drop if exists, then create)
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
-- 2. CREATE TABLES (drop if exists, then create)
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

-- =====================================================
-- 3. CREATE TRIGGERS FOR AUTO-INCREMENT AND TIMESTAMPS
-- =====================================================

-- Trigger for auto-increment on reviews
CREATE OR REPLACE TRIGGER reviews_bir
BEFORE INSERT ON "reviews"
FOR EACH ROW
BEGIN
  IF :new."id" IS NULL THEN
    SELECT reviews_seq.NEXTVAL INTO :new."id" FROM dual;
  END IF;
END;
/

-- Trigger for auto-increment on checks
CREATE OR REPLACE TRIGGER checks_bir
BEFORE INSERT ON "checks"
FOR EACH ROW
BEGIN
  IF :new."id" IS NULL THEN
    SELECT checks_seq.NEXTVAL INTO :new."id" FROM dual;
  END IF;
END;
/

-- Trigger for updating updated_at on checks
CREATE OR REPLACE TRIGGER checks_bur
BEFORE UPDATE ON "checks"
FOR EACH ROW
BEGIN
  :new."updated_at" := CURRENT_TIMESTAMP;
END;
/

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Drop indexes if they exist (for clean re-initialization)
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

-- Create indexes
CREATE INDEX idx_checks_review ON "checks"("review");
CREATE INDEX idx_checks_requirement ON "checks"("requirement");
CREATE INDEX idx_checks_status ON "checks"("status");
CREATE INDEX idx_reviews_created_at ON "reviews"("created_at");

-- =====================================================
-- 5. INSERT TEST DATA (Optional - for development)
-- =====================================================

-- Uncomment the following to insert sample data for testing
/*
-- Sample review
INSERT INTO reviews (title, excluded_content_types, object_type, regulatory_framework, selected_prefill_ids)
VALUES ('Test Granskning 1', 'video;audio', 'web', 'WCAG 2.2 AA', 'prefill1;prefill2');

-- Sample checks
INSERT INTO checks (review, requirement, status, check_comment, flag)
VALUES (1, 'req-1.1.1', 1, 'Alla bilder har alt-text', 0);

INSERT INTO checks (review, requirement, status, check_comment, flag)
VALUES (1, 'req-1.2.1', 0, 'Vissa videor saknar undertexter', 1);

INSERT INTO checks (review, requirement, status, check_comment, flag)
VALUES (1, 'req-1.3.1', 3, NULL, 0);

COMMIT;
*/

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
