import oracledb from 'oracledb';
import { getConnectionStringFromLDAP } from './getConnectionStringFromLDAP';

// Environment variables
const dbPassword = process.env.DB_PASSWORD;
const dbUser = process.env.DB_USER;

if (!dbPassword) {
  console.error('ERROR: DB_PASSWORD environment variable is not set');
  process.exit(1);
}

async function setupDatabase() {
  let connection: oracledb.Connection | undefined;

  try {
    console.log('Connecting to database...');
    const dbConnectionString = await getConnectionStringFromLDAP();
    connection = await oracledb.getConnection({
      user: dbUser,
      password: dbPassword,
      connectString: dbConnectionString,
    });

    console.log('Connected successfully. Creating database schema...');

    // Execute schema creation SQL
    const schemaSQL = `
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

      BEGIN
        DBMS_OUTPUT.PUT_LINE('Schema created successfully');
      END;
      /

      EXIT;
    `;

    // Execute the SQL
    await connection.execute(schemaSQL, [], { autoCommit: true });

    console.log('Schema creation completed successfully');

    // Verify tables were created
    const result = await connection.execute(
      `SELECT COUNT(*) FROM user_tables WHERE table_name IN ('REVIEWS', 'CHECKS')`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const tablesCount = result.rows?.[0]?.['COUNT(*)'] || 0;
    if (tablesCount !== 2) {
      console.warn(`WARNING: Expected 2 tables, but found ${tablesCount}`);
    } else {
      console.log('Verification: 2 tables created successfully');
    }
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

setupDatabase();
