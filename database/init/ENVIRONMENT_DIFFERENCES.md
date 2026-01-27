# Felsökning: Varför fungerar setup på en MacBook men inte på en annan?

Detta dokument beskriver vanliga skillnader mellan miljöer som kan orsaka att Oracle-setup fungerar på en maskin men inte på en annan.

## 1. Podman Machine-konfiguration

### Problem: Olika Podman Machine-inställningar

**Kontrollera:**
```bash
# Jämför Podman Machine-versioner
podman machine list
podman --version

# Kontrollera Podman Machine-resurser
podman machine inspect podman-machine-default | grep -A 10 "ResourceLimits"

# Kontrollera att Podman Machine är igång
podman machine list
```

**Lösning:**
```bash
# Om Podman Machine inte är igång eller har fel konfiguration:
podman machine stop
podman machine rm podman-machine-default
podman machine init --cpus 4 --memory 8192 --disk-size 50
podman machine start
```

### Problem: Olika Podman Machine-versioner

**Kontrollera:**
```bash
# På båda maskinerna:
podman --version
podman-compose --version
```

**Lösning:** Uppdatera till samma version på båda maskinerna:
```bash
brew upgrade podman podman-compose
```

## 2. macOS-version och arkitektur

### Problem: Olika macOS-versioner eller arkitektur (ARM vs Intel)

**Kontrollera:**
```bash
# macOS-version
sw_vers

# Arkitektur
uname -m  # arm64 för Apple Silicon, x86_64 för Intel
arch
```

**Lösning:**
- **ARM Mac (M1/M2/M3):** Använd `ORACLE_IMAGE_TAG=latest-lite`
- **Intel Mac:** Använd `ORACLE_IMAGE_TAG=latest`

Kontrollera att rätt image-tag används i `.env`:
```bash
cat .env | grep ORACLE_IMAGE_TAG
```

## 3. Resursbegränsningar (minne, CPU, disk)

### Problem: Otillräckligt minne eller CPU

**Kontrollera:**
```bash
# Tillgängligt minne
sysctl hw.memsize
vm_stat | grep "Pages free"

# CPU-kärnor
sysctl hw.ncpu

# Diskutrymme
df -h
```

**Oracle-krav:**
- Minst 8GB RAM tillgängligt (inte bara totalt)
- Minst 2 CPU-kärnor
- Minst 20GB ledigt diskutrymme

**Lösning:**
- Stäng andra resurskrävande applikationer
- Öka Podman Machine-minne:
  ```bash
  podman machine stop
  podman machine rm podman-machine-default
  podman machine init --cpus 4 --memory 8192
  podman machine start
  ```

### Problem: Diskutrymme i Podman Machine

**Kontrollera:**
```bash
podman machine ssh
df -h
exit
```

**Lösning:**
```bash
# Rensa oanvända images och volumes
podman system prune -a --volumes

# Om det inte hjälper, öka diskstorlek:
podman machine stop
podman machine rm podman-machine-default
podman machine init --disk-size 100  # Öka från 50GB till 100GB
podman machine start
```

## 4. Nätverkskonfiguration

### Problem: Olika nätverksinställningar eller VPN

**Kontrollera:**
```bash
# Nätverksgränssnitt
ifconfig | grep -E "inet |inet6 "

# DNS-inställningar
scutil --dns | grep "nameserver\[0\]"

# Kontrollera om VPN är aktivt
scutil --nc list
```

**Lösning:**
- Stäng av VPN när du startar containers första gången
- Kontrollera att inga brandväggsregler blockerar Podman
- Testa med olika nätverk (WiFi vs Ethernet)

### Problem: Port-konflikter

**Kontrollera:**
```bash
# Kontrollera om port 1521 är upptagen
lsof -i :1521
netstat -an | grep 1521

# Kontrollera om port 3000 är upptagen
lsof -i :3000
```

