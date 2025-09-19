import CryptoJS from "crypto-js";

export const encryptPassword = (plainText: string, masterKey: string): string => {
  if (!plainText) {
    throw new Error("Password is required for encryption.");
  }

  if (!masterKey) {
    throw new Error("Master key is required for encryption.");
  }

  return CryptoJS.AES.encrypt(plainText, masterKey).toString();
};

export const decryptPassword = (cipherText: string, masterKey: string): string => {
  if (!cipherText) {
    throw new Error("Cipher text is required for decryption.");
  }

  if (!masterKey) {
    throw new Error("Master key is required for decryption.");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, masterKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Invalid master key or corrupted data.");
    }

    return decrypted;
  } catch (error) {
    throw new Error("Failed to decrypt password. Check the master key and data.");
  }
};
