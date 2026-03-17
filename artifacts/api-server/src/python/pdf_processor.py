#!/usr/bin/env python3
"""
OMNIMENS PDF Processor
STDIN: JSON {action, file_b64, options}
Actions: extract_text, extract_tables, get_metadata, get_page_count, create_pdf
"""
import sys, json, base64, io, tempfile, os
def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

try:
    import fitz  # PyMuPDF
    PYMUPDF = True
except: PYMUPDF = False

try:
    import pdfplumber
    PDFPLUMBER = True
except: PDFPLUMBER = False

try:
    from reportlab.pdfgen import canvas as rlcanvas
    from reportlab.lib.pagesizes import A4, LETTER
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    REPORTLAB = True
except: REPORTLAB = False

def process(spec: dict) -> dict:
    action = spec.get("action", "extract_text")
    file_b64 = spec.get("file_b64", "")
    options = spec.get("options", {})

    # Decode file if provided
    file_bytes = None
    if file_b64:
        try: file_bytes = base64.b64decode(file_b64)
        except: error_out("Invalid base64 file data")

    if action == "extract_text":
        if not PYMUPDF: error_out("PyMuPDF not available")
        if not file_bytes: error_out("file_b64 required")
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for i, page in enumerate(doc):
            text = page.get_text("text")
            pages.append({"page": i+1, "text": text.strip(), "char_count": len(text)})
        full_text = "\n\n".join(f"--- PAGE {p['page']} ---\n{p['text']}" for p in pages)
        return {"success": True, "action": "extract_text", "page_count": len(doc),
                "total_chars": sum(p["char_count"] for p in pages),
                "pages": pages, "full_text": full_text[:50000]}

    elif action == "extract_tables":
        if not PDFPLUMBER: error_out("pdfplumber not available")
        if not file_bytes: error_out("file_b64 required")
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(file_bytes); tmp_path = tmp.name
        try:
            tables_all = []
            with pdfplumber.open(tmp_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for j, table in enumerate(tables):
                        tables_all.append({"page": i+1, "table_index": j, "rows": table,
                                           "row_count": len(table), "col_count": len(table[0]) if table else 0})
            return {"success": True, "action": "extract_tables", "table_count": len(tables_all), "tables": tables_all}
        finally: os.unlink(tmp_path)

    elif action == "get_metadata":
        if not PYMUPDF: error_out("PyMuPDF not available")
        if not file_bytes: error_out("file_b64 required")
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        meta = doc.metadata
        return {"success": True, "action": "get_metadata", "page_count": len(doc),
                "metadata": meta, "is_encrypted": doc.is_encrypted,
                "toc": doc.get_toc()[:50]}

    elif action == "create_pdf":
        if not REPORTLAB: error_out("reportlab not available")
        content = spec.get("content", "")
        title = spec.get("title", "OMNIMENS Generated Document")
        sections = spec.get("sections", [])  # [{heading, body}]
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=LETTER, leftMargin=inch, rightMargin=inch,
                                topMargin=inch, bottomMargin=inch)
        styles = getSampleStyleSheet()
        story = []
        from reportlab.lib.enums import TA_CENTER
        title_style = styles["Title"]; title_style.textColor = colors.HexColor("#1a1a2e")
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.3*inch))
        if content:
            for line in content.split('\n'):
                line = line.strip()
                if line.startswith("# "): story.append(Paragraph(line[2:], styles["Heading1"])); story.append(Spacer(1, 0.1*inch))
                elif line.startswith("## "): story.append(Paragraph(line[3:], styles["Heading2"])); story.append(Spacer(1, 0.1*inch))
                elif line: story.append(Paragraph(line, styles["BodyText"])); story.append(Spacer(1, 0.05*inch))
        for section in sections:
            if section.get("heading"): story.append(Paragraph(section["heading"], styles["Heading2"])); story.append(Spacer(1, 0.1*inch))
            if section.get("body"): story.append(Paragraph(section["body"], styles["BodyText"])); story.append(Spacer(1, 0.1*inch))
            if section.get("table"):
                tdata = section["table"]
                t = Table(tdata)
                t.setStyle(TableStyle([
                    ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#6c63ff")),
                    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
                    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
                    ("ALIGN",(0,0),(-1,-1),"CENTER"),
                    ("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#cccccc")),
                    ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, colors.HexColor("#f5f5ff")]),
                ]))
                story.append(t); story.append(Spacer(1, 0.1*inch))
        doc.build(story)
        pdf_b64 = base64.b64encode(buf.getvalue()).decode()
        return {"success": True, "action": "create_pdf", "pdf_base64": pdf_b64, "size_bytes": len(buf.getvalue())}

    else:
        error_out(f"Unknown action: {action}. Use: extract_text, extract_tables, get_metadata, create_pdf")

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
