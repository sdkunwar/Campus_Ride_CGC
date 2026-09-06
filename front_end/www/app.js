/* ═══════════════════════════════════════════════════════════════════ */
/* Campus ride CGC — College Bus Tracking System                         */
/* Enhanced: Multiple buses per route, next-bus, GPS live tracking   */
/* ═══════════════════════════════════════════════════════════════════ */

// ─── ROUTE DATA ────────────────────────────────────────────────────
// Each route has multiple trips (buses) throughout the day.
// GPS coordinates simulate a real college area (using Bangalore area coords).
// This array is replaced by live data from the Flask backend when it is
// reachable; the built-in demo routes are kept as an offline fallback.
let ROUTES = [
    {
        id: 'A', name: 'CGC Landran → Chandigarh Sec 17 (via Mohali Phase 7)', color: 'a',
        stops: [
            { name: 'CGC Landran (Sector 112, NH 205A, Gate No. 7)', lat: 30.7069, lng: 76.6512 },
            { name: 'Sohana Hospital',               lat: 30.6860, lng: 76.6980 },
            { name: 'Mohali Phase 7',                lat: 30.7010, lng: 76.7200 },
            { name: 'Mohali Phase 3B2',              lat: 30.7050, lng: 76.7280 },
            { name: 'Sector 35 Market',              lat: 30.7250, lng: 76.7600 },
            { name: 'Chandigarh Sector 17 Terminal', lat: 30.7420, lng: 76.7820 },
        ],
        trips: [
            { busNo: 'PB-65-1234', driver: 'Rajesh Kumar',  driverId: 'DRV-101', departure: '6:30 AM',  arrival: '7:30 AM'  },
            { busNo: 'PB-65-1235', driver: 'Anil Verma',    driverId: 'DRV-107', departure: '7:30 AM',  arrival: '8:30 AM'  },
            { busNo: 'PB-65-1236', driver: 'Mohan Das',     driverId: 'DRV-108', departure: '8:30 AM',  arrival: '9:30 AM'  },
            { busNo: 'PB-65-1234', driver: 'Rajesh Kumar',  driverId: 'DRV-101', departure: '9:45 AM',  always_active: true, arrival: '10:45 AM' },
            { busNo: 'PB-65-1235', driver: 'Anil Verma',    driverId: 'DRV-107', departure: '12:00 PM', arrival: '1:00 PM'  },
            { busNo: 'PB-65-1236', driver: 'Mohan Das',     driverId: 'DRV-108', departure: '4:30 PM',  arrival: '5:30 PM'  },
        ],
        studentCount: 24,
    },
    {
        id: 'B', name: 'CGC Landran → Chandigarh Railway Stn (Express)', color: 'b',
        stops: [
            { name: 'CGC Landran (Sector 112, NH 205A, Gate No. 7)', lat: 30.7069, lng: 76.6512 },
            { name: 'Mohali Phase 11',               lat: 30.6750, lng: 76.7350 },
            { name: 'Sector 20 Gurudwara',           lat: 30.7210, lng: 76.7780 },
            { name: 'Sector 26 Khalsa College',      lat: 30.7280, lng: 76.7950 },
            { name: 'Chandigarh Railway Station',    lat: 30.7050, lng: 76.8010 },
        ],
        trips: [
            { busNo: 'PB-65-5678', driver: 'Suresh Patel',   driverId: 'DRV-102', departure: '6:15 AM',  arrival: '7:15 AM'  },
            { busNo: 'PB-65-5679', driver: 'Ramesh Yadav',   driverId: 'DRV-109', departure: '7:15 AM',  arrival: '8:15 AM'  },
            { busNo: 'PB-65-5678', driver: 'Suresh Patel',   driverId: 'DRV-102', departure: '8:30 AM',  arrival: '9:30 AM'  },
            { busNo: 'PB-65-5679', driver: 'Ramesh Yadav',   driverId: 'DRV-109', departure: '10:00 AM', arrival: '11:00 AM' },
            { busNo: 'PB-65-5678', driver: 'Suresh Patel',   driverId: 'DRV-102', departure: '1:00 PM',  arrival: '2:00 PM'  },
            { busNo: 'PB-65-5679', driver: 'Ramesh Yadav',   driverId: 'DRV-109', departure: '5:00 PM',  arrival: '6:00 PM'  },
        ],
        studentCount: 32,
    },
    {
        id: 'C', name: 'CGC Landran → Zirakpur VIP Road', color: 'c',
        stops: [
            { name: 'CGC Landran (Sector 112, NH 205A, Gate No. 7)', lat: 30.7069, lng: 76.6512 },
            { name: 'Sohana Chowk',                  lat: 30.6890, lng: 76.7010 },
            { name: 'Mohali Phase 9',                lat: 30.6880, lng: 76.7270 },
            { name: 'Aerocity Mohali',               lat: 30.6620, lng: 76.7600 },
            { name: 'Singla Chowk Zirakpur',         lat: 30.6550, lng: 76.8100 },
            { name: 'Zirakpur VIP Road',             lat: 30.6420, lng: 76.8200 },
        ],
        trips: [
            { busNo: 'PB-65-9012', driver: 'Amit Sharma',   driverId: 'DRV-103', departure: '6:00 AM',  arrival: '7:20 AM'  },
            { busNo: 'PB-65-9013', driver: 'Sanjay Mishra',  driverId: 'DRV-110', departure: '7:00 AM',  arrival: '8:20 AM'  },
            { busNo: 'PB-65-9012', driver: 'Amit Sharma',   driverId: 'DRV-103', departure: '8:30 AM',  arrival: '9:50 AM'  },
            { busNo: 'PB-65-9013', driver: 'Sanjay Mishra',  driverId: 'DRV-110', departure: '11:00 AM', arrival: '12:20 PM' },
            { busNo: 'PB-65-9012', driver: 'Amit Sharma',   driverId: 'DRV-103', departure: '3:30 PM',  arrival: '4:50 PM'  },
        ],
        studentCount: 18,
    },
    {
        id: 'D', name: 'CGC Landran → Ambala (via Sec 17, Sec 43, Sec 16)', color: 'd',
        stops: [
            { name: 'CGC Landran (Sector 112, NH 205A, Gate No. 7)', lat: 30.7069, lng: 76.6512 },
            { name: 'Chandigarh Sector 43 (Bus Stand)',               lat: 30.7157, lng: 76.7989 },
            { name: 'Chandigarh Sector 16 (PGI Chowk)',              lat: 30.7636, lng: 76.7726 },
            { name: 'Chandigarh Sector 17 (ISBT / Bus Terminal)',     lat: 30.7420, lng: 76.7820 },
            { name: 'Zirakpur (Ambala Highway)',                      lat: 30.6420, lng: 76.8200 },
            { name: 'Ambala City Bus Stand',                          lat: 30.3782, lng: 76.7767 },
            { name: 'Ambala Cantt Railway Station',                   lat: 30.3486, lng: 76.8368 },
        ],
        trips: [
            { busNo: 'PB-65-3456', driver: 'Vikram Singh',  driverId: 'DRV-104', departure: '5:30 AM',  arrival: '7:30 AM'  },
            { busNo: 'PB-65-3457', driver: 'Prakash Nair',   driverId: 'DRV-111', departure: '7:00 AM',  arrival: '9:00 AM'  },
            { busNo: 'PB-65-3456', driver: 'Vikram Singh',  driverId: 'DRV-104', departure: '8:30 AM',  arrival: '10:30 AM' },
            { busNo: 'PB-65-3457', driver: 'Prakash Nair',   driverId: 'DRV-111', departure: '1:00 PM',  arrival: '3:00 PM'  },
            { busNo: 'PB-65-3456', driver: 'Vikram Singh',  driverId: 'DRV-104', departure: '4:30 PM',  arrival: '6:30 PM'  },
        ],
        studentCount: 15,
    },
    {
        id: 'E', name: 'CGC Landran → Panchkula Sector 5 Bus Stand', color: 'e',
        stops: [
            { name: 'CGC Landran (Sector 112, NH 205A, Gate No. 7)', lat: 30.7069, lng: 76.6512 },
            { name: 'Mohali Phase 5',                lat: 30.7070, lng: 76.7220 },
            { name: 'Sector 22 Tribune Chowk',       lat: 30.7050, lng: 76.7820 },
            { name: 'Manimajra Chowk',               lat: 30.7250, lng: 76.8250 },
            { name: 'MDC Panchkula',                 lat: 30.7180, lng: 76.8400 },
            { name: 'Panchkula Sector 5 Bus Stand',  lat: 30.6970, lng: 76.8600 },
        ],
        trips: [
            { busNo: 'PB-65-7890', driver: 'Mahesh Rao',     driverId: 'DRV-105', departure: '6:20 AM',  arrival: '7:25 AM'  },
            { busNo: 'PB-65-7891', driver: 'Ganesh Reddy',    driverId: 'DRV-112', departure: '7:20 AM',  arrival: '8:25 AM'  },
            { busNo: 'PB-65-7890', driver: 'Mahesh Rao',     driverId: 'DRV-105', departure: '8:45 AM',  arrival: '9:50 AM'  },
            { busNo: 'PB-65-7891', driver: 'Ganesh Reddy',    driverId: 'DRV-112', departure: '11:30 AM', arrival: '12:35 PM' },
            { busNo: 'PB-65-7890', driver: 'Mahesh Rao',     driverId: 'DRV-105', departure: '4:00 PM',  arrival: '5:05 PM'  },
        ],
        studentCount: 21,
    },
    {
        id: 'F', name: 'CGC Landran → Kurali Bus Stand', color: 'f',
        stops: [
            { name: 'CGC Landran (Sector 112, NH 205A, Gate No. 7)', lat: 30.7069, lng: 76.6512 },
            { name: 'Landran Road Crossing',         lat: 30.7210, lng: 76.6450 },
            { name: 'Kharar Highway Bypass',         lat: 30.7550, lng: 76.6380 },
            { name: 'Padiala Chowk',                 lat: 30.7850, lng: 76.6080 },
            { name: 'Kurali Bus Stand',              lat: 30.8220, lng: 76.5740 },
        ],
        trips: [
            { busNo: 'PB-65-2345', driver: 'Deepak Joshi',   driverId: 'DRV-106', departure: '6:10 AM',  arrival: '7:35 AM'  },
            { busNo: 'PB-65-2346', driver: 'Ravi Shankar',    driverId: 'DRV-113', departure: '7:10 AM',  arrival: '8:35 AM'  },
            { busNo: 'PB-65-2345', driver: 'Deepak Joshi',   driverId: 'DRV-106', departure: '8:30 AM',  always_active: true, arrival: '9:55 AM'  },
            { busNo: 'PB-65-2346', driver: 'Ravi Shankar',    driverId: 'DRV-113', departure: '10:30 AM', arrival: '11:55 AM' },
            { busNo: 'PB-65-2345', driver: 'Deepak Joshi',   driverId: 'DRV-106', departure: '2:30 PM',  arrival: '3:55 PM'  },
            { busNo: 'PB-65-2346', driver: 'Ravi Shankar',    driverId: 'DRV-113', departure: '5:30 PM',  arrival: '6:55 PM'  },
        ],
        studentCount: 28,
    },
];

const DEFAULT_STUDENTS = {};
let STUDENTS = { ...DEFAULT_STUDENTS };

// Build drivers from all trips
let DRIVERS = {};
ROUTES.forEach(route => {
    route.trips.forEach(trip => {
        if (!DRIVERS[trip.driverId]) {
            DRIVERS[trip.driverId] = { name: trip.driver, pin: '1234', route: route.id, busNo: trip.busNo };
        }
    });
});

const ADMINS = {
    'ADMIN-01': { id: 'ADMIN-01', name: 'System Administrator', pin: '1234', email: 'admin@cgc.edu.in' }
};

// ─── Faculty accounts (local mirror) ──────────────────────────────
// Keyed by employee ID. The backend users table is the source of truth
// when reachable; this store keeps the portal usable offline.
let FACULTY = {};

function loadFacultyAccounts() {
    try {
        const saved = localStorage.getItem('campus-ride-faculty');
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
            FACULTY = { ...parsed };
        }
    } catch (error) {
        console.warn('Unable to load saved faculty accounts', error);
    }
}

function saveFacultyAccounts() {
    try {
        localStorage.setItem('campus-ride-faculty', JSON.stringify(FACULTY));
    } catch (error) {
        console.warn('Unable to save faculty accounts', error);
    }
}

// Hash a password for the offline demo store. The backend hashes with
// werkzeug; this only avoids persisting plaintext in localStorage.
async function hashPw(str) {
    try {
        if (window.crypto && crypto.subtle) {
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(str)));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) { /* fall back below */ }
    let h = 5381;
    const s = String(str);
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return 'djb2:' + (h >>> 0).toString(16);
}

loadFacultyAccounts();

function loadDriverAccounts() {
    try {
        const saved = localStorage.getItem('college-bus-tracker-drivers');
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
            DRIVERS = { ...DRIVERS, ...parsed };
        }
    } catch (error) {
        console.warn('Unable to load saved driver accounts', error);
    }
}

loadDriverAccounts();

// ─── State ─────────────────────────────────────────────────────────
let currentUser = null;
let portalMode = 'student'; // 'student' | 'faculty' within the Faculty/Student portal
let notifications = [];
let notifIdCounter = 0;
let liveMap = null;
let busMarkers = {};          // busNo -> L.marker
let routePolylines = {};      // routeId -> L.polyline
let stopMarkers = [];
let gpsSimInterval = null;
let busSim = {};              // busNo -> { routeId, tripIdx, progress, lat, lng, speed, nextStopIdx }
let countdownInterval = null;
let studentResponses = {};    // key: studentPass_notifId -> response
window.driverCheckins = [];   // list of student departure responses
let routePathMetrics = {};    // routeId -> { latlngs, dists, total }

// ─── API CONFIGURATION ──────────────────────────────────────────────
// The frontend talks to the Flask backend. If it is unreachable, the
// app keeps working with the built-in demo data above.
// Switch between environments by changing ACTIVE_API_ENV below.
//   local:      Flask backend on the same Wi-Fi (Android/desktop testing)
//   production: live HTTPS API for deployed students
const API_BASE_URLS = {
    local: window.CAMPUS_RIDE_API_BASE || 'http://10.222.42.8:5000',
    production: window.CAMPUS_RIDE_API_BASE || '',
};
const ACTIVE_API_ENV = window.CAMPUS_RIDE_API_ENV || 'local';
const API_BASE = API_BASE_URLS[ACTIVE_API_ENV];
let API_AVAILABLE = false;

async function apiGet(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) {
        let detail = '';
        try { const d = await res.json(); detail = d.error || d.message || ''; } catch (e) { /* ignore */ }
        const error = new Error(detail || (`${res.status} ${res.statusText}`).trim());
        error.status = res.status;
        throw error;
    }
    return res.json();
}

async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        let detail = '';
        try { const d = await res.json(); detail = d.error || d.message || ''; } catch (e) { /* ignore */ }
        throw new Error(detail || (`${res.status} ${res.statusText}`).trim());
    }
    return res.json();
}

// Authenticated admin request helper (PUT / POST / DELETE / GET with the
// admin bearer token). Returns parsed JSON; throws on non-2xx.
async function adminApi(method, path, body) {
    const token = currentUser && currentUser.type === 'admin' && currentUser.data.adminToken;
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['X-Admin-Token'] = token;
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    if (!res.ok) {
        let detail = '';
        try { const d = await res.json(); detail = d.error || d.message || ''; } catch (e) { /* ignore */ }
        const err = new Error(detail || (`${res.status} ${res.statusText}`).trim());
        err.status = res.status;
        throw err;
    }
    return res.json();
}

// Authenticated user request helper (student / faculty / driver). Uses the
// X-User-Token session token issued at login whenever the backend is live;
// offline/demo mode falls back to the local notification stores.
async function userApi(method, path, body) {
    const token = currentUser && currentUser.data && currentUser.data.sessionToken;
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['X-User-Token'] = token;
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    if (!res.ok) {
        let detail = '';
        try { const d = await res.json(); detail = d.error || d.message || ''; } catch (e) { /* ignore */ }
        const err = new Error(detail || (`${res.status} ${res.statusText}`).trim());
        err.status = res.status;
        throw err;
    }
    return res.json();
}

// Format a MySQL created_at ("2026-08-18 07:00:00") for the notification lists.
// Same-day rows show only the time; older rows show "Aug 16, 7:00 AM".
function fmtNotifTime(ts) {
    if (!ts) return '';
    const d = new Date(String(ts).replace(' ', 'T'));
    if (isNaN(d.getTime())) return String(ts);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return time;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + time;
}

// Convert backend "7:00:00" to the display format "7:00 AM"
function apiTimeToDisplay(t) {
    if (!t) return '';
    const m = String(t).match(/(\d{1,2}):(\d{2})/);
    if (!m) return String(t);
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${min} ${ampm}`;
}

const API_ROUTE_COLORS = ['a', 'b', 'c', 'd', 'e', 'f'];

// Load buses, routes, trips and stops from the Flask backend and rebuild
// the ROUTES array. Falls back to the built-in demo data on any failure.
async function loadBackendData() {
    try {
        const [buses, routes, trips] = await Promise.all([
            apiGet('/api/buses'),
            apiGet('/api/routes'),
            apiGet('/api/trips'),
        ]);

        const stopsByRoute = {};
        await Promise.all(routes.map(async (r) => {
            try {
                const data = await apiGet(`/api/routes/${r.route_id}/stops`);
                stopsByRoute[r.route_id] = data.stops || [];
            } catch (e) {
                stopsByRoute[r.route_id] = [];
            }
        }));

        const busById = {};
        buses.forEach((b) => { busById[b.bus_id] = b; });

        ROUTES = routes.map((r, idx) => {
            const stops = (stopsByRoute[r.route_id] || [])
                .map((s) => ({ name: s.stop_name, lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) }))
                .filter((s) => !isNaN(s.lat) && !isNaN(s.lng));

            const routeTrips = trips
                .filter((t) => Number(t.route_id) === Number(r.route_id))
                .map((t) => ({
                    busNo: t.bus_number || (busById[t.bus_id] && busById[t.bus_id].bus_number) || ('Bus-' + t.bus_id),
                    busId: t.bus_id,
                    driver: t.driver_name || 'Driver',
                    driverId: 'DRV-' + (t.driver_id || t.bus_id),
                    departure: apiTimeToDisplay(t.departure_time),
                    arrival: apiTimeToDisplay(t.arrival_time),
                    always_active: t.status === 'always_active' || t.status === 'active',
                    tripId: t.trip_id,
                }));

            return {
                id: String(r.route_id),
                name: r.route_name,
                status: r.status || 'active',
                color: API_ROUTE_COLORS[idx % API_ROUTE_COLORS.length],
                stops,
                geometry: (r.geometry && Array.isArray(r.geometry)) ? r.geometry : null,
                trips: routeTrips,
                studentCount: 0,
                buses: (r.buses || []).map((b) => ({
                    busId: b.bus_id,
                    busNumber: b.bus_number || ('Bus-' + b.bus_id),
                    driver: b.driver_name || '',
                    stations: (b.stations || [])
                        .map((s) => ({
                            stationId: s.station_id,
                            name: s.station_name,
                            lat: parseFloat(s.latitude),
                            lng: parseFloat(s.longitude),
                            time: s.estimated_time || '',
                        }))
                        .filter((s) => !isNaN(s.lat) && !isNaN(s.lng)),
                })),
            };
        });

        API_AVAILABLE = true;

        // Rebuild drivers from backend trips, then re-apply saved accounts
        DRIVERS = {};
        ROUTES.forEach((route) => {
            route.trips.forEach((trip) => {
                if (!DRIVERS[trip.driverId]) {
                    DRIVERS[trip.driverId] = { name: trip.driver, pin: '1234', route: route.id, busNo: trip.busNo };
                }
            });
        });
        loadDriverAccounts();
        populateRegisterRouteOptions();
        populateDriverRegisterRouteOptions();
        populateFacultyRegisterRouteOptions();

        // If the user logged in before the data arrived, restart the GPS
        // simulation so it uses the freshly loaded backend routes.
        if (gpsSimInterval && (!activeDriverTrip || activeDriverTrip.status !== 'ACTIVE')) {
            startGPSSimulation();
        }

        console.log(`[API] Loaded ${ROUTES.length} routes, ${buses.length} buses from backend.`);
    } catch (err) {
        console.warn('[API] Backend unavailable, using built-in demo data.', err);
        API_AVAILABLE = false;
    }
}

// ─── DOM ───────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const loginPage   = $('#login-page');
const studentPage = $('#student-page');
const driverPage  = $('#driver-page');
const adminPage   = $('#admin-page');
const facultyPage = $('#faculty-page');

const roleToggle     = $('#role-toggle');
const btnRoleStudent = $('#btn-role-student');
const btnRoleDriver  = $('#btn-role-driver');
const btnRoleAdmin   = $('#btn-role-admin');

const portalSubToggle   = $('#portal-subtoggle');
const portalBtnStudent  = $('#portal-btn-student');
const portalBtnFaculty  = $('#portal-btn-faculty');

const studentForm  = $('#student-login-form');
const studentPass  = $('#student-pass');
const passError    = $('#pass-error');
const studentRegisterCard = $('#student-register-card');
const studentRegisterForm = $('#student-register-form');
const studentAuthButtons = Array.from(document.querySelectorAll('.student-auth-toggle__btn'));
const studentAuthSection = $('#student-auth-section');
const driverRegisterCard = $('#driver-register-card');
const driverRegisterForm = $('#driver-register-form');
const driverAuthButtons = Array.from(document.querySelectorAll('.driver-auth-toggle__btn'));
const driverAuthSection = $('#driver-auth-section');
const driverRegisterName = $('#driver-register-name');
const driverRegisterId = $('#driver-register-id');
const driverRegisterPin = $('#driver-register-pin');
const driverRegisterRoute = $('#driver-register-route');
const driverRegisterBus = $('#driver-register-bus');
const driverRegisterContact = $('#driver-register-contact');
const registerName = $('#register-name');
const registerRelationType = $('#register-relation-type');
const registerRelationValue = $('#register-relation-value');
const registerRoll = $('#register-roll');
const registerRoute = $('#register-route');
const registerBranch = $('#register-branch');
const registerCollege = $('#register-college');
const registerPickup = $('#register-pickup');
const registerIssueDate = $('#register-issue-date');
const registerValidUpTo = $('#register-valid-up-to');
const registerFeeReceipt = $('#register-fee-receipt');
const registerFeeDate = $('#register-fee-date');
const registerFeePlace = $('#register-fee-place');
const registerContact = $('#register-contact');
const registerEmail = $('#register-email');
const registerPassword = $('#register-password');

const driverForm   = $('#driver-login-form');
const driverId     = $('#driver-id');
const driverPin    = $('#driver-pin');
const driverIdErr  = $('#driver-id-error');
const driverPinErr = $('#driver-pin-error');

const adminForm        = $('#admin-login-form');
const adminId          = $('#admin-id');
const adminPin         = $('#admin-pin');
const adminIdErr       = $('#admin-id-error');
const adminPinErr      = $('#admin-pin-error');
const adminAuthSection = $('#admin-auth-section');
const adminSignupPanel = $('#admin-signup-panel');
const adminSignupLink  = $('#admin-signup-link');
const adminSignupForm  = $('#admin-signup-form');
const adminSignupId    = $('#admin-signup-id');
const adminSignupName  = $('#admin-signup-name');
const adminSignupPw    = $('#admin-signup-password');
const adminSignupBack  = $('#admin-signup-back');

const facultyAuthSection   = $('#faculty-auth-section');
const facultyForm          = $('#faculty-login-form');
const facultyId            = $('#faculty-id');
const facultyIdErr         = $('#faculty-id-error');
const facultyLoginPassword = $('#faculty-password-input');
const facultyLoginPwdErr   = $('#faculty-login-password-error');
const facultyRegisterCard  = $('#faculty-register-card');
const facultyRegisterForm  = $('#faculty-register-form');
const facultyAuthButtons   = Array.from(document.querySelectorAll('.faculty-auth-toggle__btn'));
const facultyRegisterName     = $('#faculty-register-name');
const facultyRegisterId       = $('#faculty-register-id');
const facultyRegisterEmail    = $('#faculty-register-email');
const facultyRegisterContact  = $('#faculty-register-contact');
const facultyRegisterDept     = $('#faculty-register-department');
const facultyRegisterRoute    = $('#faculty-register-route');
const facultyRegisterPassword = $('#faculty-register-password');

const facultyName         = $('#faculty-name');
const facultyAvatar       = $('#faculty-avatar');
const facultyGreeting     = $('#faculty-greeting');
const facultyNotifBadge   = $('#faculty-notif-badge');
const facultyNotifList    = $('#faculty-notification-list');
const facultyBusStatus    = $('#faculty-bus-status');
const facultyBusNumber    = $('#faculty-bus-number');
const facultyRouteName    = $('#faculty-route-name');
const facultyBusLocation  = $('#faculty-bus-location');
const facultyNextStop     = $('#faculty-next-stop');
const facultyEta          = $('#faculty-eta');

// Isolated notification feed for the faculty dashboard
let facultyNotifications = [];

const studentName       = $('#student-name');
const studentGreet      = $('#student-greeting');
const studentNavAvatar  = $('#student-nav-avatar');
const passRenewDate     = $('#pass-renew-date');
const pendingFee        = $('#pending-fee');
const btnClearDues      = $('#btn-clear-dues');
const paymentOptions    = $('#payment-options');
const paymentFlow       = $('#payment-flow');
const paymentFlowTitle  = $('#payment-flow-title');
const paymentFlowSubtitle = $('#payment-flow-subtitle');
const paymentFlowAmount = $('#payment-flow-amount');
const paymentFlowStatus = $('#payment-flow-status');
const paymentFlowSteps  = Array.from(document.querySelectorAll('.payment-step'));
const btnPayNow         = $('#btn-pay-now');
const notifBadge        = $('#notif-badge');
const notifBell      = $('#notification-bell');
const notifList      = $('#notification-list');
const btnClearNotif  = $('#btn-clear-notif');
const routesGrid     = $('#routes-grid');
const routeSearch    = $('#route-search');

const driverNameEl     = $('#driver-name');
const driverGreetEl    = $('#driver-greeting');
const driverRouteEl    = $('#driver-route-name');
const driverBusEl      = $('#driver-bus-number');
const driverStudentCnt = $('#driver-student-count');
const driverRouteStops = $('#driver-route-stops');
const driverNavAvatar  = $('#driver-nav-avatar');
const customMessage    = $('#custom-message');
const btnSendNotif     = $('#btn-send-notif');
const sendSuccess      = $('#send-success');

const toastContainer = $('#toast-container');

const trackRouteSelect = $('#track-route-select');
const trackBusSelect   = $('#track-bus-select');
const showSpeedToggle  = $('#show-speed-toggle');
const activeBusList    = $('#active-buses-list');
const activeBusCount   = $('#active-bus-count');
const mapBusInfo       = $('#map-bus-info');
const mapInfoTraffic   = $('#map-info-traffic');
let selectedBusNo      = null;
let studentPickupMarker = null; // per-student pickup marker on the map

// ═══════════════════════════════════════════════════════════════════
// TIME HELPERS
// ═══════════════════════════════════════════════════════════════════
function parseTime(str) {
    const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
}

// ─── Student pickup helpers ───────────────────────────────────────
function getAssignedBusForStudent(passNo) {
    const student = STUDENTS[passNo];
    if (!student) return null;
    const route = ROUTES.find(r => r.id === student.route);
    if (!route || !route.trips || route.trips.length === 0) return null;
    // Deterministic assignment: use numeric part of passNo to pick a trip index
    const num = parseInt(String(passNo).replace(/\D/g, '') || '0', 10);
    const idx = num % route.trips.length;
    return route.trips[idx].busNo;
}

function getStudentPickupLocation(passNo) {
    const student = STUDENTS[passNo];
    if (!student) return null;
    const route = ROUTES.find(r => r.id === student.route);
    if (!route || !route.stops || route.stops.length === 0) return null;
    // Choose a stop index deterministically from pass number so every student gets a "unique" pickup near a stop
    const num = parseInt(String(passNo).replace(/\D/g, '') || '0', 10);
    const stopIdx = num % route.stops.length;
    const stop = route.stops[stopIdx];
    // Small offset so each student marker doesn't overlap the stop marker
    const jitterLat = ((num % 7) - 3) * 0.00012; // -0.00036 .. +0.00036
    const jitterLng = (((num >> 3) % 7) - 3) * 0.00012;
    return { lat: stop.lat + jitterLat, lng: stop.lng + jitterLng, stopName: stop.name, routeId: route.id };
}

function addStudentPickupMarker() {
    // Remove existing marker
    try { if (studentPickupMarker && liveMap && liveMap.hasLayer(studentPickupMarker)) liveMap.removeLayer(studentPickupMarker); } catch(e) {}
    studentPickupMarker = null;
    if (!currentUser || currentUser.type !== 'student' || !liveMap) return;
    const loc = getStudentPickupLocation(currentUser.passNo);
    if (!loc) return;
    const html = `
        <div class="student-pickup-marker" title="Your pickup: ${loc.stopName}">
            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" fill="#fff" />
                <circle cx="12" cy="12" r="6" fill="var(--accent)" />
                <text x="12" y="16" font-size="9" text-anchor="middle" fill="#fff" font-family="Inter, sans-serif">S</text>
            </svg>
        </div>`;
    const icon = L.divIcon({ html, className: '', iconSize: [22,22], iconAnchor: [11,11] });
    studentPickupMarker = L.marker([loc.lat, loc.lng], { icon }).addTo(liveMap);
    studentPickupMarker.on('click', () => {
        const busNo = getAssignedBusForStudent(currentUser.passNo);
        if (busNo) highlightAssignedBus(busNo);
        showToast('success', 'Pickup selected', `Marked your pickup for Bus ${busNo || '—'}`);
    });
}

function highlightAssignedBus(busNo) {
    clearHighlightAssignedBus();
    if (!busNo) return;
    const el = document.querySelector(`.busno-with-dot[data-busno="${busNo}"] .pickup-dot`);
    if (el) el.classList.add('visible');
}

function clearHighlightAssignedBus() {
    document.querySelectorAll('.pickup-dot.visible').forEach(d => d.classList.remove('visible'));
}


function nowMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function formatMin(totalMin) {
    let h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2,'0')} ${ampm}`;
}

function getStopTimeForTrip(route, trip, stopIndex) {
    const departure = parseTime(trip.departure);
    const arrival = parseTime(trip.arrival);
    const stopCount = route.stops.length;
    if (stopCount < 2) return trip.departure;
    const duration = arrival - departure;
    const fraction = stopIndex / (stopCount - 1);
    const time = departure + Math.round(duration * fraction);
    return formatMin((time + 24 * 60) % (24 * 60));
}

function getTripStatus(trip) {
    if (trip.always_active) return 'enroute';
    const now = nowMinutes();
    const dep = parseTime(trip.departure);
    const arr = parseTime(trip.arrival);
    if (now >= arr) return 'departed';
    if (now >= dep && now < arr) return 'enroute';
    return 'upcoming';
}

