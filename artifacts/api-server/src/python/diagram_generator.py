#!/usr/bin/env python3
"""
OMNIMENS Diagram Generator — Graphviz + NetworkX
STDIN: JSON {type, code, options} OR {type:"network", nodes, edges, options}
Types: dot, neato, fdp, sfdp, circo, twopi, network, tree
Returns: {success, svg, png_base64}
"""
import sys, json, base64, subprocess, tempfile, os, shutil

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

DOT_BIN = shutil.which("dot") or ""

def process(spec: dict) -> dict:
    diag_type = spec.get("type", "dot")
    code = spec.get("code", "")
    options = spec.get("options", {})

    # ── Pre-built network diagram from node/edge lists ──────────────────────
    if diag_type == "network" or spec.get("nodes"):
        import networkx as nx
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import io

        nodes = spec.get("nodes", [])
        edges = spec.get("edges", [])
        directed = options.get("directed", False)
        layout = options.get("layout", "spring")
        node_size = options.get("node_size", 1000)
        title = options.get("title", "Network Graph")

        G = nx.DiGraph() if directed else nx.Graph()
        for node in nodes:
            if isinstance(node, dict): G.add_node(node["id"], **{k:v for k,v in node.items() if k!="id"})
            else: G.add_node(node)
        for edge in edges:
            if isinstance(edge, dict): G.add_edge(edge["from"], edge["to"], **{k:v for k,v in edge.items() if k not in ("from","to")})
            elif isinstance(edge, list) and len(edge) >= 2: G.add_edge(edge[0], edge[1])

        layouts = {"spring": nx.spring_layout, "circular": nx.circular_layout,
                   "kamada_kawai": nx.kamada_kawai_layout, "spectral": nx.spectral_layout,
                   "shell": nx.shell_layout, "random": nx.random_layout}
        pos = layouts.get(layout, nx.spring_layout)(G, seed=42)

        fig, ax = plt.subplots(figsize=(12, 8))
        fig.patch.set_facecolor("#0d0d0d"); ax.set_facecolor("#0d0d0d")
        ax.set_title(title, color="#eeeeee", fontsize=14, fontweight="bold")
        nx.draw_networkx(G, pos, ax=ax, node_color="#6c63ff", edge_color="#444488",
                         font_color="white", node_size=node_size, font_size=9,
                         arrows=directed, arrowsize=20, width=1.5)
        ax.axis("off")
        plt.tight_layout()
        buf = io.BytesIO(); fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        buf.seek(0); b64 = base64.b64encode(buf.read()).decode(); plt.close(fig)
        return {"success": True, "type": "network", "png_base64": b64, "format": "image/png",
                "node_count": G.number_of_nodes(), "edge_count": G.number_of_edges(),
                "is_connected": nx.is_connected(G) if not directed else nx.is_weakly_connected(G)}

    # ── Graphviz DOT rendering ───────────────────────────────────────────────
    if not DOT_BIN: error_out("graphviz (dot) not found in PATH")
    if not code: error_out("code (DOT language) is required")

    engine_map = {"dot": "dot", "neato": "neato", "fdp": "fdp", "sfdp": "sfdp",
                  "circo": "circo", "twopi": "twopi", "tree": "dot"}
    engine = engine_map.get(diag_type, "dot")

    tmpdir = tempfile.mkdtemp()
    try:
        in_path = os.path.join(tmpdir, "input.dot")
        svg_path = os.path.join(tmpdir, "output.svg")
        png_path = os.path.join(tmpdir, "output.png")
        with open(in_path, "w") as f: f.write(code)

        # Render SVG
        r_svg = subprocess.run([engine, "-Tsvg", in_path, "-o", svg_path], capture_output=True, timeout=30)
        # Render PNG
        r_png = subprocess.run([engine, "-Tpng", "-Gdpi=150", in_path, "-o", png_path], capture_output=True, timeout=30)

        result = {"success": True, "type": diag_type, "engine": engine}
        if os.path.exists(svg_path):
            with open(svg_path) as f: result["svg"] = f.read()
        if os.path.exists(png_path):
            with open(png_path, "rb") as f: result["png_base64"] = base64.b64encode(f.read()).decode()
            result["format"] = "image/png"
        if not os.path.exists(svg_path) and not os.path.exists(png_path):
            return {"success": False, "error": r_svg.stderr.decode()[:500]}
        return result
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
