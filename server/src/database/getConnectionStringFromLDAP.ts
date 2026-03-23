import { DB_CONFIG } from './CONFIG';
import { Client } from 'ldapts';

const getValueFromString = (stringToSearch: any, valueToFind: string):string =>{
  const regex = new RegExp(`\\(${valueToFind}=([^\\)]+)\\)`);
  const match = stringToSearch.match(regex);
  return match ? match[1] : '';
}
/*
* Funktion för att hämta connection-string från LDAP
* */
export const getConnectionStringFromLDAP = async()=>{

  const LDAP_URL = DB_CONFIG.ldapUrl

   const client = new Client({
     url: LDAP_URL
   });

   try {
     try {
       // Detta skapar en anonym connection till LDAP - vi kommer att få ett fel
       // men struntar i det
       await client.bind(`uid=${DB_CONFIG.username},ou=users,dc=example,dc=org`, DB_CONFIG.password);
     } catch (e){}

     const wpOrWt = DB_CONFIG.ldapUrl === 'ldap://afkatalog.arbetsformedlingen.se:389' ? 'WP' : 'WT';

     const baseDN = `cn=OracleContext,ou=${wpOrWt},ou=oracle,o=AF,c=SE`;
     const filter = `(cn=${DB_CONFIG.dbServiceName})`;

     const { searchEntries } = await client.search(baseDN, {
       scope: 'sub',
       attributes: [
         'orclNetDescString'
       ],
       filter
     });

     if (searchEntries.length === 0) {
       throw new Error('No Oracle services found in LDAP');
     }

     const entry = searchEntries[0];
     const connStr = entry.orclNetDescString;

     /*
      Det vi får tillbaks ser ut så här typ:
     //Oracle descriptor: (DESCRIPTION=(CONNECT_TIMEOUT=90)(RETRY_COUNT=30)(RETRY_DELAY=3)(TRANSPORT_CONNECT_TIMEOUT=3)
                          (ADDRESS_LIST=(LOAD_BALANCE=ON)(ADDRESS=(PROTOCOL=tcp)(PORT=1521)(HOST=mtstutvscan.arbetsformedlingen.se)))
                          (CONNECT_DATA=(SERVICE_NAME=utvtillganglighetsrv)))
     Vi behöver plocka ut innehållet så den kommer se ut så här:
     <HOST>:<PORT>/<SERVICE_NAME>
     maccscan.arbetsformedlingen.se:1521/utvtillganglighetsrv
     */

     return `${getValueFromString(connStr, 'HOST')}:${getValueFromString(connStr, 'PORT')}/${getValueFromString(connStr, 'SERVICE_NAME')}`

   } catch (err) {
     console.error('LDAP error:', err);
   } finally {
     await client.unbind();
   }
}