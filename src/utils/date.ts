export function formatChatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday = (() => {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  })();

  if (isToday) {
    return 'Today';
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    // Format as 09 October 2025
    return date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}

/**
 * Format a "last seen" timestamp similar to WhatsApp:
 * - Today -> "Last seen today at 9:05 PM"
 * - Yesterday -> "Last seen yesterday at 9:05 PM"
 * - Same year -> "Last seen on Oct 08 at 9:05 PM"
 * - Older -> "Last seen on Oct 08, 2024 at 9:05 PM"
 */
export function formatLastSeen(lastActive: Date | string | number) {
  const date = typeof lastActive === 'string' || typeof lastActive === 'number' ? new Date(lastActive) : lastActive;
  if (!date || Number.isNaN(date.getTime())) return 'Offline';
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday = (() => {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  })();

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) return `Last seen today at ${timeStr}`;
  if (isYesterday) return `Last seen yesterday at ${timeStr}`;

  // Compact single-line date label similar to WhatsApp: "Oct 09" or "Oct 09, 2024"
  const dateLabel = date.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });

  return `Last seen ${dateLabel} at ${timeStr}`;
}