**Lösning:**
- Stäng andra tjänster som använder samma portar
- Ändra portar i `compose.dev.yml` om nödvändigt

## 5. Tidsinställningar och NTP

### Problem: Olika tidsinställningar eller NTP-synkronisering

**Kontrollera:**
```bash
# Systemtid
date

# NTP-status
sntp -S time.apple.com

# Tidszon
systemsetup -gettimezone
```

**Lösning:**
```bash
# Synkronisera tid manuellt
sntp -sS time.apple.com

# Kontrollera att automatisk tidsinställning är aktiverad
# System Preferences > Date & Time > Set time zone automatically
```

## 6. Miljövariabler och .env-fil

### Problem: Olika .env-filer eller miljövariabler

**Kontrollera:**
```bash
# Jämför .env-filer
cat .env

# Kontrollera att alla variabler är satta
grep -E "ORACLE_PWD|DB_PASSWORD|DB_USER" .env

# Kontrollera shell-miljövariabler som kan överrida .env
env | grep -E "ORACLE|DB_"
```

**Lösning:**
- Kopiera `.env` från den fungerande maskinen
- Kontrollera att inga shell-miljövariabler överrider `.env`
- Undvik specialtecken i lösenord (särskilt `$`)

### Problem: Olika lösenord eller specialtecken

**Kontrollera:**
```bash
# Kontrollera att lösenord inte innehåller problematiska tecken
cat .env | grep PASSWORD

# Testa att lösenord fungerar
echo "Test: ${ORACLE_PWD}"
```

**Lösning:**
- Undvik `$`, `'`, `"` i lösenord
- Om du måste använda `$`, escape med `$$` i compose-filer
- Använd samma lösenord på båda maskinerna för testning

## 7. Volumes och persistent data

### Problem: Korrupt eller gammal volume-data

**Kontrollera:**
```bash
# Lista volumes
podman volume ls | grep oracle

# Kontrollera volume-storlek
podman volume inspect tillgang-oracle-data-dev
```

**Lösning:**
```bash
# Ta bort alla volumes och starta om (VARNING: Tar bort all data)
podman compose -f compose.dev.yml down -v
podman volume prune -f
podman compose -f compose.dev.yml up -d
```

## 8. Oracle Image Cache

### Problem: Olika versioner av Oracle-image i cache

**Kontrollera:**
```bash
# Lista Oracle-images
podman images | grep oracle

# Kontrollera image-taggar
podman images container-registry.oracle.com/database/free
```

**Lösning:**
```bash
# Ta bort och hämta image igen
podman rmi container-registry.oracle.com/database/free:latest-lite
podman rmi container-registry.oracle.com/database/free:latest

# Hämta rätt image baserat på arkitektur
# För ARM Mac:
export ORACLE_IMAGE_TAG=latest-lite
podman compose -f compose.dev.yml pull oracle-db

# För Intel Mac:
export ORACLE_IMAGE_TAG=latest
podman compose -f compose.dev.yml pull oracle-db
```

## 9. Filrättigheter och line endings

### Problem: Olika filrättigheter eller line endings (CRLF vs LF)

**Kontrollera:**
```bash
# Kontrollera filrättigheter på init-skript
ls -la database/init/000-create-user.sh

# Kontrollera line endings
file database/init/000-create-user.sh
```

**Lösning:**
```bash
# Sätt körrättigheter
chmod +x database/init/000-create-user.sh

# Konvertera CRLF till LF om nödvändigt
dos2unix database/init/000-create-user.sh
# eller
sed -i '' 's/\r$//' database/init/000-create-user.sh
```

## 10. Bakgrundsprocesser och konflikter

### Problem: Andra containers eller tjänster som stör

**Kontrollera:**
```bash
# Lista alla containers
podman ps -a

# Kontrollera om andra Oracle-containers kör
podman ps | grep oracle

# Kontrollera Docker-containers (om Docker är installerat)
docker ps -a 2>/dev/null || echo "Docker not running"
```

