# Portal de Certificados

Backend: Node.js + Express + MongoDB (Mongoose). Frontend: React + Vite.

## Como rodar

Pré-requisitos: Node 18+ e MongoDB rodando (local ou Atlas).

```bash
# 1) Backend
cd backend
cp .env.example .env      # edite JWT_SECRET, MONGO_URI, ADMIN_EMAIL e ADMIN_SENHA
npm install
npm run seed:admin        # cria o usuário do laboratório
npm run dev               # http://localhost:3000

# 2) Frontend (outro terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## Fluxo

1. O laboratório entra com o admin criado no seed e cadastra a empresa (aba Empresas).
2. O cliente acessa "Criar conta" usando o CNPJ da empresa. A conta fica pendente.
3. O laboratório aprova na aba Aprovações.
4. O laboratório emite o certificado (PDF) na aba Emitir certificado.
5. O cliente entra e vê/baixa apenas os certificados da própria empresa.

## Antes de ir para produção

- Usar HTTPS e `NODE_ENV=production` (cookie `secure`).
- Servir o frontend com `npm run build` atrás de um proxy (Nginx) que encaminhe `/api` para o Express.
- Mover os PDFs da pasta `backend/storage` para S3 ou similar e fazer backup.
- Adicionar recuperação de senha por e-mail.
- Trocar o log de downloads (console) por uma coleção de auditoria no MongoDB.
