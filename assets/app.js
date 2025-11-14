/* College Events — client-only app
   - localStorage based
   - safe rendering via textContent
   - image fallback, search, filter, delete, register
   - hamburger nav + dark-mode persistence
*/
const DB_KEY = 'ce_events_v1';
const REGS_KEY = 'ce_regs_v1';
const DM_KEY = 'ce_dark_v1';

// --- storage helpers
function getEvents(){ try{ return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); } catch(e){ return []; } }
function saveEvents(events){ localStorage.setItem(DB_KEY, JSON.stringify(events)); }
function getRegs(){ try{ return JSON.parse(localStorage.getItem(REGS_KEY) || '[]'); } catch(e){ return []; } }
function saveRegs(r){ localStorage.setItem(REGS_KEY, JSON.stringify(r)); }

// --- date formatting
function fmt(dateStr){
  const d = new Date(dateStr);
  if(isNaN(d)) return dateStr;
  return d.toLocaleString();
}

// --- create DOM card safely
function createEventCard(ev, idx){
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.className = 'event-img';
  img.alt = '';
  // only show image if provided
  if (ev.image && ev.image.trim()) {
    img.src = ev.image.trim();
  } else {
    img.style.display = 'none'; // hide the image element completely
  }

  card.appendChild(img);

  const h3 = document.createElement('h3'); h3.textContent = ev.title; card.appendChild(h3);

  const pMeta = document.createElement('p'); pMeta.className = 'small';
  pMeta.textContent = `${ev.category} • ${fmt(ev.date)}`;
  card.appendChild(pMeta);

  if(ev.location || ev.seats){
    const p2 = document.createElement('p'); p2.className = 'small';
    p2.textContent = `${ev.location || 'Online'}${ev.seats ? ' • ' + ev.seats + ' seats' : ''}`;
    card.appendChild(p2);
  }

 // controls: Register (primary) + Delete (styled like primary)
const controls = document.createElement('div');
controls.style = 'margin-top:10px;display:flex;gap:8px;';

const reg = document.createElement('a');
reg.className = 'cta';
reg.href = '#';
reg.textContent = 'Register';
reg.addEventListener('click', function(e){
  e.preventDefault();
  registerEventByIdx(idx);
});

const del = document.createElement('a');
// make delete visually identical to register by using same 'cta' class
del.className = 'cta btn-danger';

del.href = '#';
del.textContent = 'Delete';
del.addEventListener('click', function(e){
  e.preventDefault();
  // confirm first to avoid accidental deletes
  if(confirm('Delete this event?')) {
    deleteEventByIdx(idx);
  }
});

controls.appendChild(reg);
controls.appendChild(del);
card.appendChild(controls);


  return card;
}

// --- render events list with optional filters
function renderEventsList(containerId, opts = {}){
  const { search = '', category = '' } = opts;
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = '';

  const q = (search || '').toLowerCase().trim();
  let events = getEvents().slice().sort((a,b)=>new Date(a.date)-new Date(b.date));

  if(category) events = events.filter(ev => (ev.category||'').toLowerCase() === category.toLowerCase());
  if(q) events = events.filter(ev => ((ev.title||'') + ' ' + (ev.desc||'') + ' ' + (ev.location||'')).toLowerCase().includes(q));

  if(events.length === 0){
    const p = document.createElement('p'); p.className = 'small'; p.textContent = 'No events yet. Create one from the Create Event page.';
    el.appendChild(p); return;
  }

  events.forEach((ev, idx) => {
    el.appendChild(createEventCard(ev, idx));
  });
}

// --- create event form
function submitCreateForm(e){
  if(e) e.preventDefault();
  const title = (document.getElementById('title') || {}).value || '';
  const date = (document.getElementById('date') || {}).value || '';
  const category = (document.getElementById('category') || {}).value || '';
  const desc = (document.getElementById('desc') || {}).value || '';
  const location = (document.getElementById('location') || {}).value || '';
  const lat = (document.getElementById('lat') || {}).value || '';
  const lon = (document.getElementById('lon') || {}).value || '';
  const seats = (document.getElementById('seats') || {}).value || '';
  const image = (document.getElementById('image') || {}).value || '';

  if(!title.trim() || !date || !category){
    alert('Please fill Title, Date and Category.');
    return;
  }

  const events = getEvents();
  events.push({
    title: title.trim(),
    date,
    category,
    desc: desc.trim(),
    location: location.trim(),
    seats: seats ? Number(seats) : '',
    image: image.trim(),
    lat: lat ? Number(lat) : '',
  lon: lon ? Number(lon) : '',
    createdAt: new Date().toISOString()
  });
  saveEvents(events);
  alert('Event created ✅');
  window.location.href = 'events.html';
}

