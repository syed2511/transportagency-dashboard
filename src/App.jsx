import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    addDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    where, 
    query, 
    writeBatch, 
    getDocs, 
    getDoc 
} from "firebase/firestore";

/* =======================================================================
   LOCAL FIREBASE CONFIGURATION
   Replace the placeholder below with your actual Firebase project keys
   found in Project Settings > General > Your Apps
   ======================================================================= */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Simplified path for local use
const getBasePath = (userId) => `users/${userId}`;

/* =======================================================================
   ICON COMPONENTS
   ======================================================================= */
const TruckIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><path d="M14 9h4l4 4v4h-8v-4l-4-4Z" /><path d="M10 18h4" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
const PlusCircleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const FileTextIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>;
const DollarSignIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const DownloadIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const UsersIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const BriefcaseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const AlertTriangleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const InfoIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const CheckCircleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const LogOutIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SettingsIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>

/* =======================================================================
   HELPERS & CONFIGS (Unchanged)
   ======================================================================= */
const getFinancialYear = () => { const today = new Date(); const currentMonth = today.getMonth(); const currentYear = today.getFullYear(); if (currentMonth >= 3) { return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`; } else { return `${currentYear - 1}-${currentYear.toString().slice(-2)}`; } };

const numberToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const inWords = (n, s) => {
        let str = '';
        if (n > 19) { str += b[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' : '') + a[n % 10]; } else { str += a[n]; }
        if (n) { str = str.trim() + ' ' + s + ' '; }
        return str;
    };
    let n = Math.floor(num);
    if (n === 0) return "ZERO";
    let str = '';
    const crore = Math.floor(n / 10000000); n %= 10000000;
    if (crore > 0) str += inWords(crore, 'crore');
    const lakh = Math.floor(n / 100000); n %= 100000;
    if (lakh > 0) str += inWords(lakh, 'lakh');
    const thousand = Math.floor(n / 1000); n %= 1000;
    if (thousand > 0) str += inWords(thousand, 'thousand');
    const hundred = Math.floor(n / 100); n %= 100;
    if (hundred > 0) str += inWords(hundred, 'hundred');
    if (str && n > 0) str += 'and ';
    if (n > 0) str += inWords(n, '');
    return str.trim().toUpperCase().replace(/\s+/g, ' ') + " ONLY";
};

const alphanumericComparator = (strA, strB) => {
    const regex = /^(\d*)(.*)$/;
    const [, numAStr, suffixA] = String(strA || '').match(regex) || ["", "", String(strA || '')];
    const [, numBStr, suffixB] = String(strB || '').match(regex) || ["", "", String(strB || '')];
    const numA = parseInt(numAStr, 10);
    const numB = parseInt(numBStr, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) return numA - numB;
        return suffixA.localeCompare(suffixB);
    }
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return String(strA || '').localeCompare(String(strB || ''));
};

const defaultCompanyConfigs = {
    "GLOBAL LOGISTICS": {
        header: "GLOBAL LOGISTICS",
        prefix: "GL",
        address: "2-42-69/3 ILTD JUNCTION, RAJAMAHENDRAVARAM",
        panNo: "LJBPS6830H",
        phone: "9885086504, 7981658659",
        email: "GLOBALRJY1@GMAIL.COM",
        bankAccounts: [
            { name: "HDFC BANK", ac: "50200117398447", ifsc: "HDFC0000215", branch: "DANVAIPETA, RAJAHMUNDRY" },
            { name: "ICICI BANK", ac: "631505500740", ifsc: "ICIC0006315", branch: "T NAGAR, RAJAHMUNDRY" }
        ]
    },
    "SRI KUMAR TRANSPORT": {
        header: "SRI KUMAR TRANSPORT",
        prefix: "SKT",
        address: "6-93/7/4, NEAR KONTHAMURU PANCHAYATI OFFICE",
        phone: "9885086504, 9390680009",
        email: "SKTC.RJY@GMAIL.COM",
        bankAccounts: [
            { name: "ICICI BANK", ac: "631505013772", ifsc: "ICIC0006315", branch: "T NAGAR, RAJAHMUNDRY" }
        ]
    },
    "SAI KUMAR TRANSPORT": {
        header: "SAI KUMAR TRANSPORT",
        prefix: "SAI",
        address: "6-93/7/4, NEAR KONTHAMURU PANCHAYATI OFFICE",
        phone: "9885086504, 9390680009",
        email: "SKTC.RJY@GMAIL.COM",
        bankAccounts: [
            { name: "BANK OF MAHARASHTRA", ac: "60380956429", ifsc: "MAHB0001126", branch: "T NAGAR, RAJAHMUNDRY" }
        ]
    }
};

// (PDF/Statement logic omitted for brevity, remains identical to your original code)
// ... [Insert generatePdfForBill and generateDueStatementPDF from your original code] ...

/* =======================================================================
   UI COMPONENTS (Identical to your original code)
   ======================================================================= */
// ... [Insert AlertModal, ConfirmModal, PaymentModal, NavButton, Section, Input, PartySelector, InfoBox, PartyFormModal] ...

/* =======================================================================
   VIEW COMPONENTS (Identical to your original code)
   ======================================================================= */
// ... [Insert LrView, LrForm, BillingView, CreateBillForm, PartiesView, CompanySettingsView, StatementView] ...

/* =======================================================================
   AUTHENTICATION SCREENS
   ======================================================================= */
function LoginScreen({ showAlert }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!email || !password) { showAlert("Authentication Error", "Please enter both email and password."); return; }
        try {
            if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
            else await signInWithEmailAndPassword(auth, email, password);
        } catch (error) { showAlert("Authentication Failed", error.message); }
    };
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-center mb-6"><TruckIcon className="h-12 w-12 text-indigo-600" /></div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{isRegistering ? 'Create an Account' : 'Transport Dashboard Login'}</h2>
                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1 text-slate-600">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="p-2 border rounded-md" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1 text-slate-600">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="p-2 border rounded-md" />
                    </div>
                    <div><button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors">{isRegistering ? 'Sign Up' : 'Sign In'}</button></div>
                </form>
                <div className="mt-6 text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-indigo-600 hover:underline">{isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</button></div>
            </div>
        </div>
    );
}

/* =======================================================================
   MAIN APP COMPONENT
   ======================================================================= */
function App() {
    const [view, setView] = useState(() => localStorage.getItem('currentView') || 'lrs');
    const [lrs, setLrs] = useState([]);
    const [bills, setBills] = useState([]);
    const [parties, setParties] = useState([]);
    const [editingLr, setEditingLr] = useState(null);
    const [editingBill, setEditingBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null);
    const [editingParty, setEditingParty] = useState(null);
    const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [configs, setConfigs] = useState(defaultCompanyConfigs);

    const showAlert = useCallback((title, message) => setAlertInfo({ title, message }), []);
    
    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Load External Scripts (jsPDF, etc)
    useEffect(() => {
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
        });

        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"))
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"))
            .then(() => setScriptsLoaded(true))
            .catch(() => showAlert("Loading Error", "Could not load required libraries."));
    }, [showAlert]);
    
    // Data Syncing
    useEffect(() => {
        if (!user) { setDataLoaded(false); return; }
        
        const paths = ['lrs', 'bills', 'parties'];
        const unsubscribers = paths.map(path => {
            const setter = path === 'lrs' ? setLrs : path === 'bills' ? setBills : setParties;
            return onSnapshot(query(collection(db, getBasePath(user.uid), path)), (snapshot) => {
                setter(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        });

        // Fetch user-specific settings
        const fetchSettings = async () => {
            const snap = await getDoc(doc(db, getBasePath(user.uid), 'settings', 'companyConfigs'));
            if (snap.exists()) setConfigs(snap.data());
        };
        fetchSettings();

        setDataLoaded(true);
        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    const handleSetView = (newView) => { setEditingLr(null); setEditingBill(null); setView(newView); };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <LoginScreen showAlert={showAlert} />;
    
    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            {/* Confirmation and Alert Modals */}
            {confirmation && <ConfirmModal message={confirmation.message} onConfirm={() => { confirmation.onConfirm(); setConfirmation(null); }} onCancel={() => setConfirmation(null)} />}
            {alertInfo && <AlertModal title={alertInfo.title} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}
            
            <div className="container mx-auto p-4">
                <header className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-3"><TruckIcon className="h-8 w-8 text-indigo-600" /><h1 className="text-2xl font-bold">Transport Dashboard</h1></div>
                    <button onClick={() => signOut(auth)} className="text-red-500 font-semibold flex items-center gap-2"><LogOutIcon className="h-5 w-5"/> Logout</button>
                </header>

                <nav className="bg-white rounded-lg shadow p-2 flex gap-2 mb-6">
                    <NavButton icon={<FileTextIcon />} label="LRs" active={view === 'lrs'} onClick={() => handleSetView('lrs')} />
                    <NavButton icon={<DollarSignIcon />} label="Billing" active={view === 'billing'} onClick={() => handleSetView('billing')} />
                    <NavButton icon={<UsersIcon />} label="Parties" active={view === 'parties'} onClick={() => handleSetView('parties')} />
                    <NavButton icon={<BriefcaseIcon />} label="Statements" active={view === 'statements'} onClick={() => handleSetView('statements')} />
                    <NavButton icon={<SettingsIcon />} label="Settings" active={view === 'company_settings'} onClick={() => handleSetView('company_settings')} />
                </nav>

                <main className="bg-white rounded-lg shadow p-6">
                   {/* View Rendering Logic here based on 'view' state */}
                   {/* e.g. view === 'lrs' && <LrView ... /> */}
                </main>
            </div>
        </div>
    );
}

export default App;