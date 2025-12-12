# Követelményspecifikáció

**Projekt neve:** Egyszerű Receptmegosztó Alkalmazás (ERA)
**Verzió:** 1.1
**Dátum:** 2025.11.08.
**Készítette:** Fejlesztői csapat

---

## 1. Bevezetés
[cite_start]A projekt célja egy modern, webalapú receptmegosztó platform megvalósítása, amely közösségi teret biztosít a gasztronómia iránt érdeklődőknek[cite: 247]. [cite_start]A rendszer lehetővé teszi a felhasználók számára saját receptek publikálását, mások receptjeinek felfedezését, értékelését, valamint a speciális étrendi igények (pl. allergének) hatékony kezelését[cite: 248]. [cite_start]A rendszer MVP (Minimum Viable Product) szemléletben készül, de skálázható architektúrával a későbbi bővítésekhez[cite: 249].

## 2. Célok és funkciók
* [cite_start]**Receptkezelés:** Receptek teljes körű menedzselése (létrehozás, szerkesztés, törlés) részletes adatokkal (hozzávalók, lépések, képek)[cite: 251].
* [cite_start]**Keresés és szűrés:** Gyors és pontos keresés kulcsszavak, kategóriák és allergén-mentesség alapján[cite: 252].
* [cite_start]**Közösségi interakció:** Értékelési rendszer (csillagozás) és szöveges kommentek biztosítása a visszajelzésekhez[cite: 253].
* [cite_start]**Személyre szabhatóság:** Kedvenc receptek mentése saját listára[cite: 254].
* [cite_start]**Adminisztráció:** A platform tartalmának moderálása és törzsadatok (allergének) karbantartása[cite: 255].

## 3. Érintettek és szerepkörök
* **Adminisztrátor:** Teljes hozzáféréssel rendelkezik a rendszerhez. [cite_start]Kezeli a felhasználókat, moderálja a feltöltött recepteket és kommenteket, valamint karbantartja az allergének listáját[cite: 257].
* **Regisztrált felhasználó:** Teljes értékű közösségi tag. [cite_start]Létrehozhat saját recepteket, szerkesztheti és törölheti azokat[cite: 258]. [cite_start]Értékelhet és kommentelhet más recepteket, valamint használhatja a "Kedvencek" funkciót[cite: 259].
* [cite_start]**Vendég:** Látogató, aki regisztráció nélkül böngészhet a receptek között, használhatja a keresőt és megtekintheti a részleteket, de interakcióba nem léphet[cite: 260].

## 4. Funkcionális követelmények

### Regisztráció és Hitelesítés
* [cite_start]Felhasználói fiók létrehozása email cím és jelszó megadásával[cite: 263].
* [cite_start]Biztonságos bejelentkezés JWT (JSON Web Token) alapú hitelesítéssel[cite: 264].

### Receptkezelés
* [cite_start]Új recept létrehozása címmel, leírással, hozzávalók listájával, elkészítési lépésekkel és kategória besorolással[cite: 266].
* [cite_start]Allergének megjelölése a recept létrehozásakor[cite: 267].
* [cite_start]Saját receptek utólagos szerkesztése és törlése[cite: 268].

### Keresés és Szűrés
* [cite_start]Szabadszavas keresés a recept nevében és leírásában[cite: 270].
* [cite_start]Szűrés kategóriákra (pl. Levesek, Főételek, Desszertek)[cite: 271].
* [cite_start]"Mentes" szűrő: adott allergéneket tartalmazó receptek kizárása a találati listából[cite: 272].

### Interakció
* [cite_start]Receptek értékelése 1-5 skálán (csak regisztráltaknak)[cite: 274].
* [cite_start]Szöveges hozzászólás fűzése a receptekhez[cite: 275].
* [cite_start]Receptek hozzáadása a "Kedvencek" listához és onnan való eltávolítás[cite: 276].

## 5. Nem funkcionális követelmények

### Biztonság
* [cite_start]Jelszavak tárolása bcrypt hasheléssel[cite: 279].
* [cite_start]Végpontok védelme JWT token validációval[cite: 280].
* [cite_start]Duplikált email címek tiltása regisztrációnál[cite: 281].

### Teljesítmény
* [cite_start]Az átlagos válaszidő nem haladhatja meg az 500ms-ot normál terhelés mellett[cite: 283].

### Felhasználói felület (UI/UX)
* [cite_start]Reszponzív kialakítás (mobil, tablet és asztali nézet támogatása)[cite: 285].
* [cite_start]Átlátható, intuitív navigáció[cite: 286].

### Adatbázis
* [cite_start]MVP fázisban SQLite használata a gyors fejlesztés érdekében[cite: 288].
* [cite_start]Éles környezetben (Production) PostgreSQL-re való migráció támogatása[cite: 289].

## 6. Rendszerkörnyezet
* [cite_start]**Backend:** Node.js (Express) vagy Python (Flask/Django) – REST API architektúra[cite: 292].
* [cite_start]**Frontend:** Modern JavaScript keretrendszer (React, Vue.js vagy Angular) vagy HTML5/CSS3/Vanilla JS[cite: 293].
* [cite_start]**Adatbázis:** SQLite (fejlesztés), PostgreSQL (éles)[cite: 294].
* [cite_start]**Futtatás:** Docker konténerizáció támogatott, webszerver (pl. Nginx) mögött[cite: 295].

## 7. Korlátozások
* [cite_start]A rendszer jelenlegi verziója nem támogatja a közösségi média megosztást (Facebook, Instagram integráció)[cite: 297].
* [cite_start]Nincs beépített bevásárlólista generálás a hozzávalók alapján[cite: 298].
* [cite_start]Videós receptfeltöltés nem támogatott (csak képek vagy külső linkek)[cite: 299].

## 8. Példa felhasználói történet
* [cite_start]**Felhasználóként:** Szeretnék feltölteni egy "Gluténmentes Csokitorta" receptet[cite: 301].
* [cite_start]**Cselekmény:** Megadom a hozzávalókat, bejelölöm a "Glutén" allergént (hogy a gluténérzékenyek ki tudják szűrni, vagy a mentes keresésnél megjelenjen), és feltöltök egy ínycsiklandó fotót[cite: 302].
* [cite_start]**Cél:** Hogy megoszthassam a receptemet a közösséggel, és visszajelzéseket kaphassak róla[cite: 303].

## 9. Elfogadási feltételek (Kritériumok)
* [cite_start]A regisztrációs folyamat megakadályozza már létező email cím használatát[cite: 305].
* [cite_start]A keresőben az "allergén kizárása" funkció helyesen rejti el azokat a recepteket, amelyek tartalmazzák a kiválasztott allergént[cite: 306].
* [cite_start]A felhasználó csak a saját maga által létrehozott receptet tudja szerkeszteni vagy törölni; más felhasználóét vagy az adminét nem[cite: 307].
* [cite_start]Sikeres bejelentkezés után a rendszer érvényes JWT tokent ad vissza[cite: 308].

## 10. Jövőbeli bővítési lehetőségek
* [cite_start]Bevásárlólista automatikus generálása és exportálása (PDF/Email)[cite: 310].
* [cite_start]Tápanyagértékek (kalória, fehérje, zsír, ch) automatikus számítása vagy manuális megadása[cite: 311].
* [cite_start]Közösségi bejelentkezés (Google, Facebook Auth)[cite: 312].
* [cite_start]Mobilapplikáció fejlesztése (iOS/Android)[cite: 313].