// --- delete/register by index
function deleteEventByIdx(idx){
  const events = getEvents();
  if(!events[idx]) return alert('Event not found');
  if(!confirm('Delete this event?')) return;
  events.splice(idx,1);
  saveEvents(events);
  // re-render if on page
  renderEventsList('eventsList', { search: currentSearchQuery(), category: currentCategoryFilter() });
  renderProfile();
}

function registerEventByIdx(idx){
  const events = getEvents();
  const ev = events[idx];
  if(!ev) return alert('Event not found');
  const regs = getRegs();
  regs.push({ eventTitle: ev.title, date: ev.date, registeredAt: new Date().toISOString() });
  saveRegs(regs);
  alert('Registered successfully! 🎉');
  renderProfile();
}

// --- profile rendering
function renderProfile(){
  const createdEl = document.getElementById('createdList');
  const joinedEl = document.getElementById('joinedList');
  if(createdEl){
    const events = getEvents();
    createdEl.innerHTML = events.length ? events.map(ev => {
      return `<div class="card padded"><h4>${escapeHtml(ev.title)}</h4><p class="small">${ev.category} • ${fmt(ev.date)}</p></div>`;
    }).join('') : `<p class="small">You haven't created any events.</p>`;
  }
  if(joinedEl){
    const regs = getRegs();
    joinedEl.innerHTML = regs.length ? regs.map(r => {
      return `<div class="card padded"><h4>${escapeHtml(r.eventTitle)}</h4><p class="small">Registered: ${fmt(r.registeredAt)}</p></div>`;
    }).join('') : `<p class="small">No registrations yet.</p>`;
  }
}

// --- small helper escaping for innerHTML fragments used above
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
}

// --- search debounce & helpers
let _searchTimer = null;
function debounceSearch(fn, ms=250){
  return function(...args){
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(()=> fn.apply(this, args), ms);
  };
}

function currentSearchQuery(){
  const el = document.querySelector('.search-input');
  return el ? el.value : '';
}
function currentCategoryFilter(){
  const sel = document.querySelector('#filterCategory');
  return sel ? sel.value : '';
}

// --- UI: hamburger & dark-mode
function setupHeaderUI(){

  // FAB Dark Mode Toggle
  const darkFab = document.getElementById('darkFab');
  if (darkFab) {
  darkFab.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(DM_KEY, document.body.classList.contains('dark') ? '1' : '0');
  });
  }


  // hamburger
  const burger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if(burger && nav){
    burger.addEventListener('click', ()=> nav.classList.toggle('show'));
  }

  // dark mode
  const body = document.body;
  const saved = localStorage.getItem(DM_KEY);
  if(saved === '1') body.classList.add('dark');

  const dmToggle = document.getElementById('dmToggle');
  if(dmToggle){
    dmToggle.addEventListener('click', ()=>{
      body.classList.toggle('dark');
      localStorage.setItem(DM_KEY, body.classList.contains('dark') ? '1' : '0');
      updateKnob();
    });
    updateKnob();
  }

  function updateKnob(){
    const knob = document.querySelector('.knob');
    if(!knob) return;
    const isDark = document.body.classList.contains('dark');
    knob.style.transform = isDark ? 'translateX(16px)' : 'translateX(0)';
  }
}

// --- search + filter wiring
function setupSearchAndFilters(listContainerId='eventsList'){
  const searchInput = document.querySelector('.search-input');
  const categorySelect = document.querySelector('#filterCategory');

  const doRender = debounceSearch(() => {
    renderEventsList(listContainerId, { search: currentSearchQuery(), category: currentCategoryFilter() });
  }, 180);

  if(searchInput){
    searchInput.addEventListener('input', doRender);
  }
  if(categorySelect){
    categorySelect.addEventListener('change', doRender);
  }
}

// --- init
document.addEventListener('DOMContentLoaded', ()=>{
  // auto render if elements exist
  renderEventsList('eventsList', { search: currentSearchQuery(), category: currentCategoryFilter() });
  renderProfile();

  // create form hook
  const createForm = document.getElementById('createForm');
  if(createForm) createForm.addEventListener('submit', submitCreateForm);

  // header widgets
  setupHeaderUI();
  setupSearchAndFilters('eventsList');
});

