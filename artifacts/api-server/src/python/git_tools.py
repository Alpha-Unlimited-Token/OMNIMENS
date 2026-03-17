"""
OMNIMENS Git Tools — Clone, Diff, Log, Blame, Status
Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
"""
import sys, json, os, tempfile, subprocess, shutil

def _run_git(args: list, cwd: str, timeout: int = 30) -> tuple[int, str, str]:
    proc = subprocess.run(["git"] + args, cwd=cwd, capture_output=True, text=True, timeout=timeout)
    return proc.returncode, proc.stdout, proc.stderr

def clone_repo(url: str, branch: str = None, depth: int = 1) -> dict:
    tmpdir = tempfile.mkdtemp(prefix="omnimens_git_")
    try:
        args = ["clone", "--depth", str(depth)]
        if branch:
            args += ["-b", branch]
        args += [url, tmpdir]
        code, out, err = _run_git(args, "/tmp", timeout=60)
        if code != 0:
            return {"success": False, "error": err or "Clone failed"}

        # Get basic info
        _, files_out, _ = _run_git(["ls-files", "--others", "--cached", "--exclude-standard"], tmpdir)
        files = files_out.strip().splitlines()
        _, log_out, _ = _run_git(["log", "--oneline", "-10"], tmpdir)
        _, stat_out, _ = _run_git(["show", "--stat", "--format=%H %s", "-1"], tmpdir)
        return {"success": True, "url": url, "branch": branch or "default",
                "file_count": len(files), "files": files[:50],
                "recent_commits": log_out.strip().splitlines(),
                "latest_stat": stat_out.strip()[:2000], "tmpdir": tmpdir}
    except Exception as e:
        shutil.rmtree(tmpdir, ignore_errors=True)
        return {"success": False, "error": str(e)}

def repo_info(path: str) -> dict:
    if not os.path.isdir(path):
        return {"success": False, "error": f"Path not found: {path}"}
    try:
        _, branch, _ = _run_git(["rev-parse", "--abbrev-ref", "HEAD"], path)
        _, log, _ = _run_git(["log", "--oneline", "--graph", "-20"], path)
        _, status, _ = _run_git(["status", "--short"], path)
        _, remote, _ = _run_git(["remote", "-v"], path)
        _, contributors, _ = _run_git(["shortlog", "-sn", "--no-merges", "-20"], path)
        return {"success": True, "branch": branch.strip(), "status": status.strip(),
                "log": log.strip().splitlines(), "remotes": remote.strip(),
                "contributors": contributors.strip().splitlines()}
    except Exception as e:
        return {"success": False, "error": str(e)}

def diff_commits(path: str, from_ref: str = "HEAD~1", to_ref: str = "HEAD") -> dict:
    try:
        _, diff, err = _run_git(["diff", from_ref, to_ref, "--stat"], path)
        _, diff_full, _ = _run_git(["diff", from_ref, to_ref], path)
        if err and not diff:
            return {"success": False, "error": err}
        return {"success": True, "stat": diff.strip(), "diff": diff_full[:10000]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def blame_file(path: str, filepath: str) -> dict:
    try:
        _, out, err = _run_git(["blame", "-l", "--line-porcelain", filepath], path)
        if err and not out:
            return {"success": False, "error": err}
        lines = []
        current = {}
        for line in out.splitlines():
            if line.startswith("\t"):
                current["content"] = line[1:]
                lines.append(current)
                current = {}
            elif " " in line:
                key, _, val = line.partition(" ")
                current[key] = val
        return {"success": True, "file": filepath, "lines": lines[:200]}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    op = data.get("op", "info")
    if op == "clone":
        result = clone_repo(data.get("url",""), data.get("branch"), data.get("depth",1))
    elif op == "info":
        result = repo_info(data.get("path", "."))
    elif op == "diff":
        result = diff_commits(data.get("path","."), data.get("from","HEAD~1"), data.get("to","HEAD"))
    elif op == "blame":
        result = blame_file(data.get("path","."), data.get("file",""))
    else:
        result = {"success": False, "error": f"Unknown op: {op}"}
    print(json.dumps(result))
