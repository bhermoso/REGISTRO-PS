// Firebase — inicialización, auth anónima y acceso a DB
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth, signInAnonymously} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {getDatabase, ref, get, push, remove, set} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey:      "AIzaSyCdAivJATiX76xuOJAMc4Yt7sLq-3GDuDw",
  authDomain:  "itaca-3ba7b.firebaseapp.com",
  databaseURL: "https://itaca-3ba7b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:   "itaca-3ba7b",
  storageBucket: "itaca-3ba7b.firebasestorage.app",
  messagingSenderId: "891982060410",
  appId: "1:891982060410:web:cd954a8602eb89ebccd4c3"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

let _ready = false;
let _token = null;

async function fbInit() {
  if (_ready) return;
  await signInAnonymously(auth);
  const snap = await get(ref(db, 'raps_config/gh_token'));
  _token = snap.val();
  _ready = true;
}

async function fbGuardarEvidencia(recordId, meta) {
  await fbInit();
  return push(ref(db, `raps_evidencias/${recordId}`), meta);
}

async function fbLeerEvidencias(recordId) {
  await fbInit();
  const snap = await get(ref(db, `raps_evidencias/${recordId}`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([k, v]) => ({_key: k, ...v}));
}

async function fbEliminarEvidencia(recordId, key) {
  await fbInit();
  return remove(ref(db, `raps_evidencias/${recordId}/${key}`));
}

async function ghToken() {
  await fbInit();
  return _token;
}

export {fbInit, fbGuardarEvidencia, fbLeerEvidencias, fbEliminarEvidencia, ghToken};
