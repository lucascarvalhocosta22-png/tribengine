"""
Teste Completo - Motor Inteligente da Reforma Tributária
"""
import sys
sys.path.insert(0, ".")

from app.engine.classificador import TribAIEngine
from app.services.calculadora import CalculadoraTributaria
from app.services.auditoria import AuditoriaFiscal

engine = TribAIEngine()
calculadora = CalculadoraTributaria()
auditoria = AuditoriaFiscal()

produtos = [
    {"ncm": "22041000", "descricao": "Vinho tinto fino", "cfop": "5101"},
    {"ncm": "22030000", "descricao": "Cerveja artesanal", "cfop": "5102"},
    {"ncm": "22021000", "descricao": "Refrigerante sabor cola", "cfop": "5102"},
    {"ncm": "", "descricao": "Restaurante - refeição delivery", "cfop": "5101"},
    {"ncm": "04069000", "descricao": "Queijo muçarela", "cfop": "5101"},
    {"ncm": "30049000", "descricao": "Medicamento genérico", "cfop": "5101"},
    {"ncm": "27101259", "descricao": "Gasolina comum", "cfop": "5656"},
    {"ncm": "84713000", "descricao": "Notebook Dell Inspiron", "cfop": "5101"},
    {"ncm": "61091000", "descricao": "Camiseta de algodão", "cfop": "5101"},
    {"ncm": "87032310", "descricao": "Automóvel a gasolina", "cfop": "5101"},
    {"ncm": "24022000", "descricao": "Cigarro de tabaco", "cfop": "5101"},
    {"ncm": "49019900", "descricao": "Livro de direito tributário", "cfop": "5101"},
    {"ncm": "94035000", "descricao": "Móvel de madeira para quarto", "cfop": "5101"},
    {"ncm": "33030000", "descricao": "Perfume importado", "cfop": "5101"},
    {"ncm": "84713000", "descricao": "Tablet", "cfop": "5101"},
    {"ncm": "10064000", "descricao": "Arroz branco", "cfop": "5101"},
]

print("=" * 110)
print("MOTOR INTELIGENTE DA REFORMA TRIBUTÁRIA - TESTE COMPLETO")
print("TribAI Engine v1.0 | LC 214/2025 | IBS | CBS | Imposto Seletivo")
print("=" * 110)

total_ibs = 0
total_cbs = 0
total_is = 0

for i, prod in enumerate(produtos, 1):
    resultado = engine.classificar(
        ncm=prod["ncm"], cest="", cfop=prod["cfop"], descricao=prod["descricao"]
    )
    calc = calculadora.calcular_item({
        "valor_total": 1000,
        "aliquota_ibms": resultado["aliquota_ibms"],
        "aliquota_cbs": resultado["aliquota_cbs"],
        "aliquota_is": resultado["aliquota_is"],
        "reducao_base": resultado["reducao_base"],
        "aliquota_zero": resultado["aliquota_zero"],
        "imunidade": resultado["imunidade"],
        "isencao": resultado["isencao"],
        "suspensao": resultado["suspensao"],
        "monofasico": resultado["monofasico"],
        "cesta_basica": resultado["cesta_basica"],
    })
    audit = auditoria.auditar_item(resultado)

    total_ibs += calc["valor_ibms"]
    total_cbs += calc["valor_cbs"]
    total_is += calc["valor_is"]

    nivel = resultado["nivel_confianca"]
    print(f"\n{i:2d}. {resultado['descricao']:<35s} NCM: {resultado['ncm'] or 'N/I':>8s}")
    print(f"    cClassTrib: {resultado['cclass_trib']:<12s} {resultado['cclasstrib_descricao']:<30s} Conf: {resultado['confianca']:5.1f}% [{nivel}]")
    print(f"    Regime: {resultado['regime_especifico']:<40s} CST: {resultado['cst_ibms']}/{resultado['cst_cbs']}/{resultado['cst_is']}")
    print(f"    Alíq: IBS={resultado['aliquota_ibms']:.1f}%  CBS={resultado['aliquota_cbs']:.1f}%  IS={resultado['aliquota_is']:.1f}%")
    print(f"    Cálculo (R$1.000): IBS={calc['valor_ibms']:.2f}  CBS={calc['valor_cbs']:.2f}  IS={calc['valor_is']:.2f}  Carga={calc['carga_total']:.2f}")
    if audit["problemas"]:
        print(f"    [!] Problemas: {', '.join(audit['problemas'])}")

print("\n" + "=" * 110)
print(f"RESUMO (base R$1.000/produto): IBS={total_ibs:.2f}  CBS={total_cbs:.2f}  IS={total_is:.2f}  Total={total_ibs+total_cbs+total_is:.2f}")
print("=" * 110)
print("\n✅ Sistema funcionando! Para iniciar o servidor web completo:")
print("   Execute: backend\\iniciar.bat")
print("   Ou manualmente:")
print("   cd backend && python -m uvicorn app.main:app --reload --port 8000")
print("   cd frontend && npm run dev")
print("=" * 110)
