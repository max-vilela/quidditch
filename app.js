const TEAMS = [
  { id: 'gryffindor', name: 'Grifinória', short: 'G', color: '#8e2e2a' },
  { id: 'slytherin', name: 'Sonserina', short: 'S', color: '#195c50' },
  { id: 'ravenclaw', name: 'Corvinal', short: 'C', color: '#244b72' },
  { id: 'hufflepuff', name: 'Lufa-Lufa', short: 'L', color: '#b7952f' },
];
const STORE_KEY = 'quadribol-manager-v2';
const titles = { dashboard: 'Visão geral', players: 'Jogadores', standings: 'Classificação', simulation: 'Simulação' };

function createFixtures() {
  const firstLeg = [['gryffindor', 'slytherin'], ['ravenclaw', 'hufflepuff'], ['gryffindor', 'ravenclaw'], ['hufflepuff', 'slytherin'], ['hufflepuff', 'gryffindor'], ['slytherin', 'ravenclaw']];
  return [...firstLeg, ...firstLeg.map(([home, away]) => [away, home])].map(([home, away], index) => ({ id: index + 1, round: Math.floor(index / 2) + 1, home, away, played: false, homeScore: null, awayScore: null, events: [] }));
}

function initialState() {
  return { players: [], fixtures: createFixtures(), manual: Object.fromEntries(TEAMS.map((team) => [team.id, { wins: 0, draws: 0, losses: 0, scored: 0, conceded: 0 }])) };
}

let state;
try { state = JSON.parse(localStorage.getItem(STORE_KEY)) || initialState(); } catch { state = initialState(); }
let activeTeam = 'all';
let selectedFixtureId = state.fixtures.find((fixture) => !fixture.played)?.id || state.fixtures[0].id;
const $ = (selector) => document.querySelector(selector);
const team = (id) => TEAMS.find((item) => item.id === id);
const crest = (item) => `<i class="mini" style="background:${item.color}">${item.short}</i>`;

function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function notify(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 2600); }
function escapeHtml(value) { const span = document.createElement('span'); span.textContent = value; return span.innerHTML; }

function standings() {
  const rows = TEAMS.map((item) => ({ team: item, ...state.manual[item.id] }));
  state.fixtures.filter((fixture) => fixture.played).forEach((fixture) => {
    const home = rows.find((row) => row.team.id === fixture.home); const away = rows.find((row) => row.team.id === fixture.away);
    home.scored += fixture.homeScore; home.conceded += fixture.awayScore; away.scored += fixture.awayScore; away.conceded += fixture.homeScore;
    if (fixture.homeScore > fixture.awayScore) { home.wins++; away.losses++; } else if (fixture.homeScore < fixture.awayScore) { away.wins++; home.losses++; } else { home.draws++; away.draws++; }
  });
  return rows.map((row) => ({ ...row, played: row.wins + row.draws + row.losses, difference: row.scored - row.conceded, points: row.wins * 3 + row.draws })).sort((a, b) => b.points - a.points || b.difference - a.difference || b.scored - a.scored || a.team.name.localeCompare(b.team.name));
}

function renderStandings(target, preview = false) {
  const rows = standings();
  const html = `<table${preview ? '' : ' class="standings-table"'}><thead><tr><th>#</th><th>TIME</th><th>J</th>${preview ? '<th>SG</th>' : '<th>V</th><th>E</th><th>D</th><th>PF</th><th>PS</th><th>SG</th>'}<th>PTS</th></tr></thead><tbody>${rows.map((row, i) => `<tr><td>${i + 1}</td><td>${crest(row.team)} ${row.team.name}</td><td>${row.played}</td>${preview ? `<td>${row.difference > 0 ? '+' : ''}${row.difference}</td>` : `<td>${row.wins}</td><td>${row.draws}</td><td>${row.losses}</td><td>${row.scored}</td><td>${row.conceded}</td><td>${row.difference > 0 ? '+' : ''}${row.difference}</td>`}<td><b>${row.points}</b></td></tr>`).join('')}</tbody></table>`;
  $(target).innerHTML = preview ? html : rows.map((row, i) => `<tr><td>${i + 1}</td><td>${crest(row.team)} ${row.team.name}</td><td>${row.played}</td><td>${row.wins}</td><td>${row.draws}</td><td>${row.losses}</td><td>${row.scored}</td><td>${row.conceded}</td><td>${row.difference > 0 ? '+' : ''}${row.difference}</td><td><b>${row.points}</b></td></tr>`).join('');
}

