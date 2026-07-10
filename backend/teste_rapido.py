"""
Teste Rápido do Motor de Classificação Tributária
IBS • CBS • Imposto Seletivo • cClassTrib • TribAI Engine
"""
import json
from app.engine.classificador import TribAIEngine

engine = TribAIEngine()

produtos_teste = [
    {"ncm": "22041000", "descricao": "Vinho tinto fino", "cfop": "5101"},
    {"ncm": "22021000", "descricao": "Refrigerante sabor cola", "cfop": "5102"},
    {"ncm": "04069000", "descricao": "Queijo muçarela", "cfop": "5101"},
    {"ncm": "30049000", "descricao": "Medicamento genérico", "cfop": "5101"},
    {"ncm": "27101259", "descricao": "Gasolina comum", "cfop": "5656"},
    {"ncm": "84713000", "descricao": "Notebook Dell Inspiron", "cfop": "5101"},
    {"ncm": "61091000", "descricao": "Camiseta de algodão", "cfop": "5101"},
    {"ncm": "87032310", "descricao": "Automóvel a gasolina", "cfop": "5101"},
    {"ncm": "24022000", "descricao": "Cigarro de tabaco", "cfop": "5101"},
    {"ncm": "", "descricao": "Restaurante - refeição delivery", "cfop": "5101"},
    {"ncm": "22030000", "descricao": "Cerveja artesanal", "cfop": "5101"},
    {"ncm": "94035000", "descricao": "Móvel de madeira para quarto", "cfop": "5101"},
    {"ncm": "49019900", "descricao": "Livro de direito tributário", "cfop": "5101"},
    {"ncm": "84713000", "descricao": "Tablet", "cfop": "5101"},
    {"ncm": "33030000", "descricao": "Perfume importado", "cfop": "5101"},
]

print("=" * 100)
print("MOTOR INTELIGENTE DA REFORMA TRIBUTÁRIA - TESTE RÁPIDO")
print("TribAI Engine • LC 214/2025")
print("=" * 100)

for i, prod in enumerate(produtos_teste, 1):
    print(f"\n--- Produto {i}: {prod['descricao']} ---")
    resultado = engine.classificar(
        ncm=prod["ncm"],
        cest="",
        cfop=prod["cfop"],
        descricao=prod["descricao"],
    )

    conf = resultado["confianca"]
    nivel = resultado["nivel_confianca"]
    cor_conf = "\033[92m" if conf >= 90 else "\033[93m" if conf >= 75 else "\033[91m"

    print(f"  NCM: {resultado['ncm'] or 'N/I':8s}  CEST: {resultado['cest'] or 'N/I':7s}  CFOP: {resultado['cfop']}")
    print(f"  cClassTrib: {resultado['cclass_trib']:10s}  {resultado['cclasstrib_descricao']}")
    print(f"  Regime: {resultado['regime_especifico']}")
    print(f"  CST IBS/CBS/IS: {resultado['cst_ibms']}/{resultado['cst_cbs']}/{resultado['cst_is']}")
    print(f"  Alíq. IBS: {resultado['aliquota_ibms']:.1f}%  CBS: {resultado['aliquota_cbs']:.1f}%  IS: {resultado['aliquota_is']:.1f}%")
    print(f"  {cor_conf}Confiança: {conf:.1f}% - {nivel}\033[0m")
    print(f"  Alíquota Zero: {resultado['aliquota_zero']}  |  Cesta Básica: {resultado['cesta_basica']}")
    print(f"  Monofásico: {resultado['monofasico']}  |  Imunidade: {resultado['imunidade']}")
    print(f"  Cashback: {resultado['cashback']}  |  Split Payment: {resultado['split_payment']}")

print("\n" + "=" * 100)
print("TESTE CONCLUÍDO - Todos os produtos classificados com base na LC 214/2025")
print("=" * 100)
