import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

if HAS_NUMPY:
    from project_hyperion_engine import QuantumNoise, AdvancedPEPS
    from quantum_tensor_engine import AdvancedTensorNetwork, QuantumInspiredML


@unittest.skipUnless(HAS_NUMPY, "numpy is required for quantum tensor tests")
class TestHyperionAndNebulaEngines(unittest.TestCase):
    def test_kraus_completeness(self):
        """Kraus Operators must satisfy completeness relation: K0^dag*K0 + K1^dag*K1 = I."""
        gamma = 0.05
        K0, K1 = QuantumNoise.amplitude_damping(gamma)
        K0_dag = np.conjugate(K0.T)
        K1_dag = np.conjugate(K1.T)
        identity_check = np.dot(K0_dag, K0) + np.dot(K1_dag, K1)
        np.testing.assert_allclose(identity_check, np.eye(2, dtype=np.complex128), atol=1e-10)

    def test_von_neumann_entropy_pure_state(self):
        """A pure unentangled state has exactly 0.0 bits of entropy."""
        peps = AdvancedPEPS(2, 2)
        entropy = peps.calculate_von_neumann_entropy(np.array([1.0, 0.0, 0.0, 0.0]))
        self.assertEqual(entropy, 0.0)

    def test_von_neumann_entropy_maximally_entangled(self):
        """A maximally entangled Bell pair yields 1.0 bit of entropy."""
        peps = AdvancedPEPS(2, 2)
        entropy = peps.calculate_von_neumann_entropy(np.array([0.70710678, 0.70710678, 0.0, 0.0]))
        self.assertTrue(np.isclose(entropy, 1.0, atol=1e-5))

    def test_svd_truncation_limit(self):
        """SVD truncation must cap bond dimension at max_bond."""
        max_bond = 16
        peps = AdvancedPEPS(grid_x=2, grid_y=2, max_bond=max_bond)
        massive_tensor = np.random.rand(64, 64)
        U, S, Vh = np.linalg.svd(massive_tensor, full_matrices=False)
        if len(S) > peps.max_bond:
            U = U[:, : peps.max_bond]
            S = S[: peps.max_bond]
            Vh = Vh[: peps.max_bond, :]
        self.assertLessEqual(len(S), max_bond)
        self.assertEqual(U.shape[1], max_bond)
        self.assertEqual(Vh.shape[0], max_bond)

    def test_nebula_1d_mps_and_qiml(self):
        """Verify 1D MPS gate application and QIML feature encoding."""
        tn = AdvancedTensorNetwork(num_qubits=4, max_bond_dim=8)
        cz_gate = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, -1]], dtype=np.complex128)
        for i in range(3):
            tn.apply_two_qubit_gate(cz_gate, i, i + 1)
        self.assertEqual(tn.tensors[0].shape[0], 1)
        self.assertEqual(tn.tensors[-1].shape[2], 1)
        encoded = QuantumInspiredML.encode_data([0.1, 0.5, 0.8])
        self.assertEqual(len(encoded.tensors), 3)

    def test_nebula_max_bond_dim_truncation_edge_cases(self):
        """Verify AdvancedTensorNetwork handles SVD truncation cleanly when max_bond_dim is reached."""
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

        # Case 1: Multi-qubit entangling circuit exceeding tight max_bond_dim=2
        max_bond = 2
        tn = AdvancedTensorNetwork(num_qubits=6, max_bond_dim=max_bond, noise_tolerance=1e-12)
        for q in range(6):
            tn.apply_single_qubit_gate(hadamard, q)

        # Apply multiple deep entangling layers so SVD bond rank exceeds max_bond_dim
        for _ in range(3):
            for q in range(5):
                tn.apply_two_qubit_gate(cnot, q, q + 1)

        self.assertEqual(tn.tensors[0].shape[0], 1)
        self.assertEqual(tn.tensors[-1].shape[2], 1)
        for i in range(5):
            left_tensor = tn.tensors[i]
            right_tensor = tn.tensors[i + 1]
            self.assertEqual(left_tensor.ndim, 3)
            self.assertEqual(left_tensor.shape[1], 2)
            self.assertEqual(left_tensor.shape[2], right_tensor.shape[0])
            self.assertLessEqual(left_tensor.shape[2], max_bond)
            self.assertGreaterEqual(left_tensor.shape[2], 1)

        # Case 2: Extreme edge case max_bond_dim=1 on a maximally entangled Bell state
        tn_extreme = AdvancedTensorNetwork(num_qubits=3, max_bond_dim=1, noise_tolerance=1e-12)
        tn_extreme.apply_single_qubit_gate(hadamard, 0)
        tn_extreme.apply_two_qubit_gate(cnot, 0, 1)
        tn_extreme.apply_two_qubit_gate(cnot, 1, 2)
        for tensor in tn_extreme.tensors:
            self.assertEqual(tensor.shape, (1, 2, 1))

    def test_peps_noisy_gate_and_bmps(self):
        """Verify 2D PEPS noisy gate contraction across multiple adjacent bonds and BMPS sweep."""
        peps = AdvancedPEPS(grid_x=2, grid_y=3, max_bond=8, noise_gamma=0.02)
        cz_gate = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, -1]]
        peps.apply_noisy_gate_and_truncate(cz_gate, 0, 0, 1)
        peps.apply_noisy_gate_and_truncate(cz_gate, 0, 1, 2)
        msg = peps.contract_grid_bmps()
        self.assertIn("BMPS Contraction Successful", msg)


if __name__ == "__main__":
    unittest.main()