function renderDashboard() {
  const played = state.fixtures.filter((fixture) => fixture.played).length;
  $('#stats-grid').innerHTML = `<article><span>JOGADORES</span><strong>${state.players.length}</strong><small>cadastrados manualmente</small></article><article><span>PARTIDAS</span><strong>${played}<em>/12</em></strong><small>${12 - played} ainda por disputar</small></article><article><span>RODADA ATUAL</span><strong>${Math.min(6, Math.floor(played / 2) + 1)}</strong><small>de 6 rodadas</small></article>`;
  const next = state.fixtures.find((fixture) => !fixture.played);
  $('#next-match').innerHTML = next ? `<div class="next-match"><div>${crest(team(next.home))}<b>${team(next.home).name}</b><small>MANDANTE</small></div><span><small>RODADA ${next.round}</small><b>VS</b></span><div>${crest(team(next.away))}<b>${team(next.away).name}</b><small>VISITANTE</small></div></div>` : '<div class="empty-state"><b>Temporada concluída!</b><span>Confira a classificação final.</span></div>';
  renderStandings('#standings-preview', true);
  $('#season-progress').textContent = `${played} de 12 jogos`; $('#progress').value = played;
}

function renderPlayers() {
  const counts = Object.fromEntries(TEAMS.map((item) => [item.id, state.players.filter((player) => player.team === item.id).length]));
  $('#team-tabs').innerHTML = `<button class="${activeTeam === 'all' ? 'active' : ''}" data-team="all">Todos <b>${state.players.length}</b></button>${TEAMS.map((item) => `<button class="${activeTeam === item.id ? 'active' : ''}" data-team="${item.id}">${crest(item)} ${item.name} <b>${counts[item.id]}</b></button>`).join('')}`;
  const players = activeTeam === 'all' ? state.players : state.players.filter((player) => player.team === activeTeam);
  $('#players-body').innerHTML = players.map((player) => `<tr><td><div class="player-name"><span>${escapeHtml(player.name).split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><b>${escapeHtml(player.name)}</b><small>${team(player.team).name}</small></div></div></td><td><span class="position">${player.position}</span></td><td>${player.number}</td><td><b>${player.overall}</b></td><td>${player.attack}</td><td>${player.defense}</td><td>${player.speed}</td><td>${player.stamina}</td><td>${player.morale}</td><td><div class="row-actions"><button data-edit="${player.id}" title="Editar">✎</button><button data-delete="${player.id}" title="Excluir">⌫</button></div></td></tr>`).join('');
  $('#players-empty').classList.toggle('visible', !players.length);
}

function renderFixtures() {
  const played = state.fixtures.filter((fixture) => fixture.played).length;
  $('#fixture-count').textContent = `${played}/12 concluídos`;
  $('#fixtures').innerHTML = state.fixtures.map((fixture, index) => `${index % 2 === 0 ? `<h3>RODADA ${fixture.round}</h3>` : ''}<button class="fixture ${selectedFixtureId === fixture.id ? 'active' : ''}" data-fixture="${fixture.id}"><span>${crest(team(fixture.home))}<b>${team(fixture.home).name}</b></span><em>${fixture.played ? `${fixture.homeScore} × ${fixture.awayScore}` : '— × —'}</em><span><b>${team(fixture.away).name}</b>${crest(team(fixture.away))}</span></button>`).join('');
  renderSimulator();
}

