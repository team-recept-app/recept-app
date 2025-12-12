# RENDSZERTERV

**Projekt:** Receptmegosztó Alkalmazás (RMA)
**Verzió:** 1.1 (MVP - Read-only)
**Dátum:** 2025.12.12.

---

## 1. BEVEZETÉS
Ez a dokumentum a Receptmegosztó alkalmazás technikai specifikációját tartalmazza. A rendszerterv célja, hogy definiálja az architektúrát, az adatbázis szerkezetét és az API interfészeket a fejlesztőcsapat számára.

## 2. RENDSZERARCHITEKTÚRA
A rendszer egy klasszikus kliens-szerver architektúrára épül, REST API kommunikációval.

### 2.1 Technológiai Stack

**Frontend (Kliens):**
* **Keretrendszer:** React
* **Build eszköz:** Vite
* **Nyelv:** TypeScript
* **Stílus:** CSS Modules vagy Tailwind CSS
* **Állapotkezelés:** React Context API

**Backend (Szerver):**
* **Nyelv:** Python
* **Keretrendszer:** Flask
* **ORM:** SQLAlchemy

**Adatbázis:**
* **Típus:** SQLite (fejlesztéshez és MVP-hez file-alapú)

## 3. ADATBÁZIS TERV (FIZIKAI ADATMODELL)
Az adatok tárolása relációs adatbázisban történik.

### (1) users tábla (Felhasználók)
* **id (INTEGER):** Elsődleges kulcs, automatikus növekmény
* **email (VARCHAR):** Egyedi, nem lehet üres
* **password_hash (VARCHAR):** Titkosított jelszó (Bcrypt)
* **name (VARCHAR):** Megjelenített név
* **role (VARCHAR):** Szerepkör ('user' vagy 'admin')
* **created_at (DATETIME):** Regisztráció ideje

### (2) recipes tábla (Receptek)
* **id (INTEGER):** Elsődleges kulcs
* **title (VARCHAR):** Recept címe
* **summary (TEXT):** Rövid leírás
* **category (VARCHAR):** Kategória (pl. Leves)
* **ingredients (TEXT):** Hozzávalók listája JSON formátumban
* **steps (TEXT):** Lépések listája JSON formátumban
* **image_url (VARCHAR):** Kép elérési útja
* *(Megjegyzés: Az avg_rating mező törölve az MVP-ből)*

### (3) allergens tábla (Allergének)
* **id (INTEGER):** Elsődleges kulcs
* **name (VARCHAR):** Megnevezés (pl. Glutén)
* **code (VARCHAR):** Rövid kód

### (4) recipe_allergens tábla (Kapcsolótábla)
* **recipe_id (INTEGER):** Külső kulcs
* **allergen_id (INTEGER):** Külső kulcs

### (5) favorites tábla (Kedvencek)
* **user_id (INTEGER):** Külső kulcs
* **recipe_id (INTEGER):** Külső kulcs
* **added_at (DATETIME):** Hozzáadás ideje

*(Megjegyzés: A ratings tábla törölve az MVP-ből)*

## 4. API SPECIFIKÁCIÓ (VÉGPONTOK)
A backend RESTful API-t biztosít JSON válaszokkal.

### 4.1 Hitelesítés (Auth)
* `POST /api/auth/register` - **Bemenet:** email, jelszó, név - **Válasz:** 201 Created
* `POST /api/auth/login` - **Bemenet:** email, jelszó - **Válasz:** 200 OK (JWT token visszaadása)

### 4.2 Receptek (Recipes - Read Only)
* `GET /api/recipes` - **Funkció:** Lista lekérése szűréssel - **Paraméterek:** keresőszó (`q`), kategória, allergén kizárás (`exclude`)
* `GET /api/recipes/{id}` - **Funkció:** Egy recept részletes adatai

### 4.3 Interakciók
* `POST /api/recipes/{id}/favorite` - **Funkció:** Kedvencekhez adás vagy eltávolítás (Toggle) - **Auth:** Szükséges
* `GET /api/users/me/favorites` - **Funkció:** Bejelentkezett felhasználó kedvenceinek lekérése
* `GET /api/allergens` - **Funkció:** Allergén lista lekérése a szűrőhöz

## 5. BIZTONSÁGI TERV
* **Jelszókezelés:** A jelszavakat titkosítva (bcrypt) tároljuk.
* **API Védelem:** A védett végpontok (`/favorite`) JWT Bearer Tokent várnak a fejlécben.
* **Bemenet Validáció:** Minden beérkező adat ellenőrzése a szerver oldalon.
* **CORS:** Engedélyezve a fejlesztői környezet (localhost) számára.

## 6. NAPLÓZÁS ÉS TESZTELÉS
* **Naplózás:** INFO és ERROR szintű logolás a konzolra.
* **Tesztelés:** Manuális tesztelés (Postman/Böngésző) a definiált tesztesetek alapján.