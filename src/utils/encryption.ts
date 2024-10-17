import { AES, enc } from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';

export const encryptMessage = (message: string): string => {
  return AES.encrypt(message, ENCRYPTION_KEY).toString();
};

export const decryptMessage = (encryptedMessage: string): string => {
  const bytes = AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
  return bytes.toString(enc.Utf8);
};
