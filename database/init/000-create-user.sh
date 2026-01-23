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
until echo "SELECT 1 FROM DUAL;" | sqlplus -s system/${ORACLE_PWD}@XEPDB1 > /dev/null 2>&1; do
  echo "Waiting for database to be ready..."
  sleep 5
done

# Create user if it doesn't exist
sqlplus -s system/${ORACLE_PWD}@XEPDB1 <<EOF
SET HEADING OFF
SET FEEDBACK OFF
SET VERIFY OFF

DECLARE
  user_exists INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_exists FROM dba_users WHERE username = 'TILLGANG_USER';
  IF user_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE USER tillgang_user IDENTIFIED BY "${DB_PASSWORD}" DEFAULT TABLESPACE users TEMPORARY TABLESPACE temp QUOTA UNLIMITED ON users';
    EXECUTE IMMEDIATE 'GRANT CONNECT, RESOURCE TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE TABLE TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE SEQUENCE TO tillgang_user';
    EXECUTE IMMEDIATE 'GRANT CREATE VIEW TO tillgang_user';
    DBMS_OUTPUT.PUT_LINE('User tillgang_user created successfully');
  ELSE
    DBMS_OUTPUT.PUT_LINE('User tillgang_user already exists');
  END IF;
END;
/

EXIT;
EOF

echo "User creation completed"
