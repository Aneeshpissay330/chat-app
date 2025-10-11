const { formatLastSeen } = require('./src/utils/date');

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 5);
const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 9);
const older = new Date('2024-10-08T09:09:00');

console.log('today:', formatLastSeen(today));
console.log('yesterday:', formatLastSeen(yesterday));
console.log('older:', formatLastSeen(older));
