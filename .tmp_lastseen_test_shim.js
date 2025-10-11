function formatLastSeen(lastActive) {
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

  const dateLabel = date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });

  return `Last seen on ${dateLabel} at ${timeStr}`;
}

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 5);
const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 9);
const older = new Date('2024-10-08T09:09:00');

console.log('today:', formatLastSeen(today));
console.log('yesterday:', formatLastSeen(yesterday));
console.log('older:', formatLastSeen(older));
