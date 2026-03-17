#!/usr/bin/env python3
"""
OMNIMENS Math Engine — sympy + numpy + scipy
STDIN: JSON {action, expression, options}
Actions: solve, simplify, diff, integrate, series, factor, expand, plot, matrix_ops, stats
"""
import sys, json, base64, io, warnings
warnings.filterwarnings("ignore")

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

def process(spec: dict) -> dict:
    action = spec.get("action", "simplify")
    expression = spec.get("expression", "")
    options = spec.get("options", {})

    import sympy as sp
    import numpy as np
    from sympy import symbols, sympify, solve, simplify, diff, integrate, series, factor, expand, latex, Matrix
    from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

    transforms = (standard_transformations + (implicit_multiplication_application,))

    def parse(expr_str):
        try: return parse_expr(expr_str, transformations=transforms)
        except: return sympify(expr_str)

    if action == "solve":
        expr_str = expression or spec.get("equation", "")
        var_str = options.get("variable", "x")
        var = symbols(var_str)
        # Handle equations (with =)
        if "=" in expr_str:
            lhs, rhs = expr_str.split("=", 1)
            eq = sp.Eq(parse(lhs.strip()), parse(rhs.strip()))
        else:
            eq = parse(expr_str)
        solutions = solve(eq, var)
        return {"success": True, "action": "solve", "expression": expression,
                "variable": var_str, "solutions": [str(s) for s in solutions],
                "solutions_numeric": [complex(sp.N(s)).real for s in solutions if s.is_number],
                "solutions_latex": [latex(s) for s in solutions]}

    elif action == "simplify":
        expr = parse(expression)
        result = simplify(expr)
        return {"success": True, "action": "simplify", "input": expression,
                "result": str(result), "latex": latex(result),
                "numeric_approx": float(sp.N(result)) if result.is_number else None}

    elif action == "diff":
        expr = parse(expression)
        var_str = options.get("variable", "x"); order = options.get("order", 1)
        var = symbols(var_str)
        result = diff(expr, var, order)
        simplified = simplify(result)
        return {"success": True, "action": "diff", "expression": expression,
                "variable": var_str, "order": order,
                "derivative": str(simplified), "latex": latex(simplified)}

    elif action == "integrate":
        expr = parse(expression)
        var_str = options.get("variable", "x")
        var = symbols(var_str)
        lower = options.get("lower"); upper = options.get("upper")
        if lower is not None and upper is not None:
            result = integrate(expr, (var, parse(str(lower)), parse(str(upper))))
            numeric = float(sp.N(result)) if result.is_number else None
            return {"success": True, "action": "definite_integral", "expression": expression,
                    "variable": var_str, "bounds": [str(lower), str(upper)],
                    "result": str(simplify(result)), "latex": latex(simplify(result)), "numeric": numeric}
        else:
            result = integrate(expr, var)
            return {"success": True, "action": "indefinite_integral", "expression": expression,
                    "variable": var_str, "result": str(result) + " + C", "latex": latex(result) + " + C"}

    elif action == "factor":
        expr = parse(expression)
        result = factor(expr)
        return {"success": True, "action": "factor", "expression": expression,
                "factored": str(result), "latex": latex(result)}

    elif action == "expand":
        expr = parse(expression)
        result = expand(expr)
        return {"success": True, "action": "expand", "expression": expression,
                "expanded": str(result), "latex": latex(result)}

    elif action == "series":
        expr = parse(expression)
        var_str = options.get("variable", "x"); point = options.get("point", 0); n = options.get("n", 6)
        var = symbols(var_str)
        result = series(expr, var, point, n)
        return {"success": True, "action": "series", "expression": expression,
                "variable": var_str, "point": point, "order": n,
                "series": str(result), "latex": latex(result)}

    elif action == "plot":
        import matplotlib; matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        expressions = spec.get("expressions", [expression] if expression else [])
        x_range = options.get("x_range", [-10, 10]); points = options.get("points", 1000)
        title = options.get("title", "Mathematical Plot")
        x_sym = symbols("x")
        x_vals = np.linspace(x_range[0], x_range[1], points)
        fig, ax = plt.subplots(figsize=(10, 6)); fig.patch.set_facecolor("#0d0d0d"); ax.set_facecolor("#111111")
        PALETTE = ["#6c63ff","#ff6584","#43e97b","#f7b731","#00cec9"]
        ax.axhline(0, color="#333333", linewidth=0.8); ax.axvline(0, color="#333333", linewidth=0.8)
        ax.grid(color="#222222", alpha=0.7)
        for i, expr_str in enumerate(expressions[:5]):
            try:
                expr = parse(expr_str)
                f = sp.lambdify(x_sym, expr, modules=["numpy"])
                y_vals = f(x_vals)
                mask = np.isfinite(y_vals)
                ax.plot(x_vals[mask], y_vals[mask], color=PALETTE[i % len(PALETTE)],
                        linewidth=2.5, label=f"f(x) = {expr_str}")
            except Exception as e: pass
        ax.set_title(title, color="#eeeeee", fontsize=13, fontweight="bold")
        ax.legend(labelcolor="#cccccc", framealpha=0.2, facecolor="#111111")
        ax.tick_params(colors="#999999"); ax.set_xlabel("x", color="#aaaaaa"); ax.set_ylabel("y", color="#aaaaaa")
        plt.tight_layout()
        buf = io.BytesIO(); fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        buf.seek(0); b64 = base64.b64encode(buf.read()).decode(); plt.close(fig)
        return {"success": True, "action": "plot", "plot_png": b64, "expressions": expressions}

    elif action == "matrix_ops":
        matrices = spec.get("matrices", {})
        op = options.get("op", "det")
        results = {}
        for name, mat_data in matrices.items():
            M = Matrix(mat_data)
            results[name] = {
                "determinant": str(M.det()) if M.is_square else None,
                "rank": M.rank(),
                "eigenvalues": {str(k): int(v) for k, v in M.eigenvals().items()} if M.is_square else None,
                "inverse": str(M.inv()) if M.is_square and M.det() != 0 else None,
                "trace": str(M.trace()) if M.is_square else None,
                "rref": str(M.rref()[0]),
            }
        return {"success": True, "action": "matrix_ops", "results": results}

    elif action == "stats":
        from scipy import stats
        data = spec.get("data", [])
        arr = np.array(data, dtype=float)
        result = {
            "mean": float(np.mean(arr)), "median": float(np.median(arr)),
            "std": float(np.std(arr, ddof=1)), "var": float(np.var(arr, ddof=1)),
            "min": float(arr.min()), "max": float(arr.max()),
            "q1": float(np.percentile(arr, 25)), "q3": float(np.percentile(arr, 75)),
            "iqr": float(np.percentile(arr, 75) - np.percentile(arr, 25)),
            "skewness": float(stats.skew(arr)), "kurtosis": float(stats.kurtosis(arr)),
            "count": len(arr),
        }
        norm_test = stats.normaltest(arr)
        result["normality_test"] = {"statistic": float(norm_test.statistic), "p_value": float(norm_test.pvalue),
                                     "is_normal": norm_test.pvalue > 0.05}
        return {"success": True, "action": "stats", **result}

    else:
        error_out(f"Unknown action: {action}. Use: solve, simplify, diff, integrate, factor, expand, series, plot, matrix_ops, stats")

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
