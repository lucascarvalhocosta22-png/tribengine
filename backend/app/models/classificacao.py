from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from datetime import datetime, UTC
from app.database import Base


class TabelaCClassTrib(Base):
    __tablename__ = "tabela_cclasstrib"

    id = Column(Integer, primary_key=True, index=True)
    cclass_trib = Column(String(10), index=True)
    descricao = Column(String(500))
    ncm_inicio = Column(String(8))
    ncm_fim = Column(String(8))
    aliquota_ibms = Column(Float, default=0)
    aliquota_cbs = Column(Float, default=0)
    aliquota_is = Column(Float, default=0)
    regime_especifico = Column(String(100))
    regime_diferenciado = Column(String(100))
    regime_favorecido = Column(String(100))
    cesta_basica = Column(String(3), default="Nao")
    monofasico = Column(String(3), default="Nao")
    reducao_base = Column(Float, default=0)
    reducao_aliquota = Column(Float, default=0)
    cashback = Column(String(3), default="Nao")
    fundamentacao_legal = Column(Text)
    vigencia_inicio = Column(DateTime)
    vigencia_fim = Column(DateTime)
    versao = Column(String(20))
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))


class TabelaCST(Base):
    __tablename__ = "tabela_cst"

    id = Column(Integer, primary_key=True, index=True)
    cst = Column(String(3), index=True)
    descricao = Column(String(300))
    tipo = Column(String(10))
    tributo = Column(String(10))
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))


class HistoricoClassificacao(Base):
    __tablename__ = "historico_classificacao"

    id = Column(Integer, primary_key=True, index=True)
    ncm = Column(String(8), index=True)
    cest = Column(String(10))
    descricao = Column(String(500))
    cclass_trib = Column(String(10))
    cst_ibms = Column(String(3))
    cst_cbs = Column(String(3))
    cst_is = Column(String(3))
    confianca = Column(Float)
    fundamentacao = Column(Text)
    artigos_utilizados = Column(JSON)
    fonte = Column(String(100))
    usuario = Column(String(100))
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
