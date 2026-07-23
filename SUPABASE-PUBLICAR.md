# Publicação compartilhada do Monitoria

## 1. Preparar o Supabase

1. Abra **SQL Editor** no projeto Supabase.
2. Crie uma consulta, cole todo o conteúdo de `supabase-setup.sql` e clique em **Run**.
3. Abra **Authentication > Users > Add user** e crie o usuário `pedromceara@hotmail.com` com a senha desejada. Marque a confirmação automática do e-mail, se essa opção aparecer.
4. Execute novamente apenas o último comando `insert into public.monitoria_profiles...` do arquivo SQL, para garantir que esse usuário seja administrador.
5. Em **Authentication > Providers > Email**, mantenha o acesso por e-mail e senha ativado. Para testes simples, desative a confirmação obrigatória de e-mail; se mantiver ativa, cada convidado precisará confirmar a mensagem recebida antes de entrar.
6. Em **Authentication > URL Configuration**, inclua o endereço publicado no GitHub Pages como URL autorizada.

## 2. Publicar no GitHub

Envie para a raiz do repositório os arquivos desta pasta, incluindo:

- `index.html`
- `style.css`
- `script.js`
- `supabase-monitoria.js`
- pasta `assets`

O arquivo `supabase-setup.sql` não precisa ser publicado; ele serve apenas para configurar o banco.

## Resultado

- Usuários e ocorrências passam a ser compartilhados.
- Somente o perfil administrador cria convites.
- A pessoa convidada cria a própria senha no primeiro acesso.
- A sessão do Monitoria dura cinco minutos por navegador.
