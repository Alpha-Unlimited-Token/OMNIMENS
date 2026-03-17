#!/usr/bin/env python3
"""
OMNIMENS Chart Generator Engine
Accepts JSON via STDIN with: {type, title, data, options}
Returns: {success, base64_png, format, description}
Supports: bar, line, scatter, pie, area, histogram, heatmap, box, violin, correlation
"""
import sys, json, base64, io, warnings
warnings.filterwarnings("ignore")

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

DARK_BG = "#0d0d0d"
CARD_BG = "#161616"
ACCENT = "#6c63ff"
ACCENT2 = "#ff6584"
ACCENT3 = "#43e97b"
PALETTE = ["#6c63ff","#ff6584","#43e97b","#f7b731","#00cec9","#fd79a8","#e17055","#74b9ff","#a29bfe","#55efc4"]

def setup_dark_theme():
    plt.rcParams.update({
        "figure.facecolor": DARK_BG, "axes.facecolor": CARD_BG,
        "axes.edgecolor": "#333333", "axes.labelcolor": "#cccccc",
        "xtick.color": "#999999", "ytick.color": "#999999",
        "text.color": "#eeeeee", "grid.color": "#222222", "grid.alpha": 0.7,
        "axes.grid": True, "figure.dpi": 150,
        "font.family": "DejaVu Sans", "font.size": 10,
        "axes.spines.top": False, "axes.spines.right": False,
        "axes.spines.left": True, "axes.spines.bottom": True,
    })

def render_to_b64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=DARK_BG, dpi=150)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return b64

