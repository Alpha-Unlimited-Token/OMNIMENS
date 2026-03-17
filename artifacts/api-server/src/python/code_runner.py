"""
OMNIMENS Code Runner — Execute Python / Node.js / Bash safely
Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
"""
import sys, json, subprocess, tempfile, os, resource, time

def run_code(lang: str, code: str, stdin_data: str = "", timeout: int = 15) -> dict:
    lang = lang.lower().strip()
    ext_map = {"python": ".py", "python3": ".py", "javascript": ".js",
               "node": ".js", "nodejs": ".js", "bash": ".sh", "sh": ".sh"}
    cmd_map = {"python": ["python3"], "python3": ["python3"],
               "javascript": ["node"], "node": ["node"], "nodejs": ["node"],
               "bash": ["bash"], "sh": ["bash"]}

    if lang not in ext_map:
        return {"success": False, "error": f"Unsupported language: {lang}. Supported: python, javascript, bash"}

    ext = ext_map[lang]
    cmd = cmd_map[lang]

    with tempfile.NamedTemporaryFile(mode="w", suffix=ext, delete=False) as f:
        f.write(code)
        tmpfile = f.name

    try:
        start = time.time()
        proc = subprocess.run(
            cmd + [tmpfile],
            input=stdin_data,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        elapsed = round(time.time() - start, 3)
        return {
            "success": proc.returncode == 0,
            "stdout": proc.stdout[:8000],
            "stderr": proc.stderr[:3000],
            "exit_code": proc.returncode,
            "elapsed_sec": elapsed,
            "language": lang,
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": f"Execution timed out after {timeout}s", "language": lang}
    except Exception as e:
        return {"success": False, "error": str(e), "language": lang}
    finally:
        try: os.unlink(tmpfile)
        except: pass

def format_python(code: str) -> dict:
    try:
        import black
        formatted = black.format_str(code, mode=black.Mode())
        return {"success": True, "formatted": formatted}
    except Exception as e:
        return {"success": False, "error": str(e), "original": code}

def lint_python(code: str) -> dict:
    import tempfile, subprocess, os
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        tmpfile = f.name
    try:
        proc = subprocess.run(
            ["pylint", "--output-format=json", "--disable=C0114,C0115,C0116", tmpfile],
            capture_output=True, text=True, timeout=30
        )
        try:
            msgs = json.loads(proc.stdout)
        except:
            msgs = []
        issues = [{"line": m["line"], "type": m["type"], "message": m["message"], "symbol": m["symbol"]} for m in msgs]
        return {"success": True, "issues": issues, "count": len(issues)}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        try: os.unlink(tmpfile)
        except: pass

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    op = data.get("op", "run")
    if op == "run":
        result = run_code(data.get("lang", "python"), data.get("code", ""), data.get("stdin", ""), data.get("timeout", 15))
    elif op == "format":
        result = format_python(data.get("code", ""))
    elif op == "lint":
        result = lint_python(data.get("code", ""))
    else:
        result = {"success": False, "error": f"Unknown op: {op}"}
    print(json.dumps(result))
