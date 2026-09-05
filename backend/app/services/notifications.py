from __future__ import annotations

import asyncio
import logging
import smtplib
from email.message import EmailMessage
from typing import Literal

import httpx

from app.config import settings
from app.schemas import ContactCreate

logger = logging.getLogger("uvicorn.error")

ChannelState = Literal["ok", "failed", "skipped"]

# Human labels for the service slugs, used in the notification body only.
SERVICE_LABELS = {
    "product-engineering": "Product Engineering",
    "ai-systems": "AI & Intelligent Systems",
    "cloud-devops": "Cloud & DevOps",
    "automation": "Automation",
    "backend-apis": "Backend & APIs",
    "ui-engineering": "UI Engineering",
    "other": "Other / not sure",
}


def _summary(payload: ContactCreate, reference: str) -> str:
    lines = [
        f"New Vortiqen enquiry — {reference}",
        "",
        f"Name:    {payload.name}",
        f"Email:   {payload.email}",
    ]
    if payload.company:
        lines.append(f"Company: {payload.company}")
    if payload.service:
        lines.append(f"Service: {SERVICE_LABELS.get(payload.service, payload.service)}")
    lines += ["", "Message:", payload.message]
    return "\n".join(lines)


class NotificationService:
    """
    Delivers an enquiry to the team over whichever channels are configured.

    Each channel reports ``ok`` / ``failed`` / ``skipped`` rather than raising,
    so the caller can apply the delivery policy (see EnquiryService) and decide
    whether the visitor may be told their enquiry was received.
    """

    async def send_webhook(self, payload: ContactCreate, reference: str) -> ChannelState:
        if not settings.webhook_configured:
            return "skipped"
        body = {
            "text": _summary(payload, reference),
            "reference": reference,
            "email": str(payload.email),
            "service": payload.service,
        }
        try:
            async with httpx.AsyncClient(
                timeout=settings.NOTIFICATION_WEBHOOK_TIMEOUT_SECONDS
            ) as client:
                response = await client.post(
                    settings.NOTIFICATION_WEBHOOK_URL, json=body
                )
            if response.status_code >= 400:
                # Status code only — the response body may echo our payload.
                logger.error(
                    "Enquiry webhook rejected %s with status %s",
                    reference,
                    response.status_code,
                )
                return "failed"
            return "ok"
        except Exception as exc:
            logger.error(
                "Enquiry webhook failed for %s: %s", reference, type(exc).__name__
            )
            return "failed"

    def _send_email_sync(self, payload: ContactCreate, reference: str) -> None:
        message = EmailMessage()
        message["Subject"] = f"New Vortiqen enquiry — {reference}"
        message["From"] = settings.SENDER_EMAIL
        message["To"] = settings.TEAM_INBOX
        message["Reply-To"] = str(payload.email)
        message.set_content(_summary(payload, reference))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            if settings.SMTP_STARTTLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)

    async def send_email(self, payload: ContactCreate, reference: str) -> ChannelState:
        if not settings.smtp_configured:
            return "skipped"
        try:
            await asyncio.to_thread(self._send_email_sync, payload, reference)
            return "ok"
        except Exception as exc:
            # Never log credentials or the message body.
            logger.error(
                "Enquiry email failed for %s: %s", reference, type(exc).__name__
            )
            return "failed"

    async def dispatch(
        self, payload: ContactCreate, reference: str
    ) -> dict[str, ChannelState]:
        """Fire every configured channel concurrently."""
        webhook, email = await asyncio.gather(
            self.send_webhook(payload, reference),
            self.send_email(payload, reference),
        )
        return {"webhook": webhook, "email": email}


notification_service = NotificationService()