function getNextTrip(route) {
    const now = nowMinutes();
    // First check for en-route trips
    for (let i = 0; i < route.trips.length; i++) {
        const t = route.trips[i];
        const dep = parseTime(t.departure);
        const arr = parseTime(t.arrival);
        if (now >= dep && now < arr) return { trip: t, idx: i, status: 'enroute' };
    }
    // Then find next upcoming
    for (let i = 0; i < route.trips.length; i++) {
        const t = route.trips[i];
        const dep = parseTime(t.departure);
        if (dep > now) return { trip: t, idx: i, status: 'upcoming' };
    }
    // All departed — wrap to first tomorrow
    return { trip: route.trips[0], idx: 0, status: 'tomorrow' };
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

// Compute simple path metrics (cumulative distances) for a route polyline
function computeRoutePathMetrics(routeId, latlngs) {
    if (!latlngs || latlngs.length < 2) return;
    const pts = latlngs.map(p => L.latLng(p[0], p[1]));
    const dists = [0];
    for (let i = 1; i < pts.length; i++) {
        dists[i] = dists[i - 1] + pts[i - 1].distanceTo(pts[i]);
    }
    const total = dists[dists.length - 1] || 0;
    routePathMetrics[routeId] = { latlngs: pts, dists, total };
}

// Given a routeId and fraction [0..1], return interpolated [lat,lng] on its path
function getPointOnRoute(routeId, fraction) {
    const m = routePathMetrics[routeId];
    if (!m) return null;
    fraction = Math.max(0, Math.min(1, fraction));
    const target = fraction * m.total;
    const dists = m.dists;
    const pts = m.latlngs;
    if (target <= 0) return [pts[0].lat, pts[0].lng];
    if (target >= m.total) {
        const last = pts[pts.length - 1];
        return [last.lat, last.lng];
    }
    let i = 0;
    while (i < dists.length - 1 && dists[i + 1] < target) i++;
    const segDist = dists[i + 1] - dists[i];
    const t = segDist === 0 ? 0 : (target - dists[i]) / segDist;
    const p1 = pts[i], p2 = pts[i + 1];
    const lat = p1.lat + (p2.lat - p1.lat) * t;
    const lng = p1.lng + (p2.lng - p1.lng) * t;
    return [lat, lng];
}

function getRouteHeading(routeId, fraction) {
    const route = ROUTES.find(r => r.id === routeId);
    if (!route) return 0;
    const m = routePathMetrics[routeId];
    if (m && m.total > 0) {
        fraction = Math.max(0, Math.min(1, fraction));
        const target = fraction * m.total;
        const dists = m.dists;
        const pts = m.latlngs;
        let i = 0;
        while (i < dists.length - 1 && dists[i + 1] < target) i++;
        if (i >= pts.length - 1) i = pts.length - 2;
        const start = pts[i];
        const end = pts[i + 1];
        return getBearing([start.lat, start.lng], [end.lat, end.lng]);
    }

    const stopCount = route.stops.length;
    const rawIdx = Math.min(Math.max(0, fraction * (stopCount - 1)), stopCount - 1);
    const stopIdx = Math.min(Math.floor(rawIdx), stopCount - 2);
    const from = route.stops[stopIdx];
    const to = route.stops[stopIdx + 1];
    return getBearing([from.lat, from.lng], [to.lat, to.lng]);
}

function getBearing(from, to) {
    const lat1 = from[0] * Math.PI / 180;
    const lat2 = to[0] * Math.PI / 180;
    const dLon = (to[1] - from[1]) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
}

function createBusIcon(color, heading = 0) {
    return L.divIcon({
        className: '',
        html: `<div class="bus-marker-icon" style="background:${color};transform:rotate(${heading}deg);">🚌</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
    });
}

function loadStudentAccounts() {
    try {
        const saved = localStorage.getItem('college-bus-tracker-students');
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
            const normalizedAccounts = {};
            const records = Array.isArray(parsed) ? parsed : Object.values(parsed);
            records.forEach((student, index) => {
                if (!student || typeof student !== 'object') return;

                const legacyKey = Object.keys(parsed)[index] || '';
                const canonicalId = String(
                    student.passNo ||
                    student.rollNo ||
                    student.studentId ||
                    student.id ||
                    legacyKey
                ).trim().toUpperCase();

                if (!canonicalId) return;

                student.passNo = student.passNo || canonicalId;
                student.rollNo = student.rollNo || canonicalId;
                student.studentId = student.studentId || canonicalId;
                student.id = student.id || canonicalId;
                student.passNo = String(student.passNo).trim().toUpperCase();
                student.rollNo = String(student.rollNo).trim().toUpperCase();
                student.studentId = String(student.studentId).trim().toUpperCase();
                student.id = String(student.id).trim().toUpperCase();

                if (student.registeredViaPortal === undefined && student.password) {
                    student.registeredViaPortal = true;
                }

                normalizedAccounts[canonicalId] = student;
            });

            STUDENTS = { ...DEFAULT_STUDENTS, ...normalizedAccounts };
        }
    } catch (error) {
        console.warn('Unable to load saved students', error);
    }
}

function saveStudentAccounts() {
    try {
        localStorage.setItem('college-bus-tracker-students', JSON.stringify(STUDENTS));
    } catch (error) {
        console.warn('Unable to save student accounts', error);
    }
}

function populateRegisterRouteOptions() {
    if (!registerRoute) return;
    const options = ROUTES.map(route => `<option value="${route.id}">${route.name}</option>`).join('');
    registerRoute.innerHTML = `<option value="">Select a route</option>${options}`;
}

function populateDriverRegisterRouteOptions() {
    if (!driverRegisterRoute) return;
    const options = ROUTES.map(route => `<option value="${route.id}">${route.name}</option>`).join('');
    driverRegisterRoute.innerHTML = `<option value="">Select a route</option>${options}`;
}

function populateFacultyRegisterRouteOptions() {
    if (!facultyRegisterRoute) return;
    const options = ROUTES.map(route => `<option value="${route.id}">Route ${route.id} — ${route.name}</option>`).join('');
    facultyRegisterRoute.innerHTML = `<option value="">No route assigned</option>${options}`;
}

loadStudentAccounts();
populateRegisterRouteOptions();
populateDriverRegisterRouteOptions();
populateFacultyRegisterRouteOptions();

// ═══════════════════════════════════════════════════════════════════
// ROLE TOGGLE
// ═══════════════════════════════════════════════════════════════════
function setStudentAuthMode(mode) {
    studentForm.classList.toggle('visible', mode === 'signin');
    studentRegisterCard.classList.toggle('visible', mode === 'signup');
    studentAuthButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.authMode === mode));
}

function setDriverAuthMode(mode) {
    driverForm.classList.toggle('visible', mode === 'signin');
    driverRegisterCard.classList.toggle('visible', mode === 'signup');
    driverAuthButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.authMode === mode));
}

function setFacultyAuthMode(mode) {
    facultyForm.classList.toggle('visible', mode === 'signin');
    facultyRegisterCard.classList.toggle('visible', mode === 'signup');
    facultyAuthButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.authMode === mode));
}

// Portal selector within the combined "Faculty / Student" role
function setPortalMode(mode) {
    portalMode = mode;
    const isStudent = mode === 'student';
    portalBtnStudent.classList.toggle('active', isStudent);
    portalBtnFaculty.classList.toggle('active', !isStudent);
    studentAuthSection.classList.toggle('active', isStudent);
    if (facultyAuthSection) facultyAuthSection.classList.toggle('active', !isStudent);
    if (isStudent) setStudentAuthMode('signin');
    else setFacultyAuthMode('signin');
    clearErrors();
}

function setRole(role) {
    roleToggle.dataset.active = role;
    btnRoleStudent.classList.toggle('active', role === 'student');
    btnRoleDriver.classList.toggle('active', role === 'driver');
    if (btnRoleAdmin) btnRoleAdmin.classList.toggle('active', role === 'admin');

    // The Faculty / Student button opens the shared portal with its own sub-toggle
    if (portalSubToggle) portalSubToggle.classList.toggle('visible', role === 'student');

    studentAuthSection.classList.toggle('active', role === 'student' && portalMode === 'student');
    if (facultyAuthSection) facultyAuthSection.classList.toggle('active', role === 'student' && portalMode === 'faculty');
    driverAuthSection.classList.toggle('active', role === 'driver');
    if (adminAuthSection) adminAuthSection.classList.toggle('active', role === 'admin');

    if (role === 'student') {
        if (portalMode === 'faculty') setFacultyAuthMode('signin');
        else setStudentAuthMode('signin');
    } else if (role === 'driver') {
        setDriverAuthMode('signin');
    }

    clearErrors();
}
btnRoleStudent.addEventListener('click', () => setRole('student'));
btnRoleDriver.addEventListener('click', () => setRole('driver'));
if (btnRoleAdmin) btnRoleAdmin.addEventListener('click', () => setRole('admin'));

if (portalBtnStudent) portalBtnStudent.addEventListener('click', () => setPortalMode('student'));
if (portalBtnFaculty) portalBtnFaculty.addEventListener('click', () => setPortalMode('faculty'));

studentAuthButtons.forEach(btn => {
    btn.addEventListener('click', () => setStudentAuthMode(btn.dataset.authMode));
});
driverAuthButtons.forEach(btn => {
    btn.addEventListener('click', () => setDriverAuthMode(btn.dataset.authMode));
});
facultyAuthButtons.forEach(btn => {
    btn.addEventListener('click', () => setFacultyAuthMode(btn.dataset.authMode));
});

function clearErrors() {
    passError.textContent = '';
    driverIdErr.textContent = '';
    driverPinErr.textContent = '';
    if (adminIdErr) adminIdErr.textContent = '';
    if (adminPinErr) adminPinErr.textContent = '';
    if (facultyIdErr) facultyIdErr.textContent = '';
    if (facultyLoginPwdErr) facultyLoginPwdErr.textContent = '';
    $$('.input-group').forEach(g => g.classList.remove('error'));
}

// ═══════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════
// Try signing in against the Flask backend (email + password). Returns:
//   true  – handled by the backend (success or a backend rejection)
//   false – no backend match / backend unreachable → use local demo login
async function tryBackendStudentLogin(rollInput, passwordInput, loginPasswordError) {
    if (!API_AVAILABLE) return false;
    try {
        const profile = await apiPost('/api/auth/login', { identifier: rollInput, password: passwordInput, role: 'student' });
        const route = ROUTES.find(r => String(r.id) === String(profile.route_id || ''));
        if (!route) {
            showFieldError('input-group-pass', passError, 'This account is assigned to a route that is no longer available.');
            return true;
        }

        const studentData = {
            name: profile.name,
            email: profile.email,
            rollNo: profile.roll_no,
            passNo: profile.roll_no,
            studentId: profile.roll_no,
            id: String(profile.id),
            contactNo: profile.contact_no,
            branch: profile.branch,
            college: profile.college,
            pickupPoint: profile.pickup_point,
            route: String(profile.route_id),
            issueDate: profile.pass_issue_date || '',
            validUpTo: profile.pass_valid_upto || '',
            passValidUpto: profile.pass_valid_upto || '',
            feeReceipt: profile.fee_receipt_no || '',
            feeDate: profile.fee_date || '',
            feePlace: profile.fee_place || '',
            relationType: profile.relation_type || '',
            relationValue: profile.relation_value || '',
            passRenewDate: profile.pass_valid_upto || '2026-12-31',
            pendingFee: 0,
            password: passwordInput,
            registeredViaPortal: true,
            avatar: profile.avatar || null,
        };
        if (profile && profile.session_token) studentData.sessionToken = profile.session_token;

        // Cache locally so pickup / assigned-bus helpers keep working.
        // Never let an empty portal value clobber a locally known parent name.
        const prev = STUDENTS[studentData.passNo] || {};
        const merged = Object.assign({}, prev, studentData);
        merged.relationValue = studentData.relationValue || prev.relationValue || '';
        merged.relationType = studentData.relationType || prev.relationType || '';
        STUDENTS[studentData.passNo] = merged;
        studentData.relationValue = merged.relationValue;
        studentData.relationType = merged.relationType;

        currentUser = { type: 'student', data: studentData, route, passNo: studentData.passNo };
        openStudentDashboard();
        return true;
    } catch (err) {
        const msg = String(err && err.message || err);
        if (/401|invalid email|incorrect password/i.test(msg)) {
            showFieldError('input-group-login-password', loginPasswordError, 'Incorrect password.');
            return true;
        }
        if (/404/i.test(msg)) {
            showFieldError('input-group-pass', passError, 'Student ID not found on the portal.');
            return true;
        }
        console.warn('[API] Backend login failed, using local login.', err);
        return false;
    }
}

studentForm.addEventListener('submit', async (e) => {
    e.preventDefault(); clearErrors();
    const rollInput = studentPass.value.trim().toUpperCase();
    const passwordInput = $('#student-password-input')?.value || '';
    const loginPasswordError = $('#login-password-error');
    if (!rollInput) { showFieldError('input-group-pass', passError, 'Please enter your Student ID'); return; }
    if (!passwordInput) { showFieldError('input-group-login-password', loginPasswordError, 'Please enter your password'); return; }

    // Try the backend first (if reachable). If it handled the login, stop.
    if (await tryBackendStudentLogin(rollInput, passwordInput, loginPasswordError)) return;

    // ── Local (demo) login fallback ──
    const student = Object.values(STUDENTS).find(entry => {
        if (!entry) return false;
        const candidateIds = [entry.rollNo, entry.passNo, entry.studentId, entry.id];
        return candidateIds.some(value => {
            if (!value) return false;
            return String(value).trim().toUpperCase() === rollInput;
        });
    });

    if (!student) {
        showFieldError('input-group-pass', passError, 'Student ID not found. Please create an account first.');
        return;
    }

    const hasPortalRegistration = student && (
        student.registeredViaPortal === true ||
        (typeof student.password === 'string' && student.password.length > 0 && student.route)
    );
    if (!hasPortalRegistration) {
        showFieldError('input-group-pass', passError, 'Only students who created an account on this app can sign in.');
        return;
    }

    if (student.password !== passwordInput) {
        showFieldError('input-group-login-password', loginPasswordError, 'Incorrect password.');
        return;
    }

    const pass = student.passNo || student.rollNo || student.studentId || student.id || rollInput;
    const route = ROUTES.find(r => r.id === student.route);
    if (!route) {
        showFieldError('input-group-pass', passError, 'This account is assigned to a route that is no longer available.');
        return;
    }

    currentUser = { type: 'student', data: student, route, passNo: pass };
    openStudentDashboard();
});

// ── Faculty sign-in ─────────────────────────────────────────────────
// Tries the Flask backend first (employee ID + password, role-scoped).
// Returns true when handled (success or backend rejection), false when
// the backend is unreachable so the local demo login can run instead.
async function tryBackendFacultyLogin(empIdInput, passwordInput, errorEl) {
    if (!API_AVAILABLE) return false;
    try {
        const profile = await apiPost('/api/auth/login', { identifier: empIdInput, password: passwordInput, role: 'faculty' });

        const route = profile.route_id
            ? (ROUTES.find(r => String(r.id) === String(profile.route_id)) || null)
            : null;

        const facultyData = {
            name: profile.name,
            email: profile.email,
            empId: profile.roll_no,
            facultyId: profile.roll_no,
            id: String(profile.id),
            role: 'faculty',
            department: profile.department || '',
            designation: profile.designation || '',
            college: profile.college || 'CGC Landran, Mohali',
            contactNo: profile.contact_no || '',
            pickupPoint: profile.pickup_point || '',
            dob: profile.dob || '',
            gender: profile.gender || '',
            address: profile.address || '',
            bloodGroup: profile.blood_group || '',
            emergencyContact: profile.emergency_contact || '',
            route: profile.route_id ? String(profile.route_id) : '',
            avatar: profile.avatar || null,
            registeredViaPortal: true,
            password: passwordInput,
        };
        if (profile.session_token) facultyData.sessionToken = profile.session_token;

        // Mirror to the local store WITHOUT persisting the plaintext password.
        const { password: _loginPw, ...facultyMirror } = facultyData;
        FACULTY[facultyData.empId] = { ...facultyMirror, pwHash: await hashPw(passwordInput) };
        saveFacultyAccounts();

        currentUser = { type: 'faculty', data: facultyData, route };
        openFacultyDashboard();
        return true;
    } catch (err) {
        const msg = String(err && err.message || err);
        if (/401|invalid email|incorrect password/i.test(msg)) {
            showFieldError('input-group-faculty-login-password', facultyLoginPwdErr, 'Incorrect password.');
            return true;
        }
        if (/403/i.test(msg)) {
            showFieldError('input-group-faculty-id', facultyIdErr, 'This account is not registered as Faculty.');
            return true;
        }
        if (/404/i.test(msg)) {
            showFieldError('input-group-faculty-id', facultyIdErr, 'Faculty ID not found on the portal.');
            return true;
        }
        console.warn('[API] Backend faculty login failed, using local login.', err);
        return false;
    }
}

facultyForm.addEventListener('submit', async (e) => {
    e.preventDefault(); clearErrors();
    const empIdInput = facultyId.value.trim().toUpperCase();
    const passwordInput = facultyLoginPassword.value || '';
    if (!empIdInput) { showFieldError('input-group-faculty-id', facultyIdErr, 'Please enter your Faculty ID'); return; }
    if (!passwordInput) { showFieldError('input-group-faculty-login-password', facultyLoginPwdErr, 'Please enter your password'); return; }

    if (await tryBackendFacultyLogin(empIdInput, passwordInput, facultyIdErr)) return;

    // ── Local (demo) login fallback ──
    const account = Object.values(FACULTY).find(a =>
        a && String(a.empId || a.facultyId || '').trim().toUpperCase() === empIdInput
    );
    if (!account) {
        showFieldError('input-group-faculty-id', facultyIdErr, 'Faculty ID not found. Please create an account first.');
        return;
    }
    if (account.password !== passwordInput && account.pwHash !== await hashPw(passwordInput)) {
        showFieldError('input-group-faculty-login-password', facultyLoginPwdErr, 'Incorrect password.');
        return;
    }

    const route = account.route
        ? (ROUTES.find(r => String(r.id) === String(account.route)) || null)
        : null;
    currentUser = { type: 'faculty', data: account, route };
    openFacultyDashboard();
});

// Password show/hide toggle
document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const wrapper = btn.closest('.input-wrapper');
        const input = wrapper.querySelector('input[type="password"], input[type="text"]');
        const eyeOpen = btn.querySelector('.eye-open');
        const eyeClosed = btn.querySelector('.eye-closed');
        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            input.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
        input.focus();
    });
});

// Forgot password / forgot PIN panel controls
document.querySelectorAll('[data-forgot-panel]').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const panelId = link.dataset.forgotPanel;
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.classList.toggle('open');
        const targetInput = panel.querySelector('input');
        if (panel.classList.contains('open') && targetInput) {
            setTimeout(() => targetInput.focus(), 15);
        }
    });
});

document.querySelectorAll('[data-close-forgot]').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const panel = document.getElementById(closeBtn.dataset.closeForgot);
        if (!panel) return;
        panel.classList.remove('open');
    });
});

const otpRecovery = {
    student: { otp: null, expiresAt: 0, verified: false, role: 'student' },
    driver: { otp: null, expiresAt: 0, verified: false, role: 'driver' },
    admin: { otp: null, expiresAt: 0, verified: false, role: 'admin' },
    faculty: { otp: null, expiresAt: 0, verified: false, role: 'faculty' }
};

function getOtpRecoveryRole(role) {
    return otpRecovery[role] || null;
}

function startOtpCountdown(role) {
    const status = getOtpRecoveryRole(role);
    const timerEl = document.getElementById(`${role}-otp-timer`);
    if (!status || !timerEl) return;

    const remainingMs = Math.max(0, status.expiresAt - Date.now());
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function issueOtp(role, id, contact) {
    const record = getOtpRecoveryRole(role);
    if (!record) return;

    const normalizedContact = String(contact || '').trim().toLowerCase();
    const normalizedId = String(id || '').trim().toUpperCase();
    if (!normalizedId || !normalizedContact) {
        showToast('warning', 'Missing details', 'Please enter the account ID and the registered email or mobile number.');
        return;
    }

    if (role === 'student') {
        const student = STUDENTS[normalizedId] || Object.values(STUDENTS).find(entry => {
            if (!entry) return false;
            return [entry.rollNo, entry.passNo, entry.studentId, entry.id].some(value => String(value || '').trim().toUpperCase() === normalizedId);
        });
        if (!student) {
            showToast('warning', 'Student not found', 'That Student ID is not registered on this portal.');
            return;
        }
        const lookup = (student.email || '').toLowerCase() === normalizedContact || (student.contactNo || '').replace(/\D/g, '') === normalizedContact.replace(/\D/g, '');
        if (!lookup) {
            showToast('warning', 'Contact mismatch', 'Enter the email or mobile number connected to this account.');
            return;
        }
        if (!student.password) {
            showToast('warning', 'No password', 'This account has not been configured for password recovery.');
            return;
        }
    } else if (role === 'driver') {
        const driver = DRIVERS[normalizedId] || DRIVERS[String(normalizedId).toUpperCase()];
        if (!driver) {
            showToast('warning', 'Driver not found', 'Driver ID not found.');
            return;
        }
        const mobile = String(driver.contactNo || '').replace(/\D/g, '');
        const enteredMobile = String(normalizedContact).replace(/\D/g, '');
        if (!mobile || enteredMobile !== mobile) {
            showToast('warning', 'Mobile mismatch', 'Enter the registered mobile number for this driver.');
            return;
        }
    } else if (role === 'admin') {
        const admin = ADMINS[normalizedId];
        if (!admin) {
            showToast('warning', 'Admin not found', 'Admin ID not found.');
            return;
        }
        const adminContact = (admin.email || admin.contactNo || '').trim().toLowerCase();
        const entered = String(normalizedContact).trim().toLowerCase();
        if (!adminContact || entered !== adminContact) {
            showToast('warning', 'Admin recovery mismatch', 'Enter the registered email or mobile for this admin account.');
            return;
        }
    }

    grantOtp(role, contact);
}

function grantOtp(role, contact) {
    const record = getOtpRecoveryRole(role);
    if (!record) return;

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    record.otp = otp;
    record.expiresAt = Date.now() + 5 * 60 * 1000;
    record.verified = false;

    const otpVerify = document.getElementById(`${role}-otp-verify-block`);
    const resetBlock = document.getElementById(`${role}-forgot-reset-block`);
    if (otpVerify) otpVerify.classList.add('open');
    if (resetBlock) resetBlock.classList.remove('open');

    let timerEl = document.getElementById(`${role}-otp-timer`);
    if (timerEl) {
        timerEl.textContent = '05:00';
    }

    const timer = setInterval(() => {
        const active = getOtpRecoveryRole(role);
        if (!active) { clearInterval(timer); return; }
        if (!active.otp) { clearInterval(timer); return; }
        if (Date.now() > active.expiresAt) {
            clearInterval(timer);
            active.otp = null;
            const timerEl = document.getElementById(`${role}-otp-timer`);
            if (timerEl) timerEl.textContent = '00:00';
            showToast('warning', 'OTP expired', 'The OTP expired. Please request a new one.');
            const verifyBlock = document.getElementById(`${role}-otp-verify-block`);
            const resetBlock = document.getElementById(`${role}-forgot-reset-block`);
            if (verifyBlock) verifyBlock.classList.remove('open');
            if (resetBlock) resetBlock.classList.remove('open');
            return;
        }
        startOtpCountdown(role);
    }, 1000);

    showToast('success', 'OTP sent', `A 6-digit OTP has been sent to ${contact}.`);
    showToast('info', 'OTP code', `Demo OTP: ${otp}`);
}

async function issueFacultyOtp(identifier) {
    const norm = String(identifier || '').trim();
    if (!norm) {
        showToast('warning', 'Missing details', 'Enter your registered email or Faculty ID.');
        return;
    }
    const lower = norm.toLowerCase();
    const upper = norm.toUpperCase();

    const localMatch = Object.values(FACULTY).find(entry => {
        if (!entry) return false;
        return String(entry.email || '').toLowerCase() === lower
            || String(entry.empId || entry.facultyId || entry.id || '').trim().toUpperCase() === upper;
    });

    const record = getOtpRecoveryRole('faculty');
    if (typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
        try {
            const response = await apiPost('/api/auth/faculty/request-reset', { identifier: norm });
            if (!response.reset_token) {
                showToast('warning', 'Recovery unavailable', 'Secure OTP delivery is not configured on the server. Please try again later.');
                return;
            }
            record.resetToken = response.reset_token;
            if (response.demo_otp) {
                record.serverOtp = response.demo_otp;
                showToast('info', 'Development OTP', `Demo OTP: ${response.demo_otp}`);
            }
            record.expiresAt = Date.now() + 5 * 60 * 1000;
            record.verified = false;
            const otpVerify = document.getElementById('faculty-otp-verify-block');
            const resetBlock = document.getElementById('faculty-forgot-reset-block');
            if (otpVerify) otpVerify.classList.add('open');
            if (resetBlock) resetBlock.classList.remove('open');
            startOtpCountdown('faculty');
            showToast('success', 'OTP sent', 'If the faculty account exists, an OTP has been sent to the registered email.');
            return;
        } catch (error) {
            console.warn('[OTP] Backend reset request failed; using local demo recovery.', error);
        }
    }

    if (localMatch) {
        grantOtp('faculty', norm);
    } else {
        // Do not reveal whether an account exists when the backend is unavailable.
        showToast('warning', 'Recovery unavailable', 'The secure faculty recovery service is unavailable right now. Please try again later.');
    }
}

function isStrongPassword(pw) {
    return typeof pw === 'string' && pw.length >= 8
        && /[A-Z]/.test(pw) && /[a-z]/.test(pw)
        && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

function resetFacultyForgotForm() {
    ['faculty-forgot-identifier', 'faculty-forgot-otp-input', 'faculty-forgot-new-password', 'faculty-forgot-confirm-password']
        .forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });
    const record = getOtpRecoveryRole('faculty');
    if (record) { record.otp = null; record.serverOtp = null; record.resetToken = null; record.expiresAt = 0; record.verified = false; }
    const verifyBlock = document.getElementById('faculty-otp-verify-block');
    const resetBlock = document.getElementById('faculty-forgot-reset-block');
    if (verifyBlock) verifyBlock.classList.remove('open');
    if (resetBlock) resetBlock.classList.remove('open');
    const timerEl = document.getElementById('faculty-otp-timer');
    if (timerEl) timerEl.textContent = '05:00';
}

async function verifyOtp(role, enteredOtp) {
    const record = getOtpRecoveryRole(role);
    if (!record || !record.otp) {
        showToast('warning', 'OTP missing', 'Request an OTP before verifying.');
        return;
    }

    if (Date.now() > record.expiresAt) {
        record.otp = null;
        record.verified = false;
        showToast('warning', 'OTP expired', 'The OTP has expired. Request a fresh OTP.');
        return;
    }

    if (role === 'faculty' && record.resetToken && typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
        try {
            const result = await apiPost('/api/auth/faculty/verify-reset', { reset_token: record.resetToken, otp: String(enteredOtp || '').trim() });
            record.resetToken = result.reset_token;
            record.verified = true;
            record.otp = null;
        } catch (error) {
            showToast('warning', 'OTP mismatch', String(error && error.message || 'The OTP is not correct or has expired.'));
            return;
        }
    } else {
        if (String(enteredOtp || '').trim() !== String(record.otp)) {
            showToast('warning', 'OTP mismatch', 'The OTP entered is not correct.');
            return;
        }
        record.verified = true;
    }

    const resetBlock = document.getElementById(`${role}-forgot-reset-block`);
    if (resetBlock) resetBlock.classList.add('open');
    showToast('success', 'OTP verified', 'OTP verified. Enter a new password or PIN.');
}

async function resetCredential(role) {
    const record = getOtpRecoveryRole(role);
    if (!record || !record.verified) {
        showToast('warning', 'OTP required', 'Complete OTP verification first.');
        return;
    }

    const id = role === 'faculty' ? '' : (document.getElementById(`${role}-forgot-id`)?.value.trim().toUpperCase() || '');
    if (role !== 'faculty' && !id) {
        showToast('warning', 'Account ID missing', 'Enter the account ID first.');
        return;
    }

    if (role === 'student') {
        const student = STUDENTS[id] || Object.values(STUDENTS).find(entry => {
            if (!entry) return false;
            return [entry.rollNo, entry.passNo, entry.studentId, entry.id].some(value => String(value || '').trim().toUpperCase() === id);
        });
        if (!student) {
            showToast('warning', 'Student not found', 'Unable to find this student account.');
            return;
        }
        const newPassword = document.getElementById('student-forgot-new-password')?.value || '';
        if (!newPassword) {
            showToast('warning', 'New password missing', 'Enter a new password.');
            return;
        }
        student.password = newPassword;
        saveStudentAccounts();
        showToast('success', 'Password updated', 'Your password has been reset successfully.');
    } else if (role === 'driver') {
        const driver = DRIVERS[id];
        if (!driver) {
            showToast('warning', 'Driver not found', 'Unable to find this driver account.');
            return;
        }
        const newPin = document.getElementById('driver-forgot-new-pin')?.value || '';
        if (!newPin || !/^\d{4}$/.test(newPin)) {
            showToast('warning', 'PIN invalid', 'Enter a valid 4-digit PIN.');
            return;
        }
        driver.pin = newPin;
        localStorage.setItem('college-bus-tracker-drivers', JSON.stringify(DRIVERS));
        showToast('success', 'PIN updated', 'The driver PIN has been reset successfully.');
    } else if (role === 'admin') {
        const admin = ADMINS[id];
        if (!admin) {
            showToast('warning', 'Admin not found', 'Unable to find this admin account.');
            return;
        }
        const newCredential = document.getElementById('admin-forgot-new-password')?.value || '';
        if (!newCredential) {
            showToast('warning', 'Credential missing', 'Enter a new credential.');
            return;
        }
        admin.pin = newCredential;
        showToast('success', 'Admin credential updated', 'The admin credential has been updated.');
    } else if (role === 'faculty') {
        const identifier = document.getElementById('faculty-forgot-identifier')?.value.trim();
        if (!identifier) {
            showToast('warning', 'Account ID missing', 'Enter your registered email or Faculty ID first.');
            return;
        }
        const newPassword = document.getElementById('faculty-forgot-new-password')?.value || '';
        const confirmPassword = document.getElementById('faculty-forgot-confirm-password')?.value || '';

        if (!isStrongPassword(newPassword)) {
            showToast('warning', 'Weak password', 'Use at least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('warning', 'Password mismatch', 'The new password and its confirmation do not match.');
            return;
        }

        const lowerId = identifier.toLowerCase();
        const upperId = identifier.toUpperCase();
        const localKey = Object.keys(FACULTY).find(key => {
            const entry = FACULTY[key];
            if (!entry) return false;
            return String(entry.email || '').toLowerCase() === lowerId
                || String(entry.empId || entry.facultyId || entry.id || '').trim().toUpperCase() === upperId;
        });

        let resetComplete = false;

        if (typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
            try {
                await apiPost('/api/auth/faculty/reset-password', { reset_token: record.resetToken, new_password: newPassword });
                resetComplete = true;
            } catch (error) {
                const msg = String((error && error.message) || error);
                const status = error && error.status;
                if (status === 400 || /Password must be/i.test(msg)) {
                    showToast('warning', 'Invalid password', msg);
                    return;
                }
                if (status === 403 || /not faculty/i.test(msg)) {
                    showToast('warning', 'Not a faculty account', msg);
                    return;
                }
                if (status === 404 || /No faculty account found/i.test(msg)) {
                    showToast('warning', 'Faculty not found', msg);
                    return;
                }
                console.warn('[Reset] Backend faculty reset unavailable, falling back to local update.', error);
            }
        }

        if (!resetComplete) {
            if (localKey) {
                FACULTY[localKey].pwHash = await hashPw(newPassword);
                saveFacultyAccounts();
                resetComplete = true;
            } else {
                showToast('warning', 'Faculty not found', 'No faculty account found with that email or Faculty ID.');
                return;
            }
        }

        if (resetComplete) {
            showToast('success', 'Password reset', 'Your faculty password has been reset. You can sign in now.');
            const panel = document.getElementById('faculty-forgot-panel');
            if (panel) panel.classList.remove('open');
            resetFacultyForgotForm();
            return;
        }
    }

    const panel = document.getElementById(`${role}-forgot-panel`);
    if (panel) panel.classList.remove('open');
}

const forgotHandlers = {
    'student-forgot-otp': () => {
        const id = $('#student-forgot-id')?.value.trim();
        const contact = $('#student-forgot-contact')?.value.trim();
        issueOtp('student', id, contact);
    },
    'driver-forgot-otp': () => {
        const id = $('#driver-forgot-id')?.value.trim();
        const contact = $('#driver-forgot-contact')?.value.trim();
        issueOtp('driver', id, contact);
    },
    'admin-forgot-otp': () => {
        const id = $('#admin-forgot-id')?.value.trim();
        const contact = $('#admin-forgot-contact')?.value.trim();
        issueOtp('admin', id, contact);
    },
    'faculty-forgot-otp': () => {
        const identifier = $('#faculty-forgot-identifier')?.value.trim();
        issueFacultyOtp(identifier);
    },
    'student-forgot-verify': () => {
        const entered = $('#student-forgot-otp-input')?.value.trim();
        verifyOtp('student', entered);
    },
    'driver-forgot-verify': () => {
        const entered = $('#driver-forgot-otp-input')?.value.trim();
        verifyOtp('driver', entered);
    },
    'admin-forgot-verify': () => {
        const entered = $('#admin-forgot-otp-input')?.value.trim();
        verifyOtp('admin', entered);
    },
    'faculty-forgot-verify': () => {
        const entered = $('#faculty-forgot-otp-input')?.value.trim();
        verifyOtp('faculty', entered);
    },
    'student-forgot-reset': () => resetCredential('student'),
    'driver-forgot-reset': () => resetCredential('driver'),
    'admin-forgot-reset': () => resetCredential('admin'),
    'faculty-forgot-reset': () => resetCredential('faculty')
};

Object.entries(forgotHandlers).forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
});

studentRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = registerName.value.trim();
    const relationType = registerRelationType.value.trim();
    const relationValue = registerRelationValue.value.trim();
    const rollNo = registerRoll.value.trim().toUpperCase();
    const pass = rollNo;
    const routeId = registerRoute.value;
    const branch = registerBranch.value.trim();
    const college = registerCollege.value.trim();
    const pickupPoint = registerPickup.value.trim();
    const issueDate = registerIssueDate.value;
    const validUpTo = registerValidUpTo.value;
    const feeReceipt = registerFeeReceipt.value.trim();
    const feeDate = registerFeeDate.value;
    const feePlace = registerFeePlace.value.trim();
    const contactNo = registerContact.value.trim();
    const email = registerEmail.value.trim().toLowerCase();
    const password = registerPassword.value;
    const hasRelation = relationType && relationValue;

    if (!name || !hasRelation || !rollNo || !routeId || !branch || !college || !pickupPoint || !issueDate || !validUpTo || !feeReceipt || !feeDate || !feePlace || !contactNo || !email || !password) {
        showToast('warning', 'Incomplete form', 'Please complete all required fields before creating your student account.');
        return;
    }

    // Try registering on the Flask backend first (if reachable)
    if (API_AVAILABLE) {
        try {
            await apiPost('/api/auth/signup', {
                name, email, password,
                role: 'student',
                roll_no: rollNo,
                contact_no: contactNo,
                branch,
                college,
                pickup_point: pickupPoint,
                pass_issue_date: issueDate,
                pass_valid_upto: validUpTo,
                fee_receipt_no: feeReceipt,
                fee_date: feeDate,
                fee_place: feePlace,
                relation_type: relationType,
                relation_value: relationValue,
                route_id: routeId,
            });

            // Mirror the account locally so all existing features keep working
            STUDENTS[pass] = {
                name, relationType, relationValue, rollNo, passNo: rollNo,
                college, pickupPoint, issueDate, validUpTo, feeReceipt,
                feeDate, feePlace, contactNo, email, password, route: routeId,
                branch, course: 'Registered via portal', passRenewDate: '2026-12-31',
                pendingFee: 0, registeredViaPortal: true,
            };
            saveStudentAccounts();

            registerName.value = '';
            registerRelationType.value = '';
            registerRelationValue.value = '';
            registerRoll.value = '';
            registerRoute.value = '';
            registerBranch.value = '';
            registerCollege.value = '';
            registerPickup.value = '';
            registerIssueDate.value = '';
            registerValidUpTo.value = '';
            registerFeeReceipt.value = '';
            registerFeeDate.value = '';
            registerFeePlace.value = '';
            registerContact.value = '';
            registerEmail.value = '';
            registerPassword.value = '';

            studentPass.value = pass;
            showToast('success', 'Account created', `Your student ID ${pass} is ready. You can sign in now.`);
            setStudentAuthMode('signin');
            return;
        } catch (err) {
            const msg = String(err && err.message || err);
            if (/409|already registered/i.test(msg)) {
                showToast('warning', 'Email already used', msg);
                return;
            }
            if (/400/i.test(msg)) {
                showToast('error', 'Signup failed', msg);
                return;
            }
            // Network / server failure → fall through to local demo signup
            console.warn('[API] Backend signup unavailable, using local demo signup.', err);
        }
    }

    if (STUDENTS[pass]) {
        showToast('warning', 'ID already used', 'That student ID is already registered. Please choose another one.');
        return;
    }

    STUDENTS[pass] = {
        name,
        relationType,
        relationValue,
        rollNo,
        passNo: rollNo,
        college,
        pickupPoint,
        issueDate,
        validUpTo,
        feeReceipt,
        feeDate,
        feePlace,
        contactNo,
        email,
        password,
        route: routeId,
        branch,
        course: 'Registered via portal',
        passRenewDate: '2026-12-31',
        pendingFee: 0,
        registeredViaPortal: true,
    };
    saveStudentAccounts();

    registerName.value = '';
    registerRelationType.value = '';
    registerRelationValue.value = '';
    registerRoll.value = '';
    registerRoute.value = '';
    registerBranch.value = '';
    registerCollege.value = '';
    registerPickup.value = '';
    registerIssueDate.value = '';
    registerValidUpTo.value = '';
    registerFeeReceipt.value = '';
    registerFeeDate.value = '';
    registerFeePlace.value = '';
    registerContact.value = '';
    registerEmail.value = '';
    registerPassword.value = '';

    studentPass.value = pass;
    showToast('success', 'Account created', `Your student ID ${pass} is ready. You can sign in now.`);
    setStudentAuthMode('signin');
});

// ── Faculty sign-up ────────────────────────────────────────────────
facultyRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = facultyRegisterName.value.trim();
    const empId = facultyRegisterId.value.trim().toUpperCase();
    const email = facultyRegisterEmail.value.trim().toLowerCase();
    const contactNo = facultyRegisterContact.value.trim();
    const department = facultyRegisterDept.value.trim();
    const routeId = facultyRegisterRoute.value || '';
    const password = facultyRegisterPassword.value;

    if (!name || !empId || !email || !contactNo || !department || !password) {
        showToast('warning', 'Incomplete form', 'Please complete all required fields before creating your faculty account.');
        return;
    }

    // Try registering on the Flask backend first (if reachable)
    if (API_AVAILABLE) {
        try {
            await apiPost('/api/auth/signup', {
                name, email, password,
                role: 'faculty',
                roll_no: empId,
                contact_no: contactNo,
                department,
                route_id: routeId || null,
            });

            // Mirror the account locally so the portal keeps working offline
            FACULTY[empId] = {
                name, empId, facultyId: empId, email, contactNo, department,
                college: 'CGC Landran, Mohali', route: routeId,
                pwHash: await hashPw(password), registeredViaPortal: true,
            };
            saveFacultyAccounts();

            resetFacultyRegisterForm();
            facultyId.value = empId;
            showToast('success', 'Faculty account created', `Your Faculty ID ${empId} is ready. You can sign in now.`);
            setFacultyAuthMode('signin');
            return;
        } catch (err) {
            const msg = String(err && err.message || err);
            if (/409|already registered/i.test(msg)) {
                showToast('warning', 'Email already used', msg);
                return;
            }
            if (/400/i.test(msg)) {
                showToast('error', 'Signup failed', msg);
                return;
            }
            // Network / server failure → fall through to local demo signup
            console.warn('[API] Backend faculty signup unavailable, using local demo signup.', err);
        }
    }

    if (FACULTY[empId]) {
        showToast('warning', 'ID already used', 'That Faculty ID is already registered. Please choose another one.');
        return;
    }

    FACULTY[empId] = {
        name, empId, facultyId: empId, email, contactNo, department,
        college: 'CGC Landran, Mohali', route: routeId,
        pwHash: await hashPw(password), registeredViaPortal: true,
    };
    saveFacultyAccounts();

    resetFacultyRegisterForm();
    facultyId.value = empId;
    showToast('success', 'Faculty account created', `Your Faculty ID ${empId} is ready. You can sign in now.`);
    setFacultyAuthMode('signin');
});

function resetFacultyRegisterForm() {
    facultyRegisterName.value = '';
    facultyRegisterId.value = '';
    facultyRegisterEmail.value = '';
    facultyRegisterContact.value = '';
    facultyRegisterDept.value = '';
    facultyRegisterRoute.value = '';
    facultyRegisterPassword.value = '';
}

driverRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = driverRegisterName.value.trim();
    const id = driverRegisterId.value.trim().toUpperCase();
    const pin = driverRegisterPin.value.trim();
    const routeId = driverRegisterRoute.value;
    const busNo = driverRegisterBus.value.trim().toUpperCase();
    const contactNo = driverRegisterContact.value.trim();

    if (!name || !id || !pin || !routeId || !busNo || !contactNo) {
        showToast('warning', 'Incomplete form', 'Please complete all driver registration fields.');
        return;
    }

    // Persist the driver into the existing users table (role='driver', hashed
    // password) through the shared signup API so the account works from any
    // device. If the backend is unreachable, fall back to the local demo
    // account (same behaviour as the existing offline demo login).
    let backendCreated = false;
    if (typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
        try {
            const driverEmail = `driver-${id.replace(/[^A-Za-z0-9]/g, '').toLowerCase()}@cgc-campus.local`;
            await apiPost('/api/auth/signup', {
                name,
                roll_no: id,
                password: pin,
                email: driverEmail,
                contact_no: contactNo,
                role: 'driver',
            });
            backendCreated = true;
        } catch (err) {
            const msg = String(err && err.message || err);
            if (/409|already registered|driver id/i.test(msg)) {
                showToast('error', 'Driver ID already exists', 'Driver ID already exists.');
                return;
            }
            if (/400/i.test(msg)) {
                showToast('error', 'Signup failed', msg);
                return;
            }
            console.warn('[API] Backend driver signup unavailable, using local demo signup.', err);
        }
    }

    DRIVERS[id] = { name, pin, route: routeId, busNo, contactNo };
    localStorage.setItem('college-bus-tracker-drivers', JSON.stringify(DRIVERS));

    driverRegisterName.value = '';
    driverRegisterId.value = '';
    driverRegisterPin.value = '';
    driverRegisterRoute.value = '';
    driverRegisterBus.value = '';
    driverRegisterContact.value = '';

    driverId.value = id;
    showToast('success', 'Driver account created',
        backendCreated
            ? 'Driver account created successfully.'
            : 'Driver account created successfully (offline mode). You can sign in now.');
    setDriverAuthMode('signin');
});

// Try signing in against the Flask backend (driver ID + PIN, hashed on the
// server). Returns true when handled (success or backend rejection), false to
// fall back to the local demo login.
async function tryBackendDriverLogin(id, pin) {
    if (!API_AVAILABLE) return false;
    try {
        const profile = await apiPost('/api/auth/driver-login', { id, pin });

        let route = ROUTES.find(r => String(r.id) === String(profile.route_id || ''));
        if (!route && DRIVERS[id] && DRIVERS[id].route) {
            route = ROUTES.find(r => r.id === DRIVERS[id].route);
        }
        if (!route) {
            showFieldError('input-group-driver-id', driverIdErr, 'This driver is not assigned to an available route.');
            return true;
        }

        let avatar = profile.avatar || '';
        if (!avatar && profile.id) {
            try {
                const extra = await apiGet('/api/profile/' + profile.id);
                avatar = extra.avatar || '';
            } catch (e) { /* avatar stays empty */ }
        }

        const driverData = {
            name: profile.name,
            email: profile.email,
            busNo: profile.bus_number || (DRIVERS[id] && DRIVERS[id].busNo) || '',
            busId: profile.bus_id || null,
            route: String(profile.route_id),
            contactNo: profile.contact_no,
            avatar: avatar,
            pin: pin,
            registeredViaPortal: true,
        };
        if (profile.session_token) driverData.sessionToken = profile.session_token;
        // Cache locally so dashboard features that look up DRIVERS keep working
        DRIVERS[id] = driverData;

        currentUser = { type: 'driver', data: driverData, route, driverId: id };
        openDriverDashboard();
        return true;
    } catch (err) {
        const msg = String(err && err.message || err);
        if (/401|incorrect pin/i.test(msg)) { showFieldError('input-group-driver-pin', driverPinErr, 'Incorrect PIN'); return true; }
        if (/404|not found/i.test(msg)) { showFieldError('input-group-driver-id', driverIdErr, 'Driver ID not found'); return true; }
        if (/400/i.test(msg)) { showFieldError('input-group-driver-id', driverIdErr, msg); return true; }
        console.warn('[API] Backend driver login failed, using local login.', err);
        return false;
    }
}

// Same for admin (admin ID + PIN).
async function tryBackendAdminLogin(id, pin) {
    if (!API_AVAILABLE) return false;
    try {
        const profile = await apiPost('/api/auth/admin-login', { id, pin });
        const adminData = { id, name: profile.name, email: profile.email, contactNo: profile.contact_no, adminToken: profile.admin_token || '' };
        currentUser = { type: 'admin', data: adminData };
        openAdminDashboard();
        return true;
    } catch (err) {
        const msg = String(err && err.message || err);
        if (/401|incorrect pin/i.test(msg)) { showFieldError('input-group-admin-pin', adminPinErr, 'Incorrect PIN'); return true; }
        if (/404|not found/i.test(msg)) { showFieldError('input-group-admin-id', adminIdErr, 'Admin ID not found'); return true; }
        if (/403/i.test(msg)) { showFieldError('input-group-admin-pin', adminPinErr, msg); return true; }
        if (/400/i.test(msg)) { showFieldError('input-group-admin-id', adminIdErr, msg); return true; }
        console.warn('[API] Backend admin login failed, using local login.', err);
        return false;
    }
}

driverForm.addEventListener('submit', async (e) => {
    e.preventDefault(); clearErrors();
    const id  = driverId.value.trim().toUpperCase();
    const pin = driverPin.value.trim();
    let valid = true;
    if (!id)  { showFieldError('input-group-driver-id', driverIdErr, 'Please enter your Driver ID'); valid = false; }
    if (!pin) { showFieldError('input-group-driver-pin', driverPinErr, 'Please enter your PIN'); valid = false; }
    if (!valid) return;

    // Try the Flask backend first (if reachable)
    if (await tryBackendDriverLogin(id, pin)) return;

    // ── Local (demo) login fallback ──
    const driver = DRIVERS[id];
    if (!driver) { showFieldError('input-group-driver-id', driverIdErr, 'Driver ID not found'); return; }
    if (driver.pin !== pin) { showFieldError('input-group-driver-pin', driverPinErr, 'Incorrect PIN'); return; }
    const route = ROUTES.find(r => String(r.id) === String(driver.route));
    if (!route) { showFieldError('input-group-driver-id', driverIdErr, 'This driver is not assigned to an available route.'); return; }
    currentUser = { type: 'driver', data: driver, route, driverId: id };
    openDriverDashboard();
});

if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault(); clearErrors();
        const id  = adminId.value.trim().toUpperCase();
        const pin = adminPin.value.trim();
        let valid = true;
        if (!id)  { showFieldError('input-group-admin-id', adminIdErr, 'Please enter Admin ID'); valid = false; }
        if (!pin) { showFieldError('input-group-admin-pin', adminPinErr, 'Please enter PIN'); valid = false; }
        if (!valid) return;

        // Try the Flask backend first (if reachable)
        if (await tryBackendAdminLogin(id, pin)) return;

        // ── Local (demo) login fallback ──
        const admin = ADMINS[id];
        if (!admin) { showFieldError('input-group-admin-id', adminIdErr, 'Admin ID not found'); return; }
        if (admin.pin !== pin) { showFieldError('input-group-admin-pin', adminPinErr, 'Incorrect PIN'); return; }

        currentUser = { type: 'admin', data: admin };
        openAdminDashboard();
    });
}

// ── Admin Sign Up (single admin account only) ──────────────────────
if (adminSignupLink && adminForm && adminSignupPanel) {
    adminSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        adminForm.classList.remove('visible');
        adminSignupPanel.classList.add('open');
        const firstInput = adminSignupPanel.querySelector('input');
        if (firstInput) setTimeout(() => firstInput.focus(), 15);
    });
}
if (adminSignupBack && adminForm && adminSignupPanel) {
    adminSignupBack.addEventListener('click', () => {
        adminSignupPanel.classList.remove('open');
        adminForm.classList.add('visible');
    });
}

function setAdminRegistrationClosed() {
    // The Sign Up link stays visible; the backend enforces the one-admin rule.
    if (adminSignupPanel) adminSignupPanel.classList.remove('open');
}

async function checkAdminRegistration() {
    let exists = false;
    if (typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
        try {
            const res = await apiGet('/api/auth/admin/status');
            exists = !!(res && res.admin_exists);
        } catch (err) {
            console.warn('[API] Admin registration status check failed.', err);
        }
    }
    if (exists) setAdminRegistrationClosed();
}

if (adminSignupForm) {
    adminSignupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        const id = adminSignupId.value.trim().toUpperCase();
        const name = adminSignupName.value.trim();
        const password = adminSignupPw.value;
        const confirmPw = $('#admin-signup-confirm').value;

        if (!id) {
            showFieldError('input-group-admin-signup-id', $('#admin-signup-id-error'), 'Please enter an Admin ID');
            return;
        }
        if (!name) {
            showFieldError('input-group-admin-signup-name', $('#admin-signup-name-error'), 'Please enter your name');
            return;
        }
        if (!password) {
            showFieldError('input-group-admin-signup-password', $('#admin-signup-password-error'), 'Please create a password');
            return;
        }
        if (password !== confirmPw) {
            showFieldError('input-group-admin-signup-confirm', $('#admin-signup-confirm-error'), 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            showFieldError('input-group-admin-signup-password', $('#admin-signup-password-error'), 'Password must be at least 6 characters');
            return;
        }

        if (!(typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE)) {
            showToast('error', 'Signup unavailable', 'Admin signup requires the backend service to be online.');
            return;
        }

        try {
            await apiPost('/api/auth/signup', { name, password, role: 'admin', roll_no: id });
            showToast('success', 'Admin account created', `Admin ID ${id} is ready. You can sign in now.`);
            adminSignupId.value = '';
            adminSignupName.value = '';
            adminSignupPw.value = '';
            $('#admin-signup-confirm').value = '';
            setAdminRegistrationClosed();
            adminSignupPanel.classList.remove('open');
            adminForm.classList.add('visible');
        } catch (err) {
            const msg = String(err && err.message || err);
            if (/An admin account already exists/.test(msg)) {
                showToast('error', 'Registration closed', 'An admin account already exists.');
                setAdminRegistrationClosed();
                return;
            }
            if (/409|already registered/i.test(msg)) {
                showFieldError('input-group-admin-signup-id', $('#admin-signup-id-error'), msg);
                return;
            }
            if (/400/i.test(msg)) {
                showToast('error', 'Signup failed', msg);
                return;
            }
            console.warn('[API] Admin signup backend unavailable.', err);
            showToast('error', 'Signup failed', 'Could not create the admin account. Please try again.');
        }
    });
}

function showFieldError(groupId, errorEl, msg) {
    const group = document.getElementById(groupId);
    group.classList.add('error');
    errorEl.textContent = msg;
    group.style.animation = 'none';
    group.offsetHeight;
    group.style.animation = 'shake 0.4s ease';
}

// Shake keyframe
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`;
document.head.appendChild(shakeStyle);

// ═══════════════════════════════════════════════════════════════════
// TABS (Student Dashboard / Faculty Dashboard)
// ═══════════════════════════════════════════════════════════════════
$$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById('content-' + btn.dataset.tab);
        if (target) target.classList.add('active');
        if (btn.dataset.tab === 'tracking') initMap();
        if (btn.dataset.tab === 'pass' && currentUser && currentUser.type === 'student') renderStudentPass();
        if (btn.dataset.tab === 'froutes' && currentUser && currentUser.type === 'faculty') initFacultyMap();
        if (btn.dataset.tab === 'fpass' && currentUser && currentUser.type === 'faculty') renderFacultyPass();
        if (btn.dataset.tab === 'dprofile' && currentUser && currentUser.type === 'driver') renderDriverProfile();
        if (btn.dataset.tab === 'broutes' && currentUser && currentUser.type === 'student') brShowLevel('brstu', 1);
        if (btn.dataset.tab === 'fbroutes' && currentUser && currentUser.type === 'faculty') brShowLevel('brfac', 1);
    });
});

