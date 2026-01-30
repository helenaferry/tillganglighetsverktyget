# Felsökning: "DATABASE SETUP WAS NOT SUCCESSFUL"

Detta fel uppstår när Oracle-containerns init-skript (`000-create-user.sh`) misslyckas. Här är en systematisk guide för att identifiera problemet.

**💡 Om setup fungerar på en maskin men inte på en annan:** Se [ENVIRONMENT_DIFFERENCES.md](ENVIRONMENT_DIFFERENCES.md) för en omfattande guide om miljöskillnader.

## Steg 1: Kontrollera Oracle-loggar

```bash
# Visa alla Oracle-loggar
podman compose -f compose.dev.yml logs oracle-db

# Filtrera efter fel och init-skript
podman compose -f compose.dev.yml logs oracle-db | grep -E "ERROR|create-user|DATABASE SETUP|exit"
```

## Vanliga orsaker och lösningar

### 1. DB_PASSWORD miljövariabel saknas eller är tom

**Symptom:**

```
ERROR: DB_PASSWORD environment variable is not set
```

**Lösning:**

```bash
# Kontrollera att .env finns och innehåller DB_PASSWORD
cat .env | grep DB_PASSWORD

# Om den saknas, lägg till:
echo "DB_PASSWORD=MinSakraLösenord123!" >> .env

# Starta om containers
podman compose -f compose.dev.yml down -v
podman compose -f compose.dev.yml up -d
```

### 2. ORACLE_PWD miljövariabel saknas eller är felaktig

**Symptom:**

```
ORA-01017: invalid username/password
```

**Lösning:**

```bash
# Kontrollera .env
cat .env | grep ORACLE_PWD

# Om den saknas eller är felaktig, sätt korrekt värde
# OBS: Undvik specialtecken som $ i lösenordet (eller escape med $$)
```

### 3. SQLPlus-kommandon misslyckas (tysta fel)

**Symptom:** Inga tydliga fel, men "DATABASE SETUP WAS NOT SUCCESSFUL"

**Diagnos:**

```bash
# Kör skriptet manuellt för att se fel
podman exec tillgang-oracle-dev bash -c 'cd /opt/oracle/scripts/startup && bash -x 000-create-user.sh'
```

**Vanliga SQL-fel:**

- **ORA-01017:** Fel lösenord för SYSTEM-användare
- **ORA-00959:** Tablespace finns inte (ska inte hända med Oracle Free)
- **ORA-01917:** Användare finns redan (ska hanteras av skriptet)

### 4. Filrättigheter - skriptet är inte körbart

**Symptom:** Skriptet körs inte alls

**Lösning:**

```bash
# Kontrollera filrättigheter lokalt
ls -la database/init/000-create-user.sh

# Sätt körrättigheter om de saknas
chmod +x database/init/000-create-user.sh

# Starta om
podman compose -f compose.dev.yml down -v
podman compose -f compose.dev.yml up -d
```

### 5. Oracle-instans avslutas på grund av tidsdrift (ORA-12752)

**Symptom:**

```
--ATTENTION--
Time drifted forward by (XXXXXX) micro seconds
PMON (ospid: XX): terminating the instance due to ORA error 12752
Instance terminated by PMON
```

**Orsak:** Oracle är mycket känslig för tidsändringar. Om systemklockan hoppar framåt eller bakåt avslutas instansen automatiskt för att skydda dataintegriteten.

**Lösning:**

1. **Kontrollera att systemklockan är synkroniserad:**

   ```bash
   # macOS
   sntp -sS time.apple.com

   # Linux
   sudo timedatectl set-ntp true
   sudo systemctl restart systemd-timesyncd

   # Windows/WSL
   wsl --shutdown
   # Starta om WSL och kontrollera att Windows-tid är korrekt
   ```

2. **Kontrollera tidszon-inställningar:**

   ```bash
   # Kontrollera tidszon i containern
   podman exec tillgang-oracle-dev date

   # Kontrollera tidszon på värdsystemet
   date

   # Om de skiljer sig, sätt samma tidszon
   ```

