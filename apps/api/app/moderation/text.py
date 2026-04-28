from __future__ import annotations

from typing import Any

from app.config import Settings
from app.moderation.errors import ModerationBackendUnavailableError
from app.moderation.normalize import normalize_text


class ModelTextModerator:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._tokenizer: Any | None = None
        self._model: Any | None = None
        self._obscenity_index: int | None = None

    def normalize_text(self, text: str) -> str:
        return normalize_text(text)

    def is_profane(self, text: str) -> bool:
        return self.get_obscenity_score(text) >= self.settings.moderation_obscenity_threshold

    def get_obscenity_score(self, text: str) -> float:
        normalized_text = self.normalize_text(text)
        if not normalized_text:
            return 0.0

        torch = self.get_torch_module()
        tokenizer = self.get_tokenizer()
        model = self.get_model()
        encoded = tokenizer(normalized_text, return_tensors="pt", truncation=True, padding=True)

        with torch.no_grad():
            logits = model(**encoded).logits
            probabilities = torch.sigmoid(logits).cpu().tolist()[0]

        return float(probabilities[self.get_obscenity_index()])

    def get_tokenizer(self):
        if self._tokenizer is not None:
            return self._tokenizer

        try:
            from transformers import AutoTokenizer
        except ImportError as exc:
            raise ModerationBackendUnavailableError(
                "Text moderation dependency is unavailable. Install transformers first."
            ) from exc

        try:
            self._tokenizer = AutoTokenizer.from_pretrained(
                self.settings.moderation_text_model_id,
                revision=self.settings.moderation_text_model_revision,
            )
        except Exception as exc:
            raise ModerationBackendUnavailableError(
                "Text moderation model tokenizer could not be loaded."
            ) from exc
        return self._tokenizer

    def get_model(self):
        if self._model is not None:
            return self._model

        try:
            from transformers import AutoModelForSequenceClassification
        except ImportError as exc:
            raise ModerationBackendUnavailableError(
                "Text moderation dependency is unavailable. Install transformers first."
            ) from exc

        try:
            self._model = AutoModelForSequenceClassification.from_pretrained(
                self.settings.moderation_text_model_id,
                revision=self.settings.moderation_text_model_revision,
                use_safetensors=True,
            )
        except Exception as exc:
            raise ModerationBackendUnavailableError(
                "Text moderation model weights could not be loaded."
            ) from exc
        self._model.eval()
        return self._model

    def get_obscenity_index(self) -> int:
        if self._obscenity_index is not None:
            return self._obscenity_index

        id2label = getattr(self.get_model().config, "id2label", {}) or {}
        for raw_index, raw_label in id2label.items():
            label = str(raw_label).strip().lower().replace("-", "_").replace(" ", "_")
            if label == "obscenity":
                self._obscenity_index = int(raw_index)
                return self._obscenity_index

        raise ModerationBackendUnavailableError(
            "Text moderation model does not expose an obscenity label."
        )

    def get_torch_module(self):
        try:
            import torch
        except ImportError as exc:
            raise ModerationBackendUnavailableError(
                "Text moderation dependency is unavailable. Install torch first."
            ) from exc

        return torch
