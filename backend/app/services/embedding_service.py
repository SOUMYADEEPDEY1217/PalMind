import logging
import hashlib
import numpy as np

logger = logging.getLogger("palmind.embedding")


class EmbeddingService:
    """
    Lightweight embedding service designed for serverless deployment.

    Does NOT use:
    - sentence-transformers
    - transformers
    - torch

    This keeps the Vercel deployment bundle small.
    """

    def __init__(self):
        # Keep 384 dimensions so existing database/vector structures
        # remain compatible with the previous MiniLM configuration.
        self._dimension = 384

        logger.info(
            f"Lightweight EmbeddingService initialized "
            f"(dimension: {self._dimension})"
        )

    def encode(self, text: str) -> list[float]:
        """
        Convert text into a deterministic normalized vector.

        The same text always produces the same vector.
        """

        if not text or not text.strip():
            return [0.0] * self._dimension

        text = text.strip().lower()

        vec = np.zeros(self._dimension, dtype=np.float32)

        # Token-based hashing gives better behaviour than
        # simply converting individual characters to numbers.
        words = text.split()

        for word in words:
            digest = hashlib.sha256(word.encode("utf-8")).digest()

            # Use several positions for every word.
            for i in range(0, len(digest), 4):
                chunk = digest[i:i + 4]

                if len(chunk) < 4:
                    continue

                value = int.from_bytes(chunk, byteorder="little")

                index = value % self._dimension

                # Alternate positive/negative values.
                sign = 1.0 if (value % 2 == 0) else -1.0

                vec[index] += sign

        # Normalize vector.
        norm = np.linalg.norm(vec)

        if norm > 0:
            vec = vec / norm

        return vec.tolist()

    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Encode multiple strings.
        """

        if not texts:
            return []

        return [self.encode(text) for text in texts]

    @staticmethod
    def cosine_similarity(
        vec_a: list[float],
        vec_b: list[float]
    ) -> float:
        """
        Calculate cosine similarity between two vectors.
        """

        if not vec_a or not vec_b:
            return 0.0

        a = np.asarray(vec_a, dtype=np.float32)
        b = np.asarray(vec_b, dtype=np.float32)

        # Protect against incompatible vectors.
        if a.shape != b.shape:
            logger.warning(
                f"Vector dimension mismatch: {a.shape} vs {b.shape}"
            )
            return 0.0

        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        similarity = np.dot(a, b) / (norm_a * norm_b)

        return float(similarity)


# Global embedding service instance
embedding_service = EmbeddingService()