3. **Starta om containers efter tidsändringar:**

   ```bash
   # Stoppa alla containers
   podman compose -f compose.dev.yml down -v

   # Vänta några sekunder för att säkerställa tidsstabilitet
   sleep 5

   # Starta om
   podman compose -f compose.dev.yml up -d
   ```

4. **Om problemet kvarstår - kontrollera Podman/Docker-tidsinställningar:**

   ```bash
   # macOS med Podman Machine
   podman machine ssh
   # I VM: kontrollera att NTP är aktiverat
   timedatectl status

   # Om NTP inte är aktiverat:
   sudo timedatectl set-ntp true
   ```

5. **Undvik att ändra systemtid medan Oracle kör:**
   - Ändra aldrig systemklockan medan Oracle-containern är igång
   - Om du måste ändra tid, stoppa först Oracle-containern

**Förebyggande:**

- Aktivera automatisk NTP-synkronisering på värdsystemet
- Undvik manuella tidsändringar när Oracle kör
- Använd samma tidszon för värdsystemet och containern

### 6. Line endings (CRLF vs LF) - Windows/WSL-problem

**Symptom:** Skriptet misslyckas med konstiga fel

**Diagnos:**

```bash
# Kontrollera line endings
file database/init/000-create-user.sh

# Om det visar "CRLF", konvertera till LF:
dos2unix database/init/000-create-user.sh
# eller
sed -i 's/\r$//' database/init/000-create-user.sh
```

**Förebyggande:** Konfigurera Git:

```bash
git config core.autocrlf input
```

### 6. Specialtecken i lösenord

**Symptom:** SQL-kommandon misslyckas när lösenord innehåller `$`, `'`, `"`, etc.

**Lösning:**

- Undvik specialtecken i lösenord, ELLER
- Escape korrekt i SQL (se nedan)

**Exempel på problematiska lösenord:**

- `Pass$word` → Använd `Pass$$word` eller undvik `$`
- `Pass'word` → Använd `Pass''word` eller undvik `'`
- `Pass"word` → Undvik `"`

**Init-skript (000-create-user.sh):** Lösenordet skickas med dubbla citattecken i SQL. Ett literal dubbeltecken (`"`) eller enkelt citattecken (`'`) i lösenordet kan göra SQL:en ogiltig. Undvik därför `"` och `'` i `DB_PASSWORD` och `ORACLE_PWD`.

### 7. FREEPDB1 är inte registrerad hos listenern (ORA-12514)

**Symptom:**

```
ORA-12514: Cannot connect to database. Service FREEPDB1 is not registered with the listener
```

**Orsak:** Pluggable database FREEPDB1 är inte öppen eller inte registrerad hos listenern när init-skriptet körs.

**Lösning:**

- Skriptet försöker nu automatiskt öppna FREEPDB1 om den inte är öppen
- Om problemet kvarstår, kontrollera PDB-status manuellt:

```bash
# Kontrollera PDB-status
podman exec tillgang-oracle-dev bash -c "echo 'SELECT name, open_mode FROM v\$pdbs;' | sqlplus -s system/\${ORACLE_PWD}@localhost:1521"

# Öppna FREEPDB1 manuellt om den är stängd
podman exec tillgang-oracle-dev bash -c "echo 'ALTER PLUGGABLE DATABASE FREEPDB1 OPEN;' | sqlplus -s system/\${ORACLE_PWD}@localhost:1521"
```

**Förebyggande:** Skriptet väntar nu aktivt på att FREEPDB1 ska bli tillgänglig och försöker öppna den om nödvändigt.

### 8. Skriptet körs innan Oracle är redo

**Symptom:** "Waiting for database to be ready..." loopar för evigt

**Lösning:**

- Detta borde inte hända, men om det gör:

