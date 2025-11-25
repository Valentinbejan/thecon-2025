# 🗺️ VibeScout (TheCon 2025 Edition)

**VibeScout** este o aplicație mobilă modernă, cross-platform (iOS, Android, Web), dezvoltată cu React Native și Expo, concepută pentru a ajuta utilizatorii să descopere locuri interesante (cafenele, restaurante, bistrouri) din România. Aplicația integrează funcționalități avansate de geolocație, inteligență artificială conversațională și filtrare detaliată pentru a oferi recomandări personalizate.

---

## 📹 Demo Video

Urmărește VibeScout în acțiune!

[**Vizionează Demo Video**](LINK_VIDEO_AICI)

_(Click pe link-ul de mai sus pentru a vedea prezentarea)_

---

## � Cuprins

1. [Descriere Generală](#-descriere-generală)
2. [Funcționalități Cheie](#-funcționalități-cheie)
3. [Arhitectură Tehnică](#-arhitectură-tehnică)
4. [Integrare AI (VibeBot & Vibe Check)](#-integrare-ai-vibebot--vibe-check)
5. [Configurare Backend (Supabase)](#-configurare-backend-supabase)
6. [Instalare și Rulare](#-instalare-și-rulare)
7. [Structură Proiect](#-structură-proiect)

---

## 🚀 Descriere Generală

Aplicația rezolvă problema clasică "Unde ieșim azi?" printr-o abordare hibridă:

1.  **Explorare vizuală și geografică:** Utilizatorii pot căuta locații pe hartă sau într-o listă, filtrate după criterii specifice (atmosferă, bucătărie, facilități).
2.  **Asistență AI:** Un chatbot integrat ("VibeBot") care cunoaște locația utilizatorului și baza de date a localurilor, oferind sugestii conversaționale.
3.  **Context Local:** Calcularea distanțelor în timp real față de orașul setat în profilul utilizatorului.

---

## 🌟 Funcționalități Cheie

### 1. 🌍 Modulul Explore (Explorare)

Acesta este ecranul principal și oferă două moduri de vizualizare interschimbabile:

- **List View:**

  - Afișează carduri detaliate cu imagine, nume, rating și descriere scurtă.
  - **Calcul Distanță:** Dacă utilizatorul și-a setat orașul în profil, fiecare card arată distanța (ex: "~5 km") față de utilizator.
  - **Bara de Căutare:** Filtrare live după nume sau adresă.
  - **Sistem Avansat de Filtrare:**
    - Locație (Orașe din România).
    - Categorie (Cafenea, Restaurant, Gaming, etc.).
    - Rating minim.
    - Specific culinar (Ex: Italian, Vegan, Tradițional).
    - Atmosferă (Ex: Quiet/Study-friendly, Romantic).
    - Distanță maximă (Ex: Doar locuri pe o rază de 10km).

- **Map View (Hartă Interactivă):**
  - Implementare hibridă inteligentă: Folosește `react-native-webview` cu Leaflet JS pentru mobil (pentru performanță și clustere) și `react-leaflet` pentru web.
  - Marker-e interactive care deschid un preview al locației.
  - Buton "Fly To" pentru a centra harta pe o locație specifică.

### 2. 🤖 Modulul Chat (VibeBot)

Un asistent personal alimentat de AI (prin OpenRouter API) care are acces la contextul aplicației:

- **Context Aware:** Botul știe în ce oraș se află utilizatorul și care sunt locațiile disponibile în baza de date JSON.
- **Recomandări Inteligente:** Poți întreba "Unde pot bea o cafea bună aproape de mine?" și botul va prioritiza locurile din orașul tău, menționând distanța.
- **Personalitate:** Răspunsuri prietenoase, folosind emoji-uri și un ton relaxat.

### 3. 👤 Profil Utilizator & Geolocație

- **Autentificare:** Login și Sign Up securizate prin Supabase Auth.
- **Setare Locație:** Utilizatorul își alege orașul dintr-o listă predefinită de orașe mari din România (București, Cluj, Timișoara, etc.). Aceasta este setarea critică pentru calculul distanțelor.
- **Avatar:** Încărcare și stocare poze de profil în Supabase Storage.
- **Dark Mode:** Comutare între temă luminoasă și întunecată (persistentă în sesiune).

### 4. 📍 Detalii Locație

- **Vibe Check (AI):** Un buton magic care trimite descrierea tehnică a locației către AI și returnează o descriere creativă despre "vibrația" locului.
- **Acțiuni Rapide:**
  - _Get Directions:_ Deschide Google Maps/Apple Maps cu coordonatele locației.
  - _Share:_ Partajează locația prietenilor.
  - _Rezervă:_ Deschide automat WhatsApp cu un mesaj precompletat către numărul locației.

### 5. 📡 Gestionare Offline

- Include un **NetworkBanner** care detectează automat pierderea conexiunii la internet și avertizează utilizatorul, prevenind crash-urile pe funcțiile care necesită rețea.

---

## 🛠 Arhitectură Tehnică

### Frontend

- **Framework:** React Native cu Expo (Managed Workflow).
- **Limbaj:** TypeScript (pentru siguranța tipurilor de date).
- **UI Library:** `react-native-paper` (Material Design 3).
- **Navigație:** `react-navigation` (Native Stack & Bottom Tabs).
- **Hărți:**
  - Mobile: `react-native-webview` injectând HTML cu Leaflet.js.
  - Web: `react-leaflet`.

### Backend & Services

- **Bază de Date & Auth:** Supabase (PostgreSQL).
- **AI API:** OpenRouter (folosind modele precum `moonshotai/kimi` sau altele compatibile OpenAI).
- **Stocare:** Supabase Storage (pentru avatare).

---

## 🧠 Integrare AI (VibeBot & Vibe Check)

Fișierul `src/lib/ai.ts` gestionează comunicarea cu API-ul.

1.  **System Prompt Dinamic:** Când utilizatorul trimite un mesaj, aplicația construiește un "System Prompt" care include:
    - Rolul AI-ului (VibeBot).
    - Lista completă de locații (nume, descriere, coordonate).
    - **Distanța calculată** față de utilizator (dacă acesta are orașul setat).
2.  **Privacy:** Se trimit doar metadatele locațiilor și locația generică a orașului, nu date personale sensibile.

---

## 🗄 Configurare Backend (Supabase)

Aplicația necesită următoarea structură în Supabase. Scripturile SQL de migrare sunt incluse în fișierele proiectului (`supabase_*.sql`).

### 1. Tabele

- **`profiles`**: Extensie a tabelei `auth.users`.
  - Coloane: `id`, `username`, `full_name`, `avatar_url`, `city` (Text), `city_lat` (Float), `city_long` (Float).

### 2. Storage

- Bucket numit **`avatars`** cu politici de securitate (RLS) care permit utilizatorilor să își încarce propriile poze și oricui să le vizualizeze.

### 3. Triggers

- Un trigger automat care creează o intrare în `profiles` atunci când un utilizator nou se înregistrează prin `auth.users`.

---

## ⚙️ Instalare și Rulare

### Cerințe Preliminare

- Node.js instalat.
- Cont Expo.
- Proiect Supabase creat.
- Cheie API OpenRouter (pentru funcțiile AI).

### Pași

1.  **Clonare Proiect:**
    Descărcați sursa proiectului.

2.  **Instalare Dependențe:**

    ```bash
    npm install
    ```

3.  **Configurare Mediu:**
    Creează un fișier `.env` în rădăcina proiectului (inspirat din `.env.example`):

    ```env
    EXPO_PUBLIC_SUPABASE_URL=https://proiectul-tau.supabase.co
    EXPO_PUBLIC_SUPABASE_ANON_KEY=cheia-ta-publica-anonima
    EXPO_PUBLIC_OPENROUTER_API_KEY=cheia-ta-openrouter
    ```

4.  **Rulare Aplicație:**

    ```bash
    # Pentru a porni serverul de dezvoltare
    npx expo start

    # Apasă 'a' pentru Android Emulator, 'i' pentru iOS Simulator, sau 'w' pentru Web.
    ```

---

## 📂 Structură Proiect

```text
thecon-2025/
├── assets/                 # Icoane și imagini statice
├── src/
│   ├── components/         # Componente reutilizabile (MapComponent, NetworkBanner)
│   ├── context/            # ThemeContext (Dark/Light mode)
│   ├── data/               # Date statice (locatii.json, cities.ts)
│   ├── lib/                # Utilitare (supabase client, ai client, calculator distanțe)
│   ├── navigation/         # Configurare rute (Stack & Tabs)
│   ├── screens/            # Ecranele principale (Explore, Chat, Profile, Login)
│   └── types/              # Definiții TypeScript (Venue, UserProfile)
├── App.tsx                 # Punctul de intrare, ErrorBoundary
├── app.json                # Configurare Expo
└── package.json            # Dependențe
```

### 📱 Note Specifice Platformelor

- **Android:** Aplicația folosește `react-native-screens` configurat special (`enableScreens(false)`) în `App.tsx` pentru a preveni crash-uri cunoscute pe anumite versiuni de Android în combinație cu React Navigation v7.
- **Hărți:** Pe Android, harta folosește accelerare hardware (`androidLayerType="hardware"`) în WebView pentru o experiență fluidă.
