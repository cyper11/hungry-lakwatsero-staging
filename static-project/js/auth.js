// Authentication & Registration Controllers

let regCurrentStep = 1;
let regSelectedRole = 1; // 1 = Tourist, 2 = Food Owner, 3 = Admin

function setRegRole(roleId) {
  regSelectedRole = roleId;
  document.querySelectorAll('.reg-role-card').forEach(card => {
    card.classList.remove('border-brand-500', 'bg-brand-950/20');
    card.classList.add('border-slate-800');
    const check = card.querySelector('.check-icon');
    if (check) check.classList.add('hidden');
  });
  const selectedCard = document.getElementById(`reg-role-${roleId}`);
  selectedCard.classList.remove('border-slate-800');
  selectedCard.classList.add('border-brand-500', 'bg-brand-950/20');
  const check = selectedCard.querySelector('.check-icon');
  if (check) check.classList.remove('hidden');
}

function updateRegWizard() {
  // Hide all panels
  document.getElementById('reg-panel-1').classList.add('hidden');
  document.getElementById('reg-panel-2').classList.add('hidden');
  document.getElementById('reg-panel-3').classList.add('hidden');
  
  // Show active panel
  document.getElementById(`reg-panel-${regCurrentStep}`).classList.remove('hidden');
  
  // Update Stepper dots
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`reg-step-dot-${i}`);
    if (!dot) continue;
    if (i < regCurrentStep) {
      dot.className = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-brand-500 text-slate-950";
      dot.innerHTML = "✓";
    } else if (i === regCurrentStep) {
      dot.className = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-brand-500 text-brand-500 bg-brand-950/40";
      dot.innerHTML = i;
    } else {
      dot.className = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-800 text-slate-500 bg-slate-900";
      dot.innerHTML = i;
    }
  }
  
  // Render role-specific fields
  if (regCurrentStep === 3) {
    document.getElementById('reg-fields-tourist').classList.add('hidden');
    document.getElementById('reg-fields-owner').classList.add('hidden');
    document.getElementById('reg-fields-admin').classList.add('hidden');
    
    if (regSelectedRole === 1) {
      document.getElementById('reg-fields-tourist').classList.remove('hidden');
    } else if (regSelectedRole === 2) {
      document.getElementById('reg-fields-owner').classList.remove('hidden');
    } else {
      document.getElementById('reg-fields-admin').classList.remove('hidden');
    }
  }
  lucide.createIcons();
}

function nextRegStep() {
  if (regCurrentStep === 1) {
    regCurrentStep = 2;
    updateRegWizard();
  } else if (regCurrentStep === 2) {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;
    
    if (!name || !email || !pass || !confirm) {
      alert('Please fill out all fields.');
      return;
    }
    if (pass !== confirm) {
      alert('Passwords do not match.');
      return;
    }
    if (pass.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    regCurrentStep = 3;
    updateRegWizard();
  }
}

function prevRegStep() {
  if (regCurrentStep > 1) {
    regCurrentStep--;
    updateRegWizard();
  }
}

function handlePasswordInput() {
  const val = document.getElementById('reg-password').value;
  const checks = {
    length: val.length >= 8,
    upper: /[A-Z]/.test(val),
    lower: /[a-z]/.test(val),
    number: /[0-9]/.test(val),
    special: /[^A-Za-z0-9]/.test(val)
  };
  
  for (const [key, passed] of Object.entries(checks)) {
    const el = document.getElementById(`pw-check-${key}`);
    if (!el) continue;
    const icon = el.querySelector('.chk-icon');
    if (passed) {
      el.classList.remove('text-slate-500');
      el.classList.add('text-brand-500');
      if (icon) icon.innerHTML = '✓';
    } else {
      el.classList.remove('text-brand-500');
      el.classList.add('text-slate-500');
      if (icon) icon.innerHTML = '○';
    }
  }
}

function submitRegistration() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  
  let newUser = {
    id: Date.now(),
    username: email.split('@')[0],
    email: email,
    first_name: name.split(' ')[0],
    last_name: name.split(' ').slice(1).join(' ') || 'User',
    role_name: regSelectedRole === 1 ? 'Tourist' : (regSelectedRole === 2 ? 'Food Business Owner' : 'Admin'),
    is_active: true
  };
  
  if (regSelectedRole === 1) {
    newUser.nationality = document.getElementById('reg-nationality').value;
    newUser.preference = document.getElementById('reg-preference').value;
    state.users.push(newUser);
    addAuditLogLocal('REGISTER_TOURIST', 'User', newUser.username, `New account created: ${newUser.first_name} ${newUser.last_name}`);
    alert('Tourist account registered successfully! Logging you in...');
    state.user = { username: newUser.username, role: 'Tourist', roleId: 1, firstName: newUser.first_name, lastName: newUser.last_name, nationality: newUser.nationality, preference: newUser.preference };
    loginAsUserDirectly(state.user);
  } else if (regSelectedRole === 2) {
    const bizName = document.getElementById('reg-biz-name').value.trim();
    const bizAddr = document.getElementById('reg-biz-address').value.trim();
    const bizDesc = document.getElementById('reg-biz-desc').value.trim();
    
    if (!bizName || !bizAddr) {
      alert('Please fill out the Business Name and Address.');
      return;
    }
    
    const newRest = {
      id: Date.now(),
      name: bizName,
      address: bizAddr,
      latitude: 14.2811 + (Math.random() - 0.5) * 0.1,
      longitude: 120.9168 + (Math.random() - 0.5) * 0.1,
      average_rating: 0.0,
      rating_count: 0,
      primary_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      municipality_name: 'Kawit',
      description: bizDesc || 'Traditional Cavite eatery.',
      contact_info: '+63 917 000 0000',
      business_hours: 'Mon-Sun 8:00 AM - 9:00 PM',
      history_story: 'Founded with a passion for preserving Caviteño food traditions.',
      owner_id: newUser.id,
      status: 'pending',
      menu: [],
      reviews: []
    };
    
    state.restaurants.push(newRest);
    state.users.push(newUser);
    
    addAuditLogLocal('REGISTER_MERCHANT', 'User', newUser.username, `Registered and submitted listing: "${newRest.name}"`);
    alert('Business Owner registered and listing submitted for Admin Approval! Logging you in...');
    state.user = { username: newUser.username, role: 'Food Business Owner', roleId: 2, firstName: newUser.first_name, lastName: newUser.last_name, restaurantId: newRest.id };
    
    loginAsUserDirectly(state.user);
  } else {
    const code = document.getElementById('reg-admin-code').value;
    if (code !== 'eatywonders2026') {
      alert('Invalid admin security access code.');
      return;
    }
    state.users.push(newUser);
    addAuditLogLocal('REGISTER_ADMIN', 'User', newUser.username, `Admin registration completed`);
    alert('Administrator account registered! Logging you in...');
    state.user = { username: newUser.username, role: 'Admin', roleId: 3, firstName: newUser.first_name, lastName: newUser.last_name };
    loginAsUserDirectly(state.user);
  }
}

