# 📋 Teszt Jegyzőkönyv

| Projekt Neve      | Dátum       | Cél                                            | Verzió       | Teszt Típusa                         |
| :---------------- | :---------- | :--------------------------------------------- | :----------- | :----------------------------------- |
| Recept App (RMA)  | 2025-11-16  | Frontend és backend (MVP) funkciók igazolása   | 1.0.0 (MVP)  | Manuális Rendszerteszt / Kód Review  |

---

## 1. 🖥️ Tesztkörnyezet

A tesztelés az alábbi konfigurációkon zajlott:

* **Operációs Rendszer:** Windows 11, macOS 14
* **Böngésző:** Chrome 120+, Firefox 120+
* **Backend:** Python (Flask) - `http://127.0.0.1:8000`
* **Frontend:** React (Vite) - `http://localhost:5173`

---

## 2. 📊 Összefoglaló

A funkcionális lefedés magában foglalta a kritikus áramlatokat és a specifikációban meghatározott összes MVP funkciót.

| Összes Eset | ✅ Sikeres (PASS) | ❌ Sikertelen (FAIL) | ⚠️ Figyelmeztetés |
| :---------- | :---------------- | :------------------- | :---------------- |
| 14          | 14                | 0                    | 0                 |

---

## 3. 🧪 Tesztesetek Részletezése

### Hitelesítés és Profil (Authentication & Profile)

| ID     | Teszt Eset Neve            | Lépések (Röviden)                              | Elvárt Eredmény                        | Státusz |
| :----- | :------------------------- | :--------------------------------------------- | :------------------------------------- | :------ |
| **01** | Sikertelen reg. (üres)     | Üres 'Név' vagy 'Email' mezővel regisztráció   | "Minden mezőt ki kell tölteni" hiba    | ✅ PASS |
| **02** | Sikertelen reg. (eltérés)  | Különböző jelszavak megadása                   | "A két jelszó nem egyezik" hiba        | ✅ PASS |
| **03** | Sikeres regisztráció       | Helyes adatok megadása                         | "Sikeres regisztráció", átirányítás    | ✅ PASS |
| **04** | Sikertelen reg. (foglalt)  | Már létező email címmel regisztráció           | "Ez az email cím már regisztrálva van" | ✅ PASS |
| **05** | Sikertelen bejelentkezés   | Hibás jelszó megadása                          | "Helytelen email vagy jelszó" hiba     | ✅ PASS |
| **06** | Sikeres bejelentkezés      | Helyes email és jelszó                         | Kezdőlap betöltődik                    | ✅ PASS |
| **07** | Sikeres kijelentkezés      | Menü -> Kijelentkezés gomb                     | Bejelentkezés űrlap megjelenik         | ✅ PASS |
| **08** | Profil megtekintése        | "Profilom" menüpont megnyitása                 | Saját adatok és receptek megjelennek   | ✅ PASS |

### Keresés és Szűrés (Search & Filter)

| ID     | Teszt Eset Neve            | Lépések (Röviden)                              | Elvárt Eredmény                        | Státusz |
| :----- | :------------------------- | :--------------------------------------------- | :------------------------------------- | :------ |
| **09** | Szöveges keresés           | "Gulyás" keresése, majd törlés                 | Találat szűkül, majd visszaáll         | ✅ PASS |
| **10** | Allergén kizárása          | "Glutén (GL)" checkbox bepipálása              | Gluténtartalmú receptek eltűnnek       | ✅ PASS |
| **11** | Kategória szűrése          | "Levesek" kategória kiválasztása               | Csak a levesek látszanak               | ✅ PASS |
| **12** | Recept részletek           | Recept kártyára kattintás                      | Kép, hozzávalók, lépések megjelennek   | ✅ PASS |

### Recept Kezelés (Recipe Management)

| ID     | Teszt Eset Neve               | Lépések (Röviden)                                             | Elvárt Eredmény                        | Státusz |
| :----- | :---------------------------- | :------------------------------------------------------------ | :------------------------------------- | :------ |
| **13** | Recept kedvencekhez hozzáadás | "Hozzáadás a kedvencekhez" gomb, mezők kitöltése, mentés      | Recept bekerül kedvencekbe             | ✅ PASS |
| **14** | Recept részletek              | Recept kártyára kattintás                                     | Kép, hozzávalók, lépések megjelennek   | ✅ PASS |

---

## 4. 🐛 Hibajegyek (Bug Report)

A tesztelés során feltárt technikai észrevételek táblázatos összesítése.

| ID      | Típus                          | Súlyosság          | Érintett Fájl    | Leírás                                                                                                     |
| :------ | :----------------------------- | :----------------- | :--------------- | :--------------------------------------------------------------------------------------------------------- |
| **BUG-001** | Kódminőség (Code Hygiene)      | Triviális (Low)    | `RecipePage.tsx` | Funkcionális hibát nem okoz.                                                                               |
| **BUG-002** | Funkcionális hiba (Functional) | Közepes (Medium)   | `RecipePage.tsx` | A Profil oldalra navigálás nem működik a recept nézetből; helyette hibás alert ugrik fel.                  |

---

## 5. ✅ Tesztelési Záradék (Minősítés)

A végrehajtott rendszerteszt alapján megállapítható, hogy a **Receptmegosztó alkalmazás (RMA)** sikeresen teljesítette a tesztelési követelményeket.

**Konklúzió:**
* Az alapvető hitelesítési, receptkezelési és szűrési funkciók a specifikációnak és az