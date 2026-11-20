#!/usr/bin/env python3
"""
PROJECT NEBULA - QUANTUM-INSPIRED 1D MPS TENSOR NETWORK
Features: Matrix Product States (MPS), SVD Entanglement Truncation,
Comprehensive SVD Diagnostics Logging, and QIML Feature Encoding.
"""

import logging
import time
import numpy as np

try:
    import opt_einsum as oe
except ImportError:
    oe = None

logger = logging.getLogger("hyperion.tensor_engine")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def _contract(subscripts, *operands):
    if oe is not None:
        return oe.contract(subscripts, *operands)
    return np.einsum(subscripts, *operands)


class AdvancedTensorNetwork:
    def __init__(self, num_qubits: int, max_bond_dim: int = 64, noise_tolerance: float = 1e-5):
        if num_qubits < 2:
            raise ValueError("num_qubits must be at least 2 for two-qubit gate operations.")
        if max_bond_dim < 1:
            raise ValueError("max_bond_dim must be at least 1.")

        self.num_qubits = num_qubits
        self.max_bond_dim = max_bond_dim
        self.noise_tolerance = noise_tolerance
        self.svd_history = []

        self.tensors = [np.zeros((1, 2, 1), dtype=np.complex128) for _ in range(num_qubits)]
        for i in range(num_qubits):
            self.tensors[i][0, 0, 0] = 1.0

    def apply_single_qubit_gate(self, gate, target: int):
        gate_arr = np.asarray(gate, dtype=np.complex128)
        tensor = self.tensors[target]
        self.tensors[target] = _contract("ij,ljr->lir", gate_arr, tensor)

    def apply_two_qubit_gate(self, gate, target1: int, target2: int):
        if abs(target1 - target2) != 1:
            raise ValueError("Only adjacent qubits supported in 1D MPS layout.")

        gate_arr = np.asarray(gate, dtype=np.complex128)
        if target1 > target2:
            # Swap physical input/output qubit axes so left-to-right contraction remains valid
            target1, target2 = target2, target1
            gate_tensor = gate_arr.reshape(2, 2, 2, 2).transpose(1, 0, 3, 2)
        else:
            gate_tensor = gate_arr.reshape(2, 2, 2, 2)

        T_A = self.tensors[target1]
        T_B = self.tensors[target2]

        left_bond = T_A.shape[0]
        right_bond = T_B.shape[2]

        # Contract shared virtual bond (r) and apply 2-qubit gate on physical axes (i, j) -> (a, b)
        block = _contract("lir,rjs->lijs", T_A, T_B)
        block = _contract("abij,lijs->labs", gate_tensor, block)

        L_dim = left_bond * 2
        R_dim = 2 * right_bond
        matrix = block.reshape(L_dim, R_dim)

        U, S, Vh = np.linalg.svd(matrix, full_matrices=False)
        raw_count = int(len(S))
        raw_s_real = np.real(S) if raw_count > 0 else np.zeros((0,), dtype=np.float64)
        s_max = float(np.max(raw_s_real)) if raw_count > 0 else 0.0
        s_min = float(np.min(raw_s_real)) if raw_count > 0 else 0.0
        s_mean = float(np.mean(raw_s_real)) if raw_count > 0 else 0.0
        s_l2 = float(np.linalg.norm(raw_s_real)) if raw_count > 0 else 0.0
        condition_num = float(s_max / max(s_min, 1e-15)) if raw_count > 0 else float("inf")

        zero_padded = False
        # Align U, S, and Vh dimensions prior to boolean masking in case SVD returns
        # fewer singular vectors or fewer singular values than expected.
        aligned_rank = max(len(S), U.shape[1], Vh.shape[0])
        if aligned_rank > 0:
            if U.shape != (L_dim, aligned_rank):
                zero_padded = True
                padded_u = np.zeros((L_dim, aligned_rank), dtype=np.complex128)
                rows = min(L_dim, U.shape[0])
                cols = min(aligned_rank, U.shape[1])
                padded_u[:rows, :cols] = U[:rows, :cols]
                U = padded_u

            if len(S) < aligned_rank:
                zero_padded = True
                padded_s = np.zeros((aligned_rank,), dtype=np.float64)
                padded_s[: len(S)] = np.real(S)
                S = padded_s

            if Vh.shape != (aligned_rank, R_dim):
                zero_padded = True
                padded_vh = np.zeros((aligned_rank, R_dim), dtype=np.complex128)
                rows = min(aligned_rank, Vh.shape[0])
                cols = min(R_dim, Vh.shape[1])
                padded_vh[:rows, :cols] = Vh[:rows, :cols]
                Vh = padded_vh

        # Filter by noise threshold while retaining at least the dominant singular value if present
        keep_indices = S > self.noise_tolerance
        if not np.any(keep_indices) and len(S) > 0:
            keep_indices[0] = True

        dropped_s = S[~keep_indices] if len(S) > 0 else np.zeros((0,), dtype=np.float64)
        U = U[:, keep_indices]
        S = S[keep_indices]
        Vh = Vh[keep_indices, :]

        # Cap bond dimension at max_bond_dim
        if len(S) > self.max_bond_dim:
            dropped_s = np.concatenate([dropped_s, S[self.max_bond_dim :]])
            U = U[:, : self.max_bond_dim]
            S = S[: self.max_bond_dim]
            Vh = Vh[: self.max_bond_dim, :]

        truncation_error = float(np.linalg.norm(dropped_s)) if len(dropped_s) > 0 else 0.0

        # Safety check: dynamically zero-pad U, S, and Vh if post-filter rank is 0
        # or does not match the required bond dimension, preventing shape-mismatch ValueErrors.
        required_bond = max(1, min(self.max_bond_dim, max(len(S), U.shape[1], Vh.shape[0])))

        if U.shape != (L_dim, required_bond):
            zero_padded = True
            padded_u = np.zeros((L_dim, required_bond), dtype=np.complex128)
            rows = min(L_dim, U.shape[0])
            cols = min(required_bond, U.shape[1])
            padded_u[:rows, :cols] = U[:rows, :cols]
            U = padded_u

        if len(S) != required_bond:
            zero_padded = True
            padded_s = np.zeros((required_bond,), dtype=np.float64)
            count = min(required_bond, len(S))
            padded_s[:count] = S[:count]
            S = padded_s

        if Vh.shape != (required_bond, R_dim):
            zero_padded = True
            padded_vh = np.zeros((required_bond, R_dim), dtype=np.complex128)
            rows = min(required_bond, Vh.shape[0])
            cols = min(R_dim, Vh.shape[1])
            padded_vh[:rows, :cols] = Vh[:rows, :cols]
            Vh = padded_vh

        S_safe = np.clip(np.real(S), 0.0, None)
        S_sqrt = np.diag(np.sqrt(S_safe))
        U_new = np.dot(U, S_sqrt)
        V_new = np.dot(S_sqrt, Vh)

        is_finite = bool(np.all(np.isfinite(U_new)) and np.all(np.isfinite(V_new)))
        bond_snapshot = {
            "qubits": (target1, target2),
            "matrix_shape": (L_dim, R_dim),
            "raw_singular_count": raw_count,
            "retained_bond_dim": required_bond,
            "max_bond_dim": self.max_bond_dim,
            "s_max": round(s_max, 6),
            "s_min": round(s_min, 6),
            "s_mean": round(s_mean, 6),
            "s_l2_norm": round(s_l2, 6),
            "condition_number": condition_num,
            "truncation_error": round(truncation_error, 8),
            "spectrum_preview": [round(float(v), 6) for v in S_safe[:8]],
            "zero_padded": zero_padded,
            "is_finite": is_finite,
            "all_bonds": [t.shape[2] for t in self.tensors[:-1]],
        }

        self.tensors[target1] = U_new.reshape(left_bond, 2, required_bond)
        self.tensors[target2] = V_new.reshape(required_bond, 2, right_bond)
        bond_snapshot["all_bonds"] = [t.shape[2] for t in self.tensors[:-1]]

        self.svd_history.append(bond_snapshot)
        if len(self.svd_history) > 256:
            self.svd_history.pop(0)

        logger.info(
            "SVD Gate (%d,%d) matrix=%s | raw_rank=%d -> bond_dim=%d/%d | "
            "S[max=%.4e, min=%.4e, mean=%.4e, L2=%.4f, cond=%.2e] | "
            "trunc_err=%.4e | zero_padded=%s | finite=%s | bonds=%s",
            target1,
            target2,
            (L_dim, R_dim),
            raw_count,
            required_bond,
            self.max_bond_dim,
            s_max,
            s_min,
            s_mean,
            s_l2,
            condition_num,
            truncation_error,
            zero_padded,
            is_finite,
            bond_snapshot["all_bonds"],
        )


class QuantumInspiredML:
    @staticmethod
    def encode_data(data_vector, max_bond_dim: int = 16):
        num_qubits = len(data_vector)
        tn = AdvancedTensorNetwork(num_qubits, max_bond_dim)
        for i, val in enumerate(data_vector):
            theta = val * np.pi
            rx_gate = np.array(
                [
                    [np.cos(theta / 2), -1j * np.sin(theta / 2)],
                    [-1j * np.sin(theta / 2), np.cos(theta / 2)],
                ],
                dtype=np.complex128,
            )
            tn.apply_single_qubit_gate(rx_gate, i)
        return tn


if __name__ == "__main__":
    QUBITS = 24
    tn = AdvancedTensorNetwork(num_qubits=QUBITS, max_bond_dim=32, noise_tolerance=1e-4)
    cz_gate = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, -1]], dtype=np.complex128)
    t0 = time.time()
    for _ in range(3):
        for i in range(QUBITS - 1):
            tn.apply_two_qubit_gate(cz_gate, i, i + 1)
    print(f"Nebula {QUBITS}-qubit MPS simulation completed in {time.time() - t0:.4f}s.")
