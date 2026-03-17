"""
OMNIMENS System Tools — CPU, Memory, Disk, Processes, Environment
Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
"""
import sys, json, os, platform, subprocess, time
import psutil

def get_system_info(scope: str = "all") -> dict:
    info = {}

    if scope in ("all", "cpu"):
        cpu_times = psutil.cpu_times()
        info["cpu"] = {
            "count_logical": psutil.cpu_count(logical=True),
            "count_physical": psutil.cpu_count(logical=False),
            "percent": psutil.cpu_percent(interval=0.5),
            "freq_mhz": psutil.cpu_freq().current if psutil.cpu_freq() else None,
            "user_sec": round(cpu_times.user, 2),
            "system_sec": round(cpu_times.system, 2),
        }

    if scope in ("all", "memory"):
        vm = psutil.virtual_memory()
        swap = psutil.swap_memory()
        info["memory"] = {
            "total_gb": round(vm.total / 1e9, 2),
            "available_gb": round(vm.available / 1e9, 2),
            "used_gb": round(vm.used / 1e9, 2),
            "percent": vm.percent,
            "swap_total_gb": round(swap.total / 1e9, 2),
            "swap_used_gb": round(swap.used / 1e9, 2),
        }

    if scope in ("all", "disk"):
        disk = psutil.disk_usage("/")
        info["disk"] = {
            "total_gb": round(disk.total / 1e9, 2),
            "used_gb": round(disk.used / 1e9, 2),
            "free_gb": round(disk.free / 1e9, 2),
            "percent": disk.percent,
        }

    if scope in ("all", "processes"):
        procs = []
        for p in sorted(psutil.process_iter(["pid","name","cpu_percent","memory_info","status","cmdline"]),
                        key=lambda x: x.info.get("memory_info").rss if x.info.get("memory_info") else 0,
                        reverse=True)[:15]:
            try:
                mi = p.info.get("memory_info")
                procs.append({
                    "pid": p.info["pid"],
                    "name": p.info["name"],
                    "mem_mb": round(mi.rss / 1e6, 1) if mi else 0,
                    "status": p.info["status"],
                })
            except:
                pass
        info["processes"] = procs

    if scope in ("all", "platform"):
        info["platform"] = {
            "system": platform.system(),
            "node": platform.node(),
            "release": platform.release(),
            "machine": platform.machine(),
            "python": platform.python_version(),
            "uptime_hours": round((time.time() - psutil.boot_time()) / 3600, 1),
        }

    if scope in ("all", "network"):
        net = psutil.net_io_counters()
        info["network"] = {
            "bytes_sent_mb": round(net.bytes_sent / 1e6, 2),
            "bytes_recv_mb": round(net.bytes_recv / 1e6, 2),
            "packets_sent": net.packets_sent,
            "packets_recv": net.packets_recv,
        }

    return {"success": True, "scope": scope, **info}

def run_shell(cmd: str, timeout: int = 30) -> dict:
    safe_prefixes = ("ls", "cat", "echo", "pwd", "which", "find", "du", "df",
                     "ps", "top", "free", "env", "printenv", "uname", "whoami",
                     "python3 --version", "node --version", "git --version",
                     "pip list", "pip show", "npm", "jq", "rg", "grep", "wc",
                     "head", "tail", "sort", "uniq", "cut", "awk", "sed")
    blocked = ("rm ", "rmdir", "dd ", "mkfs", "reboot", "shutdown", "kill ",
               "killall", "> /", "sudo", "su ", "chmod 777", "curl | bash",
               "wget | bash", "eval", "exec ")
    cmd_lower = cmd.lower().strip()
    for b in blocked:
        if b in cmd_lower:
            return {"success": False, "error": f"Blocked command pattern: '{b}'"}
    try:
        proc = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return {"success": proc.returncode == 0, "stdout": proc.stdout[:8000],
                "stderr": proc.stderr[:2000], "exit_code": proc.returncode}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": f"Command timed out after {timeout}s"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    op = data.get("op", "info")
    if op == "info":
        result = get_system_info(data.get("scope", "all"))
    elif op == "shell":
        result = run_shell(data.get("cmd", ""), data.get("timeout", 30))
    else:
        result = {"success": False, "error": f"Unknown op: {op}"}
    print(json.dumps(result))