function renderSimulator() {
  const fixture = state.fixtures.find((item) => item.id === selectedFixtureId) || state.fixtures[0];
  const home = team(fixture.home); const away = team(fixture.away);
  const teamAverage = (id) => { const players = state.players.filter((player) => player.team === id); return players.length ? Math.round(players.reduce((sum, player) => sum + player.overall, 0) / players.length) : 60; };
  $('#simulator-card').innerHTML = `<span class="eyebrow">${fixture.played ? 'RESULTADO DA PARTIDA' : `RODADA ${fixture.round} • PRÓXIMO JOGO`}</span><div class="sim-match"><div><i class="large-crest" style="background:${home.color}">${home.short}</i><h2>${home.name}</h2><small>FORÇA ${teamAverage(home.id)}</small></div><strong>${fixture.played ? `${fixture.homeScore}<small>×</small>${fixture.awayScore}` : '<small>VS</small>'}</strong><div><i class="large-crest" style="background:${away.color}">${away.short}</i><h2>${away.name}</h2><small>FORÇA ${teamAverage(away.id)}</small></div></div>${fixture.played ? `<div class="event-log"><h3>DESTAQUES</h3>${fixture.events.map((event) => `<p><span>${event.minute}'</span>${event.text}</p>`).join('')}</div>` : `<div class="sim-info"><p>✦ A força do elenco, os atributos e uma variação de partida definem o resultado.</p><p>◎ A captura do pomo vale 150 pontos e encerra a partida.</p></div><button class="simulate-button" id="simulate-button">Simular partida <span>→</span></button>`}`;
  $('#simulate-button')?.addEventListener('click', () => simulate(fixture.id));
}

function simulate(id) {
  const fixture = state.fixtures.find((item) => item.id === id); if (fixture.played) return;
  const strength = (teamId) => { const players = state.players.filter((player) => player.team === teamId); return players.length ? players.reduce((sum, player) => sum + (player.attack + player.defense + player.speed + player.stamina + player.morale) / 5, 0) / players.length : 55; };
  const homeStrength = strength(fixture.home) + 3; const awayStrength = strength(fixture.away);
  const goalsHome = Math.max(0, Math.round((homeStrength - 35) / 7 + Math.random() * 7)); const goalsAway = Math.max(0, Math.round((awayStrength - 35) / 7 + Math.random() * 7));
  const homeCaught = Math.random() < homeStrength / (homeStrength + awayStrength);
  fixture.homeScore = goalsHome * 10 + (homeCaught ? 150 : 0); fixture.awayScore = goalsAway * 10 + (homeCaught ? 0 : 150); fixture.played = true;
  fixture.events = [`${goalsHome + goalsAway} gols marcados durante o confronto.`, `${homeCaught ? team(fixture.home).name : team(fixture.away).name} capturou o pomo de ouro (+150).`, `${fixture.homeScore === fixture.awayScore ? 'A partida terminou empatada.' : `${fixture.homeScore > fixture.awayScore ? team(fixture.home).name : team(fixture.away).name} venceu a partida.`}`].map((text, index) => ({ minute: [18, 47, 62][index], text }));
  save(); renderAll(); notify('Partida simulada e classificação atualizada!');
}

function renderAll() { renderDashboard(); renderPlayers(); renderStandings('#standings-body'); renderFixtures(); }
function showView(view) { document.querySelectorAll('.view').forEach((item) => item.classList.toggle('active', item.id === `${view}-view`)); document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view)); $('#page-title').textContent = titles[view]; $('#header-action').style.display = view === 'players' || view === 'dashboard' ? '' : 'none'; $('#sidebar').classList.remove('open'); }

