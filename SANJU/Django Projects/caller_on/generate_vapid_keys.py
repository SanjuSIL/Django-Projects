import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def generate_vapid_keys():
    # Generate a new private key using the SECP256R1 curve
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    # Serialize the private key to DER format (PKCS8)
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Serialize the public key to DER format (SubjectPublicKeyInfo)
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # Encode the keys to Base64 URL-safe strings and remove any trailing '='
    vapid_private_key = base64.urlsafe_b64encode(private_bytes).decode('utf-8').rstrip('=')
    vapid_public_key = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')
    return vapid_public_key, vapid_private_key

if __name__ == '__main__':
    public, private = generate_vapid_keys()
    print("Public Key:", public)
    print("Private Key:", private)

