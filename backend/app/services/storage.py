from __future__ import annotations

import asyncio
import json
import logging
import os
import secrets
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.config import settings
from app.schemas import ContactCreate

logger = logging.getLogger("uvicorn.error")


class EnquiryStore:
    """
    Append-only JSONL store for website enquiries.

    Deliberately not a database: the requirement is "never lose a business
    enquiry", and an fsync'd append to a local file satisfies that without
    adding infrastructure. The interface is narrow (``append``) so a real
    datastore can replace it later without touching the route.

    Writes are serialised through an asyncio lock and executed on a worker
    thread, so the event loop is never blocked by disk I/O.
    """

    def __init__(self, path: Optional[str] = None) -> None:
        self._path = Path(path or settings.ENQUIRY_STORE_PATH)
        self._lock = asyncio.Lock()

    @property
    def path(self) -> Path:
        return self._path

    @staticmethod
    def new_reference() -> str:
        """Short, non-sequential reference a visitor can quote back to us.

        Non-sequential on purpose: a predictable counter would leak enquiry
        volume to anyone who submits twice.
        """
        return f"VQ-{secrets.token_hex(3).upper()}"

    def _write_sync(self, record: dict) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        line = json.dumps(record, ensure_ascii=False, separators=(",", ":"))
        # Append + flush + fsync: the record survives a crash immediately
        # after the API has told the visitor it was received.
        with open(self._path, "a", encoding="utf-8") as handle:
            handle.write(line + "\n")
            handle.flush()
            os.fsync(handle.fileno())

    async def append(self, payload: ContactCreate, reference: str) -> bool:
        """Persist one enquiry. Returns True on success, False on failure.

        Never raises: the caller decides what a storage failure means for the
        response, and a storage failure must not surface as a stack trace.
        """
        record = {
            "reference": reference,
            "received_at": datetime.now(timezone.utc).isoformat(),
            "name": payload.name,
            "email": str(payload.email),
            "company": payload.company,
            "service": payload.service,
            "message": payload.message,
        }
        try:
            async with self._lock:
                await asyncio.to_thread(self._write_sync, record)
            return True
        except Exception:
            # Log without the message body or email address.
            logger.exception("Failed to persist enquiry %s to %s", reference, self._path)
            return False

    def read_all(self) -> list[dict]:
        """Read every stored enquiry. Used by tests and local inspection."""
        if not self._path.exists():
            return []
        rows = []
        for line in self._path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                rows.append(json.loads(line))
        return rows


enquiry_store = EnquiryStore()
