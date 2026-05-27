// Main App Entry and Orchestration Controller

// View Routing
function showSection(sectionId) {
  document.querySelectorAll('.section-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('sec-' + sectionId).classList.remove('hidden');

  // Initialize Leaflet Map if Map Explorer is selected
  if (sectionId === 'map') {
    setTimeout(initPreviewMap, 100);
  }
}

// Populate Lists
function populateLandingGrid() {
  const grid = document.getElementById('landing-restaurant-grid');
  if (!grid) return;
  grid.innerHTML = '';

  state.restaurants.forEach(r => {
    if (r.status !== 'approved') return;
    grid.innerHTML += `
      <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-brand-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        <div class="h-44 w-full bg-slate-900 overflow-hidden">
          <img src="${r.primary_image}" alt="${r.name}" class="w-full h-full object-cover" />
        </div>
        <div class="p-5 flex flex-col justify-between flex-grow">
          <div>
            <span class="text-[9px] font-bold text-brand-500 uppercase tracking-widest">${r.municipality_name}</span>
            <h3 class="font-display font-bold text-base text-white mt-1">${r.name}</h3>
            <p class="text-xs text-slate-455 mt-1 line-clamp-2">${r.description}</p>
          </div>
          <div class="mt-5 pt-3 border-t border-slate-850 flex items-center justify-between">
            <button onclick="viewRestaurantDetails(${r.id})" class="text-xs font-bold text-brand-500 hover:underline">Explore profile ➔</button>
            <span class="text-[10px] text-slate-500">★ ${r.average_rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    `;
  });
}

function viewRestaurantDetails(id) {
  activeRestaurantId = id;
  const r = state.restaurants.find(item => item.id === id);
  if (!r) return;

  document.getElementById('detail-name').innerText = r.name;
  document.getElementById('detail-address').innerText = '📍 ' + r.address;
  document.getElementById('detail-mun').innerText = r.municipality_name;
  document.getElementById('detail-description').innerText = r.description;
  document.getElementById('detail-history').innerText = `"${r.history_story}"`;
  document.getElementById('detail-hours').innerText = r.business_hours;
  document.getElementById('detail-cover').src = r.primary_image;

  // Menu
  const menuDiv = document.getElementById('detail-menu-items');
  menuDiv.innerHTML = '';
  if (r.menu && r.menu.length > 0) {
    r.menu.forEach(item => {
      menuDiv.innerHTML += `
        <div class="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
          <div>
            <strong class="text-slate-100 block">${item.name}</strong>
            <span class="text-[10px] text-slate-500">${item.category}</span>
          </div>
          <span class="text-accent-500 font-bold">₱${item.price.toFixed(2)}</span>
        </div>
      `;
    });
  } else {
    menuDiv.innerHTML = '<div class="col-span-full py-4 text-center text-slate-500 italic text-[11px]">No custom dishes added yet.</div>';
  }

  // Reviews
  populateDetailsReviews(r);

  // Fav button state
  const isFav = state.favorites.includes(id);
  document.getElementById('btn-fav').className = isFav
    ? "w-full py-2 bg-rose-950/40 border border-rose-900 text-rose-455 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
    : "w-full py-2 bg-slate-900 border border-slate-800 hover:border-rose-900 text-slate-400 hover:text-rose-455 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5";

  showSection('restaurant-detail');
}

function populateDetailsReviews(restaurant) {
  const list = document.getElementById('detail-reviews-list');
  if (!list) return;
  list.innerHTML = '';

  if (restaurant.reviews.length === 0) {
    list.innerHTML = '<p class="text-slate-550 italic">No reviews yet.</p>';
    return;
  }

  restaurant.reviews.forEach(rev => {
    let repliesHtml = '';
    if (rev.comments && rev.comments.length > 0) {
      rev.comments.forEach(comment => {
        repliesHtml += `
          <div class="mt-2 pl-3 border-l-2 border-brand-500 text-[10px] space-y-0.5 ml-2">
            <span class="font-bold text-brand-500">Merchant Reply (${comment.username}):</span>
            <p class="text-slate-400 italic">${comment.text}</p>
          </div>
        `;
      });
    }

    const isMyReview = state.user && state.user.username === rev.username;
    const flagButton = (!state.user || (!isMyReview && !rev.flagged))
      ? `<button onclick="flagReviewLocal(${restaurant.id}, ${rev.id})" class="text-[9px] text-slate-500 hover:text-rose-450 transition flex items-center gap-0.5 ml-2"><i data-lucide="flag" class="w-3 h-3"></i> Report</button>`
      : (rev.flagged ? `<span class="text-[9px] text-rose-500 font-bold flex items-center gap-0.5 ml-2"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Reported</span>` : '');

    list.innerHTML += `
      <div class="pt-3 border-b border-slate-850 pb-3 space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span class="font-bold text-slate-200">${rev.first_name} (${rev.username})</span>
          <div class="flex items-center gap-1.5">
            <span class="text-amber-500">★ ${rev.rating_value}</span>
            ${flagButton}
          </div>
        </div>
        <p class="text-xs text-slate-350">${rev.content}</p>
        ${repliesHtml}
      </div>
    `;
  });
  lucide.createIcons();
}

function submitReviewLocal() {
  if (!state.user) {
    alert('You must sign in to submit a review.');
    showSection('login');
    return;
  }
  if (!activeRestaurantId) return;
  const r = state.restaurants.find(item => item.id === activeRestaurantId);
  if (!r) return;

  const ratingVal = parseInt(document.getElementById('review-rating').value);
  const content = document.getElementById('review-content').value.trim();
  if (!content) {
    alert('Please enter your recipe review comment.');
    return;
  }

  const newReview = {
    id: Date.now(),
    username: state.user.username,
    first_name: state.user.firstName || 'Anonymous',
    last_name: state.user.lastName || '',
    rating_value: ratingVal,
    content: content,
    comments: [],
    flagged: false
  };

  r.reviews.unshift(newReview);
  
  // Re-calculate ratings
  const totalRating = r.reviews.reduce((sum, rev) => sum + rev.rating_value, 0);
  r.average_rating = totalRating / r.reviews.length;
  r.rating_count = r.reviews.length;

  document.getElementById('review-content').value = '';
  
  // Refresh views
  viewRestaurantDetails(activeRestaurantId);
  populateLandingGrid();
  filterMapList();
  updateMapMarkers();
  
  addAuditLogLocal('SUBMIT_REVIEW', 'Review', r.name, `Rating: ${ratingVal}★ - comment: "${content.substring(0, 25)}..."`);
  alert('Review posted successfully!');
}

function toggleFavoriteLocal() {
  if (!state.user) {
    alert('You must sign in to save favorites.');
    showSection('login');
    return;
  }
  if (!activeRestaurantId) return;
  const index = state.favorites.indexOf(activeRestaurantId);
  const r = state.restaurants.find(item => item.id === activeRestaurantId);
  if (!r) return;

  if (index === -1) {
    state.favorites.push(activeRestaurantId);
    addAuditLogLocal('ADD_FAVORITE', 'Restaurant', r.name, `Saved to favorites list`);
    alert('Restaurant added to your favorites!');
  } else {
    state.favorites.splice(index, 1);
    addAuditLogLocal('REMOVE_FAVORITE', 'Restaurant', r.name, `Removed from favorites list`);
    alert('Restaurant removed from your favorites.');
  }
  viewRestaurantDetails(activeRestaurantId);
}

function flagReviewLocal(restaurantId, reviewId) {
  if (!state.user) {
    alert('You must sign in to report content.');
    showSection('login');
    return;
  }
  const r = state.restaurants.find(item => item.id === restaurantId);
  if (!r) return;
  const rev = r.reviews.find(item => item.id === reviewId);
  if (rev) {
    rev.flagged = true;
    addAuditLogLocal('FLAG_REVIEW', 'Review', rev.username, `Review ID ${reviewId} flagged on eatery "${r.name}"`);
    populateDetailsReviews(r);
    alert('This review has been reported to the administration team.');
  }
}

// Populate Culinary CMS stories list
function populateStoriesList() {
  const list = document.getElementById('stories-feed-list');
  if (!list) return;
  list.innerHTML = '';

  state.stories.forEach(s => {
    list.innerHTML += `
      <div onclick="readStoryLocal(${s.id})" class="p-3 bg-slate-900/40 border border-slate-850 rounded-xl cursor-pointer hover:border-brand-500/20 transition">
        <span class="text-[9px] text-brand-500 font-bold uppercase tracking-wider">${s.municipality_name}</span>
        <h3 class="font-bold text-xs text-slate-100 mt-1">${s.title}</h3>
      </div>
    `;
  });
  readStoryLocal(1);
}

function readStoryLocal(id) {
  const s = state.stories.find(i => i.id === id);
  if (!s) return;
  document.getElementById('story-read-title').innerText = s.title;
  document.getElementById('story-read-meta').innerHTML = `<span>📍 ${s.municipality_name}</span><span>Author: ${s.author_name}</span>`;
  document.getElementById('story-read-body').innerText = s.content;
}

function filterMapList() {
  const text = document.getElementById('map-search').value.toLowerCase();
  const mun = document.getElementById('map-mun').value;
  const list = document.getElementById('map-restaurants-list');
  if (!list) return;
  list.innerHTML = '';

  state.restaurants.forEach(r => {
    if (r.status !== 'approved') return;
    if (mun && !r.municipality_name.includes(mun)) return;
    if (text && !r.name.toLowerCase().includes(text) && !r.description.toLowerCase().includes(text)) return;

    list.innerHTML += `
      <div onclick="viewRestaurantDetails(${r.id})" class="p-2.5 bg-slate-950 rounded-xl border border-slate-850 hover:border-brand-500/20 cursor-pointer flex justify-between items-center transition">
        <div>
          <strong class="text-slate-100 block text-xs">${r.name}</strong>
          <span class="text-[9px] text-slate-500">${r.municipality_name}</span>
        </div>
        <span class="text-[10px] text-amber-500 font-bold">★ ${r.average_rating.toFixed(1)}</span>
      </div>
    `;
  });
}

function triggerLandingSearch() {
  const q = document.getElementById('landing-search').value;
  document.getElementById('map-search').value = q;
  showSection('map');
  filterMapList();
}

// App Boot
window.onload = () => {
  populateLandingGrid();
  populateStoriesList();
  filterMapList();
  lucide.createIcons();
  showSection('landing');
};
