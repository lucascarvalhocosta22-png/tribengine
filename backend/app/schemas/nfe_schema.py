from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ItemNFeBase(BaseModel):
    codigo_produto: Optional[str] = None
    descricao: Optional[str] = None
    ncm: Optional[str] = None
    cest: Optional[str] = None
    cfop: Optional[str] = None
    uom: Optional[str] = "UN"
    quantidade: Optional[float] = 0
    valor_unitario: Optional[float] = 0
    valor_total: Optional[float] = 0
    gtin: Optional[str] = None


class ItemNFeResponse(ItemNFeBase):
    id: Optional[int] = None
    cclass_trib: Optional[str] = None
    cst_ibms: Optional[str] = None
    cst_cbs: Optional[str] = None
    cst_is: Optional[str] = None
    aliquota_ibms: Optional[float] = 0
    aliquota_cbs: Optional[float] = 0
    aliquota_is: Optional[float] = 0
    base_ibms: Optional[float] = 0
    base_cbs: Optional[float] = 0
    base_is: Optional[float] = 0
    valor_ibms: Optional[float] = 0
    valor_cbs: Optional[float] = 0
    valor_is: Optional[float] = 0
    regime_especifico: Optional[str] = None
    regime_diferenciado: Optional[str] = None
    regime_favorecido: Optional[str] = None
    suspensao: Optional[str] = "Nao"
    imunidade: Optional[str] = "Nao"
    isencao: Optional[str] = "Nao"
    reducao_base: Optional[float] = 0
    reducao_aliquota: Optional[float] = 0
    aliquota_zero: Optional[str] = "Nao"
    cashback: Optional[str] = "Nao"
    split_payment: Optional[str] = "Nao"
    monofasico: Optional[str] = "Nao"
    cesta_basica: Optional[str] = "Nao"
    confianca: Optional[float] = 0
    nivel_confianca: Optional[str] = "Necessita Revisão"
    fundamentacao_legal: Optional[str] = None
    artigos_utilizados: Optional[list] = None
    precisa_revisao: Optional[str] = "Sim"
    cclasstrib_descricao: Optional[str] = None

    class Config:
        from_attributes = True


class NFeBase(BaseModel):
    chave_acesso: Optional[str] = None
    numero: Optional[str] = None
    serie: Optional[str] = None
    destinatario_nome: Optional[str] = None
    destinatario_cnpj: Optional[str] = None
    remetente_nome: Optional[str] = None
    remetente_cnpj: Optional[str] = None
    valor_total: Optional[float] = 0
    natureza_operacao: Optional[str] = None


class NFeResponse(NFeBase):
    id: Optional[int] = None
    data_emissao: Optional[datetime] = None
    tipo_declarado: Optional[str] = None
    itens: List[ItemNFeResponse] = []

    class Config:
        from_attributes = True


class ManualData(BaseModel):
    total_compras: float = 0
    total_vendas: float = 0
    reducao_compras: bool = False
    reducao_vendas: bool = False


class SimulacaoRequest(BaseModel):
    nome: str = "Simulação"
    mes_inicio: int = 1
    ano_inicio: int = 2026
    mes_fim: int = 12
    ano_fim: int = 2026
    nfe_ids: List[int] = []
    regime: str = "geral"
    manual: Optional[ManualData] = None


class SimulacaoResponse(BaseModel):
    id: Optional[int] = None
    nome: str
    resultados: List[dict] = []


class AuditoriaResponse(BaseModel):
    item_id: Optional[int] = None
    descricao: Optional[str] = None
    problemas: List[str] = []
    alertas: List[str] = []
    sugestoes: List[str] = []
    ncm_incompativel: bool = False
    cclass_trib_incorreto: bool = False
    tributacao_errada: bool = False
    reducao_incorreta: bool = False
    cfop_incompativel: bool = False
    cst_incompativel: bool = False
    regime_incorreto: bool = False
    credito_perdido: bool = False
    economia_tributaria: bool = False
    inconsistencias_fiscais: int = 0
