#!/usr/bin/env python3
"""VSAT Log Analyzer - Detects Command Injection & RCE Attempts."""

import json
import re
import sys
from datetime import datetime, timezone

PATTERNS = {
    "command_injection": [
        r"[;&|`$]\s*(whoami|id|cat|ls|dir|ping|curl|wget)",
        r"\$\(.*?\)",
        r"`.*?`",
        r"\|\s*(sh|bash|dash|cmd)",
    ],
    "auth_failure": [
        r"authentication failure",
        r"failed password",
        r"invalid user",
    ],
    "unauthorized_config": [
        r"firmware update initiated",
        r"factory reset",
        r"acs connection url modified",
    ],
}


def scan_lines(lines):
    findings = []
    for line_no, line in enumerate(lines, 1):
        for category, regex_list in PATTERNS.items():
            for pattern in regex_list:
                if re.search(pattern, line, re.IGNORECASE):
                    findings.append(
                        {
                            "line": line_no,
                            "category": category,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "match": pattern,
                            "evidence": line.strip()[:180],
                        }
                    )
                    break
    return findings


def analyze_logs(logfile: str):
    try:
        with open(logfile, "r", encoding="utf-8") as f:
            return scan_lines(f)
    except OSError as exc:
        print(f"[-] Error parsing log file: {exc}")
        return []


if __name__ == "__main__":
    log = sys.argv[1] if len(sys.argv) > 1 else "/var/log/modem.log"
    results = analyze_logs(log)
    print(json.dumps(results, indent=2))
