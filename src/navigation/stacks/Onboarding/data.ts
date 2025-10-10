export type OnboardingCard = {
  id: string;
  title: string;
  lines: string[];
  image: string;
};

const cards: OnboardingCard[] = [
  {
    id: 'card-1',
    title: 'Welcome to ChatFlow',
    lines: ['Connect with friends, family, and colleagues', 'in a whole new way'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c21cd17f12-c74615cef31bb6bc968d.png',
  },
  {
    id: 'card-2',
    title: 'Chat Smarter',
    lines: ['Intelligent features that make', 'conversations more meaningful'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/745641996f-ba8f23911b647101ac00.png',
  },
  {
    id: 'card-3',
    title: 'Private & Secure',
    lines: ['End-to-end encryption keeps', 'your conversations safe'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/45a7e2715c-0c4c8ca2c086718acd11.png',
  },
  {
    id: 'card-4',
    title: 'Start Chatting',
    lines: ['Send messages, photos, and files', 'with lightning-fast delivery'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/a77375c423-9d0c329e1916995211fd.png',
  },
  {
    id: 'card-5',
    title: 'Voice & Video Calls',
    lines: ['Crystal-clear calls with friends', 'and family anywhere in the world'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/5d677a65e3-63319b25a9626fe0dbbb.png',
  },
  {
    id: 'card-6',
    title: 'Sync Your Contacts',
    lines: ['Find friends already on ChatFlow', 'and invite others to join'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/b6d7bf59a6-c36142feab9dd0f8bbef.png',
  },
  {
    id: 'card-7',
    title: 'Stay Connected',
    lines: ['Get instant notifications for', 'important messages and calls'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/6c740d48dd-dd807c913e18654ac1b1.png',
  },
  {
    id: 'card-8',
    title: 'Google Backup',
    lines: ['Securely backup your chats', 'and never lose important conversations'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/6a9d460e7d-8c10bf8a750d29ca2671.png',
  },
  {
    id: 'card-9',
    title: "Let's Get Started",
    lines: ['Join millions of users who trust', 'ChatFlow for their daily conversations'],
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/934b6b909c-3c70b4f6a6d588c1a65e.png',
  },
];

export default cards;
