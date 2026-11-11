# Site do evento

Front-end em React + Vite (`src/`) e API em Express + Postgres/Neon (`server/`).

## Como rodar

Precisa do **Node 22 LTS** ou mais novo ([nodejs.org](https://nodejs.org)).

1. Instale os pacotes. Rode de novo **depois de todo `git pull`**, porque
   podem ter chegado pacotes novos:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo e preencha a `DATABASE_URL`
   (peça a URL para quem cuida do banco; ela **não** vai para o git):

   ```bash
   cp .env.example .env
   ```

   No Windows, sem o `cp`: copie o arquivo e renomeie para `.env`. Confira se
   não ficou `.env.txt`.

3. Suba tudo com **um comando só**:

   ```bash
   npm run dev
   ```

   Antes de subir, ele confere o ambiente e explica o que falta. Depois,
   abra o endereço `Local` que aparecer, normalmente http://localhost:5173.

## Deu errado?

```bash
npm run diagnostico
```

Ele confere a versão do Node, os pacotes, o `.env`, a conexão com o banco e a
porta da API, e diz o que fazer em cada caso. Os problemas mais comuns:

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `node: .env: not found` | Falta o arquivo `.env` | Passo 2 acima |
| "A porta 3000 já está em uso" | Outro projeto rodando na 3000 | Feche o outro ou coloque `PORT=3001` no `.env` |
| "Não foi possível conectar ao servidor" no login | A API não está rodando | Rode `npm run dev` e veja o erro no terminal |
| Erro de conexão com o banco | Internet, URL errada ou rede bloqueando o Neon | Teste em outra rede ou no 4G do celular |
| "Credenciais inválidas" | E-mail ou senha errados | Os participantes `@exemplo.com` não têm senha; crie um admin com `npm run db:admin` |

## Outros comandos

| Comando | Para quê |
|---|---|
| `npm run dev:front` | Só o site (Vite) |
| `npm run dev:api` | Só a API, reiniciando a cada mudança |
| `npm run db:setup` | Cria as tabelas no banco (uma vez por banco novo) |
| `npm run db:admin` | Cria um admin ou troca a senha de um |
| `npm run db:popular` | Coloca participantes e minicursos fictícios (`-- --limpar` remove) |
| `npm run db:artigos` | Coloca autores, avaliadores e artigos fictícios em várias etapas (`-- --limpar` remove) |
| `npm run db:anteriores` | Coloca 5 edições passadas fictícias em "Eventos anteriores" (`-- --limpar` remove) |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run lint` | Confere o código |

## Perfis

Um único login (`/login`) para todos. O que cada pessoa vê depende do perfil
da conta:

| Perfil | Como a conta nasce | Área |
|---|---|---|
| Participante | Inscrição no evento (`/inscricao`) | `/minha-conta` |
| Autor | Cadastro público (`/cadastro`) | `/autor`: submete artigos em PDF e acompanha a situação |
| Avaliador Ad-Hoc | O admin define em **Usuários** | `/avaliador`: avalia os artigos atribuídos (sem ver os autores) |
| Administrador | `npm run db:admin` ou o admin define em **Usuários** | `/admin`: evento, usuários, submissões e avaliações |

Depois de enviada, a avaliação fica bloqueada. O avaliador pode pedir
alteração, e só o admin libera (com justificativa registrada no histórico).
A situação do artigo sai das avaliações: com todas enviadas, vale a
recomendação mais rigorosa.

### Sem banco (modo simulado)

Com `VITE_USE_MOCK=true` no `.env`, o site roda sem API nem banco, com dados
de exemplo. Só as contas de teste de [src/mocks/mock.ts](src/mocks/mock.ts)
entram, e só nesse modo. Submissão e avaliação de artigos não funcionam no modo
simulado: precisam da API e do banco.
