"""Exercise the actual Windows runner with a fake transport and isolated DPAPI config."""
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CollectorRunnerTests(unittest.TestCase):
    def test_health_failures_and_recovery(self):
        directory = ROOT / 'output' / 'tests' / 'pc-collector'
        for mode, success, failures in [('ok', True, 0), ('stale', False, 1), ('partial', False, 2), ('network', False, 3), ('ok', True, 0)]:
            with self.subTest(mode=mode, failures=failures):
                result = subprocess.run(
                    ['powershell.exe', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                     '-File', str(ROOT / 'tests' / 'poll-hosted.test.ps1'), '-Mode', mode,
                     '-TestDirectory', str(directory)],
                    capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW,
                )
                self.assertEqual(result.returncode, 0 if success else 1, result.stderr)
                receipt = json.loads((directory / 'last-check.json').read_text(encoding='utf-8-sig'))
                self.assertEqual(receipt['success'], success)
                self.assertEqual(receipt['consecutiveFailures'], failures)
                self.assertTrue(receipt['lastSuccessfulCheckAt'])
                if mode == 'stale':
                    self.assertEqual(receipt['failureStage'], 'response')
                if mode == 'network':
                    self.assertEqual(receipt['failureStage'], 'request')
                log = ''.join(p.read_text(encoding='utf-8-sig') for p in (directory / 'logs').glob('*.jsonl'))
                self.assertNotIn('TEST-ONLY-NOT-A-CREDENTIAL', log)


if __name__ == '__main__':
    unittest.main()
