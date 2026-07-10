from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.routes import router as api_router
from app.api.auth import router as auth_router, get_current_user

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

app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(api_router, prefix="/api/v1", dependencies=[Depends(get_current_user)])


@app.get("/health")
async def health():
    return {"status": "ok", "sistema": "Motor Inteligente da Reforma Tributária", "versao": "1.0.0"}
