
// ══════════════════════════════════════
//  DATA
// ══════════════════════════════════════
let regions = [
  { id:'NTR', name:'NTR', fullName:'Northern Territory Region', clusters:3, branches:3, efficiency:85, status:'ACTIVE' },
  { id:'KRI', name:'Krishna', fullName:'Coastal Hub District', clusters:3, branches:2, efficiency:92, status:'ACTIVE' },
];
let clusters = [
  { id:'NTR-CHE', name:'Cheetah', code:'NTR-CHE', region:'NTR', branches:4, status:'Active' },
  { id:'NTR-COU', name:'Cougar', code:'NTR-COU', region:'NTR', branches:4, status:'Active' },
  { id:'NTR-LEO', name:'Leopard', code:'NTR-LEO', region:'NTR', branches:4, status:'Active' },
  { id:'KRI-LIO', name:'Jaglion', code:'KRI-LIO', region:'Krishna', branches:4, status:'Active' },
  { id:'KRI-JAG', name:'Jaguar', code:'KRI-JAG', region:'Krishna', branches:4, status:'Active' },
  { id:'MQ', name:'Main Quarters', code:'MQ', region:'Headquarters', branches:4, status:'Active' },
];
let branches = [
  { id:'NTR-COU-B1', name:'Asnagar',         branchId:'NTR-COU-B1', cluster:'NTR-COU', clusterName:'Cougar',        region:'NTR',          location:'Vijayawada',   status:'Active' },
  { id:'KRI-JAG-B3', name:'Avanigadda',       branchId:'KRI-JAG-B3', cluster:'KRI-JAG', clusterName:'Jaguar',        region:'Krishna',      location:'Avanigadda',   status:'Active' },
  { id:'KRI-JAG-B4', name:'Bantumilli',       branchId:'KRI-JAG-B4', cluster:'KRI-JAG', clusterName:'Jaguar',        region:'Krishna',      location:'Bantumilli',   status:'Active' },
  { id:'NTR-LEO-B3', name:'Bhavanipuram',     branchId:'NTR-LEO-B3', cluster:'NTR-LEO', clusterName:'Leopard',       region:'NTR',          location:'Vijayawada',   status:'Active' },
  { id:'KRI-JAG-B2', name:'Challapalli',      branchId:'KRI-JAG-B2', cluster:'KRI-JAG', clusterName:'Jaguar',        region:'Krishna',      location:'Challapalli',  status:'Active' },
  { id:'CO',         name:'Corporate Office', branchId:'CO',          cluster:'MQ',      clusterName:'Main Quarters', region:'Headquarters', location:'Gandhi Nagar', status:'Active' },
];

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
let currentTab = 'regions';
let searchVal = '';
let modalMode = ''; // 'add-region' | 'edit-region' | 'add-cluster' | 'edit-cluster' | 'add-branch' | 'edit-branch'
let editId = null;
const regionColors = { NTR:'#1976D2', Krishna:'#FB8C00', Headquarters:'#757575' };

// ══════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════
function regionColor(r) { return regionColors[r] || '#9CA3AF'; }
function statusBadge(s) {
  const active = s === 'Active' || s === 'ACTIVE';
  return `<span class="badge-active${active?'':' badge-inactive'}"><span class="badge-dot${active?'':' badge-dot-inactive'}"></span>${s}</span>`;
}
function updateStats() {
  document.getElementById('stat-regions').textContent = regions.length;
  document.getElementById('stat-clusters').textContent = clusters.length;
  document.getElementById('stat-branches').textContent = branches.length;
  const avg = regions.length ? (clusters.length / regions.length).toFixed(0) : 0;
  document.getElementById('stat-clusters-sub').textContent = 'ℹ Average ' + avg + ' per Region';
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ══════════════════════════════════════
//  NAV
// ══════════════════════════════════════
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ══════════════════════════════════════
//  TABS
// ══════════════════════════════════════
function switchTab(tab) {
  currentTab = tab;
  searchVal = '';
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', ['regions','clusters','branches'][i] === tab);
  });
  const filter = document.getElementById('region-filter');
  const addBtn = document.getElementById('add-btn');
  if (tab === 'regions') {
    filter.classList.add('hidden');
    addBtn.textContent = '+ Add Region';
  } else if (tab === 'clusters') {
    filter.classList.remove('hidden');
    addBtn.textContent = '+ Add New Cluster';
  } else {
    filter.classList.remove('hidden');
    addBtn.textContent = '+ Add New Branch';
  }
  refreshRegionFilter();
  renderTable();
}

