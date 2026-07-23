# Monitoramento Operacional – Registro de Ocorrências Operacionais

Aplicação web estática para registrar ocorrências, pendências e chamados operacionais.

## Estrutura para publicação

```text
ocorrencias-operacionais/
├── index.html   # página inicial obrigatória
├── style.css    # estilos locais
├── script.js    # lógica da aplicação e armazenamento local
├── assets/
│   └── logo-acha.jpeg
└── README.md
```

Não há caminhos absolutos, chaves de API ou chamadas para APIs externas. O logo está incluído no projeto em `assets/logo-acha.jpeg`. Para preservar o visual original, a interface usa Google Fonts e Font Awesome carregados por CDN pública; esses recursos não exigem chave e não são backend. Em caso de indisponibilidade temporária da internet, o sistema continua funcional com a fonte de fallback, mas os ícones podem não ser exibidos.

## Funcionamento

- Os registros de ocorrências, pendências e chamados são salvos no `localStorage` do navegador.
- O sistema funciona apenas com HTML, CSS e JavaScript no navegador; não requer Node.js, Express, PHP, Python, banco de dados ou servidor de aplicação.
- A geração de PDF abre a tela de impressão do navegador. O usuário pode salvar o arquivo como PDF.

## Publicar no GitHub Pages

1. Crie um repositório público no GitHub.
2. Envie **o conteúdo desta pasta** para a raiz do repositório. O arquivo `index.html` deve ficar na raiz publicada.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/(root)`; depois salve.
6. Aguarde a publicação e acesse o link fornecido pelo GitHub Pages.

Também é possível manter esta pasta dentro de um repositório maior: nesse caso, configure o GitHub Pages para publicar a pasta que contém este `index.html` (por exemplo, usando uma branch de publicação dedicada).

## Limitações importantes

Os dados são locais ao navegador e ao dispositivo de cada pessoa. Portanto:

- registros não são compartilhados entre usuários;
- limpar os dados do navegador remove os registros;
- não há login, permissões, sincronização, backup nem banco de dados central.

Para tornar os registros compartilhados, seria necessário integrar um serviço externo compatível com site estático, como Firebase, Supabase ou uma API própria. Essa integração exigiria regras de acesso/autenticação e não deve expor segredos no JavaScript público.

## Compatibilidade

O projeto é 100% compatível com GitHub Pages para o funcionamento atual, pois é estático e não depende de backend. O carregamento completo do visual requer acesso à internet para as duas CDNs públicas de fonte e ícones.
