# Quadribol Manager

Um protótipo web de um jogo de gerenciamento de quadribol para campanhas de RPG.

## Executar localmente

O projeto é estático e não exige instalação de dependências:

```bash
python3 -m http.server 4173
```

Depois, acesse `http://localhost:4173`.

## Hospedagem

O projeto possui uma automação em `.github/workflows/deploy-pages.yml`. Todo push
para `main` ou `work` publica os arquivos automaticamente no GitHub Pages.

No GitHub, abra **Settings → Pages** e, em **Source**, selecione **GitHub
Actions**. Depois do primeiro deploy, o endereço estará disponível na página do
workflow e terá o formato:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

Também é possível publicar os mesmos arquivos no Netlify, Vercel ou em qualquer
servidor de arquivos estáticos.
