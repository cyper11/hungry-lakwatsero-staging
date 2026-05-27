// Tourist, Merchant (Owner), and Admin Dashboards Controller

// ==========================================
// 1. TOURIST DASHBOARD
// ==========================================
let activeTouristTab = 'favs';

function switchTouristTab(tabId) {
  activeTouristTab = tabId;
  document.querySelectorAll('.t-tab-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`t-panel-${tabId}`).classList.remove('hidden');
  
  document.querySelectorAll('[id^="btn-t-tab-"]').forEach(btn => {
    btn.className = "px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition whitespace-nowrap";
  });
  const activeBtn = document.getElementById(`btn-t-tab-${tabId}`);
  if (activeBtn) {
    activeBtn.className = "px-4 py-2.5 text-xs font-bold text-brand-500 border-b-2 border-brand-500 transition whitespace-nowrap";
  }
  
  if (tabId === 'favs') {
    populateTouristFavorites();
  } else if (tabId === 'reviews') {
    populateTouristReviews();
  } else if (tabId === 'photos') {
    populateTouristPhotos();
  }
}

function populateTouristDashboard() {
  if (state.user) {
    document.getElementById('tourist-profile-name').innerText = `${state.user.firstName || 'Juan'} ${state.user.lastName || 'Dela Cruz'}`;
    document.getElementById('tourist-profile-email').innerText = state.user.email || 'juan@example.com';
    document.getElementById('tourist-profile-avatar').innerText = `${(state.user.firstName || 'J').substring(0,1).toUpperCase()}${(state.user.lastName || 'D').substring(0,1).toUpperCase()}`;
    
    document.getElementById('t-sett-fname').value = state.user.firstName || 'Juan';
    document.getElementById('t-sett-lname').value = state.user.lastName || 'Dela Cruz';
    document.getElementById('t-sett-nation').value = state.user.nationality || 'Filipino';
    document.getElementById('t-sett-pref').value = state.user.preference || 'Street Food';
  }
  
  switchTouristTab('favs');
}

function populateTouristFavorites() {
  const favsDiv = document.getElementById('tourist-favs-grid');
  if (!favsDiv) return;
  favsDiv.innerHTML = '';
  let count = 0;
  
  state.restaurants.forEach(r => {
    if (state.favorites.includes(r.id)) {
      count++;
      favsDiv.innerHTML += `
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between h-full">
          <div class="h-32 w-full bg-slate-900 overflow-hidden relative">
            <img src="${r.primary_image}" alt="${r.name}" class="w-full h-full object-cover" />
            <span class="absolute top-2 right-2 px-2 py-0.5 bg-rose-950/80 border border-rose-500/30 text-rose-400 text-[8px] uppercase rounded font-bold cursor-pointer" onclick="event.stopPropagation(); removeFavoriteLocal(${r.id})">Remove</span>
          </div>
          <div class="p-4 flex-grow flex flex-col justify-between">
            <div>
              <span class="text-[8px] font-bold text-brand-500 uppercase tracking-widest">${r.municipality_name}</span>
              <h4 class="font-bold text-white text-xs mt-0.5">${r.name}</h4>
              <p class="text-[10px] text-slate-400 mt-1 line-clamp-2">${r.description}</p>
            </div>
            <div class="mt-4 pt-2.5 border-t border-slate-850 flex items-center justify-between text-[10px]">
              <span class="text-amber-500">★ ${r.average_rating.toFixed(1)}</span>
              <button onclick="viewRestaurantDetails(${r.id})" class="text-brand-500 font-bold hover:underline">Explore profile ➔</button>
            </div>
          </div>
        </div>
      `;
    }
  });
  document.getElementById('tourist-stat-favs').innerText = count;
  if (count === 0) {
    favsDiv.innerHTML = '<div class="col-span-full py-8 text-center text-slate-500 italic text-xs">No favorites saved yet. Go find some on the Map Explorer!</div>';
  }
}

function removeFavoriteLocal(id) {
  state.favorites = state.favorites.filter(favId => favId !== id);
  const r = state.restaurants.find(item => item.id === id);
  if (r) {
    addAuditLogLocal('REMOVE_FAVORITE', 'Restaurant', r.name, `Removed favorite`);
  }
  populateTouristFavorites();
  alert('Restaurant removed from your favorites list.');
}

function populateTouristReviews() {
  const list = document.getElementById('tourist-reviews-list');
  if (!list) return;
  list.innerHTML = '';
  let count = 0;
  
  const currentUsername = state.user ? state.user.username : 'tourist_ph';
  
  state.restaurants.forEach(r => {
    r.reviews.forEach(rev => {
      if (rev.username === currentUsername) {
        count++;
        list.innerHTML += `
          <div class="glass-card p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div class="flex justify-between items-start">
              <div>
                <strong class="text-white text-xs block">${r.name}</strong>
                <span class="text-[9px] text-slate-500">📍 ${r.municipality_name}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-amber-500 font-bold">★ ${rev.rating_value}</span>
                <button onclick="deleteTouristReviewLocal(${r.id}, ${rev.id})" class="p-1 bg-slate-950 border border-slate-800 text-rose-455 hover:bg-rose-950/20 rounded" title="Delete Review">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed">${rev.content}</p>
          </div>
        `;
      }
    });
  });
  document.getElementById('tourist-stat-reviews').innerText = count;
  lucide.createIcons();
  if (count === 0) {
    list.innerHTML = '<div class="py-8 text-center text-slate-500 italic text-xs">You haven\'t submitted any reviews yet. Explore eateries and share your experience!</div>';
  }
}

function deleteTouristReviewLocal(restaurantId, reviewId) {
  const r = state.restaurants.find(item => item.id === restaurantId);
  if (r) {
    const rev = r.reviews.find(item => item.id === reviewId);
    r.reviews = r.reviews.filter(rev => rev.id !== reviewId);
    
    // Recalculate average rating
    if (r.reviews.length > 0) {
      const totalRating = r.reviews.reduce((sum, v) => sum + v.rating_value, 0);
      r.average_rating = totalRating / r.reviews.length;
      r.rating_count = r.reviews.length;
    } else {
      r.average_rating = 0.0;
      r.rating_count = 0;
    }
    
    addAuditLogLocal('DELETE_REVIEW', 'Review', r.name, `Deleted review ID ${reviewId} by tourist`);
  }
  populateTouristReviews();
  populateLandingGrid();
  filterMapList();
  updateMapMarkers();
  alert('Your review has been deleted.');
}

function populateTouristPhotos() {
  const grid = document.getElementById('tourist-photos-grid');
  if (!grid) return;
  grid.innerHTML = '';
  let count = state.photos.length;
  
  state.photos.forEach(p => {
    grid.innerHTML += `
      <div class="glass-card rounded-xl overflow-hidden border border-slate-800 aspect-square relative group">
        <img src="${p.url}" alt="Food photo" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
          <p class="text-[9px] text-white font-medium truncate">${p.caption}</p>
          <button onclick="deleteTouristPhotoLocal(${p.id})" class="text-[8px] text-rose-455 font-bold hover:text-rose-300 mt-1 self-start">Delete</button>
        </div>
      </div>
    `;
  });
  document.getElementById('tourist-stat-photos').innerText = count;
  if (count === 0) {
    grid.innerHTML = '<div class="col-span-full py-8 text-center text-slate-500 italic text-xs">Your food gallery is empty. Upload a photo!</div>';
  }
}

function uploadTouristPhotoLocal() {
  const input = document.getElementById('tourist-photo-file');
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  const objectUrl = URL.createObjectURL(file);
  const newPhoto = {
    id: Date.now(),
    url: objectUrl,
    caption: file.name.replace(/\.[^/.]+$/, "")
  };
  
  state.photos.unshift(newPhoto);
  addAuditLogLocal('UPLOAD_PHOTO', 'Photo', newPhoto.caption, `Uploaded custom food photo`);
  populateTouristPhotos();
  alert('Photo uploaded to your explorer profile!');
}

function deleteTouristPhotoLocal(id) {
  const p = state.photos.find(item => item.id === id);
  if (p) {
    addAuditLogLocal('DELETE_PHOTO', 'Photo', p.caption, `Removed photo`);
  }
  state.photos = state.photos.filter(p => p.id !== id);
  populateTouristPhotos();
  alert('Photo deleted from your gallery.');
}

function updateTouristSettingsLocal() {
  const fname = document.getElementById('t-sett-fname').value.trim();
  const lname = document.getElementById('t-sett-lname').value.trim();
  const nation = document.getElementById('t-sett-nation').value.trim();
  const pref = document.getElementById('t-sett-pref').value;
  
  if (!fname || !lname) {
    alert('Please enter your first and last name.');
    return;
  }
  
  if (state.user) {
    state.user.firstName = fname;
    state.user.lastName = lname;
    state.user.nationality = nation;
    state.user.preference = pref;
    
    // Update user record in list
    const u = state.users.find(item => item.username === state.user.username);
    if (u) {
      u.first_name = fname;
      u.last_name = lname;
    }
    
    addAuditLogLocal('UPDATE_SETTINGS', 'User', state.user.username, `Updated profile details`);

    document.getElementById('tourist-profile-name').innerText = `${fname} ${lname}`;
    document.getElementById('tourist-profile-avatar').innerText = `${fname.substring(0,1).toUpperCase()}${lname.substring(0,1).toUpperCase()}`;
    document.getElementById('user-badge-name').innerText = fname;
  }
  alert('Profile information updated successfully!');
}

// ==========================================
// 2. MERCHANT / OWNER DASHBOARD
// ==========================================
function getActiveMerchantRestaurant() {
  const currentUser = state.users.find(u => u.username === (state.user ? state.user.username : 'mang_tomas'));
  const userId = currentUser ? currentUser.id : 2;
  return state.restaurants.find(r => r.owner_id === userId) || state.restaurants.find(r => r.id === 2);
}

function populateOwnerDashboard() {
  const r = getActiveMerchantRestaurant();
  if (!r) return;
  
  // Title and status
  document.getElementById('owner-dashboard-title').innerText = r.name;
  const statusBadge = document.getElementById('owner-status-badge');
  statusBadge.innerText = r.status.toUpperCase();
  if (r.status === 'approved') {
    statusBadge.className = "px-2 py-0.5 bg-emerald-950 text-brand-500 rounded border border-brand-500/10 font-bold uppercase";
  } else if (r.status === 'pending') {
    statusBadge.className = "px-2 py-0.5 bg-amber-950 text-accent-500 rounded border border-accent-500/10 font-bold uppercase";
  } else {
    statusBadge.className = "px-2 py-0.5 bg-rose-950 text-rose-455 rounded border border-rose-500/10 font-bold uppercase";
  }

  // Stats
  document.getElementById('owner-stat-total-reviews').innerText = r.reviews.length;
  document.getElementById('owner-stat-rating').innerText = `${r.average_rating.toFixed(1)} ★`;

  // Profile Form Fields
  document.getElementById('owner-rest-name').value = r.name;
  document.getElementById('owner-rest-address').value = r.address;
  document.getElementById('owner-rest-hours').value = r.business_hours || 'Mon-Sun 8:00 AM - 10:00 PM';
  document.getElementById('owner-rest-phone').value = r.contact_info || '+63 917 123 4567';
  document.getElementById('owner-rest-lat').value = r.latitude;
  document.getElementById('owner-rest-lng').value = r.longitude;
  document.getElementById('owner-rest-desc').value = r.description;
  document.getElementById('owner-rest-history').value = r.history_story;

  // Populate Menu Table
  populateOwnerMenuTable(r);

  // Populate Reviews Thread
  populateOwnerReviewsThread(r);
}

function updateOwnerProfileLocal(e) {
  if (e) e.preventDefault();
  const r = getActiveMerchantRestaurant();
  if (!r) return;

  r.name = document.getElementById('owner-rest-name').value.trim();
  r.address = document.getElementById('owner-rest-address').value.trim();
  r.business_hours = document.getElementById('owner-rest-hours').value.trim();
  r.contact_info = document.getElementById('owner-rest-phone').value.trim();
  r.latitude = parseFloat(document.getElementById('owner-rest-lat').value);
  r.longitude = parseFloat(document.getElementById('owner-rest-lng').value);
  r.description = document.getElementById('owner-rest-desc').value.trim();
  r.history_story = document.getElementById('owner-rest-history').value.trim();

  document.getElementById('owner-dashboard-title').innerText = r.name;
  
  addAuditLogLocal('UPDATE_PROFILE', 'Restaurant', r.name, `Updated coordinates, hours, description`);

  updateMapMarkers();
  populateLandingGrid();
  alert('Restaurant details updated successfully listing profile!');
}

function toggleMenuFormLocal() {
  const form = document.getElementById('owner-menu-form');
  form.classList.toggle('hidden');
}

function populateOwnerMenuTable(r) {
  const tbody = document.getElementById('owner-menu-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (!r.menu || r.menu.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-500 italic">No dishes in your menu. Add some now!</td></tr>';
    return;
  }

  r.menu.forEach((item, index) => {
    tbody.innerHTML += `
      <tr class="hover:bg-slate-900/40">
        <td class="py-2 text-white font-medium">${item.name}</td>
        <td class="text-slate-400">${item.category}</td>
        <td class="text-accent-500 font-bold">₱${item.price.toFixed(2)}</td>
        <td class="text-right py-1">
          <button onclick="deleteDishLocal(${index})" class="p-1 border border-slate-800 text-rose-455 hover:bg-rose-950/20 rounded">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `;
  });
  lucide.createIcons();
}

function saveDishLocal() {
  const name = document.getElementById('owner-dish-name').value.trim();
  const cat = document.getElementById('owner-dish-category').value;
  const price = parseFloat(document.getElementById('owner-dish-price').value);
  
  if (!name || isNaN(price)) {
    alert('Please fill out all dish fields with valid values.');
    return;
  }

  const r = getActiveMerchantRestaurant();
  if (!r) return;
  if (!r.menu) r.menu = [];

  r.menu.push({ name: name, category: cat, price: price });
  
  document.getElementById('owner-dish-name').value = '';
  document.getElementById('owner-dish-price').value = '';
  document.getElementById('owner-menu-form').classList.add('hidden');

  addAuditLogLocal('ADD_DISH', 'Menu', r.name, `Added dish: ${name} (₱${price})`);
  populateOwnerMenuTable(r);
  alert('Dish successfully added to your restaurant menu!');
}

function deleteDishLocal(index) {
  const r = getActiveMerchantRestaurant();
  if (r && r.menu) {
    const dishName = r.menu[index].name;
    r.menu.splice(index, 1);
    addAuditLogLocal('DELETE_DISH', 'Menu', r.name, `Removed dish: ${dishName}`);
    populateOwnerMenuTable(r);
    alert('Dish removed from menu.');
  }
}

function populateOwnerReviewsThread(r) {
  const thread = document.getElementById('owner-reviews-thread');
  if (!thread) return;
  thread.innerHTML = '';

  if (r.reviews.length === 0) {
    thread.innerHTML = '<p class="text-slate-500 italic py-2">No customer reviews yet.</p>';
    return;
  }

  r.reviews.forEach(rev => {
    let commentsHtml = '';
    if (rev.comments && rev.comments.length > 0) {
      rev.comments.forEach(comment => {
        commentsHtml += `
          <div class="mt-2 pl-3 border-l-2 border-brand-500 text-[10px] space-y-0.5 bg-slate-950/40 p-2 rounded">
            <span class="font-bold text-brand-500">Your Reply:</span>
            <p class="text-slate-400 italic">${comment.text}</p>
          </div>
        `;
      });
    }

    thread.innerHTML += `
      <div class="p-4 bg-slate-950/80 border border-slate-900 rounded-xl space-y-3">
        <div class="flex justify-between items-center text-[10px]">
          <span class="font-bold text-slate-200">${rev.first_name} (${rev.username})</span>
          <span class="text-amber-500">★ ${rev.rating_value}</span>
        </div>
        <p class="text-xs text-slate-350">${rev.content}</p>
        ${commentsHtml}
        
        <div class="flex gap-2 items-center mt-2 pt-2 border-t border-slate-900/60">
          <input type="text" id="reply-input-${rev.id}" placeholder="Type your merchant response..." class="flex-grow bg-slate-900 border border-slate-850 rounded p-1.5 text-[10px] text-slate-200 outline-none focus:border-brand-500" />
          <button onclick="submitReplyLocal(${rev.id})" class="px-3 py-1.5 bg-brand-500 text-slate-950 font-bold rounded text-[9px] hover:bg-brand-600 transition">Reply</button>
        </div>
      </div>
    `;
  });
}

function submitReplyLocal(reviewId) {
  const input = document.getElementById(`reply-input-${reviewId}`);
  if (!input || !input.value.trim()) return;

  const r = getActiveMerchantRestaurant();
  if (!r) return;

  const rev = r.reviews.find(item => item.id === reviewId);
  if (rev) {
    if (!rev.comments) rev.comments = [];
    rev.comments.push({
      id: Date.now(),
      username: state.user ? state.user.username : 'mang_tomas',
      text: input.value.trim()
    });
    
    addAuditLogLocal('MERCHANT_REPLY', 'Review', rev.username, `Replied to review ID ${reviewId} on "${r.name}"`);
    input.value = '';
    populateOwnerReviewsThread(r);
    alert('Reply posted to customer review thread!');
  }
}

function requestVerificationLocal() {
  const r = getActiveMerchantRestaurant();
  if (!r) return;

  r.status = 'pending';
  const fileInput = document.getElementById('permit-doc-input');
  const filename = fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : 'business_permit.pdf';
  
  addAuditLogLocal('SUBMIT_PERMIT', 'Restaurant', r.name, `Submitted permit file for listing approval: "${filename}"`);
  populateOwnerDashboard();
  alert('Verification permit uploaded to Admin moderator queue!');
}

// ==========================================
// 3. SUPERUSER ADMIN DASHBOARD
// ==========================================
function populateAdminDashboard() {
  // 1. Stats Counter Cards
  const totalUsers = state.users.length;
  const pendingCount = state.restaurants.filter(r => r.status === 'pending').length;
  const auditCount = state.audits.length;
  
  document.getElementById('admin-users-count').innerText = totalUsers;
  document.getElementById('admin-pending-count').innerText = pendingCount;
  document.getElementById('admin-audits-count').innerText = auditCount;

  // 2. Business Verification Queue
  const verifBody = document.getElementById('admin-verif-tbody');
  if (verifBody) {
    verifBody.innerHTML = '';
    const pendingRests = state.restaurants.filter(r => r.status === 'pending');
    
    if (pendingRests.length === 0) {
      verifBody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-slate-500 italic">No pending verification requests.</td></tr>`;
    } else {
      pendingRests.forEach(r => {
        const owner = state.users.find(u => u.id === r.owner_id) || { first_name: 'Tomas', last_name: 'Alcantara' };
        const ownerName = `${owner.first_name} ${owner.last_name}`;
        verifBody.innerHTML += `
          <tr class="align-middle border-t border-slate-900">
            <td class="py-2.5"><strong>${r.name}</strong><br/><span class="text-[10px] text-slate-550">${r.address} (${ownerName})</span></td>
            <td><span class="text-brand-500 underline font-bold cursor-pointer" onclick="alert('Displaying secure mock upload preview for Mayor Permit document DTI-SEC-991.')">permit_dti.pdf</span></td>
            <td class="text-right py-2">
              <div class="flex justify-end gap-1.5">
                <button onclick="approveVerificationLocal(${r.id})" class="p-1 bg-slate-900 hover:bg-brand-950 hover:text-brand-500 border border-slate-850 rounded" title="Approve Listing">
                  <i data-lucide="check" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="rejectVerificationLocal(${r.id})" class="p-1 bg-slate-900 hover:bg-rose-950/40 hover:text-rose-455 border border-slate-850 rounded" title="Reject Listing">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      });
    }
  }

  // 3. Flagged Content Moderator Table
  const flaggedBody = document.getElementById('admin-flagged-tbody');
  if (flaggedBody) {
    flaggedBody.innerHTML = '';
    let flaggedReviews = [];
    state.restaurants.forEach(r => {
      r.reviews.forEach(rev => {
        if (rev.flagged) {
          flaggedReviews.push({ restaurant: r, review: rev });
        }
      });
    });

    if (flaggedReviews.length === 0) {
      flaggedBody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-500 italic">No flagged content to moderate.</td></tr>`;
    } else {
      flaggedReviews.forEach(fr => {
        flaggedBody.innerHTML += `
          <tr class="hover:bg-slate-900/40 border-t border-slate-900 text-xs">
            <td class="py-2.5"><strong>${fr.restaurant.name}</strong></td>
            <td>@${fr.review.username}</td>
            <td class="max-w-xs truncate text-slate-400 font-medium" title="${fr.review.content}">${fr.review.content}</td>
            <td class="text-right py-2">
              <div class="flex justify-end gap-1.5">
                <button onclick="dismissFlaggedLocal(${fr.restaurant.id}, ${fr.review.id})" class="px-2 py-1 bg-slate-900 hover:bg-brand-950 hover:text-brand-500 border border-slate-850 rounded text-[9px] font-bold" title="Dismiss Report">
                  Dismiss
                </button>
                <button onclick="deleteFlaggedLocal(${fr.restaurant.id}, ${fr.review.id})" class="px-2 py-1 bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-850 rounded text-[9px] font-bold" title="Delete Review">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      });
    }
  }

  // 4. Users Database Table
  const usersBody = document.getElementById('admin-users-tbody');
  if (usersBody) {
    usersBody.innerHTML = '';
    state.users.forEach(u => {
      const statusClass = u.is_active 
        ? 'bg-emerald-950 text-brand-500 border border-brand-500/20' 
        : 'bg-rose-950 text-rose-455 border border-rose-500/20';
      const banIcon = u.is_active ? 'ban' : 'unlock';
      const banTitle = u.is_active ? 'Ban User' : 'Unban User';
      const rowClass = u.is_active ? '' : 'opacity-60';
      usersBody.innerHTML += `
        <tr class="border-t border-slate-900 hover:bg-slate-900/20 ${rowClass}">
          <td class="py-2.5">@${u.username}</td>
          <td>${u.email}</td>
          <td><span class="text-brand-500 font-bold uppercase tracking-wider text-[9px]">${u.role_name}</span></td>
          <td><span class="px-2 py-0.5 ${statusClass} text-[8px] uppercase rounded font-bold">${u.is_active ? 'active' : 'banned'}</span></td>
          <td class="text-right py-2">
            <button onclick="toggleUserStatusLocal(${u.id})" class="p-1 border border-slate-800 text-rose-455 hover:bg-rose-950/20 rounded" title="${banTitle}">
              <i data-lucide="${banIcon}" class="w-3.5 h-3.5"></i>
            </button>
          </td>
        </tr>
      `;
    });
  }

  // 5. System Security Audit Logs Table
  const auditBody = document.getElementById('admin-audit-tbody');
  if (auditBody) {
    auditBody.innerHTML = '';
    
    if (state.audits.length === 0) {
      auditBody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500 italic">No audit events logged.</td></tr>`;
    } else {
      state.audits.forEach(a => {
        auditBody.innerHTML += `
          <tr class="hover:bg-slate-900/40 text-[11px] border-t border-slate-900/40">
            <td class="py-2 text-slate-500 font-mono text-[10px]">${a.timestamp}</td>
            <td class="font-semibold text-slate-300">@${a.user}</td>
            <td><span class="px-1.5 py-0.5 bg-slate-950 border border-slate-850 rounded text-brand-500 font-mono text-[9px] uppercase">${a.action}</span></td>
            <td class="text-slate-400">${a.entityType}</td>
            <td class="text-slate-500 italic">${a.details || a.entityId}</td>
          </tr>
        `;
      });
    }
  }

  lucide.createIcons();
}

function approveVerificationLocal(id) {
  const r = state.restaurants.find(item => item.id === id);
  if (r) {
    r.status = 'approved';
    addAuditLogLocal('APPROVE_RESTAURANT', 'Restaurant', r.name, `Approved listing for owner ID ${r.owner_id}`);
  }
  populateAdminDashboard();
  updateMapMarkers();
  populateLandingGrid();
  alert('Establishment approved and plotted live onto the Map Explorer!');
}

function rejectVerificationLocal(id) {
  const r = state.restaurants.find(item => item.id === id);
  if (r) {
    r.status = 'rejected';
    addAuditLogLocal('REJECT_RESTAURANT', 'Restaurant', r.name, `Rejected listing for owner ID ${r.owner_id}`);
  }
  populateAdminDashboard();
  alert('Establishment listing verification request has been rejected.');
}

function dismissFlaggedLocal(restaurantId, reviewId) {
  const r = state.restaurants.find(item => item.id === restaurantId);
  if (!r) return;
  const rev = r.reviews.find(item => item.id === reviewId);
  if (rev) {
    rev.flagged = false;
    addAuditLogLocal('DISMISS_REPORT', 'Review', rev.username, `Dismissed report for review ID ${reviewId} on "${r.name}"`);
  }
  populateAdminDashboard();
  alert('Report has been dismissed.');
}

function deleteFlaggedLocal(restaurantId, reviewId) {
  const r = state.restaurants.find(item => item.id === restaurantId);
  if (!r) return;
  const rev = r.reviews.find(item => item.id === reviewId);
  if (rev) {
    r.reviews = r.reviews.filter(item => item.id !== reviewId);
    // Recalculate average rating
    if (r.reviews.length > 0) {
      const totalRating = r.reviews.reduce((sum, v) => sum + v.rating_value, 0);
      r.average_rating = totalRating / r.reviews.length;
      r.rating_count = r.reviews.length;
    } else {
      r.average_rating = 0.0;
      r.rating_count = 0;
    }
    
    addAuditLogLocal('DELETE_REVIEW', 'Review', rev.username, `Deleted reported review ID ${reviewId} on "${r.name}"`);
  }
  populateAdminDashboard();
  populateLandingGrid();
  filterMapList();
  updateMapMarkers();
  alert('Reported review content has been deleted from the database.');
}

function toggleUserStatusLocal(userId) {
  const u = state.users.find(item => item.id === userId);
  if (u) {
    u.is_active = !u.is_active;
    const statusText = u.is_active ? 'ACTIVATED' : 'BANNED';
    addAuditLogLocal('TOGGLE_USER_STATUS', 'User', u.username, `Changed status to ${statusText}`);
    
    // If current user is banned, logout immediately
    if (state.user && state.user.username === u.username && !u.is_active) {
      alert('This user account has been banned. Session will terminate.');
      handleLogout();
      return;
    }
    
    alert(`User @${u.username} status has been toggled to ${u.is_active ? 'Active' : 'Banned'}.`);
  }
  populateAdminDashboard();
}
