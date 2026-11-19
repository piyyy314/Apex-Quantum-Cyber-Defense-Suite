import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

from vsat_log_analyzer import scan_lines
from vsat_fim import hash_file, verify_baseline


class TestVsatDefensiveTools(unittest.TestCase):
    def test_scan_lines_detects_rce_and_auth_failures(self):
        sample_logs = [
            "INFO modem_boot: carrier locked SNR=11.4dB",
            "GET /cgi-bin/config?host=127.0.0.1;whoami HTTP/1.1",
            "WARN sshd: authentication failure for admin from 203.0.113.5",
            "NOTICE cwmpd: acs connection url modified",
        ]
        findings = scan_lines(sample_logs)
        categories = {f["category"] for f in findings}
        self.assertEqual(len(findings), 3)
        self.assertIn("command_injection", categories)
        self.assertIn("auth_failure", categories)
        self.assertIn("unauthorized_config", categories)

    def test_fim_detects_tampering_on_modified_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            target = os.path.join(tmpdir, "modem.conf")
            baseline = os.path.join(tmpdir, "baseline.json")

            with open(target, "w", encoding="utf-8") as f:
                f.write("auth_mode=STRICT\n")

            initial_hash = hash_file(target)
            self.assertIsNotNone(initial_hash)

            # First run establishes baseline with 0 alerts
            alerts_first = verify_baseline(paths=[target], baseline_file=baseline)
            self.assertEqual(alerts_first, [])

            # Tamper file
            with open(target, "w", encoding="utf-8") as f:
                f.write("auth_mode=DISABLED\n")

            alerts_second = verify_baseline(paths=[target], baseline_file=baseline)
            self.assertEqual(len(alerts_second), 1)
            self.assertEqual(alerts_second[0]["file"], target)
            self.assertNotEqual(alerts_second[0]["old"], alerts_second[0]["new"])


if __name__ == "__main__":
    unittest.main()