function openPlayer(player = null) {
  $('#player-form').reset(); $('#player-id').value = player?.id || ''; $('#player-dialog-title').textContent = player ? 'Editar jogador' : 'Novo jogador';
  const fields = ['name', 'team', 'position', 'number', 'overall', 'attack', 'defense', 'speed', 'stamina', 'morale']; fields.forEach((field) => { if (player) $(`#player-${field}`).value = player[field]; });
  if (!player && activeTeam !== 'all') $('#player-team').value = activeTeam; $('#player-dialog').showModal();
}

function openStandings() {
  $('#standings-fields').innerHTML = TEAMS.map((item) => { const row = state.manual[item.id]; return `<fieldset><legend>${crest(item)} ${item.name}</legend><label>V<input type="number" min="0" name="${item.id}-wins" value="${row.wins}"></label><label>E<input type="number" min="0" name="${item.id}-draws" value="${row.draws}"></label><label>D<input type="number" min="0" name="${item.id}-losses" value="${row.losses}"></label><label>PF<input type="number" min="0" name="${item.id}-scored" value="${row.scored}"></label><label>PS<input type="number" min="0" name="${item.id}-conceded" value="${row.conceded}"></label></fieldset>`; }).join(''); $('#standings-dialog').showModal();
}

document.addEventListener('click', (event) => { const viewButton = event.target.closest('[data-view]'); if (viewButton) showView(viewButton.dataset.view); const teamButton = event.target.closest('[data-team]'); if (teamButton) { activeTeam = teamButton.dataset.team; $('#team-filter').value = activeTeam; renderPlayers(); } const fixtureButton = event.target.closest('[data-fixture]'); if (fixtureButton) { selectedFixtureId = Number(fixtureButton.dataset.fixture); renderFixtures(); } const edit = event.target.closest('[data-edit]'); if (edit) openPlayer(state.players.find((player) => player.id === edit.dataset.edit)); const remove = event.target.closest('[data-delete]'); if (remove && confirm('Excluir este jogador?')) { state.players = state.players.filter((player) => player.id !== remove.dataset.delete); save(); renderAll(); notify('Jogador excluído.'); } });
$('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#add-player').addEventListener('click', () => openPlayer()); $('#header-action').addEventListener('click', () => { showView('players'); openPlayer(); });
$('#team-filter').innerHTML = `<option value="all">Todos os times</option>${TEAMS.map((item) => `<option value="${item.id}">${item.name}</option>`).join('')}`;
$('#player-team').innerHTML = TEAMS.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
$('#team-filter').addEventListener('change', (event) => { activeTeam = event.target.value; renderPlayers(); });
$('#save-player').addEventListener('click', (event) => { event.preventDefault(); if (!$('#player-form').reportValidity()) return; const id = $('#player-id').value || crypto.randomUUID(); const player = { id }; ['name', 'team', 'position'].forEach((field) => player[field] = $(`#player-${field}`).value.trim()); ['number', 'overall', 'attack', 'defense', 'speed', 'stamina', 'morale'].forEach((field) => player[field] = Number($(`#player-${field}`).value)); const index = state.players.findIndex((item) => item.id === id); if (index >= 0) state.players[index] = player; else state.players.push(player); save(); $('#player-dialog').close(); renderAll(); notify(index >= 0 ? 'Jogador atualizado!' : 'Jogador cadastrado!'); });
$('#edit-standings').addEventListener('click', openStandings);
$('#save-standings').addEventListener('click', (event) => { event.preventDefault(); TEAMS.forEach((item) => ['wins', 'draws', 'losses', 'scored', 'conceded'].forEach((field) => state.manual[item.id][field] = Number(new FormData($('#standings-form')).get(`${item.id}-${field}`)) || 0)); save(); $('#standings-dialog').close(); renderAll(); notify('Classificação atualizada!'); });
$('#reset-button').addEventListener('click', () => { if (confirm('Reiniciar resultados e classificação? Os jogadores serão mantidos.')) { state.fixtures = createFixtures(); state.manual = initialState().manual; selectedFixtureId = 1; save(); renderAll(); notify('Campeonato reiniciado.'); } });
renderAll();