def generate_chart(spec: dict) -> dict:
    setup_dark_theme()
    chart_type = spec.get("type", "bar").lower()
    title = spec.get("title", "Chart")
    data = spec.get("data", {})
    options = spec.get("options", {})
    
    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor(DARK_BG)

    labels = data.get("labels", [])
    datasets = data.get("datasets", [])

    try:
        if chart_type in ("bar", "column"):
            x = np.arange(len(labels))
            width = 0.8 / max(len(datasets), 1)
            for i, ds in enumerate(datasets):
                vals = ds.get("values", ds.get("data", []))
                offset = (i - len(datasets)/2 + 0.5) * width
                bars = ax.bar(x + offset, vals, width=width*0.9, label=ds.get("label",""),
                              color=PALETTE[i % len(PALETTE)], alpha=0.85, edgecolor="none")
                for bar in bars:
                    h = bar.get_height()
                    if h != 0:
                        ax.text(bar.get_x()+bar.get_width()/2, h*1.01, f"{h:,.1f}",
                                ha="center", va="bottom", fontsize=8, color="#cccccc")
            ax.set_xticks(x); ax.set_xticklabels(labels, rotation=20, ha="right")

        elif chart_type == "line":
            x = list(range(len(labels)))
            for i, ds in enumerate(datasets):
                vals = ds.get("values", ds.get("data", []))
                ax.plot(x, vals, label=ds.get("label",""), color=PALETTE[i % len(PALETTE)],
                        marker="o", linewidth=2.5, markersize=5)
                ax.fill_between(x, vals, alpha=0.1, color=PALETTE[i % len(PALETTE)])
            ax.set_xticks(x); ax.set_xticklabels(labels, rotation=20, ha="right")

        elif chart_type == "scatter":
            for i, ds in enumerate(datasets):
                xs = ds.get("x", []); ys = ds.get("y", [])
                sizes = ds.get("size", [50]*len(xs))
                ax.scatter(xs, ys, label=ds.get("label",""), c=PALETTE[i % len(PALETTE)],
                           s=sizes, alpha=0.75, edgecolors="none")

        elif chart_type == "pie" or chart_type == "donut":
            vals = datasets[0].get("values", datasets[0].get("data", [])) if datasets else data.get("values", [])
            colors = [PALETTE[i % len(PALETTE)] for i in range(len(labels))]
            wedge_props = {"linewidth": 2, "edgecolor": DARK_BG}
            pctdist = 0.75 if chart_type == "donut" else 0.85
            wedges, texts, autotexts = ax.pie(vals, labels=labels, autopct="%1.1f%%",
                colors=colors, wedgeprops=wedge_props, pctdistance=pctdist,
                startangle=90, textprops={"color": "#eeeeee", "fontsize": 9})
            for at in autotexts: at.set_color(DARK_BG)
            if chart_type == "donut":
                centre = plt.Circle((0, 0), 0.55, fc=DARK_BG)
                ax.add_artist(centre)
                s = sum(vals); ax.text(0, 0, f"{s:,.0f}", ha="center", va="center",
                                       fontsize=14, color="#eeeeee", fontweight="bold")
            ax.set_aspect("equal")

        elif chart_type == "area":
            x = list(range(len(labels)))
            for i, ds in enumerate(datasets):
                vals = ds.get("values", ds.get("data", []))
                ax.fill_between(x, vals, alpha=0.4, color=PALETTE[i % len(PALETTE)], label=ds.get("label",""))
                ax.plot(x, vals, color=PALETTE[i % len(PALETTE)], linewidth=2)
            ax.set_xticks(x); ax.set_xticklabels(labels, rotation=20, ha="right")

        elif chart_type == "histogram":
            vals = datasets[0].get("values", datasets[0].get("data", [])) if datasets else data.get("values", [])
            bins = options.get("bins", 20)
            n, bins_out, patches = ax.hist(vals, bins=bins, color=ACCENT, edgecolor=DARK_BG, alpha=0.85)
            for patch, c in zip(patches, plt.cm.plasma(np.linspace(0.2, 0.9, len(patches)))):
                patch.set_facecolor(c)

        elif chart_type == "heatmap":
            matrix = data.get("matrix", [])
            if not matrix: error_out("heatmap requires data.matrix (2D array)")
            arr = np.array(matrix)
            im = ax.imshow(arr, cmap="plasma", aspect="auto")
            if data.get("x_labels"): ax.set_xticks(range(len(data["x_labels"]))); ax.set_xticklabels(data["x_labels"], rotation=45, ha="right")
            if data.get("y_labels"): ax.set_yticks(range(len(data["y_labels"]))); ax.set_yticklabels(data["y_labels"])
            for i in range(arr.shape[0]):
                for j in range(arr.shape[1]):
                    ax.text(j, i, f"{arr[i,j]:.2f}", ha="center", va="center", fontsize=7, color="white")
            fig.colorbar(im, ax=ax)

        elif chart_type == "box" or chart_type == "violin":
            raw_data = [ds.get("values", ds.get("data", [])) for ds in datasets]
            if chart_type == "violin":
                parts = ax.violinplot(raw_data, showmeans=True, showextrema=True)
                for i, pc in enumerate(parts["bodies"]):
                    pc.set_facecolor(PALETTE[i % len(PALETTE)]); pc.set_alpha(0.7)
            else:
                bp = ax.boxplot(raw_data, patch_artist=True, notch=False)
                for i, patch in enumerate(bp["boxes"]):
                    patch.set_facecolor(PALETTE[i % len(PALETTE)]); patch.set_alpha(0.7)
            ds_labels = [ds.get("label","") for ds in datasets]
            if ds_labels: ax.set_xticks(range(1, len(ds_labels)+1)); ax.set_xticklabels(ds_labels)

        else:
            error_out(f"Unsupported chart type: {chart_type}. Use: bar, line, scatter, pie, donut, area, histogram, heatmap, box, violin")

        ax.set_title(title, fontsize=14, fontweight="bold", color="#eeeeee", pad=15)
        xlabel = options.get("xlabel",""); ylabel = options.get("ylabel","")
        if xlabel: ax.set_xlabel(xlabel, color="#aaaaaa")
        if ylabel: ax.set_ylabel(ylabel, color="#aaaaaa")
        if any(ds.get("label") for ds in datasets) and chart_type not in ("pie","donut","histogram","heatmap"):
            ax.legend(framealpha=0.2, facecolor="#111111", edgecolor="#333333", labelcolor="#dddddd")
        plt.tight_layout()
        return {"success": True, "base64_png": render_to_b64(fig), "format": "image/png",
                "chart_type": chart_type, "title": title}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input received on stdin")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON input")
    print(json.dumps(generate_chart(spec)))