```bash
# Kontrollera att Oracle faktiskt startar
podman compose -f compose.dev.yml logs oracle-db | grep "DATABASE IS READY"

# Om Oracle inte startar, kontrollera resurser:
# - Minst 8GB RAM tillgängligt
# - Tillräckligt med diskutrymme
```

### 8. SQL-fel i schema-skapandet

**Symptom:** Användaren skapas men schema-skapandet misslyckas

**Diagnos:**

```bash
# Kör SQL-delen manuellt
podman exec tillgang-oracle-dev bash -c 'sqlplus -s tillgang_user/<DB_PASSWORD>@FREEPDB1 <<EOF
SET SERVEROUTPUT ON
SELECT table_name FROM user_tables;
EXIT;
EOF'
```

**Vanliga SQL-fel:**

- **ORA-00955:** Objekt finns redan (ska hanteras av DROP-statements)
- **ORA-00942:** Tabell saknas (om DROP misslyckades)
- **ORA-22848:** CLOB-begränsningar (ska inte hända längre)

## Steg-för-steg diagnostik

### 1. Kontrollera miljövariabler

```bash
# Kontrollera att .env finns
ls -la .env

# Kontrollera innehåll (dölj lösenord)
cat .env | grep -E "ORACLE_PWD|DB_PASSWORD|DB_USER" | sed 's/=.*/=***/'
```

### 2. Kontrollera att skriptet finns i containern

```bash
podman exec tillgang-oracle-dev ls -la /opt/oracle/scripts/startup/
```

**Förväntat resultat:**

```
-rw-r--r-- 1 root root 4553 Jan 27 12:24 000-create-user.sh
-rw-r--r-- 1 root root 5778 Jan 27 12:25 001-initial-schema.sql.reference
```

### 3. Kör skriptet manuellt med debug-output

```bash
# Kör med debug-flagga för att se vad som händer
podman exec tillgang-oracle-dev bash -x /opt/oracle/scripts/startup/000-create-user.sh
```

### 4. Kontrollera SQLPlus-anslutning manuellt

```bash
# Testa SYSTEM-anslutning
podman exec tillgang-oracle-dev bash -c "echo 'SELECT 1 FROM DUAL;' | sqlplus -s system/\${ORACLE_PWD}@FREEPDB1"

# Testa tillgang_user-anslutning (efter att användaren skapats)
podman exec tillgang-oracle-dev bash -c "echo 'SELECT 1 FROM DUAL;' | sqlplus -s tillgang_user/\${DB_PASSWORD}@FREEPDB1"
```

### 5. Kontrollera om användaren skapades

```bash
podman exec tillgang-oracle-dev bash -c "echo 'SELECT username FROM all_users WHERE username='\"'TILLGANG_USER'\"';' | sqlplus -s system/\${ORACLE_PWD}@FREEPDB1"
```

### 6. Kontrollera om tabellerna skapades

```bash
podman exec tillgang-oracle-dev bash -c "echo 'SELECT table_name FROM user_tables;' | sqlplus -s tillgang_user/\${DB_PASSWORD}@FREEPDB1"
```

## Snabb fix: Starta om från början

Om inget av ovanstående hjälper:

```bash
# Stoppa allt
podman compose -f compose.dev.yml down -v

# Ta bort alla volumes
podman volume prune -f

# Kontrollera att .env är korrekt konfigurerad
cat .env

# Starta om
podman compose -f compose.dev.yml up -d

# Övervaka loggar
podman compose -f compose.dev.yml logs oracle-db -f
```

## Ytterligare hjälp

Om problemet kvarstår efter att ha följt denna guide:

1. Kopiera fullständiga Oracle-loggar:

   ```bash
   podman compose -f compose.dev.yml logs oracle-db > oracle-logs.txt
   ```

2. Kontrollera systemresurser:

   ```bash
   # RAM
   free -h  # Linux
   # eller
   vm_stat  # macOS

   # Diskutrymme
   df -h
   ```

3. Kontrollera Podman/Docker-version:

   ```bash
   podman --version
   podman compose version
   ```

4. Dela loggar och systeminfo för vidare felsökning.