// ═══════════════════════════════════════════════════════════════════
// BUS ROUTES (BUS Routes → Assigned Bus → Ordered Stations)
// Shared drill-down used by the Student, Faculty and Admin portals.
// The map opens only after a station is clicked, centred on its coords.
// ═══════════════════════════════════════════════════════════════════
const brState = { brstu: { level: 1 }, brfac: { level: 1 }, bradm: { level: 1 } };
const brMaps = {};                 // pfx -> Leaflet map
const brRouteLayers = {};          // pfx -> Leaflet layerGroup holding markers + route lines
const brOpenPopup = {};            // pfx -> currently open Leaflet popup
const brRouteGen = {};             // pfx -> generation counter for async rendering
const BR_ROUTE_LINE_COLOR = '#0B3D91'; // dark blue route line

function brEsc(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function brEmpty(msg) {
    return '<div class="route-browser-empty">' + brEsc(msg) + '</div>';
}

// Numbered circular pin used for every station marker (1..N order).
function brStationIcon(label) {
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
            '<circle cx="16" cy="16" r="15" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>' +
            '<circle cx="16" cy="16" r="11" fill="#ef4444"/>' +
            '<text x="16" y="21" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">' + label + '</text>' +
        '</svg>';
    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
}

function brGetRoute(id) {
    return ROUTES.find((r) => r.id === String(id)) || null;
}

function brGetBuses(route) {
    if (Array.isArray(route.buses) && route.buses.length) return route.buses;
    // Offline fallback: derive buses from the route's trips.
    const seen = new Map();
    (route.trips || []).forEach((t, i) => {
        if (!seen.has(t.busNo)) {
            seen.set(t.busNo, {
                busId: 'fb-' + i,
                busNumber: t.busNo,
                driver: t.driver || '',
                stations: (route.stops || []).map((s, si) => ({
                    stationId: 'fb-s' + si,
                    name: s.name,
                    lat: s.lat,
                    lng: s.lng,
                })),
            });
        }
    });
    return Array.from(seen.values());
}

function brShowLevel(pfx, level) {
    const state = brState[pfx] || (brState[pfx] = {});
    state.level = level || 1;
    if (state.level === 1) { state.routeId = null; state.busId = null; }

    const browser = document.getElementById(pfx + '-browser');
    const mapCard = document.getElementById(pfx + '-map-card');
    const list = document.getElementById(pfx + '-list');
    const title = document.getElementById(pfx + '-title');
    const backBtn = document.getElementById(pfx + '-back');
    if (!browser || !list || !title || !backBtn) return;

    if (mapCard) mapCard.style.display = 'none';
    browser.style.display = '';
    backBtn.hidden = !(state.level === 2 || state.level === 3);

    if (state.level === 1) {
        title.textContent = 'BUS Routes';
        list.innerHTML = '';
        if (!ROUTES.length) { list.innerHTML = brEmpty('No routes are available yet.'); return; }
        ROUTES.forEach((route) => {
            const busCount = brGetBuses(route).length;
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'route-browser-item';
            row.innerHTML =
                '<span class="route-badge route-badge--' + (route.color || 'a') + '">R' + brEsc(route.id) + '</span>' +
                '<span class="route-browser-item__main">' +
                    '<strong>' + brEsc(route.name) + '</strong>' +
                    '<span>' + busCount + ' bus' + (busCount === 1 ? '' : 'es') + ' assigned</span>' +
                '</span>' +
                '<span class="route-browser-item__chevron">›</span>';
            row.addEventListener('click', () => brOpenRoute(pfx, route.id));
            list.appendChild(row);
        });
        return;
    }

    if (state.level === 2) {
        const route = brGetRoute(state.routeId);
        if (!route) { brShowLevel(pfx, 1); return; }
        title.textContent = 'Route ' + brEsc(route.id) + ' — ' + brEsc(route.name);
        list.innerHTML = '';
        const buses = brGetBuses(route);
        if (!buses.length) { list.innerHTML = brEmpty('No buses are assigned to this route yet.'); return; }
        buses.forEach((bus, i) => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'route-browser-item';
            row.innerHTML =
                '<span class="route-browser-item__badge">Bus ' + (i + 1) + '</span>' +
                '<span class="route-browser-item__main">' +
                    '<strong>' + brEsc(bus.busNumber) + '</strong>' +
                    (bus.driver ? '<span>Driver: ' + brEsc(bus.driver) + '</span>' : '<span>Driver: Not assigned</span>') +
                '</span>' +
                '<span class="route-browser-item__chevron">›</span>';
            row.addEventListener('click', () => brOpenBus(pfx, route.id, bus.busId));
            list.appendChild(row);
        });
        return;
    }

    if (state.level === 3) {
        const route = brGetRoute(state.routeId);
        const bus = (route && brGetBuses(route).find((b) => String(b.busId) === String(state.busId))) || null;
        if (!route || !bus) { brShowLevel(pfx, 2); return; }
        title.textContent = 'Route ' + brEsc(route.id) + ' — Stations';
        list.innerHTML = '';
        const stations = bus.stations || [];
        if (!stations.length) { list.innerHTML = brEmpty('No stations have been added for this bus yet.'); return; }
        stations.forEach((s, i) => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'route-browser-item route-browser-item--station';
            const hasCoords = typeof s.lat === 'number' && !isNaN(s.lat) && typeof s.lng === 'number' && !isNaN(s.lng);
            row.innerHTML =
                '<span class="route-browser-item__badge route-browser-item__badge--order">' + (i + 1) + '</span>' +
                '<span class="route-browser-item__main">' +
                    '<strong>' + brEsc(s.name) + '</strong>' +
                    (hasCoords ? '<span>' + s.lat.toFixed(5) + ', ' + s.lng.toFixed(5) + '</span>' : '<span>No coordinates</span>') +
                '</span>' +
                '<span class="route-browser-item__chevron">›</span>';
            row.addEventListener('click', () => brOpenStation(pfx, state.routeId, bus.busId, s));
            list.appendChild(row);
        });
        // Show the full-route map: every ordered station marker joined by a
        // continuous dark-blue line ending at the final station.
        if (mapCard) {
            mapCard.style.display = '';
            const mapTitle = document.getElementById(pfx + '-map-title');
            const mapBackBtn = document.getElementById(pfx + '-map-back');
            if (mapTitle) mapTitle.textContent = 'Route ' + brEsc(route.id) + ' — ' + brEsc(bus.busNumber) + ' — Stations';
            if (mapBackBtn) mapBackBtn.hidden = true;
            brRenderRouteMap(pfx, state.routeId, state.busId);
        }
        return;
    }
}

function brOpenRoute(pfx, routeId) {
    const state = brState[pfx] || (brState[pfx] = {});
    state.level = 2; state.routeId = routeId; state.busId = null;
    brShowLevel(pfx, 2);
}

function brOpenBus(pfx, routeId, busId) {
    const state = brState[pfx] || (brState[pfx] = {});
    state.level = 3; state.routeId = routeId; state.busId = busId;
    brShowLevel(pfx, 3);
}

function brOpenStation(pfx, routeId, busId, station) {
    if (typeof station.lat !== 'number' || isNaN(station.lat) || typeof station.lng !== 'number' || isNaN(station.lng)) {
        alert('This station has no coordinates on the map yet.');
        return;
    }
    const state = brState[pfx] || (brState[pfx] = {});
    state.level = 4;
    state.station = station;

    const browser = document.getElementById(pfx + '-browser');
    const mapCard = document.getElementById(pfx + '-map-card');
    const title = document.getElementById(pfx + '-map-title');
    if (browser) browser.style.display = 'none';
    if (mapCard) mapCard.style.display = '';
    if (title) title.textContent = station.name;

    const mapBackBtn = document.getElementById(pfx + '-map-back');
    if (mapBackBtn) { mapBackBtn.hidden = false; mapBackBtn.textContent = '\u2190 Back to Stations'; }

    brRenderRouteMap(pfx, routeId, busId, station);
}

// Show every ordered station of a bus on a Leaflet map: numbered markers for
// all stations (1..N), a dark-blue road route drawn with OSRM (same stop
// order), and a straight-line fallback when routing is unavailable. Opens the
// clicked station's popup when provided.
function brRenderRouteMap(pfx, routeId, busId, focusStation) {
    const route = brGetRoute(routeId);
    const bus = (route && brGetBuses(route).find((b) => String(b.busId) === String(busId))) || null;
    if (!route || !bus) return;

    const stations = (bus.stations || []).filter((s) =>
        typeof s.lat === 'number' && !isNaN(s.lat) &&
        typeof s.lng === 'number' && !isNaN(s.lng));
    if (!stations.length) return;

    const canvas = document.getElementById(pfx + '-map');
    if (!canvas) return;

    if (typeof L === 'undefined') {
        canvas.innerHTML = '<div class="route-browser-empty">The map library failed to load. Please refresh the page.</div>';
        return;
    }

    const gen = (brRouteGen[pfx] = (brRouteGen[pfx] || 0) + 1);

    // Build or reuse the Leaflet map with an OpenStreetMap base layer.
    let map = brMaps[pfx];
    if (!map) {
        map = L.map(canvas, { zoomControl: true, attributionControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        brMaps[pfx] = map;
        brRouteLayers[pfx] = L.layerGroup().addTo(map);
    }
    map.invalidateSize();

    // Clear previous overlays for this portal.
    const layerGroup = brRouteLayers[pfx];
    layerGroup.clearLayers();
    if (brOpenPopup[pfx]) { try { brOpenPopup[pfx].close(); } catch (e) {} }
    brOpenPopup[pfx] = null;

    const latlngs = stations.map((s) => [s.lat, s.lng]);
    const bounds = L.latLngBounds(latlngs);

    // Numbered station markers (1..N in the exact station order).
    const entries = stations.map((s, i) => {
        const marker = L.marker([s.lat, s.lng], {
            icon: brStationIcon(i + 1),
            title: (i + 1) + '. ' + s.name,
            riseOnHover: true,
            zIndexOffset: 1000 + i,
        });
        marker.bindPopup('<strong>' + (i + 1) + '. ' + brEsc(s.name) + '</strong>');
        marker.addTo(layerGroup);
        return { marker: marker, station: s };
    });

    // Straight-line fallback immediately so the route is always visible.
    const straight = L.polyline(latlngs, {
        color: BR_ROUTE_LINE_COLOR,
        weight: 5,
        opacity: 0.9,
    });
    layerGroup.addLayer(straight);

    // Fit bounds so the complete route (station 1 .. station N) is visible.
    map.fitBounds(bounds, { padding: [40, 40] });

    // Replace with a road-following line via OSRM (stations in exact order).
    if (stations.length >= 2) {
        const coords = stations.map((s) => s.lng + ',' + s.lat).join(';');
        const url = 'https://router.project-osrm.org/route/v1/driving/' + coords + '?overview=full&geometries=geojson';
        fetch(url)
            .then((resp) => {
                if (!resp.ok) throw new Error('Routing fetch failed');
                return resp.json();
            })
            .then((data) => {
                if (gen !== brRouteGen[pfx]) return; // stale response
                if (!data.routes || !data.routes[0] || !data.routes[0].geometry) throw new Error('No route geometry');
                const geo = data.routes[0].geometry.coordinates; // [lng, lat]
                const routed = geo.map((c) => [c[1], c[0]]);
                if (gen !== brRouteGen[pfx]) return; // stale response
                layerGroup.removeLayer(straight);
                L.polyline(routed, {
                    color: BR_ROUTE_LINE_COLOR,
                    weight: 5,
                    opacity: 0.9,
                }).addTo(layerGroup);
                map.fitBounds(bounds, { padding: [40, 40] });
            })
            .catch((err) => {
                if (gen !== brRouteGen[pfx]) return; // stale response
                console.warn('OSRM routing failed for route browser map', pfx, err);
                map.fitBounds(bounds, { padding: [40, 40] });
            });
    } else {
        map.fitBounds(bounds, { padding: [40, 40] });
    }

    // Highlight the clicked station (or the first one by default) while
    // keeping every other station marker and the full route line visible.
    const focusEntry = (focusStation && typeof focusStation.lat === 'number')
        ? entries.find((e) =>
            Math.abs(e.station.lat - focusStation.lat) < 1e-6 &&
            Math.abs(e.station.lng - focusStation.lng) < 1e-6)
        : null;
    const focus = focusEntry || entries[0];
    focus.marker.openPopup();
    brOpenPopup[pfx] = focus.marker.getPopup();
}

function brBack(pfx) {
    const state = brState[pfx] || (brState[pfx] = { level: 1 });
    if (state.level === 4) brShowLevel(pfx, 3);
    else if (state.level === 3) brShowLevel(pfx, 2);
    else brShowLevel(pfx, 1);
}

['brstu', 'brfac', 'bradm'].forEach((pfx) => {
    const back = document.getElementById(pfx + '-back');
    if (back) back.addEventListener('click', () => brBack(pfx));
    const mapBack = document.getElementById(pfx + '-map-back');
    if (mapBack) mapBack.addEventListener('click', () => brBack(pfx));
});

// ═══════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function renderNavAvatar() {
    if (!studentNavAvatar || !currentUser || currentUser.type !== 'student') return;
    const d = currentUser.data || {};
    const local = STUDENTS[d.passNo] || STUDENTS[d.rollNo] || {};
    const name = d.name || 'Student';
    const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'S';
    renderAvatar(studentNavAvatar, initials, d.avatar || local.avatar || '');
}

function openStudentDashboard() {
    switchPage(studentPage);
    studentName.textContent = currentUser.data.name;
    studentGreet.textContent = `${getGreeting()}, ${currentUser.data.name.split(' ')[0]}!`;
    renderNavAvatar();
    renderRoutes();
    updateNotifUI();
    updateNextBusBanner();
    updateDuesUI();
    startCountdown();
    startGPSSimulation();
    renderStudentProfile();
    renderStudentPass();
    notifPollStart();
    refreshStudentNotifications();
}

function renderStudentProfile() {
    if (!currentUser || currentUser.type !== 'student') return;
    const d = currentUser.data || {};
    const route = currentUser.route;
    const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };

    const name = d.name || 'Student';
    const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'S';

    const avatar = $('#profile-avatar');
    renderAvatar(avatar, initials, d.avatar);
    setText('#profile-name', name);
    setText('#profile-branch', d.branch || d.department || '—');

    const passValid = d.passRenewDate || d.passValidUpto || '2026-12-31';
    const parsed = new Date(passValid);
    const passActive = isNaN(parsed.getTime()) ? true : parsed >= new Date(new Date().setHours(0, 0, 0, 0));
    const badge = $('#profile-pass-badge');
    if (badge) {
        badge.classList.toggle('profile-badge--expired', !passActive);
        const label = $('#profile-pass-label');
        if (label) label.textContent = passActive ? 'Active Bus Pass' : 'Bus Pass Expired';
    }

    setText('#profile-roll-no', d.rollNo || d.studentId || '—');
    setText('#profile-pass-no', d.passNo || d.rollNo || '—');
    setText('#profile-contact', d.contactNo || '—');
    const local = STUDENTS[d.passNo] || STUDENTS[d.rollNo] || {};
    setText('#profile-parent', local.relationValue || d.relationValue || '—');

    const trips = route && Array.isArray(route.trips) ? route.trips : [];
    const assigned = trips.length ? trips[0] : null;
    const routeLabel = route ? `Route ${route.id} — ${route.name}` : (d.route ? `Route ${d.route}` : '—');
    setText('#profile-bus', assigned ? `${assigned.busNo} · ${assigned.driver}` : '—');
    setText('#profile-route', routeLabel);
    setText('#profile-pickup', d.pickupPoint || '—');
    setText('#profile-destination', d.college || 'CGC Landran');
}

function renderStudentPass() {
    if (!currentUser || currentUser.type !== 'student') return;
    const d = currentUser.data || {};
    const route = currentUser.route;
    const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };
    const fmtDate = (v) => {
        if (!v) return '—';
        const parsed = new Date(v);
        if (isNaN(parsed.getTime())) return String(v);
        return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const routeLabel = (r, raw) => {
        if (r && r.id) {
            const id = String(r.id);
            if (/^\d+$/.test(id)) return `Route ${id}`;
            const idx = ROUTES.findIndex(x => x.id === id);
            return idx >= 0 ? `Route ${idx + 1}` : `Route ${id}`;
        }
        return raw ? `Route ${raw}` : '—';
    };
    const relationLabel = (v) => {
        const s = String(v || '').trim().toLowerCase().replace(/[.\s-]/g, '');
        if (s === 's/o' || s === 'so' || s === 'father' || s === 'f') return 'S/o';
        if (s === 'd/o' || s === 'do' || s === 'mother' || s === 'm') return 'D/o';
        if (s === 'w/o' || s === 'wo' || s === 'spouse' || s === 'wife' || s === 'husband') return 'W/o';
        return String(v || '').trim();
    };

    const name = d.name || 'Student';
    const passValid = d.passValidUpto || d.validUpTo || d.passRenewDate || '2026-12-31';
    const parsed = new Date(passValid);
    const passActive = isNaN(parsed.getTime()) ? true : parsed >= new Date(new Date().setHours(0, 0, 0, 0));
    const renewDate = new Date(d.passRenewDate);
    const origValid = new Date(d.passValidUpto || d.validUpTo);
    const renewed = !isNaN(renewDate.getTime()) && !isNaN(origValid.getTime()) && renewDate.getTime() > origValid.getTime();
    const feePaid = (Number(d.pendingFee) || 0) <= 0;
    const local = STUDENTS[d.passNo] || STUDENTS[d.rollNo] || {};

    const avatar = $('#pass-avatar');
    renderAvatar(avatar, name.trim().charAt(0).toUpperCase() || 'S', d.avatar || local.avatar);
    setText('#pass-name', name);

    const relType = relationLabel(local.relationType || d.relationType || local.relation_type || d.relation_type);
    const parentName = local.relationValue || d.relationValue || local.relation_value || d.relation_value || '';
    setText('#pass-relation-label', relType || (parentName ? 'S/o' : '—'));
    setText('#pass-parent', parentName || '—');
    setText('#pass-college', d.college || 'CGC Landran');
    setText('#pass-branch', d.branch || d.department || '—');
    setText('#pass-number', d.rollNo || d.passNo || '—');
    setText('#pass-route', routeLabel(route, d.route));
    setText('#pass-issue', fmtDate(d.issueDate || d.pass_issue_date));
    setText('#pass-valid', fmtDate(passValid));
    setText('#pass-receipt', d.feeReceipt || d.fee_receipt_no || '—');
    setText('#pass-fee-date', fmtDate(d.feeDate || d.fee_date));
    setText('#pass-fee-place', d.feePlace || d.fee_place || '—');
    setText('#pass-pickup', d.pickupPoint || d.pickup_point || '—');

    const passOk = passActive && feePaid;
    const badge = $('#pass-badge');
    if (badge) {
        badge.textContent = passOk ? (renewed ? 'RENEWED' : 'ACTIVE') : 'EXPIRED';
        badge.classList.toggle('pass-card__badge--expired', !passOk);
        badge.classList.toggle('pass-card__badge--renewed', passOk && renewed);
    }
    const band = $('#pass-card-band');
    if (band) {
        band.classList.toggle('pass-card__band--active', passOk);
        band.classList.toggle('pass-card__band--expired', !passOk);
    }
    const feeEl = $('#pass-fee');
    if (feeEl) {
        feeEl.textContent = passOk ? 'PAID' : 'NOT PAID';
        feeEl.classList.toggle('pass-card__fee--paid', passOk);
        feeEl.classList.toggle('pass-card__fee--unpaid', !passOk);
    }
}