function refreshRegionFilter() {
  const sel = document.getElementById('region-filter');
  const cur = sel.value;
  if (currentTab === 'branches') {
    sel.innerHTML = '<option value="all">All Clusters</option>';
    clusters.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id; o.textContent = c.name;
      if (c.id === cur) o.selected = true;
      sel.appendChild(o);
    });
  } else {
    sel.innerHTML = '<option value="all">All Regions</option>';
    regions.forEach(r => {
      const o = document.createElement('option');
      o.value = r.name; o.textContent = r.name;
      if (r.name === cur) o.selected = true;
      sel.appendChild(o);
    });
  }
}

function onSearch(val) {
  searchVal = val.toLowerCase();
  renderTable();
}

// ══════════════════════════════════════
//  RENDER TABLE
// ══════════════════════════════════════
function renderTable() {
  const container = document.getElementById('table-container');
  const regionFilter = document.getElementById('region-filter').value;
  updateStats();

  if (currentTab === 'regions') renderRegions(container);
  else if (currentTab === 'clusters') renderClusters(container, regionFilter);
  else renderBranches(container, regionFilter);
}

function renderRegions(container) {
  const filtered = regions.filter(r =>
    !searchVal || r.name.toLowerCase().includes(searchVal) || r.fullName.toLowerCase().includes(searchVal)
  );
  if (!filtered.length) { container.innerHTML = '<div class="empty-state">No regions found.</div>'; setFooter(0, 0, 'regions'); return; }
  let html = `<table><thead><tr>
    <th>REGION NAME</th><th>HIERARCHY STATS</th><th>PERFORMANCE</th><th>STATUS</th><th>ACTIONS</th>
  </tr></thead><tbody>`;
  filtered.forEach(r => {
    html += `<tr>
      <td><div style="display:flex;align-items:center;gap:12px">
        <div class="region-icon">🗺</div>
        <div><div class="region-name">${escHtml(r.name)}</div><div class="region-sub">${escHtml(r.fullName)}</div></div>
      </div></td>
      <td><div class="stat-pair">
        <div class="stat-pair-item"><div class="stat-pair-num">${r.clusters}</div><div class="stat-pair-lbl">CLUSTERS</div></div>
        <div class="stat-pair-item"><div class="stat-pair-num">${r.branches}</div><div class="stat-pair-lbl">BRANCHES</div></div>
      </div></td>
      <td>
        <div class="progress-bar"><div class="progress-fill" style="width:${r.efficiency}%"></div></div>
        <div class="progress-label">${r.efficiency}% Efficiency</div>
      </td>
      <td>${statusBadge(r.status)}</td>
      <td><div style="display:flex;gap:8px">
        <button class="btn-edit" onclick="openEdit('region','${r.id}')">✏ Edit</button>
        <button class="btn-del" onclick="deleteItem('region','${r.id}')">🗑 Delete</button>
      </div></td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
  setFooter(filtered.length, regions.length, 'regions');
}

function renderClusters(container, regionFilter) {
  let filtered = clusters.filter(c => {
    if (regionFilter !== 'all' && c.region !== regionFilter) return false;
    if (searchVal && !c.name.toLowerCase().includes(searchVal) && !c.code.toLowerCase().includes(searchVal)) return false;
    return true;
  });
  if (!filtered.length) { container.innerHTML = '<div class="empty-state">No clusters found.</div>'; setFooter(0, 0, 'clusters'); return; }
  let html = `<table><thead><tr>
    <th>NAME</th><th>CODE</th><th>REGION</th><th>BRANCHES</th><th>STATUS</th><th>ACTIONS</th>
  </tr></thead><tbody>`;
  filtered.forEach(c => {
    html += `<tr>
      <td><span class="cluster-name">${escHtml(c.name)}</span></td>
      <td><span class="code-badge">${escHtml(c.code)}</span></td>
      <td><span class="region-dot"><span class="rdot" style="background:${regionColor(c.region)}"></span>${escHtml(c.region)}</span></td>
      <td style="font-weight:700;font-size:15px;color:#0D1B2A">${String(c.branches).padStart(2,'0')}</td>
      <td>${statusBadge(c.status)}</td>
      <td><div style="display:flex;gap:8px">
        <button class="icon-btn" title="Stats" onclick="showToast('Stats coming soon')">📊</button>
        <button class="icon-btn" title="Delete" onclick="deleteItem('cluster','${c.id}')">🗑</button>
        <button class="icon-btn" title="Edit" onclick="openEdit('cluster','${c.id}')">✏</button>
      </div></td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
  setFooter(filtered.length, clusters.length, 'clusters');
}

function renderBranches(container, regionFilter) {
  let filtered = branches.filter(b => {
    if (regionFilter !== 'all' && b.cluster !== regionFilter) return false;
    if (searchVal && !b.name.toLowerCase().includes(searchVal) && !b.branchId.toLowerCase().includes(searchVal) && !(b.location||'').toLowerCase().includes(searchVal)) return false;
    return true;
  });
  const perPage = 6;
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  if (!window.branchPage || window.branchPage > totalPages) window.branchPage = 1;
  const page = window.branchPage;
  const paged = filtered.slice((page-1)*perPage, page*perPage);
  if (!filtered.length) { container.innerHTML = '<div class="empty-state">No branches found.</div>'; updateBranchFooter(0,0,0,1,1); return; }
  let html = `<div style="padding:20px 20px 8px;font-size:17px;font-weight:700;color:#0D1B2A;border-bottom:1px solid #F3F4F6;">Branches List</div>`;
  html += `<table><thead><tr>
    <th>NAME</th><th>CODE</th><th>CLUSTER</th><th>LOCATION</th><th>STATUS</th><th>ACTIONS</th>
  </tr></thead><tbody>`;
  paged.forEach(b => {
    html += `<tr>
      <td style="font-size:14px;color:#0D1B2A;">${escHtml(b.name)}</td>
      <td style="font-weight:700;font-size:14px;color:#0D1B2A;">${escHtml(b.branchId)}</td>
      <td style="font-size:13.5px;color:#374151">${escHtml(b.clusterName||b.cluster)}</td>
      <td style="font-size:13.5px;color:#374151">${escHtml(b.location||'—')}</td>
      <td>${statusBadge(b.status)}</td>
      <td><div style="display:flex;gap:6px;align-items:center">
        <button class="icon-btn" title="Edit" onclick="openEdit('branch','${b.id}')">✏</button>
        <button class="icon-btn" title="Details" onclick="showToast('Branch details coming soon')">☰</button>
        <button class="icon-btn" title="Delete" onclick="deleteItem('branch','${b.id}')">🗑</button>
      </div></td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
  const start = (page-1)*perPage+1;
  const end = Math.min(page*perPage, filtered.length);
  updateBranchFooter(start, end, filtered.length, totalPages, page);
}
function updateBranchFooter(start, end, total, totalPages, page) {
  document.getElementById('footer-info').innerHTML =
    `Showing <strong>${start}-${end}</strong> of <strong>${total}</strong> branches`;
  let pag = `<button class="page-btn" onclick="changeBranchPage(${page-1})" ${page<=1?'disabled':''}>&#8249;</button>`;
  for (let i=1;i<=totalPages;i++) pag += `<button class="page-btn${i===page?' active':''}" onclick="changeBranchPage(${i})">${i}</button>`;
  pag += `<button class="page-btn" onclick="changeBranchPage(${page+1})" ${page>=totalPages?'disabled':''}>&#8250;</button>`;
  document.querySelector('.pagination').innerHTML = pag;
}
function changeBranchPage(p) { window.branchPage = p; renderTable(); }

function setFooter(shown, total, type) {
  document.getElementById('footer-info').textContent =
    `Showing ${shown} of ${total} ${type} in organizational hierarchy.`;
}

// ══════════════════════════════════════
//  DELETE
// ══════════════════════════════════════
function deleteItem(type, id) {
  if (!confirm('Delete this item?')) return;
  if (type === 'region') regions = regions.filter(r => r.id !== id);
  else if (type === 'cluster') clusters = clusters.filter(c => c.id !== id);
  else if (type === 'branch') branches = branches.filter(b => b.id !== id);
  showToast(type.charAt(0).toUpperCase() + type.slice(1) + ' deleted.');
  refreshRegionFilter();
  renderTable();
}

// ══════════════════════════════════════
//  MODAL
// ══════════════════════════════════════
function openAdd() {
  editId = null;
  if (currentTab === 'regions') setupRegionModal(null);
  else if (currentTab === 'clusters') setupClusterModal(null);
  else setupBranchModal(null);
}
function openEdit(type, id) {
  editId = id;
  if (type === 'region') setupRegionModal(regions.find(r => r.id === id));
  else if (type === 'cluster') setupClusterModal(clusters.find(c => c.id === id));
  else setupBranchModal(branches.find(b => b.id === id));
}

function setupRegionModal(item) {
  modalMode = item ? 'edit-region' : 'add-region';
  document.getElementById('modal-title').textContent = item ? 'Edit Region' : 'Add New Region';
  document.getElementById('modal-sub').textContent = item ? 'Update region details.' : 'Create a new region in the organizational hierarchy.';
  document.getElementById('modal-submit').textContent = item ? 'Save Changes →' : 'Add Region →';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group">
      <label class="form-label">REGION NAME</label>
      <input class="form-input" id="f-name" placeholder="e.g. Eastern Territory Region" value="${escHtml(item?item.name:'')}"/>
    </div>
    <div class="form-group">
      <label class="form-label">FULL NAME / DESCRIPTION</label>
      <input class="form-input" id="f-fullname" placeholder="e.g. Eastern Hub District" value="${escHtml(item?item.fullName:'')}"/>
    </div>
    <div class="form-group">
      <label class="form-label">EFFICIENCY (%)</label>
      <input class="form-input" id="f-efficiency" type="number" min="0" max="100" placeholder="85" value="${item?item.efficiency:''}"/>
    </div>`;
  openModal();
}

function setupClusterModal(item) {
  modalMode = item ? 'edit-cluster' : 'add-cluster';
  document.getElementById('modal-title').textContent = item ? 'Edit Cluster' : 'Add New Cluster';
  document.getElementById('modal-sub').textContent = item ? 'Update cluster details.' : 'Initialize a new cluster within a region.';
  document.getElementById('modal-submit').textContent = item ? 'Save Changes →' : 'Add Cluster →';
  const regionOpts = regions.map(r => `<option value="${escHtml(r.name)}"${item && item.region===r.name?' selected':''}>${escHtml(r.name)}</option>`).join('');
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group">
      <label class="form-label">CLUSTER NAME</label>
      <input class="form-input" id="f-name" placeholder="e.g. Tiger" value="${escHtml(item?item.name:'')}"/>
    </div>
    <div class="form-group">
      <label class="form-label">PARENT REGION</label>
      <select class="form-select" id="f-region"><option value="">Select Region</option>${regionOpts}</select>
    </div>`;
  openModal();
}

function setupBranchModal(item) {
  modalMode = item ? 'edit-branch' : 'add-branch';
  document.getElementById('modal-title').textContent = item ? 'Edit Branch' : 'Add New Branch';
  document.getElementById('modal-sub').textContent = 'Initialize a new operational node within the regional hierarchy.';
  document.getElementById('modal-submit').textContent = item ? 'Save Changes →' : 'Add Branch →';
  const clusterOpts = clusters.map(c => `<option value="${escHtml(c.id)}"${item && item.cluster===c.id?' selected':''}>${escHtml(c.name)}</option>`).join('');
  const autoId = item ? item.branchId : ('BR-' + String(branches.length+1).padStart(3,'0'));
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group">
      <label class="form-label">BRANCH NAME</label>
      <input class="form-input" id="f-name" placeholder="e.g. Asnagar" value="${escHtml(item?item.name:'')}"/>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">BRANCH ID / CODE</label>
        <div class="form-readonly">${autoId}</div>
      </div>
      <div class="form-group">
        <label class="form-label">PARENT CLUSTER</label>
        <select class="form-select" id="f-cluster"><option value="">Select Cluster</option>${clusterOpts}</select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">LOCATION</label>
      <input class="form-input" id="f-location" placeholder="e.g. Vijayawada" value="${escHtml(item?item.location||'':'')}"/>
    </div>`;
  openModal();
}

function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
function onOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function submitModal() {
  if (modalMode === 'add-region') {
    const name = document.getElementById('f-name').value.trim();
    const fullName = document.getElementById('f-fullname').value.trim();
    const efficiency = parseInt(document.getElementById('f-efficiency').value) || 0;
    if (!name) { alert('Region name is required.'); return; }
    const id = name.toUpperCase().slice(0,5).replace(/\s/g,'') + '_' + Date.now();
    regions.push({ id, name, fullName, clusters:0, branches:0, efficiency, status:'ACTIVE' });
    showToast('Region added!');
  } else if (modalMode === 'edit-region') {
    const r = regions.find(x => x.id === editId);
    if (r) {
      r.name = document.getElementById('f-name').value.trim() || r.name;
      r.fullName = document.getElementById('f-fullname').value.trim();
      r.efficiency = parseInt(document.getElementById('f-efficiency').value) || r.efficiency;
    }
    showToast('Region updated!');
  } else if (modalMode === 'add-cluster') {
    const name = document.getElementById('f-name').value.trim();
    const region = document.getElementById('f-region').value;
    if (!name || !region) { alert('Name and Region are required.'); return; }
    const rid = region.slice(0,3).toUpperCase();
    const id = rid + '-' + name.toUpperCase().slice(0,3) + Date.now().toString().slice(-3);
    clusters.push({ id, name, code:id, region, branches:0, status:'Active' });
    showToast('Cluster added!');
  } else if (modalMode === 'edit-cluster') {
    const c = clusters.find(x => x.id === editId);
    if (c) {
      c.name = document.getElementById('f-name').value.trim() || c.name;
      c.region = document.getElementById('f-region').value || c.region;
    }
    showToast('Cluster updated!');
  } else if (modalMode === 'add-branch') {
    const name = document.getElementById('f-name').value.trim();
    const cluster = document.getElementById('f-cluster').value;
    const location = document.getElementById('f-location').value.trim();
    if (!name || !cluster) { alert('Name and Cluster are required.'); return; }
    const cl = clusters.find(c => c.id === cluster);
    const id = cluster + '-B' + (branches.filter(b=>b.cluster===cluster).length+1);
    branches.push({ id, name, branchId:id, cluster, clusterName: cl?cl.name:cluster, region: cl?cl.region:'', location, status:'Active' });
    showToast('Branch added!');
  } else if (modalMode === 'edit-branch') {
    const b = branches.find(x => x.id === editId);
    if (b) {
      b.name = document.getElementById('f-name').value.trim() || b.name;
      b.cluster = document.getElementById('f-cluster').value || b.cluster;
      b.location = document.getElementById('f-location').value.trim();
      const cl = clusters.find(c => c.id === b.cluster);
      b.clusterName = cl ? cl.name : b.cluster;
      b.region = cl ? cl.region : b.region;
    }
    showToast('Branch updated!');
  }
  closeModal();
  refreshRegionFilter();
  renderTable();
}

// ══════════════════════════════════════
//  INIT
// ══════════════════════════════════════
renderTable();
