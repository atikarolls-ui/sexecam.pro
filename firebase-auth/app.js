import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// --- Configuration Firebase — voir config.example.js ---
// Copie `config.example.js` vers `config.js` et remplis les valeurs depuis la console Firebase
let firebaseConfig = null;
let app = null;
let auth = null;

(async function loadConfigAndInit(){
  try{
    const m = await import('./config.js');
    firebaseConfig = m.firebaseConfig;
  }catch(err){
    // fallback - keeps the example runnable but warns the developer
    firebaseConfig = { apiKey: 'REPLACE_ME', authDomain: 'REPLACE_ME', projectId: 'REPLACE_ME' };
    console.warn('firebase-auth: No config.js found — copy config.example.js → config.js and add your Firebase web app keys.');
  }

  try{
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // show helpful warning in UI when placeholders are present
    try{
      const warnEl = document.getElementById('config-warning');
      if(warnEl && firebaseConfig && typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.includes('REPLACE')){
        warnEl.textContent = '⚠️ config.js manquante: copie config.example.js → config.js et remplis la configuration depuis Firebase Console pour activer l\'auth.';
      }
    }catch(e){/* ignore UI errors */}
  }catch(e){
    console.error('firebase-auth: failed to initialize Firebase', e);
  }
})();

// ---------------------------------------------------------------------------
// (Firebase initialisé via loadConfigAndInit au démarrage)

// UI elements
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const resetForm = document.getElementById('reset-form');
const profileSection = document.getElementById('profile');

const el = id => document.getElementById(id);

// Helpers
function showMsg(id, text, ok=true) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.style.color = ok ? '#a6f3d6' : '#ff9d9d';
}

function clearMsg(id){
  const el = document.getElementById(id);
  el.textContent = '';
}

function validateSignUpData(email, password, confirm, ageChecked, termsChecked){
  if(password !== confirm) return 'Les mots de passe ne correspondent pas.';
  if(!ageChecked) return 'Tu dois avoir 18 ans ou plus pour créer un compte.';
  if(!termsChecked) return 'Tu dois accepter les Conditions.';
  // email and length are validated by HTML attributes too
  return null;
}

// Signup
signupForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  clearMsg('signup-msg');

  const email = el('signup-email').value.trim();
  const password = el('signup-password').value;
  const confirm = el('signup-password-confirm').value;
  const ageChecked = el('signup-age').checked;
  const termsChecked = el('signup-terms').checked;

  const err = validateSignUpData(email, password, confirm, ageChecked, termsChecked);
  if(err){ showMsg('signup-msg', err, false); return; }

  el('signup-form').querySelector('button').disabled = true;
  try{
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    await sendEmailVerification(user);
    showMsg('signup-msg', 'Compte créé — un email de vérification a été envoyé. Vérifie ta boîte mail.');
    signupForm.reset();
  }catch(e){
    showMsg('signup-msg', e.message || 'Erreur lors de la création du compte', false);
  }finally{
    el('signup-form').querySelector('button').disabled = false;
  }
});

// Login
loginForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  clearMsg('login-msg');

  const email = el('login-email').value.trim();
  const password = el('login-password').value;

  el('login-form').querySelector('button').disabled = true;
  try{
    await signInWithEmailAndPassword(auth, email, password);
    showMsg('login-msg', 'Connecté.');
    loginForm.reset();
  }catch(e){
    showMsg('login-msg', e.message || 'Erreur de connexion', false);
  }finally{
    el('login-form').querySelector('button').disabled = false;
  }
});

// Password reset
resetForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  clearMsg('reset-msg');

  const email = el('reset-email').value.trim();
  el('reset-form').querySelector('button').disabled = true;
  try{
    await sendPasswordResetEmail(auth, email);
    showMsg('reset-msg', 'Email de réinitialisation envoyé.');
    resetForm.reset();
  }catch(e){
    showMsg('reset-msg', e.message || 'Erreur', false);
  }finally{
    el('reset-form').querySelector('button').disabled = false;
  }
});

// Logout
el('logout').addEventListener('click', async ()=>{
  await signOut(auth);
});

// Send verification
el('send-verif').addEventListener('click', async ()=>{
  const user = auth.currentUser;
  if(!user){ showMsg('profile-msg','Aucun utilisateur connecté', false); return; }
  try{
    await sendEmailVerification(user);
    showMsg('profile-msg','Email de vérification envoyé.');
  }catch(e){
    showMsg('profile-msg','Erreur en envoyant l’email. '+e.message, false);
  }
});

// Auth state — wait until auth is initialized and then register observer
const authInitWatcher = setInterval(() => {
  if(!auth) return;
  clearInterval(authInitWatcher);
  onAuthStateChanged(auth, user => {
    if(user){
      // afficher le tableau de bord
      profileSection.hidden = false;
      el('profile-email').textContent = `Email: ${user.email}`;
      el('profile-verified').textContent = user.emailVerified ? 'Email vérifié ✅' : 'Email non vérifié ⚠️';
    }else{
      profileSection.hidden = true;
      el('profile-email').textContent = '';
      el('profile-verified').textContent = '';
    }
  });
}, 150);

// Petit helpers pour améliorer l'utilisation
// (ex: rafraîchir l'état de l'utilisateur pour refléter la vérif réellement envoyée)
setInterval(() => {
  const user = auth.currentUser;
  if(user && !user.emailVerified){
    user.reload().catch(()=>{});
  }
}, 10_000); // toutes les 10s (optionnel)
