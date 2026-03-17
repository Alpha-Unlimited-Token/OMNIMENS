"""
OMNIMENS File Tools — Zip/Unzip, Diff, Search, Tree, JSON/YAML/TOML
Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
"""
import sys, json, os, zipfile, tarfile, difflib, fnmatch, tempfile
import yaml

def diff_text(text_a: str, text_b: str, label_a: str = "original", label_b: str = "modified",
              context: int = 3, unified: bool = True) -> dict:
    lines_a = text_a.splitlines(keepends=True)
    lines_b = text_b.splitlines(keepends=True)
    if unified:
        diff = list(difflib.unified_diff(lines_a, lines_b, fromfile=label_a, tofile=label_b, n=context))
    else:
        diff = list(difflib.ndiff(lines_a, lines_b))
    changes = sum(1 for l in diff if l.startswith(("+","-")) and not l.startswith(("+++","---")))
    return {"success": True, "diff": "".join(diff)[:10000], "changed_lines": changes,
            "lines_a": len(lines_a), "lines_b": len(lines_b)}

def zip_create(files: list, output_path: str = None, content_map: dict = None) -> dict:
    """
    files: list of file paths on disk to zip
    content_map: {"filename.txt": "content string"} for in-memory zipping
    """
    if output_path is None:
        fd, output_path = tempfile.mkstemp(suffix=".zip", prefix="omnimens_")
        os.close(fd)
    try:
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            if content_map:
                for name, content in content_map.items():
                    zf.writestr(name, content)
            if files:
                for f in files:
                    if os.path.isfile(f):
                        zf.write(f, os.path.basename(f))
        size = os.path.getsize(output_path)
        with zipfile.ZipFile(output_path, "r") as zf:
            names = zf.namelist()
        return {"success": True, "path": output_path, "size_bytes": size, "files": names}
    except Exception as e:
        return {"success": False, "error": str(e)}

def zip_list(path: str) -> dict:
    try:
        if path.endswith(".tar.gz") or path.endswith(".tgz"):
            with tarfile.open(path, "r:gz") as tf:
                members = [{"name": m.name, "size": m.size, "type": "dir" if m.isdir() else "file"}
                           for m in tf.getmembers()]
            return {"success": True, "format": "tar.gz", "members": members[:200]}
        with zipfile.ZipFile(path, "r") as zf:
            members = [{"name": i.filename, "size": i.file_size, "compressed": i.compress_size}
                       for i in zf.infolist()]
        return {"success": True, "format": "zip", "count": len(members), "members": members[:200]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def convert_format(data_str: str, from_fmt: str, to_fmt: str) -> dict:
    try:
        # Parse
        from_fmt = from_fmt.lower()
        to_fmt = to_fmt.lower()
        if from_fmt == "json":
            obj = json.loads(data_str)
        elif from_fmt in ("yaml", "yml"):
            obj = yaml.safe_load(data_str)
        elif from_fmt == "toml":
            import tomllib
            obj = tomllib.loads(data_str)
        else:
            return {"success": False, "error": f"Unknown source format: {from_fmt}"}

        # Serialize
        if to_fmt == "json":
            out = json.dumps(obj, indent=2, default=str)
        elif to_fmt in ("yaml", "yml"):
            out = yaml.dump(obj, default_flow_style=False, allow_unicode=True)
        elif to_fmt == "toml":
            try:
                import tomli_w
                out = tomli_w.dumps(obj)
            except ImportError:
                # Fallback: manual simple TOML
                lines = []
                for k, v in obj.items() if isinstance(obj, dict) else []:
                    if isinstance(v, str): lines.append(f'{k} = "{v}"')
                    elif isinstance(v, bool): lines.append(f'{k} = {"true" if v else "false"}')
                    elif isinstance(v, (int, float)): lines.append(f'{k} = {v}')
                out = "\n".join(lines)
        else:
            return {"success": False, "error": f"Unknown target format: {to_fmt}"}

        return {"success": True, "from": from_fmt, "to": to_fmt, "output": out}
    except Exception as e:
        return {"success": False, "error": str(e)}

def validate_json_schema(data, schema: dict) -> dict:
    try:
        import jsonschema
        if isinstance(data, str):
            data = json.loads(data)
        jsonschema.validate(instance=data, schema=schema)
        return {"success": True, "valid": True}
    except jsonschema.ValidationError as e:
        return {"success": True, "valid": False, "error": e.message,
                "path": list(e.absolute_path), "schema_path": list(e.absolute_schema_path)}
    except Exception as e:
        return {"success": False, "error": str(e)}

def search_files(root: str, pattern: str, content_search: str = None, max_results: int = 50) -> dict:
    results = []
    try:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in (".git","node_modules","__pycache__",".cache")]
            for fname in filenames:
                if not fnmatch.fnmatch(fname, pattern):
                    continue
                fpath = os.path.join(dirpath, fname)
                entry = {"path": fpath, "name": fname}
                if content_search:
                    try:
                        with open(fpath, "r", errors="ignore") as f:
                            content = f.read()
                        lines = [f"L{i+1}: {l.rstrip()}" for i, l in enumerate(content.splitlines())
                                 if content_search.lower() in l.lower()]
                        if not lines:
                            continue
                        entry["matches"] = lines[:10]
                    except:
                        continue
                results.append(entry)
                if len(results) >= max_results:
                    break
            if len(results) >= max_results:
                break
        return {"success": True, "count": len(results), "results": results}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    op = data.get("op", "diff")
    if op == "diff":
        result = diff_text(data.get("a",""), data.get("b",""),
                           data.get("label_a","original"), data.get("label_b","modified"),
                           data.get("context",3), data.get("unified",True))
    elif op == "zip_create":
        result = zip_create(data.get("files",[]), data.get("output"), data.get("content_map"))
    elif op == "zip_list":
        result = zip_list(data.get("path",""))
    elif op == "convert":
        result = convert_format(data.get("data",""), data.get("from","json"), data.get("to","yaml"))
    elif op == "validate":
        result = validate_json_schema(data.get("data","{}"), data.get("schema",{}))
    elif op == "search":
        result = search_files(data.get("root","."), data.get("pattern","*"),
                              data.get("content"), data.get("max",50))
    else:
        result = {"success": False, "error": f"Unknown op: {op}"}
    print(json.dumps(result))
