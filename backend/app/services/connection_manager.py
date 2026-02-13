"""
WebSocket Connection Manager
Handles multi-device connections and rate limiting
"""
from fastapi import WebSocket
from typing import Dict, Set, Optional, List
import asyncio
from datetime import datetime, timedelta
from collections import defaultdict
import logging

from ..core.config import get_settings

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    WebSocket connection manager with multi-device support.
    Tracks active connections and handles rate limiting.
    """

    def __init__(self):
        self.settings = get_settings()
        # user_id -> set of WebSocket connections
        self._connections: Dict[str, Set[WebSocket]] = defaultdict(set)
        # user_id -> list of message timestamps for rate limiting
        self._message_counts: Dict[str, List[datetime]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def can_connect(self, user_id: str) -> bool:
        """Check if user can create new connection (max 5 per user)"""
        async with self._lock:
            current_count = len(self._connections.get(user_id, set()))
            return current_count < self.settings.WS_MAX_CONNECTIONS_PER_USER

    async def connect(self, websocket: WebSocket, user_id: str) -> bool:
        """
        Register new WebSocket connection.
        Returns True if successful, False if limit reached.
        """
        if not await self.can_connect(user_id):
            return False

        async with self._lock:
            self._connections[user_id].add(websocket)
            logger.info(f"User {user_id} connected. Total connections: {len(self._connections[user_id])}")
            return True

    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove WebSocket connection"""
        async with self._lock:
            self._connections[user_id].discard(websocket)
            if not self._connections[user_id]:
                del self._connections[user_id]
                # Clean up rate limit data
                if user_id in self._message_counts:
                    del self._message_counts[user_id]
            logger.info(f"User {user_id} disconnected")

    async def check_rate_limit(self, user_id: str) -> bool:
        """
        Check if user is within rate limit (30 messages/minute).
        Returns True if allowed, False if limit exceeded.
        """
        now = datetime.utcnow()
        window_start = now - timedelta(minutes=1)

        async with self._lock:
            # Clean old timestamps
            self._message_counts[user_id] = [
                ts for ts in self._message_counts[user_id]
                if ts > window_start
            ]

            # Check limit
            if len(self._message_counts[user_id]) >= self.settings.WS_MESSAGE_RATE_LIMIT:
                logger.warning(f"Rate limit exceeded for user {user_id}")
                return False

            # Add new timestamp
            self._message_counts[user_id].append(now)
            return True

    async def send_to_user(self, user_id: str, message: dict):
        """Send message to all user's connections"""
        connections = self._connections.get(user_id, set())
        disconnected = set()

        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to {user_id}: {e}")
                disconnected.add(websocket)

        # Cleanup disconnected
        for ws in disconnected:
            await self.disconnect(ws, user_id)

    async def broadcast(self, message: dict, exclude_user: Optional[str] = None):
        """Broadcast message to all connections"""
        for user_id, connections in self._connections.items():
            if user_id == exclude_user:
                continue
            for websocket in connections:
                try:
                    await websocket.send_json(message)
                except Exception:
                    pass

    def get_active_connections_count(self) -> int:
        """Get total active connections"""
        return sum(len(conns) for conns in self._connections.values())

    def get_user_connections_count(self, user_id: str) -> int:
        """Get connection count for specific user"""
        return len(self._connections.get(user_id, set()))

    def get_connected_users(self) -> List[str]:
        """Get list of connected user IDs"""
        return list(self._connections.keys())

    def is_user_connected(self, user_id: str) -> bool:
        """Check if user has any active connections"""
        return user_id in self._connections and len(self._connections[user_id]) > 0


# Global instance
connection_manager = ConnectionManager()