function loginAsUserDirectly(account) {
  // Update Navbar
  document.getElementById('auth-guest').classList.add('hidden');
  document.getElementById('auth-logged').classList.remove('hidden');
  document.getElementById('nav-dash').classList.remove('hidden');
  
  document.getElementById('user-badge-name').innerText = account.firstName;
  document.getElementById('user-badge-role').innerText = account.role;

  // Reset registration form
  regCurrentStep = 1;
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('reg-confirm-password').value = '';
  if (document.getElementById('reg-biz-name')) document.getElementById('reg-biz-name').value = '';
  if (document.getElementById('reg-biz-address')) document.getElementById('reg-biz-address').value = '';
  if (document.getElementById('reg-biz-desc')) document.getElementById('reg-biz-desc').value = '';
  updateRegWizard();

  // Redirect
  if (account.roleId === 1) {
    populateTouristDashboard();
    showSection('tourist-dashboard');
  } else if (account.roleId === 2) {
    populateOwnerDashboard();
    showSection('owner-dashboard');
  } else {
    populateAdminDashboard();
    showSection('admin-dashboard');
  }
}

// Auth Flows
function handleLoginLocal() {
  const email = document.getElementById('login-email').value.trim();
  const captcha = document.getElementById('login-captcha').value;
  
  if (Number(captcha) !== 8) {
    alert('Security captcha incorrect.');
    return;
  }

  const users = {
    admin: { username: 'admin', role: 'Admin', roleId: 3, firstName: 'EatyWonders', lastName: 'Admin' },
    mang_tomas: { username: 'mang_tomas', role: 'Food Business Owner', roleId: 2, firstName: 'Tomas', lastName: 'Alcantara' },
    tourist_ph: { username: 'tourist_ph', role: 'Tourist', roleId: 1, firstName: 'Juan', lastName: 'Dela Cruz' }
  };

  const account = users[email] || users['tourist_ph'];
  
  // Ensure user status is active
  const dbUser = state.users.find(u => u.username === account.username);
  if (dbUser && !dbUser.is_active) {
    alert('Your account has been suspended/banned by administrators.');
    return;
  }

  state.user = account;

  // Update Navbar
  document.getElementById('auth-guest').classList.add('hidden');
  document.getElementById('auth-logged').classList.remove('hidden');
  document.getElementById('nav-dash').classList.remove('hidden');
  
  document.getElementById('user-badge-name').innerText = account.firstName;
  document.getElementById('user-badge-role').innerText = account.role;

  addAuditLogLocal('LOGIN', 'User', account.username, `Successful login session`);

  // Populate dashboards
  if (account.roleId === 1) {
    populateTouristDashboard();
    showSection('tourist-dashboard');
  } else if (account.roleId === 2) {
    populateOwnerDashboard();
    showSection('owner-dashboard');
  } else {
    populateAdminDashboard();
    showSection('admin-dashboard');
  }
}

function handleLogout() {
  if (state.user) {
    addAuditLogLocal('LOGOUT', 'User', state.user.username, `Closed session`);
  }
  state.user = null;
  document.getElementById('auth-guest').classList.remove('hidden');
  document.getElementById('auth-logged').classList.add('hidden');
  document.getElementById('nav-dash').classList.add('hidden');
  showSection('landing');
}

function openActiveDashboard() {
  if (!state.user) return;
  if (state.user.roleId === 1) {
    populateTouristDashboard();
    showSection('tourist-dashboard');
  } else if (state.user.roleId === 2) {
    populateOwnerDashboard();
    showSection('owner-dashboard');
  } else {
    populateAdminDashboard();
    showSection('admin-dashboard');
  }
}