// ─── Edit Profile (Student) ─────────────────────────────────────────────
const editProfileModal = $('#edit-profile-modal');
const editProfileForm = $('#edit-profile-form');
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
let pendingAvatar = null;
let avatarRemovePending = false;

function renderAvatar(el, initials, avatar) {
    if (!el) return;
    if (avatar) {
        el.textContent = '';
        el.style.backgroundImage = `url("${avatar}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.classList.add('has-photo');
    } else {
        el.textContent = initials;
        el.style.backgroundImage = '';
        el.classList.remove('has-photo');
    }
}

function openEditProfileModal() {
    if (!currentUser || currentUser.type !== 'student' || !editProfileModal) return;
    const d = currentUser.data || {};
    const local = STUDENTS[d.passNo] || STUDENTS[d.rollNo] || {};
    const setVal = (sel, val) => { const el = $(sel); if (el) el.value = val; };
    const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };
    pendingAvatar = null;
    avatarRemovePending = false;
    const photoInput = $('#edit-profile-photo-input');
    if (photoInput) photoInput.value = '';
    const preview = $('#edit-profile-avatar-preview');
    const name = d.name || 'Student';
    const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'S';
    renderAvatar(preview, initials, d.avatar || local.avatar || '');
    const removeBtn = $('#edit-profile-remove-photo');
    if (removeBtn) removeBtn.hidden = !(d.avatar || local.avatar);
    setText('#edit-profile-roll', d.rollNo || d.studentId || '—');
    setText('#edit-profile-passno', d.passNo || d.rollNo || '—');
    setVal('#edit-profile-name', d.name || '');
    setVal('#edit-profile-email', d.email || '');
    setVal('#edit-profile-contact', d.contactNo || '');
    setVal('#edit-profile-branch', d.branch || d.department || '');
    setVal('#edit-profile-college', d.college || '');
    setVal('#edit-profile-pickup', d.pickupPoint || '');
    setVal('#edit-profile-parent', local.relationValue || d.relationValue || '');
    editProfileModal.classList.add('open');
}

function closeEditProfileModal() {
    if (editProfileModal) editProfileModal.classList.remove('open');
}

const btnEditProfile = $('#btn-edit-profile');
if (btnEditProfile) btnEditProfile.addEventListener('click', openEditProfileModal);

const btnEditProfileClose = $('#edit-profile-close');
if (btnEditProfileClose) btnEditProfileClose.addEventListener('click', closeEditProfileModal);

const btnEditProfileCancel = $('#edit-profile-cancel');
if (btnEditProfileCancel) btnEditProfileCancel.addEventListener('click', closeEditProfileModal);

if (editProfileModal) {
    editProfileModal.addEventListener('click', (e) => {
        if (e.target === editProfileModal) closeEditProfileModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editProfileModal && editProfileModal.classList.contains('open')) {
        closeEditProfileModal();
    }
});

const btnChangePhoto = $('#edit-profile-change-photo');
const photoInput = $('#edit-profile-photo-input');
if (btnChangePhoto && photoInput) {
    btnChangePhoto.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!/^image\/(jpeg|jpg|png)$/i.test(file.type)) {
            showToast('warning', 'Invalid image', 'Please choose a JPG, JPEG or PNG image.');
            photoInput.value = '';
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            showToast('warning', 'Image too large', 'Please choose an image under 2 MB.');
            photoInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            pendingAvatar = String(reader.result);
            avatarRemovePending = false;
            const preview = $('#edit-profile-avatar-preview');
            if (preview) renderAvatar(preview, '', pendingAvatar);
            const removeBtn = $('#edit-profile-remove-photo');
            if (removeBtn) removeBtn.hidden = false;
        };
        reader.readAsDataURL(file);
    });
}

const btnRemovePhoto = $('#edit-profile-remove-photo');
if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener('click', () => {
        avatarRemovePending = true;
        pendingAvatar = null;
        const photoInput = $('#edit-profile-photo-input');
        if (photoInput) photoInput.value = '';
        const preview = $('#edit-profile-avatar-preview');
        const name = (currentUser && currentUser.data && currentUser.data.name) || 'Student';
        const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'S';
        if (preview) renderAvatar(preview, initials, '');
        btnRemovePhoto.hidden = true;
    });
}

if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || currentUser.type !== 'student') return;
        const d = currentUser.data || {};

        const name = $('#edit-profile-name').value.trim();
        const email = $('#edit-profile-email').value.trim();
        const contactNo = $('#edit-profile-contact').value.trim();
        const branch = $('#edit-profile-branch').value.trim();
        const college = $('#edit-profile-college').value.trim();
        const pickupPoint = $('#edit-profile-pickup').value.trim();
        const parentName = $('#edit-profile-parent').value.trim();

        if (!name) { showToast('warning', 'Name required', 'Please enter your full name.'); return; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('warning', 'Invalid email', 'Please enter a valid email address.'); return; }
        if (contactNo && !/^[0-9+\-\s]{7,15}$/.test(contactNo)) { showToast('warning', 'Invalid phone', 'Please enter a valid phone number.'); return; }

        let updated = false;
        if (typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
            try {
                await apiPost('/api/auth/student/update-profile', {
                    email: d.email,
                    password: d.password || '',
                    new_email: email,
                    name,
                    contact_no: contactNo,
                    branch,
                    department: d.department || '',
                    college,
                    pickup_point: pickupPoint,
                    relation_value: parentName,
                    avatar: pendingAvatar || '',
                    remove_avatar: avatarRemovePending,
                });
                updated = true;
            } catch (err) {
                const msg = String((err && err.message) || err);
                if (/409|already registered/i.test(msg)) { showToast('warning', 'Email already used', msg); return; }
                if (/401|Incorrect password/i.test(msg)) { showToast('warning', 'Authentication failed', 'Please sign in again.'); return; }
                if (/400|403|404/.test(msg)) { showToast('warning', 'Cannot update', msg); return; }
                console.warn('[API] Profile update unavailable, using local update.', err);
            }
        }

        const updatedData = Object.assign({}, d, {
            name,
            email: email.toLowerCase(),
            contactNo,
            branch,
            college,
            pickupPoint,
            relationValue: parentName,
        });
        if (pendingAvatar) updatedData.avatar = pendingAvatar;
        else if (avatarRemovePending) updatedData.avatar = null;
        currentUser.data = updatedData;
        if (STUDENTS[updatedData.passNo]) {
            STUDENTS[updatedData.passNo] = Object.assign({}, STUDENTS[updatedData.passNo], updatedData);
            STUDENTS[updatedData.passNo].relationValue = parentName;
            saveStudentAccounts();
        }

        pendingAvatar = null;
        avatarRemovePending = false;
        const photoInput = $('#edit-profile-photo-input');
        if (photoInput) photoInput.value = '';

        closeEditProfileModal();
        renderStudentProfile();
        renderStudentPass();
        studentName.textContent = currentUser.data.name;
        studentGreet.textContent = `${getGreeting()}, ${currentUser.data.name.split(' ')[0]}!`;
        renderNavAvatar();
        showToast('success', 'Profile updated successfully', 'Your profile information has been updated.');
    });
}

// ═══════════════════════════════════════════════════════════════════
// FACULTY DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function renderFacultyNavAvatar() {
    if (!facultyAvatar || !currentUser || currentUser.type !== 'faculty') return;
    const d = currentUser.data || {};
    const initials = (d.name || 'F').trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'F';
    renderAvatar(facultyAvatar, initials, d.avatar || '');
}

function renderFacultyProfileAvatar() {
    const el = $('#faculty-profile-avatar');
    if (!el || !currentUser || currentUser.type !== 'faculty') return;
    const d = currentUser.data || {};
    const initials = (d.name || 'F').trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'F';
    renderAvatar(el, initials, d.avatar || '');
}

function openFacultyDashboard() {
    switchPage(facultyPage);
    // Reset to the Home tab so every session starts on the dashboard
    $$('#faculty-page .tab-btn').forEach(b => b.classList.remove('active'));
    $('#tab-fac-home').classList.add('active');
    $$('#faculty-page .tab-content').forEach(c => c.classList.remove('active'));
    $('#content-fhome').classList.add('active');
    facultyName.textContent = currentUser.data.name;
    renderFacultyNavAvatar();
    facultyGreeting.textContent = `${getGreeting()}, ${currentUser.data.name.split(' ')[0]}!`;
    updateFacultyProfile();
    updateFacultyNotifications();
    renderFacultyRoutes();
    renderFacultySchedule();
    updateFacultyBusInfo();
    renderFacultyPass();
    startGPSSimulation();
    notifPollStart();
    refreshFacultyNotifications();
}

function updateFacultyProfile() {
    const d = currentUser.data;
    $('#faculty-profile-name').textContent = d.name || 'Faculty Member';
    $('#faculty-profile-id').textContent = d.facultyId || d.empId || '—';
    $('#faculty-profile-dept').textContent = d.department || '—';
    $('#faculty-profile-designation').textContent = d.designation || '';
    $('#faculty-profile-college').textContent = d.college || 'CGC Landran, Mohali';
    $('#faculty-profile-email').textContent = d.email || '—';
    $('#faculty-profile-contact').textContent = d.contactNo || '—';
    renderFacultyProfileAvatar();
}

function renderFacultyPass() {
    if (!currentUser || currentUser.type !== 'faculty') return;
    const d = currentUser.data || {};
    const route = currentUser.route;
    const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };
    const fmtDate = (v) => {
        if (!v) return '—';
        const parsed = new Date(v);
        if (isNaN(parsed.getTime())) return String(v);
        return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const routeLabel = (r, raw) => {
        if (r && r.id) {
            const id = String(r.id);
            if (/^\d+$/.test(id)) return `Route ${id}`;
            const idx = ROUTES.findIndex(x => x.id === id);
            return idx >= 0 ? `Route ${idx + 1}` : `Route ${id}`;
        }
        return raw ? `Route ${raw}` : '—';
    };

    const name = d.name || 'Faculty';
    const passValid = d.passValidUpto || d.validUpTo || d.passRenewDate || '2026-12-31';
    const parsed = new Date(passValid);
    const passActive = isNaN(parsed.getTime()) ? true : parsed >= new Date(new Date().setHours(0, 0, 0, 0));

    const avatar = $('#fac-pass-avatar');
    renderAvatar(avatar, name.trim().charAt(0).toUpperCase() || 'F', d.avatar || '');
    setText('#fac-pass-name', name);
    setText('#fac-pass-id', d.facultyId || d.empId || '—');
    setText('#fac-pass-dept', d.department ? (d.designation ? `${d.department} · ${d.designation}` : d.department) : '—');
    setText('#fac-pass-college', d.college || 'CGC Landran, Mohali');
    setText('#fac-pass-email', d.email || '—');
    setText('#fac-pass-contact', d.contactNo || '—');
    setText('#fac-pass-route', routeLabel(route, d.route));
    setText('#fac-pass-issue', fmtDate(d.issueDate || d.pass_issue_date));
    setText('#fac-pass-valid', fmtDate(passValid));
    setText('#fac-pass-status', passActive ? 'Active' : 'Expired');

    const badge = $('#fac-pass-badge');
    if (badge) {
        badge.textContent = passActive ? 'ACTIVE' : 'EXPIRED';
        badge.classList.toggle('pass-card__badge--expired', !passActive);
        badge.classList.toggle('pass-card__badge--renewed', false);
    }
    const band = $('#fac-pass-card-band');
    if (band) {
        band.classList.toggle('pass-card__band--active', passActive);
        band.classList.toggle('pass-card__band--expired', !passActive);
    }
}

function updateFacultyBusInfo() {
    if (!currentUser || currentUser.type !== 'faculty') return;
    const route = currentUser.route;
    const activeBuses = Object.values(busSim).filter(s => !route || s.routeId === route.id);
    const bus = activeBuses.length ? activeBuses[0] : null;

    if (bus) {
        const r = ROUTES.find(x => x.id === bus.routeId);
        const nextStop = r ? (r.stops[bus.nextStopIdx] || r.stops[r.stops.length - 1]) : null;
        facultyBusStatus.className = 'status-badge';
        facultyBusStatus.innerHTML = '<span class="status-dot"></span> En Route';
        facultyBusNumber.textContent = bus.busNo;
        facultyRouteName.textContent = r ? r.name : bus.routeId;
        facultyBusLocation.textContent = nextStop ? `Near ${nextStop.name}` : 'En route';
        facultyNextStop.textContent = nextStop ? nextStop.name : '—';
        const etaMin = r ? Math.max(1, Math.round((1 - bus.progress) * 30)) : '—';
        facultyEta.textContent = `${etaMin} min`;
    } else {
        facultyBusStatus.className = 'status-badge';
        facultyBusStatus.innerHTML = '<span class="status-dot"></span> Idle';
        facultyBusNumber.textContent = 'No bus en route';
        const r = route || (ROUTES.length ? ROUTES[0] : null);
        facultyRouteName.textContent = route ? r.name : 'All routes';
        facultyBusLocation.textContent = '—';
        facultyNextStop.textContent = '—';
        facultyEta.textContent = '—';
    }
}

function facultyNotificationFeed() {
    if (!facultyNotifications.some(n => n.id === 'fac-1')) {
        facultyNotifications.push(
            { id: 'fac-1', type: 'announcement', title: 'Welcome to the Faculty Portal', body: 'Track buses, view schedules, and report issues from one place.', time: 'Just now', read: false },
            { id: 'fac-2', type: 'schedule_change', title: 'Morning schedule update', body: 'Route A first trip departs at 6:30 AM as usual this week.', time: '2h ago', read: false },
        );
    }
}

function facultyVisibleNotifications() {
    if (!currentUser || currentUser.type !== 'faculty') return facultyNotifications;
    const facRoute = currentUser.route
        ? String(currentUser.route.id)
        : (currentUser.data && currentUser.data.route ? String(currentUser.data.route) : '');
    if (!facRoute) return facultyNotifications.filter(n => !n.routeId);
    return facultyNotifications.filter(n => !n.routeId || String(n.routeId) === facRoute);
}

function updateFacultyNotifications() {
    if (!currentUser || currentUser.type !== 'faculty') return;
    facultyNotificationFeed();
    const visible = facultyVisibleNotifications();
    const unread = visible.filter(n => !n.read).length;
    if (facultyNotifBadge) {
        facultyNotifBadge.textContent = unread;
        facultyNotifBadge.classList.toggle('visible', unread > 0);
    }
    renderFacultyNotificationList();
}

function renderFacultyNotificationList() {
    if (!facultyNotifList) return;
    const typeMeta = {
        bus_delay: ['delay', '⏱'],
        route_change: ['info', '🔄'],
        cancellation: ['danger', '🚫'],
        schedule_change: ['info', '📅'],
        announcement: ['success', '📢'],
    };

    const backendItems = facultyBackendItems.slice().reverse().map(n => {
        const [iconClass, iconEmoji] = notifIconForMessage(n.body);
        return `
            <div class="notif-item${n.read ? '' : ' notif-item--unread'}" data-notif-id="${n.backendId}" data-backend-id="${n.backendId}" data-thread-id="${n.threadId}" role="button" tabindex="0">
                <div class="notif-icon notif-icon--${iconClass}">${iconEmoji}</div>
                <div class="notif-body">
                    <div class="notif-body__header">
                        <span class="notif-driver">${n.title}</span>
                        <span class="notif-time">${n.time}</span>
                    </div>
                    <p class="notif-msg">${n.body}</p>
                    <div class="notif-actions-row">
                        <button class="btn-notif-reply" data-reply-toggle="${n.backendId}">Reply</button>
                        <button class="btn-notif-thread" data-thread-toggle="${n.backendId}">View conversation</button>
                    </div>
                    <div class="notif-reply-box" data-reply-box="${n.backendId}" hidden>
                        <textarea class="notif-reply-input" data-reply-input="${n.backendId}" rows="2" placeholder="Write your reply to the driver…"></textarea>
                        <button class="btn-primary btn-notif-send" data-reply-send="${n.backendId}">Send Reply</button>
                    </div>
                    <div class="notif-thread" data-thread-body="${n.backendId}"></div>
                </div>
            </div>`;
    }).join('');

    const localItems = facultyVisibleNotifications()
        .filter(n => !n.isBackend)
        .slice()
        .reverse()
        .map(n => {
            const [iconClass, iconEmoji] = typeMeta[n.type] || ['info', '📢'];
            return `
            <div class="notif-item${n.read ? '' : ' notif-item--unread'}" data-notif-id="${n.id}" role="button" tabindex="0">
                <div class="notif-icon notif-icon--${iconClass}">${iconEmoji}</div>
                <div class="notif-body">
                    <div class="notif-body__header">
                        <span class="notif-driver">${n.title}</span>
                        <span class="notif-time">${n.time}</span>
                    </div>
                    <p class="notif-msg">${n.body}</p>
                </div>
            </div>`;
        }).join('');

    if (!backendItems && !localItems) {
        facultyNotifList.innerHTML = '<div class="empty-state"><p>No notifications yet</p><span>Bus delays, route changes and announcements appear here</span></div>';
        return;
    }
    facultyNotifList.innerHTML = backendItems + localItems;
}

// Mark a faculty notification as read when opened/clicked (local + backend)
if (facultyNotifList) {
    facultyNotifList.addEventListener('click', (e) => {
        const replyToggle = e.target.closest('[data-reply-toggle]');
        if (replyToggle) { toggleFacultyReply(replyToggle.dataset.replyToggle); return; }
        const threadToggle = e.target.closest('[data-thread-toggle]');
        if (threadToggle) { toggleFacultyThread(threadToggle.dataset.threadToggle); return; }
        const replySend = e.target.closest('[data-reply-send]');
        if (replySend) { sendFacultyReply(replySend.dataset.replySend); return; }

        const item = e.target.closest('.notif-item');
        if (!item) return;
        const backendId = item.dataset.backendId;
        if (backendId) markBackendRead(backendId);
        const id = item.dataset.notifId;
        const n = facultyNotifications.find(x => String(x.id) === String(id));
        if (n && !n.read) {
            n.read = true;
            updateFacultyNotifications();
        }
    });
}

// Faculty notification bell → jump to the notifications section
const facultyNotifBell = $('#faculty-notification-bell');
if (facultyNotifBell) {
    facultyNotifBell.addEventListener('click', () => {
        const section = $('#faculty-section-notifications');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function renderFacultyRoutes() {
    const listEl = $('#faculty-route-stops-list');
    if (!listEl) return;
    listEl.innerHTML = ROUTES.map(route => `
        <div class="faculty-route-block">
            <h4>Route ${route.id} — ${route.name}</h4>
            <ol class="faculty-stops-list">
                ${route.stops.map(s => `<li>${s.name}</li>`).join('')}
            </ol>
        </div>`).join('');
}

function renderFacultySchedule() {
    const listEl = $('#faculty-schedule-list');
    if (!listEl) return;
    listEl.innerHTML = ROUTES.map(route => `
        <div class="faculty-route-block">
            <h4>Route ${route.id}</h4>
            <table class="faculty-schedule-table">
                <thead><tr><th>Bus</th><th>Driver</th><th>Departure</th><th>Arrival</th></tr></thead>
                <tbody>
                    ${route.trips.map(t => `<tr><td>${t.busNo}</td><td>${t.driver}</td><td>${t.departure}</td><td>${t.arrival}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>`).join('');
}

// Clear faculty notifications
const btnFacultyClearNotif = $('#btn-faculty-clear-notif');
if (btnFacultyClearNotif) {
    btnFacultyClearNotif.addEventListener('click', () => {
        if (!currentUser || currentUser.type !== 'faculty') return;
        facultyNotifications = [];
        clearFacultyNotifications();
        showToast('success', 'Cleared', 'All notifications have been cleared.');
    });
}

// Report a bus issue (stored locally + visible as a toast confirmation)
const facultyReportForm = $('#faculty-report-form');
if (facultyReportForm) {
    facultyReportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = $('#faculty-issue-type').value;
        const desc = $('#faculty-issue-desc').value.trim();
        if (!type || !desc) {
            showToast('warning', 'Missing details', 'Please choose an issue type and describe the problem.');
            return;
        }
        const photo = $('#faculty-issue-photo');
        const photoName = photo && photo.files && photo.files.length ? photo.files[0].name : null;
        const report = {
            type, desc, photoName,
            by: currentUser && currentUser.data ? currentUser.data.name : 'Faculty',
            at: new Date().toLocaleString(),
        };
        let reports = [];
        try { reports = JSON.parse(localStorage.getItem('campus-ride-issues') || '[]'); } catch (err) {}
        reports.push(report);
        localStorage.setItem('campus-ride-issues', JSON.stringify(reports));
        $('#faculty-issue-type').value = '';
        $('#faculty-issue-desc').value = '';
        if (photo) photo.value = '';
        showToast('success', 'Issue reported', `Your report (${type}) has been submitted to the transport team.`);
    });
}

// ── Faculty Edit Profile modal ──────────────────────────────────────
const facultyEditBtn = $('#btn-faculty-edit-profile');
const facultyEditProfileModal = $('#faculty-edit-profile-modal');
const facultyEditForm = $('#faculty-edit-form');
let pendingFacultyAvatar = null;
let facultyAvatarRemovePending = false;

function toDateInputValue(value) {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return '';
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function openFacultyEditProfileModal() {
    if (!currentUser || currentUser.type !== 'faculty' || !facultyEditProfileModal) return;
    const d = currentUser.data || {};
    const setVal = (sel, val) => {
        const el = $(sel);
        if (el) el.value = (val === undefined || val === null || val === '—') ? '' : val;
    };
    const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };
    pendingFacultyAvatar = null;
    facultyAvatarRemovePending = false;
    const photoInput = $('#faculty-edit-photo-input');
    if (photoInput) photoInput.value = '';
    const preview = $('#faculty-edit-avatar-preview');
    const name = d.name || 'Faculty';
    const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'F';
    renderAvatar(preview, initials, d.avatar || '');
    const removeBtn = $('#faculty-edit-remove-photo');
    if (removeBtn) removeBtn.hidden = !d.avatar;
    setText('#faculty-edit-id', d.facultyId || d.empId || '—');
    setText('#faculty-edit-role', 'Faculty');
    setVal('#faculty-edit-name', d.name);
    setVal('#faculty-edit-email', d.email);
    setVal('#faculty-edit-contact', d.contactNo);
    setVal('#faculty-edit-department', d.department);
    setVal('#faculty-edit-designation', d.designation);
    setVal('#faculty-edit-college', d.college);
    setVal('#faculty-edit-pickup', d.pickupPoint);
    setVal('#faculty-edit-dob', toDateInputValue(d.dob));
    setVal('#faculty-edit-gender', d.gender);
    setVal('#faculty-edit-blood-group', d.bloodGroup);
    setVal('#faculty-edit-address', d.address);
    setVal('#faculty-edit-emergency-contact', d.emergencyContact);
    facultyEditProfileModal.classList.add('open');
}

function closeFacultyEditProfileModal() {
    if (facultyEditProfileModal) facultyEditProfileModal.classList.remove('open');
}

if (facultyEditBtn) facultyEditBtn.addEventListener('click', openFacultyEditProfileModal);

const btnFacultyEditClose = $('#faculty-edit-close');
if (btnFacultyEditClose) btnFacultyEditClose.addEventListener('click', closeFacultyEditProfileModal);
const btnFacultyEditCancel = $('#faculty-edit-cancel');
if (btnFacultyEditCancel) btnFacultyEditCancel.addEventListener('click', closeFacultyEditProfileModal);
if (facultyEditProfileModal) {
    facultyEditProfileModal.addEventListener('click', (e) => {
        if (e.target === facultyEditProfileModal) closeFacultyEditProfileModal();
    });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && facultyEditProfileModal && facultyEditProfileModal.classList.contains('open')) {
        closeFacultyEditProfileModal();
    }
});

const btnFacultyChangePhoto = $('#faculty-edit-change-photo');
const facultyPhotoInput = $('#faculty-edit-photo-input');
if (btnFacultyChangePhoto && facultyPhotoInput) {
    btnFacultyChangePhoto.addEventListener('click', () => facultyPhotoInput.click());
    facultyPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!/^image\/(jpeg|jpg|png)$/i.test(file.type)) {
            showToast('warning', 'Invalid image', 'Please choose a JPG, JPEG or PNG image.');
            facultyPhotoInput.value = '';
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            showToast('warning', 'Image too large', 'Please choose an image under 2 MB.');
            facultyPhotoInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            pendingFacultyAvatar = String(reader.result);
            facultyAvatarRemovePending = false;
            const preview = $('#faculty-edit-avatar-preview');
            if (preview) renderAvatar(preview, '', pendingFacultyAvatar);
            const removeBtn = $('#faculty-edit-remove-photo');
            if (removeBtn) removeBtn.hidden = false;
        };
        reader.readAsDataURL(file);
    });
}

const btnFacultyRemovePhoto = $('#faculty-edit-remove-photo');
if (btnFacultyRemovePhoto) {
    btnFacultyRemovePhoto.addEventListener('click', () => {
        facultyAvatarRemovePending = true;
        pendingFacultyAvatar = null;
        const photoInput = $('#faculty-edit-photo-input');
        if (photoInput) photoInput.value = '';
        const preview = $('#faculty-edit-avatar-preview');
        const name = (currentUser && currentUser.data && currentUser.data.name) || 'Faculty';
        const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'F';
        if (preview) renderAvatar(preview, initials, '');
        btnFacultyRemovePhoto.hidden = true;
    });
}

if (facultyEditForm) {
    facultyEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || currentUser.type !== 'faculty') return;
        const d = currentUser.data || {};

        const name = $('#faculty-edit-name').value.trim();
        const email = $('#faculty-edit-email').value.trim();
        const contactNo = $('#faculty-edit-contact').value.trim();
        const department = $('#faculty-edit-department').value.trim();
        const designation = $('#faculty-edit-designation').value.trim();
        const college = $('#faculty-edit-college').value.trim();
        const pickupPoint = $('#faculty-edit-pickup').value.trim();
        const dob = $('#faculty-edit-dob').value.trim();
        const gender = $('#faculty-edit-gender').value.trim();
        const bloodGroup = $('#faculty-edit-blood-group').value.trim();
        const address = $('#faculty-edit-address').value.trim();
        const emergencyContact = $('#faculty-edit-emergency-contact').value.trim();

        if (!name) { showToast('warning', 'Name required', 'Please enter your full name.'); return; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('warning', 'Invalid email', 'Please enter a valid email address.'); return; }
        if (contactNo && !/^[0-9+\-\s]{7,15}$/.test(contactNo)) { showToast('warning', 'Invalid phone', 'Please enter a valid phone number.'); return; }
        if (emergencyContact && !/^[0-9+\-\s]{7,15}$/.test(emergencyContact)) { showToast('warning', 'Invalid emergency contact', 'Please enter a valid emergency contact number.'); return; }

        let updated = false;
        if (typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
            try {
                await apiPost('/api/auth/faculty/update-profile', {
                    email: d.email,
                    password: d.password || '',
                    new_email: email,
                    name,
                    contact_no: contactNo,
                    department,
                    designation,
                    college,
                    pickup_point: pickupPoint,
                    dob,
                    gender,
                    address,
                    blood_group: bloodGroup,
                    emergency_contact: emergencyContact,
                    avatar: pendingFacultyAvatar || '',
                    remove_avatar: facultyAvatarRemovePending,
                });
                updated = true;
            } catch (err) {
                const msg = String((err && err.message) || err);
                if (/409|already registered/i.test(msg)) { showToast('warning', 'Email already used', msg); return; }
                if (/401|Incorrect password/i.test(msg)) { showToast('warning', 'Authentication failed', 'Please sign in again.'); return; }
                if (/400|403|404/.test(msg)) { showToast('warning', 'Cannot update', msg); return; }
                console.warn('[API] Faculty profile update unavailable, using local update.', err);
            }
        }

        const updatedData = Object.assign({}, d, {
            name,
            email: email.toLowerCase(),
            contactNo,
            department,
            designation,
            college,
            pickupPoint,
            dob,
            gender,
            address,
            bloodGroup,
            emergencyContact,
        });
        if (pendingFacultyAvatar) updatedData.avatar = pendingFacultyAvatar;
        else if (facultyAvatarRemovePending) updatedData.avatar = null;
        currentUser.data = updatedData;

        // Keep the local faculty store in sync without persisting the
        // plaintext password or breaking the existing offline password hash.
        const empId = currentUser.data.empId || currentUser.data.facultyId;
        let facultyKey = null;
        if (empId) {
            if (FACULTY[empId]) {
                facultyKey = empId;
            } else {
                const entry = Object.values(FACULTY).find(a =>
                    a && String(a.empId || a.facultyId || '').trim().toUpperCase() === String(empId).trim().toUpperCase()
                );
                facultyKey = entry ? Object.keys(FACULTY).find(k => FACULTY[k] === entry) : null;
            }
        }
        if (facultyKey) {
            const existing = FACULTY[facultyKey] || {};
            const { password: _existingPw, ...existingClean } = existing;
            const { password: _pw, ...mirror } = updatedData;
            FACULTY[facultyKey] = Object.assign({}, existingClean, mirror, {
                pwHash: existing.pwHash || (d.password ? await hashPw(d.password) : undefined),
            });
            saveFacultyAccounts();
        }

        pendingFacultyAvatar = null;
        facultyAvatarRemovePending = false;
        const photoInput = $('#faculty-edit-photo-input');
        if (photoInput) photoInput.value = '';

        closeFacultyEditProfileModal();
        updateFacultyProfile();
        renderFacultyPass();
        renderFacultyNavAvatar();
        facultyName.textContent = currentUser.data.name;
        facultyGreeting.textContent = `${getGreeting()}, ${currentUser.data.name.split(' ')[0]}!`;
        showToast('success', 'Profile updated successfully', 'Your profile information has been updated.');
    });
}

// Quick actions switch to the relevant tab, then scroll to the section
document.querySelectorAll('.faculty-action-card').forEach(card => {
    card.addEventListener('click', () => {
        if (card.dataset.tab) {
            const btn = document.querySelector('#faculty-page .tab-btn[data-tab="' + card.dataset.tab + '"]');
            if (btn) btn.click();
        }
        const target = document.getElementById(card.dataset.target);
        if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    });
});

// Faculty map controls
const facultyBtnCenter = $('#faculty-btn-center');
const facultyBtnFit = $('#faculty-btn-fit');
if (facultyBtnCenter) facultyBtnCenter.addEventListener('click', () => {
    if (!facultyMap) return;
    const active = Object.values(busSim).filter(s => !currentUser.route || s.routeId === currentUser.route.id);
    if (active.length) {
        facultyMap.setView([active[0].lat, active[0].lng], 15, { animate: true });
    } else {
        facultyMap.setView([30.7069, 76.6512], 15, { animate: true });
    }
});
if (facultyBtnFit) facultyBtnFit.addEventListener('click', () => {
    if (!facultyMap) return;
    const routes = currentUser.route ? [currentUser.route] : ROUTES;
    const pts = [];
    routes.forEach(r => r.stops.forEach(s => pts.push([s.lat, s.lng])));
    if (pts.length) facultyMap.fitBounds(L.latLngBounds(pts), { padding: [40, 40], animate: true });
});

// ── Faculty live map (reuses the same Campus Ride map system) ─────
let facultyMap = null;
let facultyMapInitialized = false;
let facultyBusMarkers = {};
let facultyPolylines = {};
let facultyStopMarkers = [];

function initFacultyMap() {
    if (!facultyPage) return;
    if (facultyMapInitialized) {
        facultyMap.invalidateSize();
        updateFacultyMap();
        return;
    }

    facultyMap = L.map('faculty-live-map', { center: [30.7069, 76.6512], zoom: 15, zoomControl: true });

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19,
    });
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    });
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri', maxZoom: 19,
    });
    streetLayer.addTo(facultyMap);
    L.control.layers({ 'Dark Mode Map': darkLayer, 'Street Map (OSM)': streetLayer, 'Satellite Imagery': satelliteLayer }, null, { position: 'topright' }).addTo(facultyMap);

    const trackColor = '#1e40af';
    const stopColor = '#ff4d4d';
    ROUTES.forEach(route => {
        const latlngs = route.stops.map(s => [s.lat, s.lng]);
        facultyPolylines[route.id] = L.polyline(latlngs, { color: trackColor, weight: 5, opacity: 0.85, dashArray: '8, 8' }).addTo(facultyMap);
        route.stops.forEach(stop => {
            const pinHtml = `
                <div style="width:28px;height:38px;position:relative;display:flex;align-items:flex-start;justify-content:center;">
                    <svg width="28" height="38" viewBox="0 0 24 32"><path d="M12 0C7 0 3.5 3.5 3.5 8.5 3.5 15 12 32 12 32s8.5-17 8.5-23.5C20.5 3.5 16.99 0 12 0z" fill="${stopColor}"/><circle cx="12" cy="9" r="4.2" fill="#ffffff"/></svg>
                </div>`;
            const icon = L.divIcon({ html: pinHtml, className: '', iconSize: [28, 38], iconAnchor: [14, 38] });
            const marker = L.marker([stop.lat, stop.lng], { icon });
            marker.routeId = route.id;
            marker.addTo(facultyMap);
            marker.bindPopup(`<strong>${stop.name}</strong><br><small>Route ${route.id}</small>`);
            facultyStopMarkers.push(marker);
        });
    });

    // Center on the faculty's assigned route if available
    const focusRoute = currentUser && currentUser.route ? currentUser.route : ROUTES[0];
    if (focusRoute) {
        const pts = focusRoute.stops.map(s => [s.lat, s.lng]);
        facultyMap.fitBounds(L.latLngBounds(pts), { padding: [40, 40], animate: false });
    }

    facultyMapInitialized = true;
    updateFacultyMap();
}

