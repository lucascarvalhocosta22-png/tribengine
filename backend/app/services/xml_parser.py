import xmltodict
from app.engine.classificador import engine as trib_engine
from app.models.nfe import NFe, ItemNFe


def parse_nfe_xml(xml_content: str | bytes, tipo_declarado: str = "") -> dict:
    if isinstance(xml_content, bytes):
        raw = xml_content
        for enc in ["utf-8-sig", "utf-16", "utf-8", "latin-1", "iso-8859-1"]:
            try:
                xml_content = raw.decode(enc)
                break
            except (UnicodeDecodeError, UnicodeError):
                continue
        else:
            xml_content = raw.decode("utf-8", errors="replace")
    try:
        parsed = xmltodict.parse(xml_content)
    except Exception as e:
        raise ValueError(f"Erro ao parsear XML: {e}")

    nfe_data = {}

    inf_nfe = parsed.get("nfeProc", {}).get("NFe", {}).get("infNFe", {})
    if not inf_nfe:
        inf_nfe = parsed.get("NFe", {}).get("infNFe", {})

    nfe_data["chave_acesso"] = inf_nfe.get("@Id", "").replace("NFe", "").replace("NFCe", "")
    ide = inf_nfe.get("ide", {})
    nfe_data["numero"] = str(ide.get("nNF", ""))
    nfe_data["serie"] = str(ide.get("serie", ""))
    nfe_data["data_emissao"] = ide.get("dhEmi", "")
    nfe_data["data_recebimento"] = ide.get("dhRecbto", "")
    nfe_data["natureza_operacao"] = ide.get("natOp", "")
    nfe_data["tipo_operacao"] = str(ide.get("tpNF", ""))
    nfe_data["finalidade"] = str(ide.get("finNFe", ""))

    emit = inf_nfe.get("emit", {})
    nfe_data["remetente_nome"] = emit.get("xNome", "")
    nfe_data["remetente_cnpj"] = emit.get("CNPJ", emit.get("CPF", ""))

    dest = inf_nfe.get("dest", {})
    nfe_data["destinatario_nome"] = dest.get("xNome", "")
    nfe_data["destinatario_cnpj"] = dest.get("CNPJ", dest.get("CPF", ""))

    total = inf_nfe.get("total", {}).get("ICMSTot", {})
    nfe_data["valor_total"] = float(total.get("vNF", 0))
    nfe_data["valor_base_calculo"] = float(total.get("vBC", 0))
    nfe_data["valor_icms"] = float(total.get("vICMS", 0))
    nfe_data["valor_frete"] = float(total.get("vFrete", 0))
    nfe_data["valor_seguro"] = float(total.get("vSeg", 0))
    nfe_data["valor_despesas"] = float(total.get("vOutro", 0))
    nfe_data["valor_desconto"] = float(total.get("vDesc", 0))
    nfe_data["valor_total_tributos"] = float(total.get("vTotTrib", 0))

    itens = []
    dets = inf_nfe.get("det", [])
    if isinstance(dets, dict):
        dets = [dets]

    for det in dets:
        prod = det.get("prod", {})
        imposto = det.get("imposto", {})

        ncm = str(prod.get("NCM", ""))
        cest = str(prod.get("CEST", ""))
        cfop = str(prod.get("CFOP", ""))
        descricao = prod.get("xProd", "")
        gtin = str(prod.get("cEAN", ""))
        codigo = str(prod.get("cProd", ""))

        if gtin in ["SEM GTIN", "0", ""]:
            gtin = None

        classificacao = trib_engine.classificar(
            ncm=ncm,
            cest=cest,
            cfop=cfop,
            descricao=descricao,
            gtin=gtin,
            codigo_produto=codigo,
            tipo_declarado=tipo_declarado,
        )

        item = {
            "codigo_produto": codigo,
            "descricao": descricao,
            "ncm": ncm,
            "cest": cest,
            "cfop": cfop,
            "uom": str(prod.get("uCom", "UN")),
            "quantidade": float(prod.get("qCom", 1)),
            "valor_unitario": float(prod.get("vUnCom", 0)),
            "valor_total": float(prod.get("vProd", 0)),
            "valor_desconto": float(prod.get("vDesc", 0)),
            "valor_frete": float(prod.get("vFrete", 0)),
            "valor_seguro": float(prod.get("vSeg", 0)),
            "valor_despesas": float(prod.get("vOutro", 0)),
            "gtin": gtin,
            "ex_tipi": str(prod.get("NVE", [{}])[0] if isinstance(prod.get("NVE"), list) else prod.get("NVE", "")),
            **classificacao,
        }
        itens.append(item)

    nfe_data["itens"] = itens
    return nfe_data
