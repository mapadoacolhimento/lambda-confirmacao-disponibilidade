# lambda-confirmacao-disponibilidade

AWS Lambda com API Gateways que fazem a confirmação de disponibilidade da Voluntária.

## Introdução

Com o Novo Match e o Match Diário, estamos fazendo cada vez mais matches entre MSRs e Voluntárias, porém verificamos que **grande parte desses matches acaba sendo interrompido** (cerca de ~27%). 

Isso acontece porque frequentemente **as voluntárias não estão disponíveis** para atender as MSRs. Reconhecemos que esse é um problema que **intensifica a rota crítica das MSRs**, que acabam tendo que passar por várias voluntárias até que realmente consigam ser atendidas.

Para endereçar esse problema, entendemos que é importante **verificar a disponibilidade das voluntárias** antes de criar um match. Com objetivo de fazer essa verificação de forma ágil e impedir que a MSR fique muitos dias aguardando pelo contato da voluntária, decidimos implementar essa verificação por **WhatsApp**.

Inicialmente, a verificação da disponibilidade da voluntária será implementada apenas no Match Diário. No futuro, ela poderá ser expandida para os outros matches também.

Utilizamos [Serverless](https://www.serverless.com) para orquestrar a publicação das AWS Lambdas, que por sua vez têm sua lógica interna exposta a endpoints via Api Gateway da AWS.

## Como Começar

### Requisitos

- Node v18 (LTS atual)
	- Utilize o [nvm](https://github.com/nvm-sh/nvm) para gerenciar suas versões de node, facilitando migrações ou possíveis downgrades
- Variáveis de ambiente
	- Todas as vars necessárias para rodar o projeto estão no .env.example

```bash
# Instale as dependências
npm install

# gere os artefatos do Prisma Client
npm run generate

# Execute o servidor local
npm run dev
```

Não se esqueça de rodar o banco local a partir do repositório [`mapa-migrations`](https://github.com/mapadoacolhimento/mapa-migrations).

Caso queira saber mais sobre porque geramos os artefatos do Prisma Client, [clique aqui](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client).

**⚠️ AVISO**: Nunca altere o arquivo `schema.prisma` nesse repositório. Todas as migrations que realizamos em nosso banco de dados são feitas no [`mapa-migrations`](https://github.com/mapadoacolhimento/mapa-migrations). Esse arquivo será [automaticamente atualizado](https://github.com/mapadoacolhimento/mapa-migrations/blob/main/.github/workflows/update-schema.yml) aqui quando o `schema.prisma` do repositório `mapa-migrations` for atualizado.


## Endpoints

### Auth

Autentica as rotas privadas.

```http
POST /auth
```

### Compose

Cria o(s) support request(s) e, caso a feature flag do `NEW_MATCH` esteja habilitada, cria um novo match(es).

```http
POST /compose
```

### FeatureFlag

Verifique se uma feature flag com aquele nome está habilitada.

```http
GET /featureFlag?name=FEATURE_FLAG_NAME
```

### Sign

Cria um token de autenticação.

```http
POST /sign
```