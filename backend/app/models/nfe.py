from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Date
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from app.database import Base


class NFe(Base):
    __tablename__ = "nfe"

    id = Column(Integer, primary_key=True, index=True)
    chave_acesso = Column(String(44), unique=True, index=True)
    numero = Column(String(20))
    serie = Column(String(5))
    data_emissao = Column(DateTime)
    data_recebimento = Column(DateTime)
    destinatario_nome = Column(String(255))
    destinatario_cnpj = Column(String(18))
    destinatario_ie = Column(String(20))
    remetente_nome = Column(String(255))
    remetente_cnpj = Column(String(18))
    remetente_ie = Column(String(20))
    valor_total = Column(Float)
    valor_base_calculo = Column(Float)
    valor_icms = Column(Float)
    valor_frete = Column(Float)
    valor_seguro = Column(Float)
    valor_despesas = Column(Float)
    valor_desconto = Column(Float)
    valor_total_tributos = Column(Float)
    natureza_operacao = Column(String(255))
    tipo_operacao = Column(String(1))
    tipo_declarado = Column(String(10))
    finalidade = Column(String(1))
    simples_nacional = Column(String(3), default="Nao")
    xml_original = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    itens = relationship("ItemNFe", back_populates="nfe", cascade="all, delete-orphan")


class ItemNFe(Base):
    __tablename__ = "item_nfe"

    id = Column(Integer, primary_key=True, index=True)
    nfe_id = Column(Integer, ForeignKey("nfe.id"))
    codigo_produto = Column(String(60))
    descricao = Column(String(255))
    ncm = Column(String(8))
    cest = Column(String(10))
    cfop = Column(String(4))
    uom = Column(String(6))
    quantidade = Column(Float)
    valor_unitario = Column(Float)
    valor_total = Column(Float)
    valor_desconto = Column(Float)
    valor_frete = Column(Float)
    valor_seguro = Column(Float)
    valor_despesas = Column(Float)
    gtin = Column(String(20))
    gtin_embalagem = Column(String(20))
    ex_tipi = Column(String(3))

    cst_ibms = Column(String(3))
    cst_cbs = Column(String(3))
    cst_is = Column(String(3))
    cclass_trib = Column(String(10))
    credito_presumido = Column(String(20))

    aliquota_ibms = Column(Float, default=0)
    aliquota_cbs = Column(Float, default=0)
    aliquota_is = Column(Float, default=0)
    base_ibms = Column(Float, default=0)
    base_cbs = Column(Float, default=0)
    base_is = Column(Float, default=0)
    valor_ibms = Column(Float, default=0)
    valor_cbs = Column(Float, default=0)
    valor_is = Column(Float, default=0)

    incidencia_ibms = Column(String(50))
    incidencia_cbs = Column(String(50))
    incidencia_is = Column(String(50))
    regime_especifico = Column(String(100))
    regime_diferenciado = Column(String(100))
    regime_favorecido = Column(String(100))

    suspensao = Column(String(3), default="Nao")
    imunidade = Column(String(3), default="Nao")
    isencao = Column(String(3), default="Nao")
    reducao_base = Column(Float, default=0)
    reducao_aliquota = Column(Float, default=0)
    aliquota_zero = Column(String(3), default="Nao")
    cashback = Column(String(3), default="Nao")
    split_payment = Column(String(3), default="Nao")
    monofasico = Column(String(3), default="Nao")
    cesta_basica = Column(String(3), default="Nao")

    confianca_classificacao = Column(Float, default=0)
    fundamentacao_legal = Column(Text)
    historico_decisao = Column(JSON)
    precisa_revisao = Column(String(3), default="Sim")

    nfe = relationship("NFe", back_populates="itens")
