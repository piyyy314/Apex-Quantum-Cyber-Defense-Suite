#!/usr/bin/env python3
"""VSAT File Integrity Monitor (FIM)."""

import hashlib
import json
import os
from typing import Iterable, List, Optional

DEFAULT_CRITICAL_PATHS = [
    "/etc/passwd",
    "/etc/ssh/sshd_config",
    "/opt/vsat/config/modem.conf",
]


def hash_file(filepath: str) -> Optional[str]:
    if not os.path.exists(filepath):
        return None
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def verify_baseline(
    paths: Iterable[str] = DEFAULT_CRITICAL_PATHS,
    baseline_file: str = "/tmp/vsat_baseline.json",
) -> List[dict]:
    baseline = {}
    if os.path.exists(baseline_file):
        with open(baseline_file, "r", encoding="utf-8") as f:
            baseline = json.load(f)

    alerts = []
    new_baseline = {}
    for target_path in paths:
        current = hash_file(target_path)
        new_baseline[target_path] = current
        if target_path in baseline and baseline[target_path] != current:
            alerts.append(
                {
                    "file": target_path,
                    "old": baseline[target_path],
                    "new": current,
                }
            )

    with open(baseline_file, "w", encoding="utf-8") as f:
        json.dump(new_baseline, f, indent=2)
    return alerts


if __name__ == "__main__":
    verify_baseline()