/* ---------------------------
   Map picker + geocoding (Leaflet + Nominatim)
   --------------------------- */

// Geocode address -> { lat, lon, display_name } or null
async function geocodeAddress(address) {
  if(!address || !address.trim()) return null;
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + encodeURIComponent(address);
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if(!res.ok) return null;
    const arr = await res.json();
    if(!arr || !arr.length) return null;
    // return the first result
    return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon), display_name: arr[0].display_name };
  } catch (e) {
    return null;
  }
}

// Reverse geocode lat/lon -> display_name (optional)
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if(!res.ok) return null;
    const j = await res.json();
    return j && (j.display_name || null);
  } catch(e) {
    return null;
  }
}

/* Opens modal that lets user search OR click to choose a location.
   onSelect(lat, lon, display_name) will be called when user confirms.
*/
function openLocationPicker(onSelect, initialCenter = { lat: 20.0, lon: 77.0 }) {
  // avoid duplicate modal
  if(document.getElementById('mapModal')) return;

  const modal = document.createElement('div');
  modal.id = 'mapModal';
  modal.innerHTML = `
    <div class="map-card">
      <div id="mapHeader">
        <input id="mapSearch" class="map-search" placeholder="Search address or place (e.g. 'Margao')" />
        <button id="mapSearchBtn" class="btn">Search</button>
        <span class="map-note">Click map to place marker</span>
      </div>
      <div id="mapArea"></div>
      <div class="map-actions">
        <button id="mapCancel" class="btn">Cancel</button>
        <button id="mapConfirm" class="cta">Confirm location</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // init map
  const mapEl = document.getElementById('mapArea');
  mapEl.style.height = '100%';
  const map = L.map(mapEl).setView([initialCenter.lat, initialCenter.lon], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // marker (null initially)
  let marker = null;

  function placeMarker(lat, lon, label) {
    if(marker) {
      marker.setLatLng([lat, lon]);
      if(label) marker.bindPopup(label).openPopup();
    } else {
      marker = L.marker([lat, lon]).addTo(map);
      if(label) marker.bindPopup(label).openPopup();
    }
  }

  // click to place marker
  map.on('click', async function(e){
    const { lat, lng } = e.latlng;
    placeMarker(lat, lng, 'Selected location — fetching address...');
    const name = await reverseGeocode(lat, lng);
    if(name && marker) {
      marker.bindPopup(name).openPopup();
    }
  });

  // Search button
  document.getElementById('mapSearchBtn').addEventListener('click', async () => {
    const q = (document.getElementById('mapSearch') || {}).value || '';
    if(!q.trim()) return;
    const res = await geocodeAddress(q);
    if(!res) return alert('Location not found.');
    map.setView([res.lat, res.lon], 15);
    placeMarker(res.lat, res.lon, res.display_name);
  });

  // confirm / cancel
  document.getElementById('mapCancel').addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('mapConfirm').addEventListener('click', async () => {
    if(!marker) return alert('Please select a location on the map or search and select one first.');
    const pos = marker.getLatLng();
    // try to reverse-geocode a friendly name
    const name = await reverseGeocode(pos.lat, pos.lng);
    onSelect(pos.lat, pos.lng, name || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
    modal.remove();
  });
}

// Wire up the pick button on pages that include #openMapBtn
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openMapBtn');
  const locationInput = document.getElementById('location');
  const latInput = document.getElementById('lat');
  const lonInput = document.getElementById('lon');

  if(openBtn && locationInput) {
    openBtn.addEventListener('click', () => {
      // initial center: try to geocode current location input if present, else default
      const current = locationInput.value || '';
      if(current.trim()) {
        geocodeAddress(current).then(res => {
          const center = res ? { lat: res.lat, lon: res.lon } : undefined;
          openLocationPicker((lat, lon, display_name) => {
            locationInput.value = display_name;
            latInput.value = lat;
            lonInput.value = lon;
          }, center);
        });
      } else {
        openLocationPicker((lat, lon, display_name) => {
          locationInput.value = display_name;
          latInput.value = lat;
          lonInput.value = lon;
        });
      }
    });
  }

  // user types an address and blurs, try to geocode and fill lat/lon silently
  if(locationInput){
    locationInput.addEventListener('blur', async () => {
      const q = locationInput.value || '';
      if(!q.trim()) return;
      const r = await geocodeAddress(q);
      if(r){
        latInput.value = r.lat;
        lonInput.value = r.lon;
        
      }
    });
  }
});
