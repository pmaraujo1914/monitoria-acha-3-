/* Configuração pública para o Monitoria no GitHub Pages. Proteção real fica nas regras RLS do Supabase. */
(() => {
  const SUPABASE_URL = 'https://nvnfivlvwjcdfqumxyep.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_QVpwDQn0zUrMCysb5iXdzw_pnDMdbLj';
  const SESSION_MINUTES = 5;
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);

  const showFeedback = message => { const feedback = $('auth-feedback'); if (feedback) { feedback.textContent = message; feedback.hidden = false; } };
  const openSetup = email => { $('login-view').hidden = true; $('password-setup-view').hidden = false; $('password-setup-identifier').value = email; $('password-setup-email').textContent = `Crie sua senha para ${email}.`; };
  const setExpiry = () => localStorage.setItem('monitoria-session-expires-at', String(Date.now() + SESSION_MINUTES * 60 * 1000));
  const clearExpiry = () => localStorage.removeItem('monitoria-session-expires-at');

  async function loadSharedData() {
    const { data, error } = await client.from('monitoria_collections').select('collection,data');
    if (error) { console.error(error); return; }
    const collections = Object.fromEntries((data || []).map(item => [item.collection, item.data]));
    window.monitoriaData.setCollections(collections);
  }

  async function openDashboard(session) {
    const { data: profile, error } = await client.from('monitoria_profiles').select('is_admin,email').eq('id', session.user.id).single();
    if (error || !profile) { showFeedback('Seu acesso ainda não foi liberado pelo administrador.'); await client.auth.signOut(); return; }
    setExpiry();
    $('auth-gate').hidden = true; $('auth-gate').style.display = 'none'; $('app-shell').hidden = false;
    $('logged-user').textContent = profile.email;
    $('access-nav').hidden = !profile.is_admin;
    document.querySelectorAll('.page-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'dashboard'));
    document.querySelectorAll('[data-page]').forEach(item => item.classList.toggle('active', item.dataset.page === 'dashboard'));
    window.location.hash = 'dashboard';
    await loadSharedData();
  }

  window.monitoriaCloudSync = async (collection, data) => {
    const { data: auth } = await client.auth.getSession();
    if (!auth.session) return;
    const { error } = await client.from('monitoria_collections').upsert({ collection, data, updated_at: new Date().toISOString() });
    if (error) console.error('Não foi possível sincronizar:', error.message);
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = $('login-form');
    const setupForm = $('password-setup-form');
    const accessForm = $('access-form');

    loginForm.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const email = $('login-identifier').value.trim().toLowerCase();
      const password = $('login-password').value;
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) { openSetup(email); return; }
      await openDashboard(data.session);
    }, true);

    setupForm.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const email = $('password-setup-identifier').value.trim().toLowerCase();
      const password = $('password-setup-password').value;
      const confirmation = $('password-setup-confirm').value;
      if (!password || password !== confirmation) { showFeedback('As senhas precisam ser iguais.'); return; }
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) { showFeedback(error.message); return; }
      if (!data.session) { showFeedback('Confira seu e-mail para confirmar o acesso e depois entre novamente.'); return; }
      await openDashboard(data.session);
    }, true);

    accessForm.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const email = $('access-email').value.trim().toLowerCase();
      const { error } = await client.from('monitoria_invites').upsert({ email });
      if (error) { alert(error.message); return; }
      $('access-form').reset(); $('generated-password').hidden = false;
      $('generated-password').innerHTML = `<strong>Acesso criado</strong><br>${email} poderá criar a própria senha no primeiro acesso.`;
    }, true);

    const expiresAt = Number(localStorage.getItem('monitoria-session-expires-at') || 0);
    const { data } = await client.auth.getSession();
    if (data.session && expiresAt > Date.now()) await openDashboard(data.session);
    else if (data.session) { clearExpiry(); await client.auth.signOut(); }
  });
})();