function updateFacultyMap() {
    if (!facultyMap) return;
    const routeColors = { a: '#818cf8', b: '#10b981', c: '#f59e0b', d: '#a855f7', e: '#06b6d4', f: '#ef4444' };

    Object.keys(facultyBusMarkers).forEach(busNo => {
        if (!busSim[busNo]) {
            facultyMap.removeLayer(facultyBusMarkers[busNo]);
            delete facultyBusMarkers[busNo];
        }
    });

    Object.keys(busSim).forEach(busNo => {
        const sim = busSim[busNo];
        const color = routeColors[sim.routeColor] || '#818cf8';
        const heading = sim.heading || getRouteHeading(sim.routeId, sim.progress);
        if (facultyBusMarkers[busNo]) {
            facultyBusMarkers[busNo].setLatLng([sim.lat, sim.lng]);
            facultyBusMarkers[busNo].setIcon(createBusIcon(color, heading));
        } else {
            facultyBusMarkers[busNo] = L.marker([sim.lat, sim.lng], { icon: createBusIcon(color, heading) })
                .addTo(facultyMap)
                .on('click', () => {
                    showToast('info', `Bus ${sim.busNo}`, `${sim.driver} · Route ${sim.routeId} · ${Math.round(sim.speed)} km/h`);
                });
        }
    });

    updateFacultyBusInfo();
}

function updateDuesUI() {
    if (!currentUser || currentUser.type !== 'student') return;

    const pendingAmount = Number(currentUser.data.pendingFee || 0);
    if (passRenewDate) {
        passRenewDate.textContent = currentUser.data.passRenewDate || 'Not available';
    }
    pendingFee.textContent = pendingAmount > 0 ? `₹${pendingAmount.toFixed(2)}` : 'No pending fees';

    if (btnClearDues) {
        btnClearDues.disabled = pendingAmount <= 0;
        btnClearDues.textContent = pendingAmount <= 0 ? 'Dues Cleared' : 'Clear Dues';
        btnClearDues.classList.toggle('is-cleared', pendingAmount <= 0);
    }

    if (paymentOptions) {
        if (pendingAmount <= 0) {
            paymentOptions.classList.remove('visible');
            if (paymentFlow) paymentFlow.classList.remove('visible');
        }
    }
}

function setPaymentFlow(method, brandName) {
    if (!paymentFlow || !paymentFlowTitle || !paymentFlowSubtitle || !paymentFlowAmount || !paymentFlowStatus || !btnPayNow) return;

    paymentFlow.classList.add('visible');
    paymentFlowTitle.textContent = `Paying with ${method}`;
    paymentFlowSubtitle.textContent = `Secure ${brandName || method} checkout`;
    paymentFlowAmount.textContent = `₹${Number(currentUser.data.pendingFee || 0).toFixed(2)}`;
    paymentFlowStatus.textContent = 'Tap pay to start the UPI checkout flow.';
    btnPayNow.disabled = false;
    btnPayNow.textContent = 'Pay now';

    if (paymentFlowSteps && paymentFlowSteps.length) {
        paymentFlowSteps.forEach((step, index) => {
            step.classList.toggle('active', index === 0);
            step.classList.remove('done');
        });
    }

    const iconHolder = $('#payment-flow-icon');
    if (iconHolder) {
        iconHolder.innerHTML = '';
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('viewBox', '0 0 64 64');
        iconSvg.setAttribute('aria-hidden', 'true');
        iconHolder.appendChild(iconSvg);

        const colors = {
            GPay: ['#ffffff', '#4285F4'],
            PhonePe: ['#5f259f', '#fff'],
            Paytm: ['#00BAF2', '#fff'],
            FreeCharge: ['#75BA24', '#fff'],
            MobiKwik: ['#2D5BE3', '#fff'],
        };
        const [fill1, fill2] = colors[method] || ['#6366f1', '#fff'];
        iconSvg.innerHTML = `
            <rect x="4" y="4" width="56" height="56" rx="14" fill="${fill1}"/>
            <path d="M24 20h16c4 0 7 3 7 7v4c0 4-3 7-7 7h-4v8h-4v-8h-4c-4 0-7-3-7-7v-4c0-4 3-7 7-7Zm8 10h4c2 0 3-1 3-3v-2c0-2-1-3-3-3h-4v8Z" fill="${fill2}"/>
        `;
    }
}

function runPaymentSimulation(method) {
    if (!paymentFlowSteps || !paymentFlowSteps.length || !paymentFlowStatus || !btnPayNow) return;

    btnPayNow.disabled = true;
    btnPayNow.textContent = 'Processing…';
    paymentFlowStatus.textContent = `Opening ${method} and preparing your secure payment request...`;

    const stepSequence = [
        { index: 0, text: 'Opening app…' },
        { index: 1, text: `Confirming ₹${Number(currentUser.data.pendingFee || 0).toFixed(2)} for your bus dues…` },
        { index: 2, text: 'Authorizing with UPI PIN…' },
        { index: 3, text: 'Payment successful!' },
    ];

    let stepIndex = 0;
    const advance = () => {
        if (stepIndex >= stepSequence.length) {
            currentUser.data.pendingFee = 0;
            updateDuesUI();
            paymentFlowStatus.textContent = 'Payment completed successfully. Your dues are now cleared.';
            btnPayNow.disabled = true;
            btnPayNow.textContent = 'Paid';
            showToast('success', 'Payment Successful', `Your dues were cleared using ${method}.`);
            return;
        }

        const currentStep = stepSequence[stepIndex];
        paymentFlowSteps.forEach((step, idx) => {
            step.classList.toggle('active', idx === currentStep.index);
            if (idx < currentStep.index) step.classList.add('done');
            else step.classList.remove('done');
        });

        paymentFlowStatus.textContent = currentStep.text;
        stepIndex += 1;
        setTimeout(advance, 900);
    };

    setTimeout(advance, 400);
}

btnClearDues.addEventListener('click', () => {
    if (!currentUser || currentUser.type !== 'student') return;
    if ((currentUser.data.pendingFee || 0) <= 0) {
        showToast('info', 'No Dues', 'You have no pending dues to clear.');
        return;
    }
    paymentOptions.classList.add('visible');
    paymentFlow.classList.remove('visible');
});

paymentOptions.addEventListener('click', (e) => {
    const methodBtn = e.target.closest('.payment-method-btn');
    if (!methodBtn) return;

    if (!currentUser || currentUser.type !== 'student') return;
    if ((currentUser.data.pendingFee || 0) <= 0) {
        showToast('info', 'No Dues', 'You have no pending dues to clear.');
        return;
    }

    const method = methodBtn.dataset.method;
    const brandName = methodBtn.dataset.brand || method;
    setPaymentFlow(method, brandName);
});

btnPayNow.addEventListener('click', () => {
    if (!currentUser || currentUser.type !== 'student') return;
    if ((currentUser.data.pendingFee || 0) <= 0) {
        showToast('info', 'No Dues', 'You have no pending dues to clear.');
        return;
    }

    const method = paymentFlowTitle.textContent.replace('Paying with ', '').trim();
    runPaymentSimulation(method);
});

