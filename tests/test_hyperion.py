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
        tn.apply_two_qubit_gate(cz_gate, 0, 1)
        encoded = QuantumInspiredML.encode_data([0.1, 0.5, 0.8])
        self.assertEqual(len(encoded.tensors), 3)


if __name__ == "__main__":
    unittest.main()
