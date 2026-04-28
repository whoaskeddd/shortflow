from __future__ import annotations

import re


def normalize_text(text: str) -> str:
    lowered = text.strip().lower().replace("ё", "е")
    return " ".join(lowered.split())


def compact_text(text: str) -> str:
    normalized = normalize_text(text)
    return re.sub(r"[\W_]+", "", normalized, flags=re.UNICODE)
