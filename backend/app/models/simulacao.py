from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from app.database import Base


class Simulacao(Base):
    __tablename__ = "simulacoes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255))
    descricao = Column(Text)
    mes_inicio = Column(Integer)
    ano_inicio = Column(Integer)
    mes_fim = Column(Integer)
    ano_fim = Column(Integer)
    parametros = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    resultados = relationship("ResultadoSimulacao", back_populates="simulacao", cascade="all, delete-orphan")


class ResultadoSimulacao(Base):
    __tablename__ = "resultados_simulacao"

    id = Column(Integer, primary_key=True, index=True)
    simulacao_id = Column(Integer, ForeignKey("simulacoes.id"))
    mes = Column(Integer)
    ano = Column(Integer)

    total_compras = Column(Float, default=0)
    total_vendas = Column(Float, default=0)

    ibs_debito = Column(Float, default=0)
    cbs_debito = Column(Float, default=0)
    is_debito = Column(Float, default=0)
    ibs_credito = Column(Float, default=0)
    cbs_credito = Column(Float, default=0)
    credito_presumido = Column(Float, default=0)

    saldo_credor = Column(Float, default=0)
    saldo_devedor = Column(Float, default=0)
    saldo_liquido = Column(Float, default=0)
    total_creditos = Column(Float, default=0)
    total_debitos = Column(Float, default=0)

    carga_tributaria_total = Column(Float, default=0)
    carga_tributaria_percentual = Column(Float, default=0)
    economia_tributaria = Column(Float, default=0)
    regime = Column(String(50), default="geral")

    compras_detalhes = Column(JSON)
    vendas_detalhes = Column(JSON)

    tributos_por_ncm = Column(JSON)
    tributos_por_cfop = Column(JSON)
    tributos_por_produto = Column(JSON)
    tributos_por_cliente = Column(JSON)
    tributos_por_fornecedor = Column(JSON)
    tributos_por_municipio = Column(JSON)
    tributos_por_estado = Column(JSON)
    tributos_por_cnae = Column(JSON)

    comparativo_sistema_antigo = Column(JSON)

    simulacao = relationship("Simulacao", back_populates="resultados")
