const toast = document.querySelector('#toast');

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
    document.querySelector('h1').textContent = view;
    document.querySelector('#sidebar').classList.remove('open');
    if (view !== 'Visão geral') notify(`${view}: módulo disponível na próxima versão.`);
  });
});

document.querySelector('#menu-toggle').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
document.querySelector('#prepare-button').addEventListener('click', () => notify('Preparação para Grifinória × Sonserina iniciada!'));
document.querySelector('#continue-button').addEventListener('click', (event) => {
  event.currentTarget.disabled = true;
  event.currentTarget.firstChild.textContent = 'Simulando... ';
  window.setTimeout(() => {
    event.currentTarget.disabled = false;
    event.currentTarget.firstChild.textContent = 'Continuar ';
    notify('O calendário avançou um dia. Treino concluído!');
  }, 900);
});
