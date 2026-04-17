from cryptography.fernet import Fernet
import os

KEY_FILE = "secret.key"

def load_key():
    """
    Loads the key from the current directory named `secret.key`.
    If it doesn't exist, it generates one.
    """
    if not os.path.exists(KEY_FILE):
        generate_key()
    return open(KEY_FILE, "rb").read()

def generate_key():
    """
    Generates a secure AES key and saves it.
    """
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as key_file:
        key_file.write(key)

def encrypt_data(data_bytes):
    """
    Locks the data 🔒
    """
    key = load_key()
    f = Fernet(key)
    return f.encrypt(data_bytes)

def decrypt_data(encrypted_bytes):
    """
    Unlocks the data 🔓
    """
    key = load_key()
    f = Fernet(key)
    return f.decrypt(encrypted_bytes)