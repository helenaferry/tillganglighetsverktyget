import  oracledb from 'oracledb'
import { getConnectionStringFromLDAP } from './getConnectionStringFromLDAP';

// 'mtstutvscan.arbetsformedlingen.se:1521/utvtillganglighetsrv'

// TEST MED ENDAST ORACLE-klient och inte Sequalize
export const testDBConnecion = async()=>{
    console.log('in testDBConnecion ')
    // Starta Oracle i Thick-mode. Behövs detta fortfarande?
    oracledb.initOracleClient({ libDir: 'C:\\Program Files\\instantclient_23_0'});
    let conn;

    try {
      const connectionString = await getConnectionStringFromLDAP();

      conn = await oracledb.getConnection({
        user: 'tillganglighet',
        password: 'tillganglighet',
        connectString: connectionString
      });

      console.log('✅ Connection successful!');

    } catch (err) {
      console.error('❌ Connection failed:', err);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (closeErr) {
          console.error('Error closing connection:', closeErr);
        }
      }
    }
}