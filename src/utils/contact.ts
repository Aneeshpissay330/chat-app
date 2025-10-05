type Contact = {
  phoneNumbers: { number: string }[];
  [key: string]: any;
};

export function extractPhoneNumbers(contacts: Contact[]): string[] {
  const numbers: string[] = [];

  contacts.forEach(contact => {
    contact.phoneNumbers.forEach(phone => {
      numbers.push(phone.number);
    });
  });

  return numbers;
}
