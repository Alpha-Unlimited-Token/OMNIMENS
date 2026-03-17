#!/usr/bin/env python3
"""
OMNIMENS Data Science Engine — pandas + scikit-learn + matplotlib + seaborn
STDIN: JSON {action, data, options}
Actions: describe, correlate, cluster, classify, regress, forecast, pca, anomaly_detect, plot_matrix
"""
import sys, json, base64, io, warnings
warnings.filterwarnings("ignore")

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

def df_from_spec(data_spec):
    import pandas as pd, io as sio
    if isinstance(data_spec, str):
        return pd.read_csv(sio.StringIO(data_spec))
    elif isinstance(data_spec, list):
        if data_spec and isinstance(data_spec[0], dict): return pd.DataFrame(data_spec)
        return pd.DataFrame(data_spec)
    elif isinstance(data_spec, dict):
        return pd.DataFrame(data_spec)
    return pd.DataFrame()

def render_fig(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor="#0d0d0d", dpi=150)
    buf.seek(0); b64 = base64.b64encode(buf.read()).decode()
    plt.close(fig); return b64

def process(spec: dict) -> dict:
    action = spec.get("action", "describe")
    data_spec = spec.get("data", [])
    options = spec.get("options", {})

    import pandas as pd

    if action == "describe":
        df = df_from_spec(data_spec)
        num_cols = df.select_dtypes(include=np.number).columns.tolist()
        cat_cols = df.select_dtypes(include="object").columns.tolist()
        desc = df.describe(include="all").fillna("").to_dict()
        return {"success": True, "action": "describe",
                "shape": list(df.shape), "columns": list(df.columns),
                "numeric_columns": num_cols, "categorical_columns": cat_cols,
                "dtypes": {c: str(t) for c, t in df.dtypes.items()},
                "null_counts": df.isnull().sum().to_dict(),
                "describe": desc, "head": df.head(5).to_dict(orient="records")}

    elif action == "correlate":
        df = df_from_spec(data_spec)
        num_df = df.select_dtypes(include=np.number)
        if num_df.shape[1] < 2: error_out("Need at least 2 numeric columns for correlation")
        corr = num_df.corr()
        # Heatmap
        import seaborn as sns
        fig, ax = plt.subplots(figsize=(max(6, len(corr)*0.8), max(5, len(corr)*0.7)))
        fig.patch.set_facecolor("#0d0d0d"); ax.set_facecolor("#0d0d0d")
        sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=ax,
                    linewidths=0.5, annot_kws={"size": 8})
        ax.set_title("Correlation Matrix", color="#eeeeee"); plt.xticks(color="#cccccc"); plt.yticks(color="#cccccc")
        plt.tight_layout()
        return {"success": True, "action": "correlate",
                "correlation_matrix": corr.to_dict(),
                "heatmap_png": render_fig(fig),
                "top_correlations": sorted([{"cols": f"{a}×{b}", "correlation": round(float(corr[a][b]),3)}
                    for a in corr.columns for b in corr.columns if a < b],
                    key=lambda x: abs(x["correlation"]), reverse=True)[:10]}

    elif action == "cluster":
        from sklearn.cluster import KMeans, DBSCAN
        from sklearn.preprocessing import StandardScaler
        from sklearn.decomposition import PCA
        df = df_from_spec(data_spec)
        num_df = df.select_dtypes(include=np.number).dropna()
        if num_df.empty: error_out("No numeric columns for clustering")
        n_clusters = options.get("n_clusters", 3)
        method = options.get("method", "kmeans")
        scaler = StandardScaler()
        X = scaler.fit_transform(num_df)
        if method == "dbscan":
            model = DBSCAN(eps=options.get("eps", 0.5), min_samples=options.get("min_samples", 5))
        else:
            model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = model.fit_predict(X)
        # PCA for visualization
        pca = PCA(n_components=2); X2d = pca.fit_transform(X)
        fig, ax = plt.subplots(figsize=(9, 6)); fig.patch.set_facecolor("#0d0d0d"); ax.set_facecolor("#1a1a1a")
        colors = plt.cm.plasma(np.linspace(0.1, 0.9, len(set(labels))))
        for i, label in enumerate(set(labels)):
            mask = labels == label
            ax.scatter(X2d[mask, 0], X2d[mask, 1], c=[colors[i%len(colors)]], label=f"Cluster {label}", s=60, alpha=0.8)
        ax.set_title(f"K-Means Clustering (n={n_clusters})", color="#eeeeee"); ax.legend(labelcolor="#cccccc")
        ax.tick_params(colors="#999999"); plt.tight_layout()
        cluster_counts = {int(k): int(v) for k, v in zip(*np.unique(labels, return_counts=True))}
        return {"success": True, "action": "cluster", "method": method, "cluster_labels": labels.tolist(),
                "cluster_counts": cluster_counts, "n_clusters_found": len(set(labels)),
                "scatter_plot_png": render_fig(fig),
                "pca_variance_explained": [round(float(v)*100, 2) for v in pca.explained_variance_ratio_]}

    elif action == "regress":
        from sklearn.linear_model import LinearRegression, Ridge
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import r2_score, mean_squared_error
        df = df_from_spec(data_spec)
        target = options.get("target") or df.columns[-1]
        features = options.get("features") or [c for c in df.select_dtypes(include=np.number).columns if c != target]
        if not features: error_out("No numeric feature columns found")
        df_clean = df[features + [target]].dropna()
        X = df_clean[features].values; y = df_clean[target].values
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = LinearRegression(); model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        r2 = r2_score(y_test, y_pred); mse = mean_squared_error(y_test, y_pred)
        # Actual vs Predicted plot
        fig, ax = plt.subplots(figsize=(8, 6)); fig.patch.set_facecolor("#0d0d0d"); ax.set_facecolor("#1a1a1a")
        ax.scatter(y_test, y_pred, c="#6c63ff", alpha=0.7, s=50)
        mn = min(y_test.min(), y_pred.min()); mx = max(y_test.max(), y_pred.max())
        ax.plot([mn, mx], [mn, mx], "r--", linewidth=2, label="Perfect fit")
        ax.set_xlabel("Actual", color="#cccccc"); ax.set_ylabel("Predicted", color="#cccccc")
        ax.set_title(f"Regression: {target} (R²={r2:.3f})", color="#eeeeee"); ax.legend()
        ax.tick_params(colors="#999999"); plt.tight_layout()
        return {"success": True, "action": "regress", "target": target, "features": features,
                "r2_score": round(r2, 4), "rmse": round(float(mse**0.5), 4),
                "coefficients": dict(zip(features, [round(float(c),4) for c in model.coef_])),
                "intercept": round(float(model.intercept_), 4),
                "scatter_plot_png": render_fig(fig)}

    elif action == "anomaly_detect":
        from sklearn.ensemble import IsolationForest
        df = df_from_spec(data_spec)
        num_df = df.select_dtypes(include=np.number).dropna()
        contamination = options.get("contamination", 0.05)
        clf = IsolationForest(contamination=contamination, random_state=42)
        preds = clf.fit_predict(num_df)
        anomaly_idx = np.where(preds == -1)[0].tolist()
        return {"success": True, "action": "anomaly_detect",
                "total_samples": len(preds), "anomaly_count": len(anomaly_idx),
                "anomaly_rate": round(len(anomaly_idx)/len(preds)*100, 2),
                "anomaly_indices": anomaly_idx[:50],
                "anomaly_rows": df.iloc[anomaly_idx[:20]].to_dict(orient="records")}

    else:
        error_out(f"Unknown action: {action}. Use: describe, correlate, cluster, regress, anomaly_detect")

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
