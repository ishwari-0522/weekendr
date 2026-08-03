import base64
import hmac
import hashlib
import json
import time

def base64url_encode(data):
    if isinstance(data, dict):
        data = json.dumps(data).encode('utf-8')
    return base64.urlsafe_b64encode(data).replace(b'=', b'').decode('utf-8')

def base64url_decode(data_str):
    rem = len(data_str) % 4
    if rem > 0:
        data_str += '=' * (4 - rem)
    return base64.urlsafe_b64decode(data_str.encode('utf-8'))

class JwtService:
    """
    Self-contained JWT service for signature encryption and validation.
    """
    @staticmethod
    def encode(payload, secret_key, expires_in=86400):
        """Generates standard JWT string payload."""
        header = {"alg": "HS256", "typ": "JWT"}
        payload_copy = payload.copy()
        payload_copy["exp"] = int(time.time()) + expires_in
        
        header_b64 = base64url_encode(header)
        payload_b64 = base64url_encode(payload_copy)
        
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        signature = hmac.new(secret_key.encode('utf-8'), signing_input, hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).replace(b'=', b'').decode('utf-8')
        
        return f"{header_b64}.{payload_b64}.{signature_b64}"

    @staticmethod
    def decode(token, secret_key):
        """Decodes standard JWT signature. Returns (payload, error)."""
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return None, "Invalid token structure"
                
            header_b64, payload_b64, signature_b64 = parts
            signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
            
            expected_sig = hmac.new(secret_key.encode('utf-8'), signing_input, hashlib.sha256).digest()
            expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).replace(b'=', b'').decode('utf-8')
            
            if not hmac.compare_digest(signature_b64.encode('utf-8'), expected_sig_b64.encode('utf-8')):
                return None, "Invalid signature"
                
            payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
            
            if payload.get("exp", 0) < time.time():
                return None, "Token expired"
                
            return payload, None
        except Exception as e:
            return None, f"Decoding failed: {str(e)}"
