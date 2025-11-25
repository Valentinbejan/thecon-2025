# VibeScout 🌍✨

**VibeScout** is a modern React Native application designed to help users discover the best hangout spots in Romania. Whether you're looking for a quiet café to study, a vibrant pub for drinks, or a top-rated restaurant, VibeScout helps you find the perfect vibe.

## Features 🚀

- **🗺️ Interactive Explore Screen**:
  - Switch seamlessly between **Map** and **List** views.
  - **New:** Robust Map implementation using Leaflet via WebView for maximum stability on Android.
- **🔍 Advanced Filtering**: Filter venues by:
  - **City** (e.g., Cluj-Napoca, Bucharest)
  - **Category** (Café, Restaurant, Pub, etc.)
  - **Cuisine** & **Atmosphere**
  - **Special Features** (Terrace, Live Music, etc.)
  - **Distance** (Find places near you!)
- **✨ Vibe Check**: Get an instant AI analysis of a venue's vibe based on its description and reviews.
- **🤖 VibeBot (AI Chatbot)**: A smart assistant that gives personalized recommendations based on your location and preferences.
- **📍 Location Awareness**: Set your city in your profile to see real-time distances to venues.
- **👤 User Profiles**: Manage your account, avatar, and location preferences.
- **🔐 Secure Authentication**: Powered by Supabase.

## Tech Stack 🛠️

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React Native Paper](https://callstack.github.io/react-native-paper/)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Maps**:
  - **Mobile (Android/iOS)**: `react-native-webview` rendering Leaflet.js with OpenStreetMap tiles (Crash-proof implementation).
  - **Web**: `react-leaflet` (OpenStreetMap).
- **AI Integration**: [OpenRouter API](https://openrouter.ai/)

## Getting Started 🏁

### Prerequisites

- Node.js installed
- Expo Go app on your iOS or Android device

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Valentinbejan/thecon-2025.git
   cd thecon-2025
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Run the application**
   ```bash
   npx expo start
   ```
   Scan the QR code with the Expo Go app to run it on your phone.

## Building for Android (APK) 🤖

To build a standalone APK for testing:

1. **Configure EAS**:
   Ensure you have `eas-cli` installed and logged in.

2. **Build Command**:

   ```bash
   npx eas-cli build -p android --profile preview
   ```

3. **Install**:
   Download the APK from the Expo dashboard link provided after the build completes.

## Database Setup (Supabase) 🗄️

This project requires a Supabase project with a `profiles` table.
Make sure to run the migration scripts provided in the `supabase_*.sql` files to set up the necessary columns (like `city`, `city_lat`, `city_long`) and triggers.

## License 📄

This project is licensed under the MIT License.

## Video

https://github.com/user-attachments/assets/0e4acbfe-c6c7-47c2-983e-572805243a3c

