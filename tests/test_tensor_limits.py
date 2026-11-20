import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

if HAS_NUMPY:
    from quantum_tensor_engine import AdvancedTensorNetwork


@unittest.skipUnless(HAS_NUMPY, "numpy is required for tensor limit tests")
class TestTensorLimits(unittest.TestCase):
    def _assert_mps_invariants_and_stability(
        self, tn: "AdvancedTensorNetwork", expected_max_bond: int
    ):
        self.assertEqual(len(tn.tensors), tn.num_qubits)
        self.assertEqual(tn.tensors[0].shape[0], 1)
        self.assertEqual(tn.tensors[-1].shape[2], 1)
        for i in range(tn.num_qubits):
            t = tn.tensors[i]
            self.assertEqual(t.ndim, 3)
            self.assertEqual(t.shape[1], 2)
            self.assertGreaterEqual(t.shape[2], 1)
            self.assertLessEqual(t.shape[2], expected_max_bond)
            self.assertTrue(np.all(np.isfinite(t)), f"Non-finite values in tensor {i}")
            norm = np.linalg.norm(t)
            self.assertLessEqual(norm, 10.0, f"Unstable tensor norm at site {i}: {norm}")
            if i < tn.num_qubits - 1:
                self.assertEqual(t.shape[2], tn.tensors[i + 1].shape[0])

    def test_max_bond_dim_one_non_commuting_gate_sequence(self):
        """Execute AdvancedTensorNetwork with max_bond_dim=1 under multiple non-commuting gates."""
        hadamard = (1.0 / np.sqrt(2.0)) * np.array([[1, 1], [1, -1]], dtype=np.complex128)
        t_gate = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=np.complex128)
        rx_gate = np.array(
            [
                [np.cos(np.pi / 6), -1j * np.sin(np.pi / 6)],
                [-1j * np.sin(np.pi / 6), np.cos(np.pi / 6)],
            ],
            dtype=np.complex128,
        )
        cnot = np.array(
            [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 1],
                [0, 0, 1, 0],
            ],
            dtype=np.complex128,
        )
        iswap = np.array(
            [
                [1, 0, 0, 0],
                [0, 0, 1j, 0],
                [0, 1j, 0, 0],
                [0, 0, 0, 1],
            ],
            dtype=np.complex128,
        )
        cphase = np.diag([1.0, 1.0, 1.0, np.exp(1j * np.pi / 3)]).astype(np.complex128)

        # Confirm chosen two-qubit gates do not commute
        self.assertFalse(np.allclose(cnot @ iswap, iswap @ cnot))

        tn = AdvancedTensorNetwork(num_qubits=6, max_bond_dim=1, noise_tolerance=1e-12)
        for q in range(6):
            tn.apply_single_qubit_gate(hadamard, q)
            tn.apply_single_qubit_gate(t_gate, q)
            tn.apply_single_qubit_gate(rx_gate, q)

        for _ in range(5):
            for q in range(5):
                tn.apply_two_qubit_gate(cnot, q, q + 1)
                tn.apply_two_qubit_gate(iswap, q + 1, q)
                tn.apply_two_qubit_gate(cphase, q, q + 1)

        self._assert_mps_invariants_and_stability(tn, expected_max_bond=1)

    def test_fewer_singular_values_dynamic_zero_padding_u_and_vh(self):
        """Zero-pad U and Vh dynamically when SVD yields fewer singular values than required."""
        tn = AdvancedTensorNetwork(num_qubits=3, max_bond_dim=2, noise_tolerance=1e-10)
        hadamard = (1.0 / np.sqrt(2.0)) * np.array([[1, 1], [1, -1]], dtype=np.complex128)
        cnot = np.array(
            [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 1],
                [0, 0, 1, 0],
            ],
            dtype=np.complex128,
        )
        tn.apply_single_qubit_gate(hadamard, 0)
        tn.apply_two_qubit_gate(cnot, 0, 1)

        # Simulate SVD returning truncated U/Vh with fewer singular values than expected
        def mock_reduced_svd(matrix, full_matrices=False):
            m, n = matrix.shape
            return (
                np.ones((m, 1), dtype=np.complex128) / np.sqrt(m),
                np.array([0.8, 0.2], dtype=np.float64),
                np.ones((1, n), dtype=np.complex128) / np.sqrt(n),
            )

        with patch("numpy.linalg.svd", side_effect=mock_reduced_svd):
            tn.apply_two_qubit_gate(cnot, 1, 2)

        self.assertTrue(tn.svd_history[-1]["zero_padded"])
        self._assert_mps_invariants_and_stability(tn, expected_max_bond=2)

        # Simulate SVD returning fewer singular values than U/Vh columns
        def mock_short_s_svd(matrix, full_matrices=False):
            m, n = matrix.shape
            return (
                np.eye(m, 2, dtype=np.complex128),
                np.array([0.9], dtype=np.float64),
                np.eye(2, n, dtype=np.complex128),
            )

        with patch("numpy.linalg.svd", side_effect=mock_short_s_svd):
            tn.apply_two_qubit_gate(cnot, 1, 2)

        self.assertTrue(tn.svd_history[-1]["zero_padded"])
        self._assert_mps_invariants_and_stability(tn, expected_max_bond=2)

        # Simulate SVD returning empty singular values (0 rank)
        def mock_empty_svd(matrix, full_matrices=False):
            m, n = matrix.shape
            return (
                np.zeros((m, 0), dtype=np.complex128),
                np.zeros((0,), dtype=np.float64),
                np.zeros((0, n), dtype=np.complex128),
            )

        with patch("numpy.linalg.svd", side_effect=mock_empty_svd):
            tn.apply_two_qubit_gate(cnot, 0, 1)

        self.assertTrue(tn.svd_history[-1]["zero_padded"])
        self._assert_mps_invariants_and_stability(tn, expected_max_bond=2)

    def test_svd_diagnostic_logging_and_history_snapshots(self):
        """Verify apply_two_qubit_gate emits comprehensive SVD diagnostics and records bond snapshots."""
        tn = AdvancedTensorNetwork(num_qubits=4, max_bond_dim=4, noise_tolerance=1e-6)
        hadamard = (1.0 / np.sqrt(2.0)) * np.array([[1, 1], [1, -1]], dtype=np.complex128)
        cnot = np.array(
            [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 1],
                [0, 0, 1, 0],
            ],
            dtype=np.complex128,
        )
        tn.apply_single_qubit_gate(hadamard, 0)

        with self.assertLogs("hyperion.tensor_engine", level="INFO") as captured_logs:
            tn.apply_two_qubit_gate(cnot, 0, 1)
            tn.apply_two_qubit_gate(cnot, 1, 2)

        joined = "\n".join(captured_logs.output)
        self.assertIn("SVD Gate (0,1)", joined)
        self.assertIn("raw_rank=", joined)
        self.assertIn("bond_dim=", joined)
        self.assertIn("S[max=", joined)
        self.assertIn("trunc_err=", joined)
        self.assertIn("zero_padded=", joined)
        self.assertIn("bonds=", joined)

        self.assertEqual(len(tn.svd_history), 2)
        latest = tn.svd_history[-1]
        self.assertEqual(latest["qubits"], (1, 2))
        self.assertEqual(latest["max_bond_dim"], 4)
        self.assertGreaterEqual(latest["retained_bond_dim"], 1)
        self.assertTrue(latest["is_finite"])
        self.assertEqual(len(latest["all_bonds"]), 3)


if __name__ == "__main__":
    unittest.main()