**Lösning:**
```bash
# Stoppa alla containers
podman stop $(podman ps -q)
podman compose -f compose.dev.yml down

# Om Docker körs och använder samma portar:
docker stop $(docker ps -q) 2>/dev/null || true
```

## 11. Git-konfiguration och line endings

### Problem: Git konverterar line endings olika på olika maskiner

**Kontrollera:**
```bash
# Git-konfiguration för line endings
git config core.autocrlf
git config core.eol
```

**Lösning:**
```bash
# Sätt samma konfiguration på båda maskinerna
git config core.autocrlf input
git config core.eol lf

# Efter ändring, commit och pull på andra maskinen
```

## 12. Systemloggar och diagnostik

### Problem: Olika systemloggar eller felmeddelanden

**Kontrollera på den fungerande maskinen:**
```bash
# Oracle-loggar
podman compose -f compose.dev.yml logs oracle-db | tail -50

# Systemloggar
log show --predicate 'process == "podman"' --last 1h | tail -50
```

**Jämför med den icke-fungerande maskinen:**
```bash
# Samma kommandon på den andra maskinen
podman compose -f compose.dev.yml logs oracle-db | tail -50
log show --predicate 'process == "podman"' --last 1h | tail -50
```

## Systematisk diagnostik-checklista

Kör dessa kommandon på **båda** maskinerna och jämför resultaten:

```bash
# 1. Systeminfo
echo "=== System Info ==="
sw_vers
uname -m
sysctl hw.memsize hw.ncpu
df -h | head -5

# 2. Podman-info
echo "=== Podman Info ==="
podman --version
podman-compose --version
podman machine list
podman machine inspect podman-machine-default | grep -E "CPUs|Memory|DiskSize"

# 3. Miljövariabler
echo "=== Environment ==="
cat .env | grep -E "ORACLE|DB_"
env | grep -E "ORACLE|DB_" | head -5

# 4. Images och volumes
echo "=== Images & Volumes ==="
podman images | grep oracle
podman volume ls | grep oracle

# 5. Nätverk och portar
echo "=== Network & Ports ==="
lsof -i :1521 2>/dev/null || echo "Port 1521 free"
lsof -i :3000 2>/dev/null || echo "Port 3000 free"
ifconfig | grep "inet " | head -3

# 6. Filrättigheter
echo "=== File Permissions ==="
ls -la database/init/000-create-user.sh
file database/init/000-create-user.sh
```

## Snabb fix: Starta från scratch

Om inget annat fungerar, prova detta på den icke-fungerande maskinen:

```bash
# 1. Stoppa allt
podman compose -f compose.dev.yml down -v
podman stop $(podman ps -q) 2>/dev/null || true

# 2. Rensa allt
podman system prune -a --volumes -f

# 3. Ta bort och återskapa Podman Machine
podman machine stop
podman machine rm podman-machine-default
podman machine init --cpus 4 --memory 8192 --disk-size 50
podman machine start

# 4. Kopiera .env från fungerande maskin
# (kopiera manuellt eller via git)

# 5. Hämta rätt Oracle-image
export ORACLE_IMAGE_TAG=latest-lite  # eller latest för Intel Mac
podman compose -f compose.dev.yml pull oracle-db

# 6. Starta containers
podman compose -f compose.dev.yml up -d

# 7. Följ loggarna
podman compose -f compose.dev.yml logs -f oracle-db
```

## Vanligaste orsaker

Baserat på erfarenhet är de vanligaste orsakerna:

1. **Olika Oracle-image-taggar** (ARM vs Intel) - 40%
2. **Otillräckligt minne i Podman Machine** - 25%
3. **Olika .env-filer eller lösenord** - 15%
4. **Korrupt volume-data** - 10%
5. **Port-konflikter** - 5%
6. **Övrigt** - 5%

Börja med att kontrollera dessa i den ordningen!
