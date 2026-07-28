# Quadribol Manager

Um protótipo web de um jogo de gerenciamento de quadribol para campanhas de RPG.

## Funcionalidades

- cadastro manual, edição e exclusão de jogadores das quatro casas;
- classificação automática com pontuação por vitória, empate e derrota;
- edição manual dos resultados acumulados da tabela;
- calendário de turno e returno com 12 partidas;
- simulação de partidas baseada na força dos elencos e captura do pomo;
- persistência dos jogadores e da temporada no armazenamento local do navegador.

## Executar localmente

O projeto é estático e não exige instalação de dependências:

```bash
python3 -m http.server 4173
```

Depois, acesse `http://localhost:4173`.

## Hospedagem

Os arquivos podem ser publicados diretamente no GitHub Pages, Netlify, Vercel ou
qualquer hospedagem de arquivos estáticos.
