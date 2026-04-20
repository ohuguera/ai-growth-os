import boto3
from boto3.s3.transfer import TransferConfig
import os

_client = None

def get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            's3',
            endpoint_url=os.environ['R2_ENDPOINT'],
            aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
            region_name='auto',
        )
    return _client

BUCKET = os.environ.get('R2_BUCKET', 'hfive-videos')

# Desativa multipart — R2 token não tem CreateMultipartUpload
# Usa put_object direto (streaming por chunks de 100MB sem multipart S3)
_TRANSFER_CFG = TransferConfig(
    multipart_threshold=10 * 1024 ** 3,  # 10GB — nunca ativa multipart
    use_threads=False,
)

def upload(local_path: str, key: str) -> str:
    """Faz upload de arquivo local para R2 sem multipart. Retorna o key."""
    print(f"[R2] Upload: {local_path} -> {key}")
    get_client().upload_file(local_path, BUCKET, key, Config=_TRANSFER_CFG)
    print(f"[R2] Upload concluido: {key}")
    return key

def download(key: str, local_path: str):
    """Baixa arquivo do R2 para path local."""
    print(f"[R2] Download: {key} -> {local_path}")
    get_client().download_file(BUCKET, key, local_path)
    print(f"[R2] Download concluido: {local_path}")

def presigned_url(key: str, expiry: int = 7200) -> str:
    """Gera URL de download valida por expiry segundos."""
    return get_client().generate_presigned_url(
        'get_object',
        Params={'Bucket': BUCKET, 'Key': key},
        ExpiresIn=expiry,
    )

def delete(key: str):
    try:
        get_client().delete_object(Bucket=BUCKET, Key=key)
        print(f"[R2] Deletado: {key}")
    except Exception as e:
        print(f"[R2] Erro ao deletar {key}: {e}")

def is_available() -> bool:
    """Verifica se R2 esta configurado."""
    return bool(os.environ.get('R2_ENDPOINT') and os.environ.get('R2_ACCESS_KEY_ID'))
