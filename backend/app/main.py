from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.routes import router as api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Motor Inteligente da Reforma Tributária",
    description="IBS • CBS • Imposto Seletivo • cClassTrib | API de classificação e cálculo tributário",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "sistema": "Motor Inteligente da Reforma Tributária", "versao": "1.0.0"}
