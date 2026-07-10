# Motor Inteligente da Reforma Tributária

IBS • CBS • Imposto Seletivo • cClassTrib • TribAI Engine

## Stack

- **Frontend:** React + Next.js 14 + Tailwind CSS + Recharts
- **Backend:** Python + FastAPI + SQLAlchemy + PostgreSQL
- **Cache:** Redis
- **Container:** Docker

## Execução Rápida (Docker)

```bash
docker-compose up -d
```

Acessar:
- Frontend: http://localhost:3000
- API: http://localhost:8000/docs
- Swagger: http://localhost:8000/redoc

## Execução Manual (Desenvolvimento)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

1. **Importação XML** - Upload de NF-e/NFC-e em XML ou ZIP
2. **Classificação Automática** - cClassTrib, CST IBS/CBS/IS via TribAI Engine
3. **Cálculos** - Débito, crédito, crédito presumido, saldos
4. **Simulação** - Simulação mensal com comparativo sistema antigo vs reforma
5. **Auditoria** - Detecção automática de inconsistências fiscais
6. **Dashboard** - Gráficos e indicadores em tempo real
7. **Fundamentação Legal** - Exibição dos artigos da LC 214/2025 utilizados

## Rotas da API

- `POST /api/v1/upload/xml` - Importar XML NF-e
- `POST /api/v1/upload/zip` - Importar ZIP com XMLs
- `GET /api/v1/nfe` - Listar NF-es
- `GET /api/v1/nfe/{id}` - Detalhes da NF-e
- `DELETE /api/v1/nfe/{id}` - Deletar NF-e
- `GET /api/v1/nfe/{id}/auditoria` - Auditar NF-e
- `POST /api/v1/simular` - Simular período
- `GET /api/v1/dashboard` - Dashboard consolidado
- `GET /api/v1/classificar` - Classificador manual