function updateNextBusBanner() {
    const route = currentUser.route;
    const next = getNextTrip(route);
    if (!next) return;

    $('#next-bus-route').textContent = `Route ${route.id}`;
    const depMin = parseTime(next.trip.departure);
    const now = nowMinutes();
    let diff = depMin - now;

    if (next.status === 'enroute') {
        $('#next-bus-time').textContent = `${next.trip.departure} → ${next.trip.arrival}`;
        $('#next-bus-countdown').textContent = '🟢 En Route Now';
        $('#next-bus-countdown').style.background = 'var(--green-surface)';
        $('#next-bus-countdown').style.color = 'var(--green)';
    } else if (next.status === 'tomorrow') {
        $('#next-bus-time').textContent = next.trip.departure;
        $('#next-bus-countdown').textContent = 'Tomorrow';
        $('#next-bus-countdown').style.background = 'var(--amber-surface)';
        $('#next-bus-countdown').style.color = 'var(--amber)';
    } else {
        $('#next-bus-time').textContent = next.trip.departure;
        if (diff < 0) diff += 24 * 60;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        $('#next-bus-countdown').textContent = hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins} min`;
        $('#next-bus-countdown').style.background = 'var(--green-surface)';
        $('#next-bus-countdown').style.color = 'var(--green)';
    }

    $('#next-bus-detail').textContent = `Bus ${next.trip.busNo} · Driver ${next.trip.driver}`;

    // Track button
    $('#btn-track-next').onclick = () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $('#tab-tracking').classList.add('active');
        $$('.tab-content').forEach(c => c.classList.remove('active'));
        $('#content-tracking').classList.add('active');
        initMap();
        setTimeout(() => {
            trackRouteSelect.value = route.id;
            updateBusSelect();
            trackBusSelect.value = next.trip.busNo;
            focusBusOnMap(next.trip.busNo);
        }, 300);
    };
}

function startCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        if (currentUser && currentUser.type === 'student') {
            updateNextBusBanner();
        }
    }, 30000);
}

// ─── Render Routes with Station Schedules (S.N. | Stations | Time) ──
function renderRoutes(filter = '') {
    // Always show ALL routes for every student (their own route is visually highlighted)
    const availableRoutes = ROUTES;

    const routesCardTitle = $('#routes-card-title');
    if (routesCardTitle) {
        if (currentUser && currentUser.type === 'student' && currentUser.route) {
            routesCardTitle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                All Bus Routes &amp; Schedules
                <span style="display:block;font-size:0.75rem;font-weight:500;color:var(--accent-light);margin-top:2px;">
                  ★ Your assigned route: ${escapeHtml(currentUser.route.name)} (${escapeHtml(currentUser.route.id)})
                </span>
            `;
        } else {
            routesCardTitle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                All Bus Routes &amp; Schedules
            `;
        }
    }

    // Derive the per-bus station schedule. Prefers the authoritative
    // BUS Routes → Assigned Bus → Ordered Stations data loaded from the
    // backend; falls back to the built-in demo trips/stops when the API
    // is unavailable.
    const routeBuses = (route) => {
        if (Array.isArray(route.buses) && route.buses.length) return route.buses;
        return (route.trips || []).map((trip, i) => ({
            busId: trip.busId != null ? trip.busId : i,
            busNumber: trip.busNo || '',
            driver: trip.driver || '',
            stations: (route.stops || []).map(s => ({ name: s.name, time: '' })),
        }));
    };
    const routeStationNames = (route) => {
        const names = [];
        routeBuses(route).forEach(b => (b.stations || []).forEach(s => names.push(s.name)));
        (route.stops || []).forEach(s => names.push(s.name));
        return names;
    };

    const filtered = availableRoutes.filter(r =>
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        r.id.toLowerCase().includes(filter.toLowerCase()) ||
        routeStationNames(r).some(n => n.toLowerCase().includes(filter.toLowerCase()))
    );

    routesGrid.innerHTML = filtered.map(route => {
        const isMyRoute = currentUser && currentUser.route && currentUser.route.id === route.id;
        const buses = routeBuses(route);

        const blocksHtml = buses.length ? buses.map((bus, bi) => {
            const stations = bus.stations || [];
            const rows = stations.length
                ? stations.map((s, si) => `
                    <tr>
                        <td class="route-station-sn">${si + 1}</td>
                        <td class="route-station-name">${escapeHtml(s.name)}</td>
                        <td class="route-station-time">${s.time ? escapeHtml(apiTimeToDisplay(s.time)) : '—'}</td>
                    </tr>`).join('')
                : `<tr><td colspan="3" class="route-no-stations">No stations added for this bus yet.</td></tr>`;
            return `
                <div class="route-bus-block">
                    <div class="route-bus-block__head">
                        <span class="route-bus-number">bus ${bi + 1} :- <strong>${escapeHtml(bus.busNumber)}</strong></span>
                        <span class="route-bus-driver">Driver :- ${bus.driver ? escapeHtml(bus.driver) : 'Not assigned'}</span>
                    </div>
                    <div class="route-station-table-wrap">
                        <table class="schedule-table route-station-table">
                            <thead><tr><th class="route-station-sn">S.N.</th><th>Stations</th><th class="route-station-time">Time</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>`;
        }).join('') : `<div class="route-no-buses">No buses are assigned to this route yet.</div>`;

        const totalStations = buses.reduce((n, b) => n + ((b.stations || []).length), 0);

        return `
            <div class="route-card ${isMyRoute ? 'my-route' : ''}">
                <div class="route-card__header">
                    <span class="route-badge route-badge--${route.color || 'a'}">
                        Route ${escapeHtml(route.id)}${isMyRoute ? ' ★ Your Route' : ''}
                    </span>
                </div>
                <h3 class="route-card__name">${escapeHtml(route.name)}</h3>
                <div class="route-bus-blocks">
                    ${blocksHtml}
                </div>
                <div class="route-card__footer">
                    <span class="route-bus-info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        ${buses.length} bus${buses.length === 1 ? '' : 'es'} · ${totalStations} stations
                    </span>
                    <span class="route-status ${route.status === 'inactive' ? 'route-status--inactive' : 'route-status--active'}">
                        <span class="status-dot"></span> ${route.status === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    if (filtered.length === 0) {
        routesGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p>No routes found</p><span>Try a different search term</span></div>`;
    }
}

// Global function for inline onclick
window.switchToTracking = function(routeId, busNo) {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $('#tab-tracking').classList.add('active');
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    $('#content-tracking').classList.add('active');
    initMap();
    setTimeout(() => {
        trackRouteSelect.value = routeId;
        updateBusSelect();
        trackBusSelect.value = busNo;
        focusBusOnMap(busNo);
    }, 300);
};

routeSearch.addEventListener('input', (e) => renderRoutes(e.target.value));

// ═══════════════════════════════════════════════════════════════════
// BACKEND NOTIFICATIONS (shared MySQL store for students, faculty, drivers)
// ═══════════════════════════════════════════════════════════════════
let notifPollTimer = null;
let driverNotifReplies = [];
let facultyBackendItems = [];

function currentSessionToken() {
    return currentUser && currentUser.data && currentUser.data.sessionToken
        ? currentUser.data.sessionToken
        : '';
}

function backendNotifsEnabled() {
    return API_AVAILABLE && !!currentSessionToken();
}

async function loadBackendNotifications() {
    if (!backendNotifsEnabled()) return null;
    try {
        return await userApi('GET', '/api/notifications');
    } catch (e) {
        console.warn('[API] Failed to load notifications.', e);
        return null;
    }
}

function backendRowToLocal(n) {
    return {
        id: n.notification_id,
        backendId: n.notification_id,
        threadId: n.thread_id,
        msg: n.message,
        driver: n.sender_name || (n.sender_role === 'driver' ? 'Driver' : 'Sender'),
        route: n.route_id,
        routeId: String(n.route_id),
        busNumber: n.bus_number || '',
        routeName: n.route_name || '',
        time: fmtNotifTime(n.created_at),
        iconType: 'info',
        iconEmoji: '📢',
        unread: !n.is_read,
        replyTo: n.reply_to,
        senderRole: n.sender_role,
    };
}

function notifIconForMessage(msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('🕐') || m.includes('late')) return ['delay', '🕐'];
    if (m.includes('🚧') || m.includes('breakdown')) return ['danger', '🚧'];
    if (m.includes('❌') || m.includes('cancel')) return ['danger', '❌'];
    if (m.includes('✅') || m.includes('on time')) return ['success', '✅'];
    if (m.includes('🏠') || m.includes('depart')) return ['success', '🚍'];
    return ['info', '📢'];
}

// ── Student: merge backend notifications into the live list ─────────
async function refreshStudentNotifications() {
    if (!currentUser || currentUser.type !== 'student') return;
    const data = await loadBackendNotifications();
    if (!data) return;
    const backItems = (data.notifications || []).map(backendRowToLocal);
    const locals = notifications.filter(n => n.backendId == null);
    notifications = backItems.concat(locals);
    updateNotifUI();
}

window.markNotifRead = async function (backendId) {
    if (!backendId) return;
    const local = notifications.find(n => n.backendId === backendId);
    if (local) local.unread = false;
    updateNotifUI();
    if (!backendNotifsEnabled()) return;
    try {
        await userApi('POST', `/api/notifications/${backendId}/read`);
    } catch (e) { /* non-fatal */ }
};

async function markBackendRead(backendId) {
    if (!backendId) return;
    const item = facultyBackendItems.find(x => String(x.backendId) === String(backendId));
    if (item && !item.read) {
        item.read = true;
        renderFacultyNotificationList();
        if (facultyNotifBadge) {
            const unread = facultyBackendItems.filter(x => !x.read).length;
            facultyNotifBadge.textContent = unread;
            facultyNotifBadge.classList.toggle('visible', unread > 0);
        }
    }
    if (!backendNotifsEnabled()) return;
    try {
        await userApi('POST', `/api/notifications/${backendId}/read`);
    } catch (e) { /* non-fatal */ }
}

async function clearStudentNotifications() {
    notifications = notifications.filter(n => n.backendId == null);
    updateNotifUI();
    if (!backendNotifsEnabled()) return;
    try {
        await userApi('DELETE', '/api/notifications');
    } catch (e) { /* non-fatal */ }
}

// ── Faculty: backend feed + reply + conversation ────────────────────
async function refreshFacultyNotifications() {
    if (!currentUser || currentUser.type !== 'faculty') return;
    const data = await loadBackendNotifications();
    if (!data) return;
    facultyBackendItems = (data.notifications || []).map(n => ({
        id: n.notification_id,
        backendId: n.notification_id,
        threadId: n.thread_id,
        type: 'announcement',
        title: n.sender_name
            ? `${n.sender_name}${n.bus_number ? ` · Bus ${n.bus_number}` : ''}${n.route_name ? ` · ${n.route_name}` : ''}`
            : 'Driver',
        body: n.message,
        time: fmtNotifTime(n.created_at),
        read: !!n.is_read,
        routeId: n.route_id != null ? String(n.route_id) : '',
        sender: n.sender_name || '',
        senderRole: n.sender_role,
        isBackend: true,
    }));
    renderFacultyNotificationList();
    if (facultyNotifBadge) {
        const unread = data.unread_count || 0;
        facultyNotifBadge.textContent = unread;
        facultyNotifBadge.classList.toggle('visible', unread > 0);
    }
}

window.toggleFacultyReply = function (id) {
    const box = document.querySelector(`.notif-reply-box[data-reply-box="${id}"]`);
    if (box) box.hidden = !box.hidden;
};

window.sendFacultyReply = async function (id) {
    const input = document.querySelector(`.notif-reply-input[data-reply-input="${id}"]`);
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) { showToast('warning', 'Empty Reply', 'Please type a reply first.'); return; }
    if (!backendNotifsEnabled()) { showToast('error', 'Offline', 'Replies require the backend server.'); return; }
    try {
        await userApi('POST', `/api/notifications/${id}/reply`, { message: msg });
        showToast('success', 'Reply Sent', 'Your reply has been sent to the driver.');
        input.value = '';
        const box = document.querySelector(`.notif-reply-box[data-reply-box="${id}"]`);
        if (box) box.hidden = true;
        await refreshFacultyNotifications();
    } catch (e) {
        showToast('error', 'Reply Failed', String(e && e.message || e));
    }
};

window.toggleFacultyThread = async function (id) {
    const item = facultyBackendItems.find(x => String(x.backendId) === String(id));
    const bodyEl = document.querySelector(`.notif-thread[data-thread-body="${id}"]`);
    if (!item || !bodyEl) return;
    if (bodyEl.dataset.loaded === '1') { bodyEl.hidden = !bodyEl.hidden; return; }
    if (!backendNotifsEnabled()) return;
    try {
        const data = await userApi('GET', `/api/notifications/thread/${item.threadId}`);
        const msgs = data.messages || [];
        bodyEl.innerHTML = msgs.map(m => {
            const isMe = m.sender_id == currentUser.data.id;
            const roleLabel = m.sender_role === 'student' ? 'Student' : (m.sender_role === 'faculty' ? 'Faculty' : 'Driver');
            return `
                <div class="notif-thread-msg${isMe ? ' notif-thread-msg--mine' : ''}">
                    <div class="notif-thread-msg__meta">
                        <span class="notif-role-tag notif-role-tag--${m.sender_role}">${roleLabel}</span>
                        <strong>${m.sender_name || 'Unknown'}</strong>
                        <span class="notif-time">${fmtNotifTime(m.created_at)}</span>
                    </div>
                    <p>${m.message}</p>
                </div>`;
        }).join('') || '<div class="empty-state"><p>No messages in this conversation</p></div>';
        bodyEl.dataset.loaded = '1';
        bodyEl.hidden = false;
    } catch (e) {
        showToast('error', 'Load Failed', String(e && e.message || e));
    }
};

async function clearFacultyNotifications() {
    facultyBackendItems = [];
    renderFacultyNotificationList();
    if (!backendNotifsEnabled()) return;
    try {
        await userApi('DELETE', '/api/notifications');
        if (facultyNotifBadge) {
            facultyNotifBadge.textContent = '0';
            facultyNotifBadge.classList.remove('visible');
        }
    } catch (e) { /* non-fatal */ }
}

// ── Driver: replies from students & faculty ─────────────────────────
async function refreshDriverReplies() {
    if (!currentUser || currentUser.type !== 'driver') return;
    const bodyEl = $('#driver-replies-body');
    if (!bodyEl) return;
    if (!backendNotifsEnabled()) {
        driverNotifReplies = [];
        renderDriverReplies();
        return;
    }
    const data = await loadBackendNotifications();
    if (!data) return;
    driverNotifReplies = data.notifications || [];
    renderDriverReplies();
    if (data.unread_count && $('#driver-replies-summary')) {
        $('#driver-replies-summary').textContent = `${driverNotifReplies.filter(r => r.reply_to != null).length} Responses`;
    }
}

function renderDriverReplies() {
    const bodyEl = $('#driver-replies-body');
    const summaryEl = $('#driver-replies-summary');
    if (!bodyEl) return;
    const rows = driverNotifReplies.filter(r => r.reply_to != null);
    if (summaryEl) summaryEl.textContent = `${rows.length} Response${rows.length === 1 ? '' : 's'}`;
    if (!rows.length) {
        bodyEl.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <p>No responses yet</p>
                <span>Replies from students and faculty appear here</span>
            </div>`;
        return;
    }
    bodyEl.innerHTML = rows.map(r => {
        const roleLabel = r.sender_role === 'student' ? 'Student' : (r.sender_role === 'faculty' ? 'Faculty' : 'Driver');
        return `
            <div class="reply-item">
                <div class="reply-item__head">
                    <span class="notif-role-tag notif-role-tag--${r.sender_role}">${roleLabel}</span>
                    <strong>${r.sender_name || 'Unknown'}</strong>
                    ${r.bus_number ? `<span class="reply-bus">Bus ${r.bus_number}</span>` : ''}
                    ${r.route_name ? `<span class="reply-bus">${r.route_name}</span>` : ''}
                    <span class="notif-time">${fmtNotifTime(r.created_at)}</span>
                </div>
                <p class="reply-msg">${r.message}</p>
                <button class="btn-notif-thread" data-driver-thread="${r.thread_id}">View conversation</button>
                <div class="notif-thread" data-driver-thread-body="${r.thread_id}"></div>
            </div>`;
    }).join('');
}

document.addEventListener('click', (e) => {
    const driverThreadBtn = e.target.closest('[data-driver-thread]');
    if (driverThreadBtn) {
        const threadId = driverThreadBtn.dataset.driverThread;
        const bodyEl = document.querySelector(`[data-driver-thread-body="${threadId}"]`);
        if (bodyEl) {
            if (bodyEl.dataset.loaded === '1') { bodyEl.hidden = !bodyEl.hidden; return; }
            if (!backendNotifsEnabled()) return;
            userApi('GET', `/api/notifications/thread/${threadId}`)
                .then(data => {
                    const msgs = data.messages || [];
                    bodyEl.innerHTML = msgs.map(m => {
                        const roleLabel = m.sender_role === 'student' ? 'Student' : (m.sender_role === 'faculty' ? 'Faculty' : 'Driver');
                        return `
                            <div class="notif-thread-msg">
                                <div class="notif-thread-msg__meta">
                                    <span class="notif-role-tag notif-role-tag--${m.sender_role}">${roleLabel}</span>
                                    <strong>${m.sender_name || 'Unknown'}</strong>
                                    <span class="notif-time">${fmtNotifTime(m.created_at)}</span>
                                </div>
                                <p>${m.message}</p>
                            </div>`;
                    }).join('') || '<div class="empty-state"><p>No messages</p></div>';
                    bodyEl.dataset.loaded = '1';
                    bodyEl.hidden = false;
                })
                .catch(err => showToast('error', 'Load Failed', String(err && err.message || err)));
        }
        return;
    }
});

// ── Polling so notifications feel live while a user is logged in ────
function notifPollStart() {
    notifPollStop();
    if (!currentUser || !currentSessionToken()) return;
    notifPollTimer = setInterval(() => {
        if (!currentUser) { notifPollStop(); return; }
        if (currentUser.type === 'student') refreshStudentNotifications();
        else if (currentUser.type === 'faculty') refreshFacultyNotifications();
        else if (currentUser.type === 'driver') refreshDriverReplies();
    }, 15000);
}

function notifPollStop() {
    if (notifPollTimer) {
        clearInterval(notifPollTimer);
        notifPollTimer = null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════
notifBell.addEventListener('click', () => {
    // Switch to dashboard tab if on tracking
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $('#tab-dashboard').classList.add('active');
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    $('#content-dashboard').classList.add('active');
    setTimeout(() => {
        $('#notification-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
});

btnClearNotif.addEventListener('click', () => {
    clearStudentNotifications();
    showToast('info', 'Cleared', 'All notifications have been cleared.');
});

function updateNotifUI() {
    const visibleNotifications = notifications.filter(n => {
        if (!currentUser || currentUser.type !== 'student') return true;
        return n.routeId === currentUser.route.id;
    });

    const count = visibleNotifications.length;
    notifBadge.textContent = count;
    notifBadge.classList.toggle('visible', count > 0);
    notifBell.classList.toggle('has-notif', count > 0);

    if (count === 0) {
        notifList.innerHTML = `<div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            <p>No notifications yet</p><span>You'll see updates from your bus driver here</span></div>`;
        return;
    }
    notifList.innerHTML = visibleNotifications.slice().reverse().map(n => {
        const isDeparture = n.msg.includes('🏠') || n.msg.toLowerCase().includes('departing from college');
        let actionsHtml = '';
        if (isDeparture && currentUser && currentUser.type === 'student') {
            const respKey = `${currentUser.passNo}_${n.id}`;
            const existingResp = studentResponses[respKey];
            if (existingResp) {
                actionsHtml = `<div class="notif-response-status">Status: <strong>${existingResp}</strong></div>`;
            } else {
                actionsHtml = `
                    <div class="notif-actions">
                        <button class="btn-notif-choice btn-notif-choice--ready" onclick="submitCheckin(${n.id}, 'Ready')">Ready</button>
                        <button class="btn-notif-choice btn-notif-choice--wait" onclick="submitCheckin(${n.id}, 'Attending Lecture')">Attending Lecture, Please Wait</button>
                    </div>
                `;
            }
        }

        const isBackend = n.backendId != null;
        const busLabel = n.busNumber ? ` · Bus ${n.busNumber}` : '';
        const routeLabel = n.route != null ? ` · Route ${n.route}` : '';
        const markReadAttr = isBackend ? ` onclick="markNotifRead(${n.backendId})"` : '';

        return `
            <div class="notif-item${n.unread ? ' notif-item--unread' : ''}"${markReadAttr}>
                <div class="notif-icon notif-icon--${n.iconType}">${n.iconEmoji}</div>
                <div class="notif-body">
                    <div class="notif-body__header">
                        <span class="notif-driver">${n.driver}${routeLabel}${busLabel}</span>
                        <span class="notif-time">${n.time}</span>
                    </div>
                    <p class="notif-msg">${n.msg}</p>
                    ${actionsHtml}
                </div>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════════
// GPS SIMULATION
// ═══════════════════════════════════════════════════════════════════
function startGPSSimulation() {
    if (gpsSimInterval) clearInterval(gpsSimInterval);

    // Initialize bus positions for all en-route trips
    busSim = {};
    ROUTES.forEach(route => {
        route.trips.forEach((trip, idx) => {
            const status = getTripStatus(trip);
            if (status === 'enroute') {
                const dep = parseTime(trip.departure);
                const arr = parseTime(trip.arrival);
                const now = nowMinutes();
                const progress = Math.min(1, Math.max(0, (now - dep) / (arr - dep)));
                const stopIdx = Math.min(Math.floor(progress * (route.stops.length - 1)), route.stops.length - 2);
                const localProg = (progress * (route.stops.length - 1)) - stopIdx;

                // If we have a computed route path, place the bus on that path according to progress
                if (routePathMetrics[route.id]) {
                    const pos = getPointOnRoute(route.id, progress);
                    busSim[trip.busNo] = {
                        routeId: route.id,
                        routeColor: route.color,
                        tripIdx: idx,
                        progress,
                        lat: pos[0],
                        lng: pos[1],
                        heading: getRouteHeading(route.id, progress),
                        speed: 25 + Math.random() * 25,
                        nextStopIdx: stopIdx + 1,
                        driver: trip.driver,
                        busNo: trip.busNo,
                        busId: trip.busId,
                    };
                } else {
                    const fromStop = route.stops[stopIdx];
                    const toStop = route.stops[stopIdx + 1];
                    busSim[trip.busNo] = {
                        routeId: route.id,
                        routeColor: route.color,
                        tripIdx: idx,
                        progress,
                        lat: fromStop.lat + (toStop.lat - fromStop.lat) * localProg,
                        lng: fromStop.lng + (toStop.lng - fromStop.lng) * localProg,
                        heading: getRouteHeading(route.id, progress),
                        speed: 25 + Math.random() * 25,
                        nextStopIdx: stopIdx + 1,
                        driver: trip.driver,
                        busNo: trip.busNo,
                        busId: trip.busId,
                    };
                }
            }
        });
    });

    // Simulate movement every 2 seconds
    gpsSimInterval = setInterval(() => {
        Object.keys(busSim).forEach(busNo => {
            const sim = busSim[busNo];
            const route = ROUTES.find(r => r.id === sim.routeId);
            if (!route) return;

            // Move progress forward
            sim.progress = Math.min(1, sim.progress + 0.002 + Math.random() * 0.003);
            const stopCount = route.stops.length;
            const rawIdx = sim.progress * (stopCount - 1);
            const stopIdx = Math.min(Math.floor(rawIdx), stopCount - 2);
            const localProg = rawIdx - stopIdx;

            // If we have a route path, snap to it according to progress
            if (routePathMetrics[sim.routeId]) {
                const pos = getPointOnRoute(sim.routeId, sim.progress);
                // small jitter for realism
                sim.lat = pos[0] + (Math.random() - 0.5) * 0.00003;
                sim.lng = pos[1] + (Math.random() - 0.5) * 0.00003;
            } else {
                const fromStop = route.stops[stopIdx];
                const toStop = route.stops[stopIdx + 1];
                sim.lat = fromStop.lat + (toStop.lat - fromStop.lat) * localProg + (Math.random() - 0.5) * 0.0003;
                sim.lng = fromStop.lng + (toStop.lng - fromStop.lng) * localProg + (Math.random() - 0.5) * 0.0003;
            }
            sim.heading = getRouteHeading(sim.routeId, sim.progress);
            sim.speed = Math.max(10, Math.min(60, sim.speed + (Math.random() - 0.5) * 8));
            sim.nextStopIdx = stopIdx + 1;

            // If arrived, remove
            if (sim.progress >= 1) {
                delete busSim[busNo];
            }
        });

        // Also check for newly en-route trips
        ROUTES.forEach(route => {
            route.trips.forEach((trip, idx) => {
                if (getTripStatus(trip) === 'enroute' && !busSim[trip.busNo]) {
                    busSim[trip.busNo] = {
                        routeId: route.id, routeColor: route.color, tripIdx: idx,
                        progress: 0, lat: route.stops[0].lat, lng: route.stops[0].lng,
                        speed: 15 + Math.random() * 10, nextStopIdx: 1,
                        driver: trip.driver, busNo: trip.busNo,
                        busId: trip.busId,
                    };
                }
            });
        });

        // Fetch live locations from the backend (when available)
        fetchLiveLocations();

        // Update map markers
        updateMapMarkers();
        updateActiveBusList();
        if (facultyMap) updateFacultyMap();
        if (currentUser && currentUser.type === 'admin') {
            updateAdminFleetTable();
        }
        if (selectedBusNo && mapBusInfo.classList.contains('visible')) {
            updateBusInfoPanel(selectedBusNo, false);
        }
    }, 2000);
}

// ── Live bus locations from the Flask backend ─────────────────────
// Overrides simulated positions with real /api/buses/<id>/location
// data whenever the API is reachable. Falls back to the demo movement.
let liveLocationFetchInFlight = false;

async function fetchLiveLocations() {
    if (!API_AVAILABLE || liveLocationFetchInFlight) return;
    liveLocationFetchInFlight = true;
    try {
        await Promise.all(Object.keys(busSim).map(async (busNo) => {
            const sim = busSim[busNo];
            if (!sim || !sim.busId) return;
            try {
                const loc = await apiGet(`/api/buses/${sim.busId}/location`);
                sim.lat = parseFloat(loc.latitude);
                sim.lng = parseFloat(loc.longitude);
                if (loc.speed) sim.speed = parseFloat(loc.speed);
                if (loc.heading) sim.heading = parseFloat(loc.heading);
                const updatedAt = loc.updated_at ? new Date(String(loc.updated_at).replace(' ', 'T')).getTime() : 0;
                sim.live = !updatedAt || (Date.now() - updatedAt) <= 90 * 1000;
                if (!sim.live) sim.locationStale = true;
                else sim.locationStale = false;
            } catch (e) {
                // No location row for this bus yet → keep simulated movement
            }
        }));
    } catch (err) {
        console.warn('[API] Live location fetch failed.', err);
    } finally {
        liveLocationFetchInFlight = false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// LIVE MAP (Leaflet + OpenStreetMap)
// ═══════════════════════════════════════════════════════════════════
let mapInitialized = false;

function initMap() {
    if (mapInitialized) {
        liveMap.invalidateSize();
        updateMapMarkers();
        return;
    }

    // Sector 112 (CGC Landran) coordinates
    const sector112 = [30.7069, 76.6512];

    // Center on CGC Landran (Sector 112) using OpenStreetMap as default
    liveMap = L.map('live-map', {
        center: sector112,
        zoom: 15,
        zoomControl: true,
    });

    // 1. Dark Styled Map (CartoDB Dark Matter)
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
    });

    // 2. Street Map Layer (Standard OpenStreetMap)
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
    });

    // 3. Satellite Imagery Layer (Esri World Imagery)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
    });

    // Default to Street Map (real OpenStreetMap)
    streetLayer.addTo(liveMap);

    // Setup base layers switcher control
    const baseLayers = {
        "Dark Mode Map": darkLayer,
        "Street Map (OSM)": streetLayer,
        "Satellite Imagery": satelliteLayer
    };
    L.control.layers(baseLayers, null, { position: 'topright' }).addTo(liveMap);

    // Draw route lines
    const routeColors = {
        a: '#818cf8', b: '#10b981', c: '#f59e0b',
        d: '#a855f7', e: '#06b6d4', f: '#ef4444',
    };
    // Unified track and stop colors per user request
    const trackColor = '#1e40af'; // dark blue
    const stopColor = '#ff4d4d';  // red
    ROUTES.forEach(route => {
        // Draw an initial straight polyline as a fallback and placeholder
        const latlngs = route.stops.map(s => [s.lat, s.lng]);
        routePolylines[route.id] = L.polyline(latlngs, {
            color: trackColor,
            weight: 5,
            opacity: 0.85,
            dashArray: '8, 8',
        }).addTo(liveMap);
        // store path metrics for this route (used to move buses along the path)
        computeRoutePathMetrics(route.id, latlngs);

        // Stop markers: use a custom pin icon (red pin with bus inside)
        route.stops.forEach(stop => {
            const pinHtml = `
                <div style="width:28px;height:38px;position:relative;display:flex;align-items:flex-start;justify-content:center;">
                    <svg width="28" height="38" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C7 0 3.5 3.5 3.5 8.5 3.5 15 12 32 12 32s8.5-17 8.5-23.5C20.5 3.5 16.99 0 12 0z" fill="${stopColor}"/>
                        <circle cx="12" cy="9" r="4.2" fill="#ffffff"/>
                    </svg>
                    <div style="position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);pointer-events:none;">
                        <svg width="16" height="12" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect x="1" y="2" width="22" height="8" rx="2" fill="#222" />
                            <rect x="4" y="4" width="3" height="3" rx="0.5" fill="#fff" />
                            <rect x="9" y="4" width="3" height="3" rx="0.5" fill="#fff" />
                            <rect x="14" y="4" width="3" height="3" rx="0.5" fill="#fff" />
                            <circle cx="6" cy="12" r="1.2" fill="#222" />
                            <circle cx="18" cy="12" r="1.2" fill="#222" />
                        </svg>
                    </div>
                </div>
            `;
            const stopIdx = route.stops.findIndex(s => s.name === stop.name);
            const busScheduleMap = {};
            route.trips.forEach(trip => {
                const stopTime = getStopTimeForTrip(route, trip, stopIdx);
                if (!busScheduleMap[trip.busNo]) busScheduleMap[trip.busNo] = [];
                busScheduleMap[trip.busNo].push(stopTime);
            });
            const busRows = Object.entries(busScheduleMap).map(([busNo, times]) => {
                const displayTimes = [...new Set(times)].join(' / ');
                return `<div style="margin-bottom:0.25rem; display:flex; justify-content:space-between; gap:0.75rem;">
                    <span style="font-weight:700;">${busNo}</span>
                    <span style="color:var(--text-secondary); font-size:0.82rem; white-space:nowrap;">${displayTimes}</span>
                </div>`;
            }).join('');

            const icon = L.divIcon({ html: pinHtml, className: '', iconSize: [28, 38], iconAnchor: [14, 38] });
            const marker = L.marker([stop.lat, stop.lng], { icon });
            marker.routeId = route.id;
            marker.addTo(liveMap);
            marker.bindPopup(`
                <strong>${stop.name}</strong><br>
                <small>Route ${route.id}</small>
                <div style="margin-top:0.7rem; font-size:0.9rem; color:var(--text-secondary); line-height:1.4;">
                    ${busRows}
                </div>
            `);
            stopMarkers.push(marker);
        });
    });

    // Replace straight polylines with routed polylines following roads.
    // Prefers the geometry saved by the Admin route editor (single source of
    // truth); falls back to live OSRM routing and finally straight lines.
    async function buildRoutePolylines() {
        for (const route of ROUTES) {
            let latlngs = null;
            if (route.geometry && Array.isArray(route.geometry) && route.geometry.length >= 2) {
                latlngs = route.geometry
                    .map(p => [parseFloat(p[0]), parseFloat(p[1])])
                    .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
                if (latlngs.length < 2) latlngs = null;
            }
            if (!latlngs) {
                try {
                    const coords = route.stops.map(s => `${s.lng},${s.lat}`).join(';');
                    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
                    const resp = await fetch(url);
                    if (!resp.ok) throw new Error('Routing fetch failed');
                    const data = await resp.json();
                    if (!data.routes || !data.routes[0] || !data.routes[0].geometry) throw new Error('No route geometry');

                    const geo = data.routes[0].geometry.coordinates; // [lng,lat]
                    latlngs = geo.map(c => [c[1], c[0]]);
                } catch (err) {
                    console.warn('Routing failed for route', route.id, err);
                    continue; // keep fallback straight polyline already added
                }
            }

            // Remove existing placeholder polyline
            if (routePolylines[route.id]) {
                try { liveMap.removeLayer(routePolylines[route.id]); } catch(e) {}
            }

            // Add routed polyline (use unified track color)
            routePolylines[route.id] = L.polyline(latlngs, {
                color: trackColor,
                weight: 4,
                opacity: 0.85,
            }).addTo(liveMap);
            // update path metrics with routed geometry
            computeRoutePathMetrics(route.id, latlngs);
        }
    }

    // Start fetching routed geometries (async, don't block UI)
    buildRoutePolylines();

    // Persistent marker for CGC Landran (Sector 112)
    const campusMarker = L.marker(sector112, {
        title: 'CGC Landran (Sector 112)'
    }).addTo(liveMap);
    campusMarker.bindPopup('<strong>CGC Landran, Mohali</strong><br>Sector 112, Landran, Sahibzada Ajit Singh Nagar, Punjab 140307');
    // Open popup briefly on init
    campusMarker.openPopup();

    // Populate route selector with ALL routes
    trackRouteSelect.innerHTML = '<option value="">All Routes</option>';
    ROUTES.forEach(r => {
        const isMyRoute = (currentUser && currentUser.route && currentUser.route.id === r.id);
        const marker = isMyRoute ? ' (★ Your Route)' : '';
        trackRouteSelect.innerHTML += `<option value="${r.id}">Route ${r.id} — ${r.name}${marker}</option>`;
    });

    // Default to the student's route if applicable
    if (currentUser && currentUser.type === 'student' && currentUser.route) {
        trackRouteSelect.value = currentUser.route.id;
    }

    trackRouteSelect.addEventListener('change', () => {
        updateBusSelect();
        filterMapView();
    });

    trackBusSelect.addEventListener('change', () => {
        const busNo = trackBusSelect.value;
        if (busNo) focusBusOnMap(busNo);
    });

    if (showSpeedToggle) {
        showSpeedToggle.addEventListener('change', () => {
            const busNo = selectedBusNo || trackBusSelect.value;
            if (busNo) {
                showBusInfo(busNo);
            }
        });
    }

    $('#btn-refresh-location').addEventListener('click', () => {
        const busNo = trackBusSelect.value;
        if (busNo && busSim[busNo]) {
            liveMap.setView([busSim[busNo].lat, busSim[busNo].lng], 15, { animate: true });
        } else {
            liveMap.setView(sector112, 15, { animate: true });
            campusMarker.openPopup();
        }
    });

    $('#map-info-close').addEventListener('click', () => {
        mapBusInfo.classList.remove('visible');
    });

    mapInitialized = true;
    updateBusSelect();
    updateMapMarkers();
    updateActiveBusList();
    // Add the student's pickup marker if a student is logged in
    addStudentPickupMarker();
}

function updateBusSelect() {
    const routeId = trackRouteSelect.value;
    trackBusSelect.innerHTML = '<option value="">All Buses</option>';

    const buses = new Map();
    ROUTES.forEach(route => {
        if (routeId && route.id !== routeId) return;
        route.trips.forEach(trip => {
            if (!buses.has(trip.busNo)) {
                buses.set(trip.busNo, route.id);
            }
        });
    });

    buses.forEach((routeIdForBus, busNo) => {
        trackBusSelect.innerHTML += `<option value="${busNo}">${busNo} (Route ${routeIdForBus})</option>`;
    });
}

function updateMapMarkers() {
    if (!liveMap) return;

    const routeColors = {
        a: '#818cf8', b: '#10b981', c: '#f59e0b',
        d: '#a855f7', e: '#06b6d4', f: '#ef4444',
    };

    // Remove markers for buses no longer active
    Object.keys(busMarkers).forEach(busNo => {
        if (!busSim[busNo]) {
            liveMap.removeLayer(busMarkers[busNo]);
            delete busMarkers[busNo];
        }
    });

    // Update or create markers
    Object.keys(busSim).forEach(busNo => {
        const sim = busSim[busNo];
        const color = routeColors[sim.routeColor] || '#818cf8';
        const heading = sim.heading || getRouteHeading(sim.routeId, sim.progress);

        if (busMarkers[busNo]) {
            busMarkers[busNo].setLatLng([sim.lat, sim.lng]);
            busMarkers[busNo].setIcon(createBusIcon(color, heading));
        } else {
            const icon = createBusIcon(color, heading);
            busMarkers[busNo] = L.marker([sim.lat, sim.lng], { icon })
                .addTo(liveMap)
                .on('click', () => showBusInfo(busNo));
        }
    });
    // Ensure student's pickup marker remains present when map updates
    addStudentPickupMarker();
}

function getTrafficStatus(speed) {
    if (speed < 20) return { label: 'Heavy', color: '#e74c3c' };
    if (speed < 40) return { label: 'Moderate', color: '#f39c12' };
    return { label: 'Light', color: '#2ecc71' };
}

function updateBusInfoPanel(busNo, shouldCenter = true) {
    const sim = busSim[busNo];
    if (!sim) {
        if (selectedBusNo === busNo) {
            selectedBusNo = null;
            mapBusInfo.classList.remove('visible');
        }
        return;
    }
    const route = ROUTES.find(r => r.id === sim.routeId);
    if (!route) return;

    const nextStop = route.stops[sim.nextStopIdx] || route.stops[route.stops.length - 1];
    const stopsLeft = route.stops.length - sim.nextStopIdx;
    const etaMin = Math.max(1, Math.round((1 - sim.progress) * (parseTime(route.trips[sim.tripIdx].arrival) - parseTime(route.trips[sim.tripIdx].departure))));

    $('#map-info-badge').textContent = `Route ${sim.routeId}`;
    $('#map-info-badge').className = `map-info-badge route-badge--${sim.routeColor}`;
    $('#map-info-bus').textContent = sim.busNo;
    $('#map-info-driver').textContent = `Driver: ${sim.driver}`;

    const showSpeed = showSpeedToggle ? showSpeedToggle.checked : true;
    const traffic = getTrafficStatus(sim.speed);
    $('#map-info-speed').textContent = showSpeed ? `Speed: ${Math.round(sim.speed)} km/h` : '';
    if (mapInfoTraffic) {
        mapInfoTraffic.textContent = showSpeed ? `Traffic: ${traffic.label}` : '';
        mapInfoTraffic.style.display = showSpeed ? 'inline-block' : 'none';
        mapInfoTraffic.style.color = traffic.color;
    }

    $('#map-info-eta').textContent = `ETA to campus: ${etaMin} min`;
    $('#map-info-next-stop').textContent = `Next: ${nextStop.name} (${stopsLeft} stop${stopsLeft !== 1 ? 's' : ''} left)`;

    selectedBusNo = busNo;
    mapBusInfo.classList.add('visible');
    if (shouldCenter) {
        liveMap.setView([sim.lat, sim.lng], 15, { animate: true });
    }
}

function showBusInfo(busNo) {
    updateBusInfoPanel(busNo, true);
}

function focusBusOnMap(busNo) {
    if (busSim[busNo]) {
        showBusInfo(busNo);
    }
}

function filterMapView() {
    if (!liveMap) return;
    const routeId = trackRouteSelect.value;

    // Show/hide route polylines
    Object.keys(routePolylines).forEach(rid => {
        if (!routeId || rid === routeId) {
            routePolylines[rid].setStyle({ opacity: 0.5 });
        } else {
            routePolylines[rid].setStyle({ opacity: 0.1 });
        }
    });

    // Show/hide stop markers depending on selected route
    stopMarkers.forEach(marker => {
        if (!routeId || marker.routeId === routeId) {
            if (!liveMap.hasLayer(marker)) marker.addTo(liveMap);
        } else {
            if (liveMap.hasLayer(marker)) liveMap.removeLayer(marker);
        }
    });

    // Fit to selected route
    if (routeId) {
        const route = ROUTES.find(r => r.id === routeId);
        if (route) {
            let bounds = null;
            if (routePolylines[routeId] && typeof routePolylines[routeId].getBounds === 'function') {
                bounds = routePolylines[routeId].getBounds();
            } else {
                bounds = L.latLngBounds(route.stops.map(s => [s.lat, s.lng]));
            }
            liveMap.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    } else {
        liveMap.setView([30.7069, 76.6512], 15, { animate: true });
    }
}

function updateActiveBusList() {
    const routeColors = {
        a: '#818cf8', b: '#10b981', c: '#f59e0b',
        d: '#a855f7', e: '#06b6d4', f: '#ef4444',
    };

    const buses = Object.values(busSim);
    activeBusCount.textContent = `${buses.length} bus${buses.length !== 1 ? 'es' : ''} running`;

    if (buses.length === 0) {
        activeBusList.innerHTML = `<div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><rect x="3" y="4" width="18" height="14" rx="3"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>
            <p>No buses are currently running</p><span>Buses will appear here when en route</span></div>`;
        return;
    }

    activeBusList.innerHTML = buses.map(sim => {
        const route = ROUTES.find(r => r.id === sim.routeId);
        const nextStop = route ? (route.stops[sim.nextStopIdx] || route.stops[route.stops.length - 1]) : { name: '—' };
        return `
            <div class="active-bus-item" onclick="focusBusOnMap('${sim.busNo}')">
                <div class="active-bus-marker" style="background:${routeColors[sim.routeColor]}22; color:${routeColors[sim.routeColor]}">🚌</div>
                <div class="active-bus-body">
                    <div class="active-bus-body__top">
                        <strong>${sim.busNo}</strong>
                        <span class="route-badge route-badge--${sim.routeColor}" style="font-size:0.65rem;padding:0.1rem 0.45rem;">Route ${sim.routeId}</span>
                    </div>
                    <div class="active-bus-body__bottom">${sim.driver} · Next: ${nextStop.name}</div>
                </div>
                <div class="active-bus-speed">${Math.round(sim.speed)}<small>km/h</small></div>
            </div>
        `;
    }).join('');
}

window.focusBusOnMap = focusBusOnMap;

// ═══════════════════════════════════════════════════════════════════
// DRIVER DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function openDriverDashboard() {
    switchPage(driverPage);
    // Reset to the dashboard tab so every session starts there
    $$('#driver-page .tab-btn').forEach(b => b.classList.remove('active'));
    const dashBtn = $('#tab-driver-home');
    if (dashBtn) dashBtn.classList.add('active');
    $$('#driver-page .tab-content').forEach(c => c.classList.remove('active'));
    const dashContent = $('#content-driver-dash');
    if (dashContent) dashContent.classList.add('active');
    const route = currentUser.route;
    const driver = currentUser.data;
    driverNameEl.textContent = driver.name;
    driverGreetEl.textContent = `${getGreeting()}, ${driver.name.split(' ')[0]}!`;
    driverRouteEl.textContent = `Route ${route.id} — ${route.name}`;
    driverBusEl.textContent = driver.busNo;
    driverStudentCnt.textContent = route.studentCount;

    driverRouteStops.innerHTML = route.stops.map(s => `
        <div class="timeline-stop">
            <span class="timeline-stop__name">${s.name}</span>
        </div>
    `).join('');

    renderDriverNavAvatar();
    renderDriverProfile();
    startGPSSimulation();
    renderDriverCheckins();
    initDriverTripUI();
    notifPollStart();
    refreshDriverReplies();
}

// ─── Driver Profile ────────────────────────────────────────────────────
function renderDriverNavAvatar() {
    if (!driverNavAvatar || !currentUser || currentUser.type !== 'driver') return;
    const d = currentUser.data || {};
    const name = d.name || 'Driver';
    const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'D';
    renderAvatar(driverNavAvatar, initials, d.avatar || '');
}

function renderDriverProfile() {
    if (!currentUser || currentUser.type !== 'driver') return;
    const d = currentUser.data || {};
    const route = currentUser.route;
    const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };

    const name = d.name || 'Driver';
    const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'D';

    const avatar = $('#driver-profile-avatar');
    renderAvatar(avatar, initials, d.avatar || '');
    setText('#driver-profile-name', name);
    setText('#driver-profile-role', 'Driver');
    setText('#driver-profile-id', currentUser.driverId || d.driverId || d.rollNo || '—');
    setText('#driver-profile-contact', d.contactNo || '—');
    setText('#driver-profile-email', d.email || '—');
    setText('#driver-profile-dept', d.department || '—');
    setText('#driver-profile-bus', d.busNo || '—');
    const routeLabel = route ? `Route ${route.id} — ${route.name}` : (d.route ? `Route ${d.route}` : '—');
    setText('#driver-profile-route', routeLabel);
    const busBadge = $('#driver-profile-bus-label');
    if (busBadge) busBadge.textContent = d.busNo ? `Bus ${d.busNo}` : 'Assigned Bus';
}

// ─── Edit Profile (Driver) ─────────────────────────────────────────────
const driverEditProfileModal = $('#driver-edit-profile-modal');
const driverEditProfileForm = $('#driver-edit-profile-form');
let pendingDriverAvatar = null;
let driverAvatarRemovePending = false;

function openDriverEditProfileModal() {
    if (!currentUser || currentUser.type !== 'driver' || !driverEditProfileModal) return;
    const d = currentUser.data || {};
    const setVal = (sel, val) => { const el = $(sel); if (el) el.value = val; };
    const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };
    pendingDriverAvatar = null;
    driverAvatarRemovePending = false;
    const photoInput = $('#driver-edit-profile-photo-input');
    if (photoInput) photoInput.value = '';
    const preview = $('#driver-edit-profile-avatar-preview');
    const name = d.name || 'Driver';
    const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'D';
    renderAvatar(preview, initials, d.avatar || '');
    const removeBtn = $('#driver-edit-profile-remove-photo');
    if (removeBtn) removeBtn.hidden = !d.avatar;
    setText('#driver-edit-profile-id', currentUser.driverId || d.driverId || '—');
    setText('#driver-edit-profile-bus', d.busNo || '—');
    setVal('#driver-edit-profile-name', d.name || '');
    setVal('#driver-edit-profile-email', d.email || '');
    setVal('#driver-edit-profile-contact', d.contactNo || '');
    setVal('#driver-edit-profile-dept', d.department || '');
    driverEditProfileModal.classList.add('open');
}

function closeDriverEditProfileModal() {
    if (driverEditProfileModal) driverEditProfileModal.classList.remove('open');
}

const btnDriverEditProfile = $('#btn-driver-edit-profile');
if (btnDriverEditProfile) btnDriverEditProfile.addEventListener('click', openDriverEditProfileModal);

const btnDriverEditProfileClose = $('#driver-edit-profile-close');
if (btnDriverEditProfileClose) btnDriverEditProfileClose.addEventListener('click', closeDriverEditProfileModal);

const btnDriverEditProfileCancel = $('#driver-edit-profile-cancel');
if (btnDriverEditProfileCancel) btnDriverEditProfileCancel.addEventListener('click', closeDriverEditProfileModal);

if (driverEditProfileModal) {
    driverEditProfileModal.addEventListener('click', (e) => {
        if (e.target === driverEditProfileModal) closeDriverEditProfileModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && driverEditProfileModal && driverEditProfileModal.classList.contains('open')) {
        closeDriverEditProfileModal();
    }
});

const btnDriverChangePhoto = $('#driver-edit-profile-change-photo');
const driverPhotoInput = $('#driver-edit-profile-photo-input');
if (btnDriverChangePhoto && driverPhotoInput) {
    btnDriverChangePhoto.addEventListener('click', () => driverPhotoInput.click());
    driverPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!/^image\/(jpeg|jpg|png)$/i.test(file.type)) {
            showToast('warning', 'Invalid image', 'Please choose a JPG, JPEG or PNG image.');
            driverPhotoInput.value = '';
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            showToast('warning', 'Image too large', 'Please choose an image under 2 MB.');
            driverPhotoInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            pendingDriverAvatar = String(reader.result);
            driverAvatarRemovePending = false;
            const preview = $('#driver-edit-profile-avatar-preview');
            if (preview) renderAvatar(preview, '', pendingDriverAvatar);
            const removeBtn = $('#driver-edit-profile-remove-photo');
            if (removeBtn) removeBtn.hidden = false;
        };
        reader.readAsDataURL(file);
    });
}

const btnDriverRemovePhoto = $('#driver-edit-profile-remove-photo');
if (btnDriverRemovePhoto) {
    btnDriverRemovePhoto.addEventListener('click', () => {
        driverAvatarRemovePending = true;
        pendingDriverAvatar = null;
        const photoInput = $('#driver-edit-profile-photo-input');
        if (photoInput) photoInput.value = '';
        const preview = $('#driver-edit-profile-avatar-preview');
        const name = (currentUser && currentUser.data && currentUser.data.name) || 'Driver';
        const initials = name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'D';
        if (preview) renderAvatar(preview, initials, '');
        btnDriverRemovePhoto.hidden = true;
    });
}

if (driverEditProfileForm) {
    driverEditProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || currentUser.type !== 'driver') return;
        const d = currentUser.data || {};

        const name = $('#driver-edit-profile-name').value.trim();
        const email = $('#driver-edit-profile-email').value.trim();
        const contactNo = $('#driver-edit-profile-contact').value.trim();
        const department = $('#driver-edit-profile-dept').value.trim();

        if (!name) { showToast('warning', 'Name required', 'Please enter your full name.'); return; }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('warning', 'Invalid email', 'Please enter a valid email address.'); return; }
        if (contactNo && !/^[0-9+\-\s]{7,15}$/.test(contactNo)) { showToast('warning', 'Invalid phone', 'Please enter a valid phone number.'); return; }

        let updated = false;
        if (typeof API_AVAILABLE !== 'undefined' && API_AVAILABLE) {
            try {
                await apiPost('/api/auth/driver/update-profile', {
                    id: currentUser.driverId,
                    pin: d.pin || '',
                    new_email: email,
                    name,
                    contact_no: contactNo,
                    department,
                    avatar: pendingDriverAvatar || '',
                    remove_avatar: driverAvatarRemovePending,
                });
                updated = true;
            } catch (err) {
                const msg = String((err && err.message) || err);
                if (/401|Incorrect PIN/i.test(msg)) { showToast('warning', 'Authentication failed', 'Please sign in again to update your profile.'); return; }
                if (/409|already registered/i.test(msg)) { showToast('warning', 'Email already used', msg); return; }
                if (/400|403|404/.test(msg)) { showToast('warning', 'Cannot update', msg); return; }
                console.warn('[API] Profile update unavailable, using local update.', err);
            }
        }

        const updatedData = Object.assign({}, d, {
            name,
            email: email.toLowerCase(),
            contactNo,
            department,
        });
        if (pendingDriverAvatar) updatedData.avatar = pendingDriverAvatar;
        else if (driverAvatarRemovePending) updatedData.avatar = null;
        currentUser.data = updatedData;
        const idKey = currentUser.driverId;
        if (idKey && DRIVERS[idKey]) {
            DRIVERS[idKey] = Object.assign({}, DRIVERS[idKey], updatedData);
        }
        localStorage.setItem('college-bus-tracker-drivers', JSON.stringify(DRIVERS));

        pendingDriverAvatar = null;
        driverAvatarRemovePending = false;
        const photoInput = $('#driver-edit-profile-photo-input');
        if (photoInput) photoInput.value = '';

        closeDriverEditProfileModal();
        renderDriverProfile();
        renderDriverNavAvatar();
        driverNameEl.textContent = updatedData.name;
        driverGreetEl.textContent = `${getGreeting()}, ${updatedData.name.split(' ')[0]}!`;
        showToast('success', 'Profile updated successfully', 'Your profile information has been updated.');
    });
}

// ═══════════════════════════════════════════════════════════════════
// DRIVER TRIP CONTROL (START TRIP / END TRIP & GPS BROADCAST)
// ═══════════════════════════════════════════════════════════════════
let activeDriverTrip = null; // { watchId, busId, tripId, routeId, startTime, status, accuracy, lastUpdate }
let autoEndTripWithLogout = false;

function initDriverTripUI() {
    const btnStart = $('#btn-start-trip');
    const btnEnd = $('#btn-end-trip');
    const logoutToggle = $('#end-trip-with-logout-toggle');

    if (btnStart) btnStart.onclick = startDriverTrip;
    if (btnEnd) btnEnd.onclick = endDriverTrip;
    if (logoutToggle) {
        logoutToggle.checked = autoEndTripWithLogout;
        logoutToggle.onchange = () => {
            autoEndTripWithLogout = !!logoutToggle.checked;
        };
    }

    updateTripUI();
}

function updateTripUI() {
    const badge = $('#trip-status-badge');
    const valStatus = $('#trip-val-status');
    const valBus = $('#trip-val-bus');
    const valTripId = $('#trip-val-tripid');
    const valAccuracy = $('#trip-val-accuracy');
    const valLastUpdate = $('#trip-val-lastupdate');
    const valStartTime = $('#trip-val-starttime');
    const btnStart = $('#btn-start-trip');
    const btnEnd = $('#btn-end-trip');

    if (!badge) return;

    if (!activeDriverTrip || activeDriverTrip.status === 'INACTIVE') {
        badge.textContent = 'INACTIVE';
        badge.className = 'trip-status-badge trip-status-badge--inactive';
        valStatus.textContent = 'INACTIVE';
        valBus.textContent = (currentUser && currentUser.data && currentUser.data.busNo) || '—';
        valTripId.textContent = '—';
        valAccuracy.textContent = '—';
        valLastUpdate.textContent = '—';
        valStartTime.textContent = '—';

        if (btnStart) btnStart.disabled = false;
        if (btnEnd) btnEnd.disabled = true;
    } else if (activeDriverTrip.status === 'ACTIVE') {
        badge.textContent = 'ACTIVE';
        badge.className = 'trip-status-badge trip-status-badge--active';
        valStatus.textContent = 'ACTIVE';
        valBus.textContent = activeDriverTrip.busNumber || activeDriverTrip.busId;
        valTripId.textContent = activeDriverTrip.tripId;
        valAccuracy.textContent = activeDriverTrip.accuracy || '± 0 m';
        valLastUpdate.textContent = activeDriverTrip.lastUpdate || 'Just now';
        valStartTime.textContent = activeDriverTrip.startTime || '—';

        if (btnStart) btnStart.disabled = true;
        if (btnEnd) btnEnd.disabled = false;
    } else if (activeDriverTrip.status === 'COMPLETED') {
        badge.textContent = 'COMPLETED';
        badge.className = 'trip-status-badge trip-status-badge--completed';
        valStatus.textContent = 'COMPLETED';
        valBus.textContent = activeDriverTrip.busNumber || activeDriverTrip.busId;
        valTripId.textContent = activeDriverTrip.tripId;
        valAccuracy.textContent = 'Session ended';
        valLastUpdate.textContent = activeDriverTrip.lastUpdate || '—';
        valStartTime.textContent = activeDriverTrip.startTime || '—';

        if (btnStart) btnStart.disabled = false;
        if (btnEnd) btnEnd.disabled = true;
    }
}

function startDriverTrip() {
    if (!currentUser || currentUser.type !== 'driver') return;

    const busId = currentUser.data.busId;
    const busNumber = currentUser.data.busNo || 'UNASSIGNED';
    if (!busId) { showToast('warning', 'Bus not assigned', 'Your driver account has no assigned bus. Contact the administrator.'); return; }
    const routeId = currentUser.route.id;
    const tripId = `TRIP-${routeId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    activeDriverTrip = {
        status: 'ACTIVE',
        busId: busId,
        busNumber: busNumber,
        tripId: tripId,
        routeId: routeId,
        startTime: startTime,
        lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        accuracy: 'Requesting GPS...',
        watchId: null
    };

    notifications.push({
        id: ++notifIdCounter,
        msg: '🚍 Bus departed — get ready at your stops on time.',
        driver: currentUser.data.name,
        route: routeId,
        routeId: routeId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        iconType: 'info',
        iconEmoji: '🚍',
    });
    updateNotifUI();

    updateTripUI();
    showToast('info', 'Trip Started', `Trip ${tripId} for Bus ${busNumber} is now active.`);

    // Request GPS location permission and listen for updates
    if ('geolocation' in navigator) {
        activeDriverTrip.watchId = navigator.geolocation.watchPosition(
            (position) => {
                if (!activeDriverTrip || activeDriverTrip.status !== 'ACTIVE') return;

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = Math.round(position.coords.accuracy);
                const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                activeDriverTrip.accuracy = `± ${accuracy} m`;
                activeDriverTrip.lastUpdate = nowTime;

                // Associate position with BUS ID and TRIP ID (NOT directly with driver's personal profile)
                if (!busSim[busNumber]) {
                    busSim[busNumber] = {
                        routeId: routeId,
                        routeColor: currentUser.route.color || 'a',
                        tripIdx: 0,
                        progress: 0.5,
                        lat: lat,
                        lng: lng,
                        speed: Math.round(position.coords.speed ? position.coords.speed * 3.6 : 30),
                        nextStopIdx: 1,
                        driver: currentUser.data.name,
                        busNo: busNumber,
                        tripId: tripId
                    };
                } else {
                    busSim[busNumber].lat = lat;
                    busSim[busNumber].lng = lng;
                    busSim[busNumber].tripId = tripId;
                    if (position.coords.speed) {
                        busSim[busNumber].speed = Math.round(position.coords.speed * 3.6);
                    }
                }

                // Send the driver's real GPS position to the backend so all
                // other devices can see the same live bus location.
                userApi('POST', `/api/buses/${encodeURIComponent(busId)}/location`, {
                    latitude: lat,
                    longitude: lng,
                    speed: position.coords.speed == null ? null : position.coords.speed * 3.6,
                    accuracy,
                    heading: position.coords.heading == null ? null : position.coords.heading,
                }).catch(err => console.warn('[GPS] Failed to publish location:', err));

                updateMapMarkers();
                updateActiveBusList();
                updateTripUI();
            },
            (error) => {
                console.warn('GPS location error:', error.message);
                if (activeDriverTrip && activeDriverTrip.status === 'ACTIVE') {
                    activeDriverTrip.accuracy = 'Active (Simulated route GPS)';
                    activeDriverTrip.lastUpdate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                    if (!busSim[busNumber]) {
                        const route = currentUser.route;
                        const startStop = route.stops[0];
                        busSim[busNumber] = {
                            routeId: routeId,
                            routeColor: route.color || 'a',
                            tripIdx: 0,
                            progress: 0.1,
                            lat: startStop.lat,
                            lng: startStop.lng,
                            speed: 35,
                            nextStopIdx: 1,
                            driver: currentUser.data.name,
                            busNo: busNumber,
                            tripId: tripId
                        };
                    }
                    updateMapMarkers();
                    updateActiveBusList();
                    updateTripUI();
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    } else {
        activeDriverTrip.accuracy = 'Active (No Geolocation HW)';
        updateTripUI();
    }
}

function endDriverTrip() {
    if (!activeDriverTrip || activeDriverTrip.status !== 'ACTIVE') return;

    // 1. Stop GPS updates
    if (activeDriverTrip.watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(activeDriverTrip.watchId);
        activeDriverTrip.watchId = null;
    }

    const busId = activeDriverTrip.busId;
    const tripId = activeDriverTrip.tripId;

    // 2. Mark trip as COMPLETED
    activeDriverTrip.status = 'COMPLETED';
    activeDriverTrip.lastUpdate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 3. Hide live location from students by removing active bus tracking
    if (busSim[activeDriverTrip.busNumber]) {
        delete busSim[activeDriverTrip.busNumber];
    }

    // 4. Update live map and active bus lists
    updateMapMarkers();
    updateActiveBusList();

    // 5. Update UI
    updateTripUI();
    showToast('success', 'Trip Completed', `Trip ${tripId} ended. Live location hidden from students.`);
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN PORTAL & LIVE TRACKING DASHBOARD
// ═══════════════════════════════════════════════════════════════════
let adminMap = null;
let adminMapMarkers = {};
let adminStoppedTrips = {}; // busNo -> { status: 'STOPPED BY ADMIN', time: '...' }

function openAdminDashboard() {
    switchPage(adminPage);
    $('#admin-name').textContent = currentUser.data.name;
    updateAdminFleetTable();
    setTimeout(() => {
        initAdminMap();
    }, 100);
    initAdminPortal();
}

function initAdminMap() {
    if (!document.getElementById('admin-live-map')) return;
    if (adminMap) {
        adminMap.invalidateSize();
        updateAdminMapMarkers();
        return;
    }
    const sector112 = [30.7069, 76.6512];
    adminMap = L.map('admin-live-map').setView(sector112, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(adminMap);

    L.marker(sector112).addTo(adminMap).bindPopup('<strong>CGC Landran Campus</strong><br>Sector 112, Landran');
    updateAdminMapMarkers();
}

function updateAdminMapMarkers() {
    if (!adminMap) return;

    // Remove old bus markers
    Object.keys(adminMapMarkers).forEach(busNo => {
        adminMap.removeLayer(adminMapMarkers[busNo]);
    });
    adminMapMarkers = {};

    // Plot all active running buses on admin map
    Object.keys(busSim).forEach(busNo => {
        const sim = busSim[busNo];
        const marker = L.marker([sim.lat, sim.lng], {
            icon: L.divIcon({
                className: 'bus-map-icon',
                html: `<div style="background:#10b981; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-shadow:0 0 12px rgba(16,185,129,0.6); border:2px solid #fff;">🚌</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(adminMap);

        marker.bindPopup(`<strong>Bus ${busNo}</strong><br>Route ${sim.routeId}<br>Driver: ${sim.driver}<br>Status: ACTIVE`);
        adminMapMarkers[busNo] = marker;
    });
}

function updateAdminFleetTable() {
    const tbody = $('#admin-fleet-tbody');
    if (!tbody) return;

    const fleetList = [];

    ROUTES.forEach(route => {
        route.trips.forEach(trip => {
            const busNo = trip.busNo;
            const driverName = trip.driver;
            const routeName = `Route ${route.id} — ${route.name}`;

            let status = 'INACTIVE';
            let statusClass = 'trip-status-chip--upcoming';
            let currentLoc = 'At Depot / Idle';
            let startTime = trip.departure;
            let endTime = trip.arrival;
            let lastUpdated = '—';
            let isRunning = false;

            if (adminStoppedTrips[busNo]) {
                status = 'STOPPED BY ADMIN';
                statusClass = 'trip-status-chip--departed';
                currentLoc = 'Trip Deactivated by Admin';
                lastUpdated = adminStoppedTrips[busNo].time;
            } else if (busSim[busNo]) {
                status = 'ACTIVE';
                statusClass = 'trip-status-chip--enroute';
                const sim = busSim[busNo];
                currentLoc = `${sim.lat.toFixed(4)}, ${sim.lng.toFixed(4)}`;
                startTime = (activeDriverTrip && activeDriverTrip.busNumber === busNo) ? activeDriverTrip.startTime : trip.departure;
                endTime = trip.arrival;
                lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                isRunning = true;
            } else if (activeDriverTrip && activeDriverTrip.busNumber === busNo) {
                status = activeDriverTrip.status;
                if (status === 'COMPLETED') statusClass = 'trip-status-chip--departed';
                if (status === 'ACTIVE') { statusClass = 'trip-status-chip--enroute'; isRunning = true; }
                startTime = activeDriverTrip.startTime;
                endTime = trip.arrival;
                lastUpdated = activeDriverTrip.lastUpdate || 'Just now';
            }

            fleetList.push({
                busNo,
                routeName,
                driverName,
                currentLoc,
                startTime,
                endTime,
                lastUpdated,
                status,
                statusClass,
                isRunning
            });
        });
    });

    const activeCount = fleetList.filter(f => f.status === 'ACTIVE').length;
    const totalBusesEl = $('#admin-stat-total-buses');
    const activeTripsEl = $('#admin-stat-active-trips');
    const totalDriversEl = $('#admin-stat-total-drivers');

    if (totalBusesEl) totalBusesEl.textContent = fleetList.length;
    if (activeTripsEl) activeTripsEl.textContent = activeCount;
    if (totalDriversEl) totalDriversEl.textContent = Object.keys(DRIVERS).length;

    tbody.innerHTML = fleetList.map(item => {
        const canDeactivate = item.status === 'ACTIVE';
        const actionBtn = canDeactivate
            ? `<button class="btn-deactivate-trip" onclick="deactivateTripByAdmin('${item.busNo}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> Stop Trip
               </button>`
            : `<span style="color:var(--text-muted); font-size:0.8rem;">—</span>`;

        return `
            <tr>
                <td><strong>${item.busNo}</strong></td>
                <td>${item.routeName}</td>
                <td>${item.driverName}</td>
                <td><small style="font-family:monospace; color:var(--text-secondary);">${item.currentLoc}</small></td>
                <td>${item.startTime}</td>
                <td>${item.endTime}</td>
                <td>${item.lastUpdated}</td>
                <td><span class="trip-status-chip ${item.statusClass}">${item.status === 'ACTIVE' ? '<span class="status-dot"></span>' : ''}${item.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');

    updateAdminMapMarkers();
}

window.deactivateTripByAdmin = function(busNo) {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    adminStoppedTrips[busNo] = { status: 'STOPPED BY ADMIN', time: nowTime };

    // Remove from active bus simulation
    if (busSim[busNo]) {
        delete busSim[busNo];
    }

    // Stop active driver trip if running on this bus
    if (activeDriverTrip && activeDriverTrip.busNumber === busNo) {
        if (activeDriverTrip.watchId !== null && 'geolocation' in navigator) {
            navigator.geolocation.clearWatch(activeDriverTrip.watchId);
            activeDriverTrip.watchId = null;
        }
        activeDriverTrip.status = 'STOPPED BY ADMIN';
        activeDriverTrip.lastUpdate = nowTime;
        updateTripUI();
    }

    // Refresh maps, bus lists, and admin table
    updateMapMarkers();
    updateActiveBusList();
    updateAdminFleetTable();

    showToast('warning', 'Trip Deactivated', `Admin deactivated trip for Bus ${busNo}. Live tracking stopped.`);
};


$$('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.quick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        customMessage.value = btn.dataset.msg;
    });
});

document.querySelectorAll('.notify-recipient-option input').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.notify-recipient-option').forEach(o =>
            o.classList.toggle('selected', o.querySelector('input').checked)
        );
    });
});

btnSendNotif.addEventListener('click', async () => {
    if (!currentUser || currentUser.type !== 'driver') return;
    const msg = customMessage.value.trim();
    if (!msg) { showToast('warning', 'Empty Message', 'Please select a quick alert or type a custom message.'); return; }

    const recipientInput = document.querySelector('input[name="notify-recipient"]:checked');
    const recipient = recipientInput ? recipientInput.value : 'students';
    const toStudents = recipient === 'students' || recipient === 'everyone';
    const toFaculty = recipient === 'faculty' || recipient === 'everyone';

    let iconType = 'info', iconEmoji = '📢';
    if (msg.includes('🕐') || msg.toLowerCase().includes('late')) { iconType = 'delay'; iconEmoji = '🕐'; }
    else if (msg.includes('🚧') || msg.toLowerCase().includes('breakdown')) { iconType = 'danger'; iconEmoji = '🚧'; }
    else if (msg.includes('❌') || msg.toLowerCase().includes('cancel')) { iconType = 'danger'; iconEmoji = '❌'; }
    else if (msg.includes('✅') || msg.toLowerCase().includes('on time')) { iconType = 'success'; iconEmoji = '✅'; }
    else if (msg.includes('🏠') || msg.toLowerCase().includes('for home')) { iconType = 'success'; iconEmoji = '🏠'; }
    else if (msg.includes('🏫') || msg.toLowerCase().includes('for college')) { iconType = 'info'; iconEmoji = '🏫'; }

    const routeId = currentUser.route ? String(currentUser.route.id)
        : (currentUser.data && currentUser.data.route != null ? String(currentUser.data.route) : '');
    if (!routeId) {
        showToast('error', 'No Route Assigned', 'You must be assigned to a route before sending notifications.');
        return;
    }

    // Backend path: persist the broadcast in the shared MySQL notifications
    // table and let each recipient's portal pick it up.
    if (backendNotifsEnabled()) {
        try {
            const res = await userApi('POST', '/api/notifications/send', { message: msg, audience: recipient });
            sendSuccess.classList.add('visible');
            setTimeout(() => sendSuccess.classList.remove('visible'), 3000);
            $$('.quick-btn').forEach(b => b.classList.remove('selected'));
            customMessage.value = '';
            const audience = recipient === 'everyone' ? 'students and faculty' : recipient === 'faculty' ? 'faculty' : 'students';
            showToast('success', 'Sent!', `Notification sent to ${res.sent} ${audience} on Route ${res.route_id || routeId}.`);
            renderDriverCheckins();
            await refreshDriverReplies();
        } catch (e) {
            showToast('error', 'Send Failed', String(e && e.message || e));
        }
        return;
    }

    const driverName = currentUser.data.name || 'Driver';
    const busNo = currentUser.data.busNo || '';
    const senderLabel = driverName + (busNo ? ` · Bus ${busNo}` : '');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Clear old check-ins if sending a departure message
    const isDeparture = msg.includes('🏠') || msg.toLowerCase().includes('departing from college');
    if (isDeparture && window.driverCheckins) {
        window.driverCheckins = window.driverCheckins.filter(c => c.routeId !== routeId);
    }

    if (toStudents) {
        notifications.push({
            id: ++notifIdCounter, msg,
            driver: currentUser.data.name, route: routeId,
            routeId,
            time,
            iconType, iconEmoji,
            recipients: recipient,
        });
    }

    if (toFaculty) {
        const facType = iconType === 'delay' ? 'bus_delay'
            : (iconType === 'danger' ? 'cancellation'
            : (iconType === 'success' ? 'announcement' : 'route_change'));
        facultyNotifications.push({
            id: 'fac-driver-' + (++notifIdCounter),
            type: facType,
            title: senderLabel,
            body: msg,
            time,
            read: false,
            routeId,
            sender: driverName,
        });
    }

    updateNotifUI();
    sendSuccess.classList.add('visible');
    setTimeout(() => sendSuccess.classList.remove('visible'), 3000);
    $$('.quick-btn').forEach(b => b.classList.remove('selected'));
    customMessage.value = '';
    const audience = recipient === 'everyone' ? 'students and faculty' : recipient === 'faculty' ? 'faculty' : 'students';
    showToast('success', 'Sent!', `Notification sent to ${audience} on Route ${routeId}.`);
    
    if (currentUser && currentUser.type === 'driver') {
        renderDriverCheckins();
    }
});

function renderDriverCheckins() {
    const checkinBody = $('#driver-checkin-body');
    const checkinSummary = $('#driver-checkin-summary');
    if (!checkinBody) return;

    if (!window.driverCheckins || window.driverCheckins.length === 0) {
        checkinSummary.textContent = "0 Responded";
        checkinBody.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <p>No active departure check-ins</p>
                <span>Student check-in updates will appear here in real-time</span>
            </div>
        `;
        return;
    }

    // Filter check-ins for this driver's route
    const routeCheckins = window.driverCheckins.filter(c => c.routeId === currentUser.route.id);
    const readyCount = routeCheckins.filter(c => c.choice === 'Ready').length;
    const waitCount = routeCheckins.filter(c => c.choice === 'Attending Lecture').length;

    checkinSummary.textContent = `${routeCheckins.length} Responded (${readyCount} Ready, ${waitCount} Delayed)`;

    if (routeCheckins.length === 0) {
        checkinBody.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <p>No responses from your students yet</p>
                <span>Waiting for responses on Route ${currentUser.route.id}</span>
            </div>
        `;
        return;
    }

    checkinBody.innerHTML = `
        <div class="checkin-stats-bar">
            <div class="checkin-stat checkin-stat--ready"><strong>${readyCount}</strong> Ready</div>
            <div class="checkin-stat checkin-stat--wait"><strong>${waitCount}</strong> Delayed</div>
        </div>
        <div class="checkin-student-list">
            ${routeCheckins.map(c => `
                <div class="checkin-student-item">
                    <span class="checkin-student-name">
                        ${c.name} 
                        <small style="color:var(--text-secondary); margin-left:0.25rem;">(${c.course} — ${c.branch})</small>
                        <small style="color:var(--text-muted); margin-left:0.25rem;">[${c.passNo}]</small>
                    </span>
                    <span class="checkin-student-badge checkin-student-badge--${c.choice === 'Ready' ? 'ready' : 'wait'}">
                        ${c.choice}
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

window.submitCheckin = function(notifId, choice) {
    if (!currentUser || currentUser.type !== 'student') return;
    const respKey = `${currentUser.passNo}_${notifId}`;
    studentResponses[respKey] = choice;

    const checkinData = {
        notifId,
        passNo: currentUser.passNo,
        name: currentUser.data.name,
        branch: currentUser.data.branch,
        course: currentUser.data.course,
        routeId: currentUser.route.id,
        choice,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const existingIdx = window.driverCheckins.findIndex(c => c.notifId === notifId && c.passNo === currentUser.passNo);
    if (existingIdx > -1) {
        window.driverCheckins[existingIdx] = checkinData;
    } else {
        window.driverCheckins.push(checkinData);
    }

    showToast('success', 'Response Recorded', `You replied: "${choice}"`);
    updateNotifUI();
};

// ═══════════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════════
$('#btn-student-logout').addEventListener('click', logout);
$('#btn-driver-logout').addEventListener('click', logout);
const btnAdminLogout = $('#btn-admin-logout');
if (btnAdminLogout) btnAdminLogout.addEventListener('click', logout);
const btnFacultyLogout = $('#btn-faculty-logout');
if (btnFacultyLogout) btnFacultyLogout.addEventListener('click', logout);

async function logout() {
    const wasDriverSession = currentUser && currentUser.type === 'driver';
    const wasFacultySession = currentUser && currentUser.type === 'faculty';
    const userToken = currentUser && currentUser.data && currentUser.data.sessionToken;
    const adminToken = currentUser && currentUser.data && currentUser.data.adminToken;
    if (userToken || adminToken) {
        try {
            await fetch(API_BASE + '/api/auth/logout', {
                method: 'POST',
                headers: {
                    ...(userToken ? { 'X-User-Token': userToken } : {}),
                    ...(adminToken ? { 'X-Admin-Token': adminToken } : {}),
                },
            });
        } catch (e) { /* local logout still proceeds */ }
    }

    notifPollStop();
    facultyBackendItems = [];
    driverNotifReplies = [];

    if (wasDriverSession && autoEndTripWithLogout && activeDriverTrip && activeDriverTrip.status === 'ACTIVE') {
        endDriverTrip();
    }

    currentUser = null;
    studentPass.value = '';
    const pwdInput = $('#student-password-input');
    if (pwdInput) pwdInput.value = '';
    resetAdminPortal();
    driverId.value = '';
    driverPin.value = '';
    if (adminId) adminId.value = '';
    if (adminPin) adminPin.value = '';
    if (facultyId) facultyId.value = '';
    if (facultyLoginPassword) facultyLoginPassword.value = '';

    if (wasFacultySession && facultyMap) {
        // Reset the faculty map so the next session starts fresh
        try {
            // Cancel any in-flight zoom/pan CSS transition so Leaflet's
            // transitionend handler doesn't fire against a removed map.
            const mapPane = facultyMap.getPane('mapPane');
            if (mapPane) mapPane.style.transition = 'none';
            Object.values(facultyBusMarkers).forEach(m => facultyMap.removeLayer(m));
            facultyBusMarkers = {};
            facultyMap.remove();
        } catch (e) {}
        facultyMap = null;
        facultyMapInitialized = false;
        facultyPolylines = {};
        facultyStopMarkers = [];
    }

    if (wasDriverSession && !autoEndTripWithLogout && activeDriverTrip && activeDriverTrip.status === 'ACTIVE') {
        // Keep the current trip session alive when auto-end is disabled.
        // Driver can return later and continue or end it manually.
        updateTripUI();
        updateMapMarkers();
        updateActiveBusList();
    } else if (activeDriverTrip) {
        if (activeDriverTrip.watchId !== null && 'geolocation' in navigator) {
            navigator.geolocation.clearWatch(activeDriverTrip.watchId);
        }
        if (activeDriverTrip.busNumber && busSim[activeDriverTrip.busNumber]) {
            delete busSim[activeDriverTrip.busNumber];
        }
        activeDriverTrip = null;
    }

    clearErrors();
    clearInterval(countdownInterval);
    // remove student pickup marker and clear any pickup highlights
    try { if (studentPickupMarker && liveMap && liveMap.hasLayer(studentPickupMarker)) liveMap.removeLayer(studentPickupMarker); } catch(e) {}
    studentPickupMarker = null;
    clearHighlightAssignedBus();
    // Reset tabs
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $('#tab-dashboard').classList.add('active');
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    $('#content-dashboard').classList.add('active');
    setPortalMode('student');
    setRole('student');
    switchPage(loginPage);
}

// ═══════════════════════════════════════════════════════════════════
// PAGE & TOAST
// ═══════════════════════════════════════════════════════════════════
function switchPage(page) {
    $$('.page').forEach(p => p.classList.remove('active'));
    page.classList.add('active');
    window.scrollTo(0, 0);
}

function showToast(type, title, msg) {
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>`;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 400); }, 4000);
}

// ─── Theme toggle (light / dark) ───────────────────────────────────
const themeToggle = $('#theme-toggle');
function applyTheme(theme) {
    document.body.classList.toggle('light-theme', theme === 'light');
    if (themeToggle) themeToggle.classList.toggle('light', theme === 'light');
    try { localStorage.setItem('campus-ride-theme', theme); } catch (e) {}
}
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-theme');
        applyTheme(isLight ? 'dark' : 'light');
    });
}
(function initTheme() {
    let saved = 'dark';
    try { saved = localStorage.getItem('campus-ride-theme') || 'dark'; } catch (e) {}
    applyTheme(saved === 'light' ? 'light' : 'dark');
})();

// ═══════════════════════════════════════════════════════════════════
// ADMIN PORTAL — CENTRALIZED MANAGEMENT (Students/Faculty/Drivers/
// Routes & Stops). Requires a backend admin session (admin_token).
// ═══════════════════════════════════════════════════════════════════
let adminRouteMap = null;
let adminRouteMarkers = [];
let adminRoutePolyline = null;
let adminAddStopMode = false;
let adminPendingStopLatLng = null;
let adminSelectedRouteId = null;
let adminBusesCache = [];

// Cached lists for client-side search/filter
let adminStudentsCache = [];
let adminFacultyCache = [];
let adminDriversCache = [];
let adminRoutesCache = [];
let adminDriversLoaded = false;

// Column sort state per role table
const adminSortState = {
    student: { key: 'name', dir: 'asc' },
    faculty: { key: 'name', dir: 'asc' },
    driver: { key: 'name', dir: 'asc' },
};

const adminModalCloseButtons = () => document.querySelectorAll('[data-modal-close]');
const adminModalOpen = (id) => { const el = document.getElementById(id); if (el) el.classList.add('open'); };
const adminModalClose = (id) => { const el = document.getElementById(id); if (el) el.classList.remove('open'); };

function adminConfirm(message, title) {
    return new Promise((resolve) => {
        const titleEl = $('#admin-confirm-title');
        const msgEl = $('#admin-confirm-message');
        if (titleEl) titleEl.textContent = title || 'Confirm';
        if (msgEl) msgEl.textContent = message || 'Are you sure?';
        adminModalOpen('admin-confirm-modal');
        const ok = $('#admin-confirm-ok');
        const finish = (val) => {
            adminModalClose('admin-confirm-modal');
            ok.removeEventListener('click', onOk);
            document.querySelectorAll('[data-modal-close="admin-confirm-modal"]').forEach(b => b.removeEventListener('click', onCancel));
            resolve(val);
        };
        const onOk = () => finish(true);
        const onCancel = () => finish(false);
        ok.addEventListener('click', onOk);
        document.querySelectorAll('[data-modal-close="admin-confirm-modal"]').forEach(b => b.addEventListener('click', onCancel));
    });
}

function initAdminPortal() {
    if (!currentUser || currentUser.type !== 'admin') return;
    bindAdminNav();
    bindAdminModals();
    bindAdminFilterInputs();
    bindAdminSortables();
    switchAdminSection('tracking');

    // The portal needs a real backend session; the demo fallback has none.
    if (!currentUser.data.adminToken) {
        showToast('warning', 'Backend Offline', 'Admin management requires the backend. Showing demo tracking only.');
        return;
    }
    loadAdminStudents();
    loadAdminFaculty();
    loadAdminDrivers();
    loadAdminRoutes();
}

function resetAdminPortal() {
    adminSelectedRouteId = null;
    adminAddStopMode = false;
    if (adminRouteMap) { try { adminRouteMap.remove(); } catch (e) {} adminRouteMap = null; }
    adminRouteMarkers = [];
    adminRoutePolyline = null;
    adminStudentsCache = [];
    adminFacultyCache = [];
    adminDriversCache = [];
    adminRoutesCache = [];
}

function bindAdminNav() {
    $$('.admin-nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchAdminSection(btn.dataset.section));
    });
}

function switchAdminSection(name) {
    $$('.admin-nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === name));
    $$('.admin-section').forEach(s => s.classList.toggle('admin-section--active', s.id === 'admin-section-' + name));
    if (name === 'tracking') {
        setTimeout(() => initAdminMap(), 80);
    }
    if (name === 'routes') {
        setTimeout(() => {
            if (adminSelectedRouteId) renderAdminRouteDetail(adminSelectedRouteId);
            initAdminRouteMap();
        }, 80);
    }
    if (name === 'broutes') {
        setTimeout(() => brShowLevel('bradm', 1), 80);
    }
}

function bindAdminModals() {
    adminModalCloseButtons().forEach(btn => {
        btn.addEventListener('click', () => adminModalClose(btn.dataset.modalClose));
    });
    $$('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('mousedown', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });
    // User form
    const userForm = $('#admin-user-form');
    if (userForm) userForm.addEventListener('submit', onAdminUserFormSubmit);
    const routeForm = $('#admin-route-form');
    if (routeForm) routeForm.addEventListener('submit', onAdminRouteFormSubmit);
    const stopForm = $('#admin-stop-form');
    if (stopForm) stopForm.addEventListener('submit', onAdminStopFormSubmit);

    const addStudent = $('#btn-add-student');
    if (addStudent) addStudent.addEventListener('click', () => openAdminUserModal('student', null));
    const addFaculty = $('#btn-add-faculty');
    if (addFaculty) addFaculty.addEventListener('click', () => openAdminUserModal('faculty', null));
    const addDriver = $('#btn-add-driver');
    if (addDriver) addDriver.addEventListener('click', () => openAdminUserModal('driver', null));
    const addRoute = $('#btn-add-route');
    if (addRoute) addRoute.addEventListener('click', () => openAdminRouteModal(null));
    const addStop = $('#btn-add-stop');
    if (addStop) addStop.addEventListener('click', onAdminAddStopMode);
    const btnEditRoute = $('#btn-edit-route');
    if (btnEditRoute) btnEditRoute.addEventListener('click', () => openAdminRouteModal(adminSelectedRouteId));
    const btnDeleteRoute = $('#btn-delete-route');
    if (btnDeleteRoute) btnDeleteRoute.addEventListener('click', () => onAdminDeleteRoute(adminSelectedRouteId));
    const btnSaveGeo = $('#btn-save-geometry');
    if (btnSaveGeo) btnSaveGeo.addEventListener('click', () => onAdminSaveGeometry(adminSelectedRouteId));
    const btnResetMap = $('#btn-reset-map');
    if (btnResetMap) btnResetMap.addEventListener('click', resetAdminRouteMapView);
    bindAdminProfileModal();
}

function bindAdminFilterInputs() {
    // Students
    const sSearch = $('#admin-students-search');
    if (sSearch) sSearch.addEventListener('input', () => renderAdminStudents());
    const sStatus = $('#admin-students-status');
    if (sStatus) sStatus.addEventListener('change', () => renderAdminStudents());
    const sBranch = $('#admin-students-branch');
    if (sBranch) sBranch.addEventListener('change', () => renderAdminStudents());
    const sRoute = $('#admin-students-route');
    if (sRoute) sRoute.addEventListener('change', () => renderAdminStudents());
    const sRefresh = $('#admin-students-refresh');
    if (sRefresh) sRefresh.addEventListener('click', () => loadAdminStudents());

    // Faculty
    const fSearch = $('#admin-faculty-search');
    if (fSearch) fSearch.addEventListener('input', () => renderAdminFaculty());
    const fStatus = $('#admin-faculty-status');
    if (fStatus) fStatus.addEventListener('change', () => renderAdminFaculty());
    const fDept = $('#admin-faculty-dept');
    if (fDept) fDept.addEventListener('change', () => renderAdminFaculty());
    const fRoute = $('#admin-faculty-route');
    if (fRoute) fRoute.addEventListener('change', () => renderAdminFaculty());
    const fRefresh = $('#admin-faculty-refresh');
    if (fRefresh) fRefresh.addEventListener('click', () => loadAdminFaculty());

    // Drivers
    const dSearch = $('#admin-drivers-search');
    if (dSearch) dSearch.addEventListener('input', () => renderAdminDrivers());
    const dStatus = $('#admin-drivers-status');
    if (dStatus) dStatus.addEventListener('change', () => renderAdminDrivers());
    const dBus = $('#admin-drivers-bus');
    if (dBus) dBus.addEventListener('change', () => renderAdminDrivers());
    const dRefresh = $('#admin-drivers-refresh');
    if (dRefresh) dRefresh.addEventListener('click', () => loadAdminDrivers());
}

// ── Shared table helpers (avatar, dates, sorting) ───────────────────
function adminAvatarHtml(user) {
    if (user.avatar) {
        return `<img class="admin-avatar" src="${escapeHtmlAttr(user.avatar)}" alt="${escapeHtmlAttr(user.name || '')}">`;
    }
    const initials = (user.name || '?').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
    return `<span class="admin-avatar admin-avatar--placeholder">${escapeHtml(initials)}</span>`;
}

function formatJoinDate(val) {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return escapeHtml(String(val));
    return escapeHtml(d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
}

function refreshSortIndicators(role) {
    const section = role === 'student' ? 'students' : role === 'faculty' ? 'faculty' : 'drivers';
    const s = adminSortState[role];
    $$(`#admin-section-${section} .admin-th-sort`).forEach(th => {
        th.classList.toggle('admin-th-sort--asc', s.key === th.dataset.sort && s.dir === 'asc');
        th.classList.toggle('admin-th-sort--desc', s.key === th.dataset.sort && s.dir === 'desc');
    });
}

window.adminSortBy = function(role, key) {
    const s = adminSortState[role] || (adminSortState[role] = { key: 'name', dir: 'asc' });
    if (s.key === key) {
        s.dir = s.dir === 'asc' ? 'desc' : 'asc';
    } else {
        s.key = key;
        s.dir = 'asc';
    }
    refreshSortIndicators(role);
    if (role === 'student') renderAdminStudents();
    else if (role === 'faculty') renderAdminFaculty();
    else renderAdminDrivers();
};

function sortAdminUsers(list, role) {
    const s = adminSortState[role] || { key: 'name', dir: 'asc' };
    const dir = s.dir === 'desc' ? -1 : 1;
    return [...list].sort((a, b) => {
        let x = a[s.key], y = b[s.key];
        if (s.key === 'created_at') {
            x = new Date(x).getTime() || 0;
            y = new Date(y).getTime() || 0;
            return (x - y) * dir;
        }
        if (x == null) x = '';
        if (y == null) y = '';
        const xs = String(x).toLowerCase();
        const ys = String(y).toLowerCase();
        if (xs < ys) return -1 * dir;
        if (xs > ys) return 1 * dir;
        return 0;
    });
}

function bindAdminSortables() {
    [['admin-section-students', 'student'], ['admin-section-faculty', 'faculty'], ['admin-section-drivers', 'driver']].forEach(([sectionId, role]) => {
        $$(`#${sectionId} .admin-th-sort`).forEach(th => {
            th.addEventListener('click', () => adminSortBy(role, th.dataset.sort));
        });
    });
}

// ── Students ────────────────────────────────────────────────────────
async function loadAdminStudents() {
    const tbody = $('#admin-students-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="10" class="admin-table-empty">Loading students…</td></tr>';
    try {
        adminStudentsCache = await adminApi('GET', '/api/admin/students');
        populateAdminBranchOptions();
        const totalEl = $('#admin-students-total');
        if (totalEl) totalEl.textContent = adminStudentsCache.length;
        const head = $('#admin-students-head-count');
        if (head) head.textContent = `(${adminStudentsCache.length})`;
        refreshSortIndicators('student');
        renderAdminStudents();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="10" class="admin-table-empty">Could not load students: ${escapeHtml(String(err.message || err))}</td></tr>`;
        showToast('error', 'Load Failed', `Could not load students: ${String(err.message || err)}`);
    }
}

function populateAdminBranchOptions() {
    const branches = [...new Set(adminStudentsCache.map(s => s.branch).filter(Boolean))].sort();
    const sel = $('#admin-students-branch');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">All branches</option>' + branches.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    sel.value = current;
}

function renderAdminStudents() {
    const tbody = $('#admin-students-tbody');
    if (!tbody) return;
    const search = ($('#admin-students-search').value || '').toLowerCase().trim();
    const status = $('#admin-students-status').value;
    const branch = $('#admin-students-branch').value;
    const route = $('#admin-students-route').value;

    const list = adminStudentsCache.filter(s => {
        if (status && s.account_status !== status) return false;
        if (branch && s.branch !== branch) return false;
        if (route && String(s.route_id || '') !== String(route)) return false;
        if (search) {
            const hay = `${s.name || ''} ${s.roll_no || ''} ${s.email || ''} ${s.contact_no || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    const sorted = sortAdminUsers(list, 'student');
    $('#admin-students-count').textContent = sorted.length;
    if (!sorted.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="admin-table-empty">No students match your filters.</td></tr>';
        return;
    }
    tbody.innerHTML = sorted.map(s => `
        <tr>
            <td>${adminAvatarHtml(s)}</td>
            <td><strong>${escapeHtml(s.roll_no || '-')}</strong></td>
            <td>${escapeHtml(s.name || '-')}</td>
            <td>${escapeHtml(s.email || '-')}</td>
            <td>${escapeHtml(s.contact_no || '-')}</td>
            <td>${escapeHtml(s.branch || '-')}</td>
            <td>${s.route_name ? `${escapeHtml(s.route_name)}${s.bus_number ? `<br><small style="color:var(--text-muted)">${escapeHtml(s.bus_number)}</small>` : ''}` : '<span style="color:var(--text-muted)">Not assigned</span>'}</td>
            <td>${formatJoinDate(s.created_at)}</td>
            <td>${adminStatusChip(s.account_status)}</td>
            <td>${adminRowActions('student', s)}</td>
        </tr>
    `).join('');
}

// ── Faculty ─────────────────────────────────────────────────────────
async function loadAdminFaculty() {
    const tbody = $('#admin-faculty-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="10" class="admin-table-empty">Loading faculty…</td></tr>';
    try {
        adminFacultyCache = await adminApi('GET', '/api/admin/faculty');
        populateAdminDeptOptions();
        const totalEl = $('#admin-faculty-total');
        if (totalEl) totalEl.textContent = adminFacultyCache.length;
        const head = $('#admin-faculty-head-count');
        if (head) head.textContent = `(${adminFacultyCache.length})`;
        refreshSortIndicators('faculty');
        renderAdminFaculty();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="10" class="admin-table-empty">Could not load faculty: ${escapeHtml(String(err.message || err))}</td></tr>`;
        showToast('error', 'Load Failed', `Could not load faculty: ${String(err.message || err)}`);
    }
}

function populateAdminDeptOptions() {
    const depts = [...new Set(adminFacultyCache.map(f => f.department).filter(Boolean))].sort();
    const sel = $('#admin-faculty-dept');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">All departments</option>' + depts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    sel.value = current;
}

function renderAdminFaculty() {
    const tbody = $('#admin-faculty-tbody');
    if (!tbody) return;
    const search = ($('#admin-faculty-search').value || '').toLowerCase().trim();
    const status = $('#admin-faculty-status').value;
    const dept = $('#admin-faculty-dept').value;
    const route = $('#admin-faculty-route').value;

    const list = adminFacultyCache.filter(f => {
        if (status && f.account_status !== status) return false;
        if (dept && f.department !== dept) return false;
        if (route && String(f.route_id || '') !== String(route)) return false;
        if (search) {
            const hay = `${f.name || ''} ${f.roll_no || ''} ${f.email || ''} ${f.contact_no || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    const sorted = sortAdminUsers(list, 'faculty');
    $('#admin-faculty-count').textContent = sorted.length;
    if (!sorted.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="admin-table-empty">No faculty members match your filters.</td></tr>';
        return;
    }
    tbody.innerHTML = sorted.map(f => `
        <tr>
            <td>${adminAvatarHtml(f)}</td>
            <td><strong>${escapeHtml(f.roll_no || '-')}</strong></td>
            <td>${escapeHtml(f.name || '-')}</td>
            <td>${escapeHtml(f.email || '-')}</td>
            <td>${escapeHtml(f.department || '-')}</td>
            <td>${escapeHtml(f.contact_no || '-')}</td>
            <td>${f.route_name ? `${escapeHtml(f.route_name)}${f.bus_number ? `<br><small style="color:var(--text-muted)">${escapeHtml(f.bus_number)}</small>` : ''}` : '<span style="color:var(--text-muted)">Not assigned</span>'}</td>
            <td>${formatJoinDate(f.created_at)}</td>
            <td>${adminStatusChip(f.account_status)}</td>
            <td>${adminRowActions('faculty', f)}</td>
        </tr>
    `).join('');
}

// ── Drivers ─────────────────────────────────────────────────────────
async function ensureAdminRoutes() {
    if (!adminRoutesCache.length) {
        try {
            adminRoutesCache = await adminApi('GET', '/api/admin/routes');
        } catch (e) { /* ignore */ }
    }
    return adminRoutesCache;
}

async function loadAdminDrivers() {
    const tbody = $('#admin-drivers-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="11" class="admin-table-empty">Loading drivers…</td></tr>';
    try {
        adminDriversCache = await adminApi('GET', '/api/admin/drivers');
        await ensureAdminBuses();
        await ensureAdminRoutes();
        adminDriversLoaded = true;
        const totalEl = $('#admin-drivers-total');
        if (totalEl) totalEl.textContent = adminDriversCache.length;
        const head = $('#admin-drivers-head-count');
        if (head) head.textContent = `(${adminDriversCache.length})`;
        refreshSortIndicators('driver');
        renderAdminDrivers();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="11" class="admin-table-empty">Could not load drivers: ${escapeHtml(String(err.message || err))}</td></tr>`;
        showToast('error', 'Load Failed', `Could not load drivers: ${String(err.message || err)}`);
    }
}

function renderAdminDrivers() {
    const tbody = $('#admin-drivers-tbody');
    if (!tbody) return;
    const search = ($('#admin-drivers-search').value || '').toLowerCase().trim();
    const status = $('#admin-drivers-status').value;
    const busFilter = $('#admin-drivers-bus').value;

    const list = adminDriversCache.filter(d => {
        if (status && d.account_status !== status) return false;
        if (busFilter && String(d.assigned_bus_id || '') !== String(busFilter)) return false;
        if (search) {
            const hay = `${d.name || ''} ${d.roll_no || ''} ${d.email || ''} ${d.contact_no || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    const sorted = sortAdminUsers(list, 'driver');
    $('#admin-drivers-count').textContent = sorted.length;
    if (!sorted.length) {
        tbody.innerHTML = '<tr><td colspan="11" class="admin-table-empty">No drivers match your filters.</td></tr>';
        return;
    }
    tbody.innerHTML = sorted.map(d => {
        const busOptions = adminBusesCache.map(b => {
            const assignedElsewhere = b.assigned_driver_id && Number(b.assigned_driver_id) !== Number(d.id);
            const label = `${b.bus_number} (${b.status})` + (assignedElsewhere ? ' — assigned' : '');
            const selected = Number(d.assigned_bus_id) === Number(b.bus_id) ? 'selected' : '';
            const disabled = assignedElsewhere ? 'disabled' : '';
            return `<option value="${b.bus_id}" ${selected} ${disabled}>${escapeHtml(label)}</option>`;
        }).join('');
        const routeOptions = adminRoutesCache.map(r => {
            const selected = Number(d.route_id) === Number(r.route_id) ? 'selected' : '';
            return `<option value="${r.route_id}" ${selected}>${escapeHtml(r.route_name || `Route ${r.route_id}`)}</option>`;
        }).join('');
        return `
        <tr>
            <td>${adminAvatarHtml(d)}</td>
            <td><strong>${escapeHtml(d.roll_no || '-')}</strong></td>
            <td>${escapeHtml(d.name || '-')}</td>
            <td>${escapeHtml(d.email || '-')}</td>
            <td>${escapeHtml(d.contact_no || '-')}</td>
            <td>
                <select class="admin-select admin-driver-bus-select" data-driver-id="${d.id}" style="max-width:170px;">
                    <option value="">— Unassigned —</option>
                    ${busOptions}
                </select>
            </td>
            <td>
                <div class="admin-driver-route-cell">
                    <select class="admin-select admin-driver-route-select" data-driver-id="${d.id}" title="Assign route" style="max-width:190px;">
                        <option value="">— Unassigned —</option>
                        ${routeOptions}
                    </select>
                    <button class="btn-primary btn-small admin-driver-route-save" data-driver-id="${d.id}" type="button" style="display:none;">Save</button>
                </div>
            </td>
            <td><span style="color:var(--text-muted)">—</span></td>
            <td>${formatJoinDate(d.created_at)}</td>
            <td>${adminStatusChip(d.account_status)}</td>
            <td>${adminRowActions('driver', d)}</td>
        </tr>
        `;
    }).join('');

    $$('.admin-driver-bus-select').forEach(sel => {
        sel.addEventListener('change', async () => {
            const driverId = sel.dataset.driverId;
            const busId = sel.value;
            try {
                await adminApi('PUT', `/api/admin/drivers/${driverId}/bus`, { bus_id: busId || null });
                showToast('success', 'Bus Assigned', `Driver updated. Bus assignment saved.`);
                await loadAdminDrivers();
            } catch (err) {
                showToast('error', 'Assignment Failed', String(err.message || err));
                loadAdminDrivers();
            }
        });
    });

    $$('.admin-driver-route-select').forEach(sel => {
        sel.addEventListener('change', () => {
            const save = document.querySelector(`.admin-driver-route-save[data-driver-id="${sel.dataset.driverId}"]`);
            if (save) save.style.display = 'inline-flex';
        });
    });

    $$('.admin-driver-route-save').forEach(btn => {
        btn.addEventListener('click', async () => {
            const driverId = btn.dataset.driverId;
            const sel = document.querySelector(`.admin-driver-route-select[data-driver-id="${driverId}"]`);
            if (!sel) return;
            const routeId = sel.value || null;
            btn.disabled = true;
            btn.textContent = 'Saving…';
            try {
                await adminApi('PUT', `/api/admin/drivers/${driverId}`, { route_id: routeId });
                showToast('success', 'Route Updated', 'Route assignment saved. The Driver Portal now shows this route.');
                await loadAdminDrivers();
            } catch (err) {
                showToast('error', 'Save Failed', String(err.message || err));
                loadAdminDrivers();
            }
        });
    });
}

// ── Routes & Stops ──────────────────────────────────────────────────
async function loadAdminRoutes() {
    const listEl = $('#admin-routes-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="admin-table-empty">Loading routes…</div>';
    try {
        adminRoutesCache = await adminApi('GET', '/api/admin/routes');
        populateAdminRouteFilterOptions(adminRoutesCache);
        renderAdminRoutes();
        if (adminDriversLoaded) renderAdminDrivers();
    } catch (err) {
        listEl.innerHTML = `<div class="admin-table-empty">Could not load routes: ${escapeHtml(String(err.message || err))}</div>`;
    }
}

function renderAdminRoutes() {
    const listEl = $('#admin-routes-list');
    if (!listEl) return;
    if (!adminRoutesCache.length) {
        listEl.innerHTML = '<div class="admin-table-empty">No routes yet. Create one with "New Route".</div>';
        return;
    }
    listEl.innerHTML = adminRoutesCache.map(r => `
        <div class="admin-route-item ${Number(adminSelectedRouteId) === Number(r.route_id) ? 'active' : ''}" data-route-id="${r.route_id}">
            <span class="admin-route-item__name">${escapeHtml(r.route_name || 'Unnamed Route')}</span>
            <span class="admin-route-item__meta">
                ${r.route_code ? `<span class="admin-route-item__code">${escapeHtml(r.route_code)}</span>` : ''}
                <span>${r.stop_count || 0} stops</span>
                <span class="admin-status-chip ${r.status === 'active' ? 'admin-status-chip--active' : 'admin-status-chip--inactive'}">${escapeHtml(r.status)}</span>
            </span>
            <span class="admin-route-item__meta">${r.bus_number ? `Bus: ${escapeHtml(r.bus_number)}` : 'No bus assigned'}</span>
        </div>
    `).join('');

    $$('.admin-route-item').forEach(item => {
        item.addEventListener('click', () => {
            adminSelectedRouteId = item.dataset.routeId;
            renderAdminRoutes();
            renderAdminRouteDetail(adminSelectedRouteId);
        });
    });
}

async function renderAdminRouteDetail(routeId) {
    const emptyEl = $('#admin-route-detail-empty');
    const bodyEl = $('#admin-route-detail-body');
    if (!emptyEl || !bodyEl) return;
    if (!routeId) {
        emptyEl.style.display = '';
        bodyEl.style.display = 'none';
        return;
    }
    try {
        const route = await adminApi('GET', `/api/admin/routes/${routeId}`);
        emptyEl.style.display = 'none';
        bodyEl.style.display = '';
        $('#admin-route-detail-title').textContent = `${route.route_name}`;
        $('#admin-route-detail-meta').innerHTML = `
            ${route.route_code ? `<span>Code: <strong>${escapeHtml(route.route_code)}</strong></span>` : ''}
            <span>Status: <strong>${escapeHtml(route.status)}</strong></span>
            ${route.start_location ? `<span>Start: <strong>${escapeHtml(route.start_location)}</strong></span>` : ''}
            ${route.end_location ? `<span>End: <strong>${escapeHtml(route.end_location)}</strong></span>` : ''}
            <span>Bus: <strong>${route.bus_number ? escapeHtml(route.bus_number) : '—'}</strong></span>
            <span>Stops: <strong>${(route.stops || []).length}</strong></span>
        `;
        renderAdminStops(route);
        renderAdminRouteMap(route);
    } catch (err) {
        emptyEl.style.display = '';
        emptyEl.textContent = `Could not load route: ${escapeHtml(String(err.message || err))}`;
        bodyEl.style.display = 'none';
    }
}

function renderAdminStops(route) {
    const listEl = $('#admin-stops-list');
    if (!listEl) return;
    const stops = route.stops || [];
    const hint = $('#admin-stops-hint');
    if (hint) hint.textContent = stops.length ? `(${stops.length} ordered stops — top is first)` : '(no stops yet)';
    if (!stops.length) {
        listEl.innerHTML = '<div class="admin-table-empty">No stops. Use "Add Stop on Map" and click the map.</div>';
        return;
    }
    listEl.innerHTML = stops.map((s, idx) => `
        <div class="admin-stop-item">
            <span class="admin-stop-item__order">${idx + 1}</span>
            <div class="admin-stop-item__info">
                <div class="admin-stop-item__name">${escapeHtml(s.stop_name || 'Stop')}${s.estimated_time ? `<small style="color:var(--accent-light);"> · ${escapeHtml(s.estimated_time)}</small>` : ''}</div>
                <div class="admin-stop-item__coords">${Number(s.latitude).toFixed(5)}, ${Number(s.longitude).toFixed(5)}</div>
            </div>
            <div class="admin-stop-item__controls">
                <button class="admin-icon-btn" title="Move up" onclick="adminMoveStop(${idx}, -1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg></button>
                <button class="admin-icon-btn" title="Move down" onclick="adminMoveStop(${idx}, 1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
                <button class="admin-icon-btn" title="Edit" onclick="openAdminStopModal(${s.stop_id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
                <button class="admin-icon-btn admin-icon-btn--danger" title="Delete" onclick="adminDeleteStop(${s.stop_id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
        </div>
    `).join('');
}

// ── Route editor map ────────────────────────────────────────────────
function initAdminRouteMap() {
    const el = document.getElementById('admin-route-map');
    if (!el) return;
    if (adminRouteMap) {
        adminRouteMap.invalidateSize();
        return;
    }
    adminRouteMap = L.map('admin-route-map').setView([30.7069, 76.6512], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(adminRouteMap);
    adminRouteMap.on('click', onAdminRouteMapClick);
    if (adminSelectedRouteId) renderAdminRouteDetail(adminSelectedRouteId);
}

function renderAdminRouteMap(route) {
    if (!adminRouteMap) return;
    // Clear previous markers + polyline
    adminRouteMarkers.forEach(m => adminRouteMap.removeLayer(m));
    adminRouteMarkers = [];
    if (adminRoutePolyline) { adminRouteMap.removeLayer(adminRoutePolyline); adminRoutePolyline = null; }

    const stops = route.stops || [];
    if (!stops.length) return;

    stops.forEach((s, idx) => {
        const marker = L.marker([Number(s.latitude), Number(s.longitude)], {
            icon: L.divIcon({
                className: '',
                html: `<div style="background:#6366f1;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;border:2px solid #fff;box-shadow:0 0 8px rgba(99,102,241,0.5);">${idx + 1}</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13],
            })
        }).addTo(adminRouteMap);
        marker.bindPopup(`<strong>${escapeHtml(s.stop_name)}</strong><br><small>Stop ${idx + 1}</small>`);
        adminRouteMarkers.push(marker);
    });

    // Draw polyline (stored geometry preferred, else straight lines)
    let latlngs = null;
    if (route.geometry && Array.isArray(route.geometry) && route.geometry.length >= 2) {
        latlngs = route.geometry.map(p => [parseFloat(p[0]), parseFloat(p[1])]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
    }
    if (!latlngs || latlngs.length < 2) {
        latlngs = stops.map(s => [Number(s.latitude), Number(s.longitude)]);
    }
    adminRoutePolyline = L.polyline(latlngs, { color: '#6366f1', weight: 4, opacity: 0.9, dashArray: '6, 6' }).addTo(adminRouteMap);
    if (stops.length >= 2) {
        try { adminRouteMap.fitBounds(adminRoutePolyline.getBounds(), { padding: [30, 30] }); } catch (e) {}
    }
}

function onAdminRouteMapClick(e) {
    if (!adminAddStopMode || !adminSelectedRouteId) return;
    adminPendingStopLatLng = [e.latlng.lat, e.latlng.lng];
    openAdminStopModal(null);
}

function onAdminAddStopMode() {
    if (!adminSelectedRouteId) {
        showToast('warning', 'Select a Route', 'Pick a route on the left before adding stops.');
        return;
    }
    adminAddStopMode = true;
    showToast('info', 'Add Stop Mode', 'Click anywhere on the map to place a stop.');
    if (adminRouteMap && adminRouteMap.getContainer()) {
        adminRouteMap.getContainer().style.cursor = 'crosshair';
    }
    setTimeout(() => { adminAddStopMode = false; if (adminRouteMap) adminRouteMap.getContainer().style.cursor = ''; }, 15000);
}

function resetAdminRouteMapView() {
    if (adminRoutePolyline) {
        try { adminRouteMap.fitBounds(adminRoutePolyline.getBounds(), { padding: [30, 30] }); } catch (e) {}
    } else {
        adminRouteMap.setView([30.7069, 76.6512], 12);
    }
}

window.adminMoveStop = async function(index, delta) {
    if (!adminSelectedRouteId) return;
    const route = adminRoutesCache.find(r => Number(r.route_id) === Number(adminSelectedRouteId));
    let detail = null;
    try { detail = await adminApi('GET', `/api/admin/routes/${adminSelectedRouteId}`); } catch (e) { showToast('error', 'Error', String(e.message || e)); return; }
    const stops = detail.stops || [];
    const target = index + delta;
    if (target < 0 || target >= stops.length) return;
    const moved = stops.splice(index, 1)[0];
    stops.splice(target, 0, moved);
    try {
        await adminApi('PUT', `/api/admin/routes/${adminSelectedRouteId}/stops/reorder`, { stop_ids: stops.map(s => s.stop_id) });
        showToast('success', 'Reordered', 'Stop order updated.');
        renderAdminRouteDetail(adminSelectedRouteId);
        loadAdminRoutes();
    } catch (err) {
        showToast('error', 'Reorder Failed', String(err.message || err));
    }
};

window.adminDeleteStop = async function(stopId) {
    const ok = await adminConfirm('Delete this stop? This cannot be undone.', 'Delete Stop');
    if (!ok) return;
    try {
        await adminApi('DELETE', `/api/admin/stops/${stopId}`);
        showToast('success', 'Stop Deleted', 'Stop removed.');
        renderAdminRouteDetail(adminSelectedRouteId);
        loadAdminRoutes();
        loadBackendData();
    } catch (err) {
        showToast('error', 'Delete Failed', String(err.message || err));
    }
};

// ── Save road-following geometry via OSRM ───────────────────────────
async function onAdminSaveGeometry(routeId) {
    if (!routeId) return;
    let detail = null;
    try { detail = await adminApi('GET', `/api/admin/routes/${routeId}`); } catch (e) { showToast('error', 'Error', String(e.message || e)); return; }
    const stops = detail.stops || [];
    if (stops.length < 2) {
        showToast('warning', 'Not Enough Stops', 'Add at least two stops before saving a road path.');
        return;
    }
    showToast('info', 'Routing', 'Fetching road-following path…');
    try {
        const coords = stops.map(s => `${s.longitude},${s.latitude}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Routing fetch failed');
        const data = await resp.json();
        const geo = data.routes && data.routes[0] && data.routes[0].geometry;
        if (!geo || !geo.coordinates) throw new Error('No route geometry returned');
        const geometry = geo.coordinates.map(c => [c[1], c[0]]);
        await adminApi('PUT', `/api/admin/routes/${routeId}`, { geometry });
        showToast('success', 'Path Saved', 'Road-following path saved for this route.');
        renderAdminRouteDetail(routeId);
        loadBackendData();
    } catch (err) {
        showToast('error', 'Routing Failed', String(err.message || err));
    }
}

// ── Shared helpers ──────────────────────────────────────────────────
function adminStatusChip(status) {
    return `<span class="admin-status-chip ${status === 'active' ? 'admin-status-chip--active' : 'admin-status-chip--inactive'}">${escapeHtml(status)}</span>`;
}

function adminRowActions(role, user) {
    const toggle = user.account_status === 'active'
        ? `<button class="admin-icon-btn admin-icon-btn--danger" title="Deactivate" onclick="adminToggleUserStatus('${role}', ${user.id}, 'inactive')">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button>`
        : `<button class="admin-icon-btn admin-icon-btn--success" title="Activate" onclick="adminToggleUserStatus('${role}', ${user.id}, 'active')">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>`;
    return `
        <div class="admin-row-actions">
            <button class="admin-icon-btn" title="View Profile" onclick="openAdminProfile('${role}', ${user.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="admin-icon-btn" title="Edit" onclick="openAdminUserModal('${role}', ${user.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            ${toggle}
            <button class="admin-icon-btn admin-icon-btn--danger" title="Delete" onclick="adminDeleteUser('${role}', ${user.id}, '${escapeHtmlAttr(user.name || '')}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
    `;
}

// ── View profile modal ──────────────────────────────────────────────
let adminProfileRole = null;
let adminProfileUser = null;

window.openAdminProfile = async function(role, userId) {
    const modal = document.getElementById('admin-profile-modal');
    if (!modal) return;
    $('#admin-profile-body').style.display = 'none';
    adminModalOpen('admin-profile-modal');
    try {
        const user = await adminApi('GET', `/api/admin/${role}s/${userId}`);
        adminProfileRole = role;
        adminProfileUser = user;
        renderAdminProfile(user);
    } catch (err) {
        showToast('error', 'Load Failed', `Could not load profile: ${String(err.message || err)}`);
        adminModalClose('admin-profile-modal');
    }
};

function adminProfileField(label, value, emptyLabel) {
    const has = value !== null && value !== undefined && String(value).trim() !== '';
    return `<div class="admin-profile__field"><span>${escapeHtml(label)}</span><strong class="${has ? '' : 'admin-profile__empty'}">${has ? escapeHtml(value) : escapeHtml(emptyLabel || '—')}</strong></div>`;
}

function renderAdminProfile(user) {
    $('#admin-profile-title').textContent = `${capitalize(user.role)} Profile`;
    $('#admin-profile-avatar').innerHTML = user.avatar
        ? `<img class="admin-avatar admin-avatar--lg" src="${escapeHtmlAttr(user.avatar)}" alt="">`
        : `<span class="admin-avatar admin-avatar--lg admin-avatar--placeholder">${escapeHtml((user.name || '?').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase())}</span>`;
    $('#admin-profile-name').textContent = user.name || '—';
    const roleLabel = user.role ? capitalize(user.role) : '';
    $('#admin-profile-sub').textContent = [user.roll_no, user.email, user.contact_no].filter(Boolean).join(' · ');
    const chip = $('#admin-profile-status');
    chip.textContent = user.account_status || 'active';
    chip.className = `admin-status-chip ${user.account_status === 'active' ? 'admin-status-chip--active' : 'admin-status-chip--inactive'}`;

    const fields = [
        ['Name', user.name],
        ['ID / Roll No.', user.roll_no],
        ['Email', user.email],
        ['Phone', user.contact_no],
        ['Branch', user.branch],
        ['Department', user.department],
        ['Designation', user.designation],
        ['College', user.college],
        ['Route', user.route_name],
        ['Bus', user.bus_number || user.assigned_bus_number],
        ['Pickup Point', user.pickup_point],
        ['Joined', formatJoinDate(user.created_at)],
        ['Status', user.account_status],
        ['Gender', user.gender],
        ['Date of Birth', user.dob],
        ['Address', user.address],
        ['Blood Group', user.blood_group],
        ['Emergency Contact', user.emergency_contact],
        ['Pass Issue Date', user.pass_issue_date],
        ['Pass Valid Till', user.pass_valid_upto],
        ['Fee Receipt No.', user.fee_receipt_no],
        ['Fee Date', user.fee_date],
        ['Fee Place', user.fee_place],
        ['Relation Type', user.relation_type],
        ['Relation Value', user.relation_value],
    ];
    $('#admin-profile-fields').innerHTML = fields.map(([label, value]) => adminProfileField(label, value)).join('');

    const toggleBtn = $('#admin-profile-toggle');
    const isActive = user.account_status === 'active';
    toggleBtn.textContent = isActive ? 'Deactivate' : 'Activate';
    toggleBtn.className = `btn-small ${isActive ? 'btn-secondary' : 'btn-primary'}`;

    $('#admin-profile-body').style.display = '';
}

function bindAdminProfileModal() {
    const editBtn = $('#admin-profile-edit');
    if (editBtn) editBtn.addEventListener('click', () => {
        if (adminProfileRole && adminProfileUser) {
            adminModalClose('admin-profile-modal');
            openAdminUserModal(adminProfileRole, adminProfileUser.id);
        }
    });
    const toggleBtn = $('#admin-profile-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => {
        if (adminProfileRole && adminProfileUser) {
            const target = adminProfileUser.account_status === 'active' ? 'inactive' : 'active';
            adminToggleUserStatus(adminProfileRole, adminProfileUser.id, target).then(() => {
                if (adminProfileUser && adminProfileRole) {
                    openAdminProfile(adminProfileRole, adminProfileUser.id);
                }
            });
        }
    });
    const deleteBtn = $('#admin-profile-delete');
    if (deleteBtn) deleteBtn.addEventListener('click', () => {
        if (adminProfileRole && adminProfileUser) {
            adminDeleteUser(adminProfileRole, adminProfileUser.id, adminProfileUser.name).then(ok => {
                if (ok) adminModalClose('admin-profile-modal');
            });
        }
    });
}

window.adminToggleUserStatus = async function(role, userId, status) {
    const verb = status === 'active' ? 'Activate' : 'Deactivate';
    const ok = await adminConfirm(`${verb} this account? Deactivated accounts cannot sign in.`, `${verb} Account`);
    if (!ok) return;
    try {
        await adminApi('POST', `/api/admin/${role}s/${userId}/status`, { status });
        showToast('success', 'Updated', `Account marked ${status}.`);
        refreshAdminSection(role);
    } catch (err) {
        showToast('error', 'Failed', String(err.message || err));
    }
};

window.adminDeleteUser = async function(role, userId, name) {
    const ok = await adminConfirm(`Delete ${name || role}? This cannot be undone.`, 'Delete Account');
    if (!ok) return false;
    try {
        await adminApi('DELETE', `/api/admin/${role}s/${userId}`);
        showToast('success', 'Deleted', `${name || role} account deleted.`);
        refreshAdminSection(role);
        return true;
    } catch (err) {
        showToast('error', 'Delete Failed', String(err.message || err));
        return false;
    }
};

async function refreshAdminSection(role) {
    if (role === 'student') await loadAdminStudents();
    else if (role === 'faculty') await loadAdminFaculty();
    else if (role === 'driver') await loadAdminDrivers();
}

// ── User create/edit modal ──────────────────────────────────────────
function openAdminUserModal(role, userId) {
    const modal = document.getElementById('admin-user-modal');
    if (!modal) return;
    $('#admin-user-modal-title').textContent = userId ? `Edit ${capitalize(role)}` : `Add ${capitalize(role)}`;
    $('#admin-user-id').value = userId || '';
    $('#admin-user-role').value = role;
    $('#admin-user-password').value = '';
    $('#admin-user-error').classList.remove('visible');
    $('#admin-user-error').textContent = '';

    const user = userId
        ? (role === 'student' ? adminStudentsCache : role === 'faculty' ? adminFacultyCache : adminDriversCache).find(u => Number(u.id) === Number(userId)) || null
        : null;

    $('#admin-user-name').value = user ? user.name || '' : '';
    $('#admin-user-roll').value = user ? user.roll_no || '' : '';
    $('#admin-user-email').value = user ? user.email || '' : '';
    $('#admin-user-contact').value = user ? user.contact_no || '' : '';
    $('#admin-user-branch').value = user ? user.branch || '' : '';
    $('#admin-user-dept').value = user ? user.department || '' : '';
    $('#admin-user-designation').value = user ? user.designation || '' : '';
    $('#admin-user-route').value = user && user.route_id ? String(user.route_id) : '';
    $('#admin-user-pass-issue').value = user && user.pass_issue_date ? String(user.pass_issue_date).slice(0, 10) : '';
    $('#admin-user-pass-valid').value = user && user.pass_valid_upto ? String(user.pass_valid_upto).slice(0, 10) : '';
    $('#admin-user-fee-receipt').value = user ? user.fee_receipt_no || '' : '';
    $('#admin-user-pickup').value = user ? user.pickup_point || '' : '';
    $('#admin-user-status').value = user ? (user.account_status || 'active') : 'active';

    // Route dropdown
    const routeSel = $('#admin-user-route');
    const routeOptions = ROUTES.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    routeSel.innerHTML = '<option value="">— None —</option>' + routeOptions;
    if (user && user.route_id) routeSel.value = String(user.route_id);

    adminModalOpen('admin-user-modal');
}

async function onAdminUserFormSubmit(e) {
    e.preventDefault();
    const role = $('#admin-user-role').value;
    const userId = $('#admin-user-id').value;
    const errEl = $('#admin-user-error');
    const payload = {
        name: $('#admin-user-name').value.trim(),
        roll_no: $('#admin-user-roll').value.trim(),
        email: $('#admin-user-email').value.trim(),
        contact_no: $('#admin-user-contact').value.trim(),
        branch: $('#admin-user-branch').value.trim() || null,
        department: $('#admin-user-dept').value.trim() || null,
        designation: $('#admin-user-designation').value.trim() || null,
        route_id: $('#admin-user-route').value ? Number($('#admin-user-route').value) : null,
        pass_issue_date: $('#admin-user-pass-issue').value || null,
        pass_valid_upto: $('#admin-user-pass-valid').value || null,
        fee_receipt_no: $('#admin-user-fee-receipt').value.trim() || null,
        pickup_point: $('#admin-user-pickup').value.trim() || null,
    };
    const password = $('#admin-user-password').value;
    if (!userId) payload.password = password;
    if (!payload.name) { errEl.textContent = 'Name is required.'; errEl.classList.add('visible'); return; }
    if (!payload.roll_no) { errEl.textContent = 'ID / roll number is required.'; errEl.classList.add('visible'); return; }
    if (!payload.email) { errEl.textContent = 'Email is required.'; errEl.classList.add('visible'); return; }
    if (!userId && !password) { errEl.textContent = 'A password is required for new accounts.'; errEl.classList.add('visible'); return; }

    try {
        if (userId) {
            await adminApi('PUT', `/api/admin/${role}s/${userId}`, payload);
        } else {
            await adminApi('POST', `/api/admin/${role}s`, payload);
        }
        showToast('success', 'Saved', `${capitalize(role)} account saved.`);
        adminModalClose('admin-user-modal');
        refreshAdminSection(role);
    } catch (err) {
        errEl.textContent = String(err.message || err);
        errEl.classList.add('visible');
    }
}

// ── Route create/edit modal ─────────────────────────────────────────
function openAdminRouteModal(routeId) {
    const modal = document.getElementById('admin-route-modal');
    if (!modal) return;
    $('#admin-route-modal-title').textContent = routeId ? 'Edit Route' : 'New Route';
    $('#admin-route-id').value = routeId || '';
    $('#admin-route-error').classList.remove('visible');
    $('#admin-route-error').textContent = '';

    const route = routeId ? adminRoutesCache.find(r => Number(r.route_id) === Number(routeId)) || null : null;
    $('#admin-route-name').value = route ? route.route_name || '' : '';
    $('#admin-route-code').value = route ? route.route_code || '' : '';
    $('#admin-route-start').value = route ? route.start_location || '' : '';
    $('#admin-route-end').value = route ? route.end_location || '' : '';
    $('#admin-route-status').value = route ? route.status || 'active' : 'active';
    $('#admin-route-description').value = route ? route.description || '' : '';

    const busSel = $('#admin-route-bus');
    const options = adminBusesCache.map(b => {
        const onThisRoute = route && Number(b.bus_id) === Number(route.bus_id);
        const onOtherRoute = adminRoutesCache.some(r => Number(r.bus_id) === Number(b.bus_id) && Number(r.route_id) !== Number(routeId || 0));
        const selected = onThisRoute ? 'selected' : '';
        const disabled = (!onThisRoute && onOtherRoute) ? 'disabled' : '';
        const suffix = onOtherRoute ? ' — used' : '';
        return `<option value="${b.bus_id}" ${selected} ${disabled}>${escapeHtml(b.bus_number)}${suffix}</option>`;
    }).join('');
    busSel.innerHTML = '<option value="">— None —</option>' + options;
    if (route && route.bus_id) busSel.value = String(route.bus_id);

    adminModalOpen('admin-route-modal');
}

async function onAdminRouteFormSubmit(e) {
    e.preventDefault();
    const routeId = $('#admin-route-id').value;
    const errEl = $('#admin-route-error');
    const payload = {
        route_name: $('#admin-route-name').value.trim(),
        route_code: $('#admin-route-code').value.trim() || null,
        start_location: $('#admin-route-start').value.trim() || null,
        end_location: $('#admin-route-end').value.trim() || null,
        status: $('#admin-route-status').value,
        description: $('#admin-route-description').value.trim() || null,
        bus_id: $('#admin-route-bus').value ? Number($('#admin-route-bus').value) : null,
    };
    if (!payload.route_name) { errEl.textContent = 'Route name is required.'; errEl.classList.add('visible'); return; }
    try {
        if (routeId) {
            await adminApi('PUT', `/api/admin/routes/${routeId}`, payload);
        } else {
            const created = await adminApi('POST', '/api/admin/routes', payload);
            adminSelectedRouteId = created.route_id;
        }
        showToast('success', 'Route Saved', 'Route saved successfully.');
        adminModalClose('admin-route-modal');
        await loadAdminRoutes();
        if (adminSelectedRouteId) renderAdminRouteDetail(adminSelectedRouteId);
        loadBackendData();
    } catch (err) {
        errEl.textContent = String(err.message || err);
        errEl.classList.add('visible');
    }
}

window.onAdminDeleteRoute = async function(routeId) {
    const route = adminRoutesCache.find(r => Number(r.route_id) === Number(routeId));
    const ok = await adminConfirm(`Delete route "${route ? route.route_name : routeId}"? Its stops and assignments will be removed.`, 'Delete Route');
    if (!ok) return;
    try {
        await adminApi('DELETE', `/api/admin/routes/${routeId}`);
        showToast('success', 'Route Deleted', 'Route removed.');
        if (Number(adminSelectedRouteId) === Number(routeId)) adminSelectedRouteId = null;
        await loadAdminRoutes();
        renderAdminRouteDetail(adminSelectedRouteId);
        loadBackendData();
    } catch (err) {
        showToast('error', 'Delete Failed', String(err.message || err));
    }
};

// ── Stop create/edit modal ──────────────────────────────────────────
function openAdminStopModal(stopId) {
    const modal = document.getElementById('admin-stop-modal');
    if (!modal) return;
    $('#admin-stop-id').value = stopId || '';
    $('#admin-stop-error').classList.remove('visible');
    $('#admin-stop-error').textContent = '';
    if (stopId) {
        adminApi('GET', `/api/admin/routes/${adminSelectedRouteId}`).then(detail => {
            const stop = (detail.stops || []).find(s => Number(s.stop_id) === Number(stopId));
            if (stop) {
                $('#admin-stop-name').value = stop.stop_name || '';
                $('#admin-stop-time').value = stop.estimated_time || '';
                $('#admin-stop-description').value = stop.description || '';
            }
        });
    } else {
        $('#admin-stop-name').value = '';
        $('#admin-stop-time').value = '';
        $('#admin-stop-description').value = '';
    }
    adminModalOpen('admin-stop-modal');
}

async function onAdminStopFormSubmit(e) {
    e.preventDefault();
    const stopId = $('#admin-stop-id').value;
    const errEl = $('#admin-stop-error');
    const payload = {
        stop_name: $('#admin-stop-name').value.trim(),
        estimated_time: $('#admin-stop-time').value.trim() || null,
        description: $('#admin-stop-description').value.trim() || null,
    };
    if (!payload.stop_name) { errEl.textContent = 'Stop name is required.'; errEl.classList.add('visible'); return; }
    try {
        if (stopId) {
            await adminApi('PUT', `/api/admin/stops/${stopId}`, payload);
        } else {
            if (!adminPendingStopLatLng) { errEl.textContent = 'Click a location on the map first.'; errEl.classList.add('visible'); return; }
            await adminApi('POST', `/api/admin/routes/${adminSelectedRouteId}/stops`, {
                ...payload,
                latitude: adminPendingStopLatLng[0],
                longitude: adminPendingStopLatLng[1],
            });
        }
        adminPendingStopLatLng = null;
        showToast('success', 'Stop Saved', 'Stop saved to route.');
        adminModalClose('admin-stop-modal');
        await loadAdminRoutes();
        renderAdminRouteDetail(adminSelectedRouteId);
        loadBackendData();
    } catch (err) {
        errEl.textContent = String(err.message || err);
        errEl.classList.add('visible');
    }
}

// ── Buses & shared option helpers ───────────────────────────────────
async function ensureAdminBuses() {
    if (!adminBusesCache.length) {
        try {
            const buses = await adminApi('GET', '/api/buses');
            adminBusesCache = buses.map(b => ({ ...b, assigned_driver_id: null }));
        } catch (e) { /* ignore */ }
    }
    // Enrich with the driver currently assigned to each bus
    adminBusesCache.forEach(b => {
        const driver = adminDriversCache.find(d => Number(d.assigned_bus_id) === Number(b.bus_id));
        b.assigned_driver_id = driver ? driver.id : null;
    });
    populateAdminBusFilter();
}

function populateAdminBusFilter() {
    const sel = $('#admin-drivers-bus');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">All buses</option>' + adminBusesCache.map(b => `<option value="${b.bus_id}">${escapeHtml(b.bus_number)}</option>`).join('');
    sel.value = current;
}

function populateAdminRouteFilterOptions(routes) {
    // Populate the route filter dropdowns (shared with students/faculty)
    const list = routes && routes.length ? routes : ROUTES;
    ['admin-students-route', 'admin-faculty-route'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '<option value="">All routes</option>' + list.map(r => `<option value="${r.route_id != null ? r.route_id : r.id}">${escapeHtml(r.route_name || r.name)}</option>`).join('');
        sel.value = current;
    });
}

// ── Small text helpers ──────────────────────────────────────────────
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeHtmlAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
}
function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

// ─── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setRole('student');
    loadBackendData().then(() => checkAdminRegistration());
});
