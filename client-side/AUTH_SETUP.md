# Firebase Authentication Setup

This document describes the authentication layer added to the project.

## 1. Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project (Analytics optional)
3. Enable Email/Password provider: Build > Authentication > Sign-in method
4. Register a Web App and copy the config values.

## 2. Environment Variables (.env)
Create a `.env` file at the project root:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
# Optional
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```
Restart `npm run dev` after changes.

## 3. Key Files
- `src/firebase/config.js` – Firebase initialization
- `src/context/AuthContext.jsx` – Provides `user`, `signUp`, `signIn`, `signOut`, `resetPassword`
- `src/components/ProtectedRoute.jsx` – Guards private routes
- `src/pages/SignUp.jsx` – Registration screen
- `src/pages/SignIn.jsx` – Login + password reset
- `src/components/Navbar.jsx` – Dynamic auth UI

## 4. Protect a Route
```jsx
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

## 5. Use Auth in a Component
```jsx
import { useAuth } from '../context/AuthContext';
const { user, signOut } = useAuth();
```

## 6. Password Reset
Enter an email on Sign In page, click "Forgot password?".

## 7. Future Enhancements
- Email verification (`sendEmailVerification`)
- Social login (Google, GitHub) with `signInWithPopup`
- Firestore user profiles & preferences
- Form validation via `react-hook-form` + `zod`
- Role-based access & custom claims

## 8. Security Notes
- Never commit `.env`
- Restrict API key usage (HTTP referrer restrictions)
- Add Firestore/Storage security rules before storing user data

## 9. Run Dev
```
npm install
npm run dev
```
Visit http://localhost:5173 and create an account.

---
Need more features? Ask for social auth, email verification, or roles.
