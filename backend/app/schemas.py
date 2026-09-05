from __future__ import annotations

import re
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# Service areas offered on the website. Kept in sync with the frontend's
# SERVICES data; an unknown value is rejected rather than silently stored.
SERVICE_AREAS = (
    "product-engineering",
    "ai-systems",
    "cloud-devops",
    "automation",
    "backend-apis",
    "ui-engineering",
    "other",
)

ServiceArea = Literal[
    "product-engineering",
    "ai-systems",
    "cloud-devops",
    "automation",
    "backend-apis",
    "ui-engineering",
    "other",
]

# Control characters are stripped from every free-text field before storage so
# a record can never break the JSONL store or a downstream log line.
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean(value: str) -> str:
    return _CONTROL_CHARS.sub("", value).strip()


class ContactCreate(BaseModel):
    """A business enquiry from the Vortiqen website."""

    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=2, max_length=120, description="Contact name")
    email: EmailStr = Field(..., description="Work email address")
    company: Optional[str] = Field(
        default=None, max_length=150, description="Company or organisation (optional)"
    )
    service: Optional[ServiceArea] = Field(
        default=None, description="Service area the enquiry relates to (optional)"
    )
    message: str = Field(
        ..., min_length=20, max_length=4000, description="What they want to build"
    )

    # Hidden anti-spam field. Real browsers leave it empty; bots fill it in.
    company_website: Optional[str] = Field(
        default="", max_length=200, description="Honeypot; must remain empty"
    )

    @field_validator("name", "message")
    @classmethod
    def _clean_required_text(cls, v: str) -> str:
        cleaned = _clean(v)
        if not cleaned:
            raise ValueError("This field cannot be blank.")
        return cleaned

    @field_validator("company")
    @classmethod
    def _clean_company(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = _clean(v)
        return cleaned or None

    @field_validator("company_website")
    @classmethod
    def _reject_honeypot(cls, v: Optional[str]) -> str:
        if v and v.strip():
            # Deliberately vague: a bot should learn nothing from the response.
            raise ValueError("Invalid submission.")
        return ""


class ContactResponse(BaseModel):
    """Response returned to the website. Carries no internal detail."""

    success: bool
    message: str
    reference: Optional[str] = Field(
        default=None, description="Short reference the visitor can quote"
    )
    timestamp: str


class HealthResponse(BaseModel):
    """Operational readiness of the Vortiqen API.

    ``accepting_enquiries`` is the field that matters: it reports whether
    /api/contact can currently deliver an enquiry, so a monitor catches a
    misconfigured deployment before a visitor does.
    """

    status: Literal["healthy", "degraded"]
    environment: str
    version: str
    accepting_enquiries: bool
    delivery_channels: dict[str, bool]
    timestamp: str
