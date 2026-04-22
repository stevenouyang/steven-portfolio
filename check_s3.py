import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def check_s3_config():
    # S3 Configuration from environment
    endpoint_url = os.getenv('AWS_S3_ENDPOINT_URL')
    access_key = os.getenv('AWS_ACCESS_KEY_ID')
    secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')

    print(f"--- Checking S3 Config for Bucket: {bucket_name} ---")
    print(f"Endpoint: {endpoint_url}")

    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

    # 1. Check Bucket ACL
    try:
        acl = s3_client.get_bucket_acl(Bucket=bucket_name)
        print("\n[Bucket ACL]")
        print(f"Owner: {acl.get('Owner', {}).get('DisplayName', 'N/A')}")
        for grant in acl.get('Grants', []):
            grantee = grant.get('Grantee', {})
            print(f"  - {grantee.get('Type')}: {grantee.get('URI', grantee.get('DisplayName', 'Unknown'))} -> {grant['Permission']}")
    except ClientError as e:
        print(f"Error getting ACL: {e}")

    # 2. Check Bucket Policy
    try:
        policy = s3_client.get_bucket_policy(Bucket=bucket_name)
        print("\n[Bucket Policy]")
        print(policy.get('Policy'))
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchBucketPolicy':
            print("\n[Bucket Policy] No bucket policy found.")
        else:
            print(f"Error getting Policy: {e}")

    # 3. Check Bucket CORS
    try:
        cors = s3_client.get_bucket_cors(Bucket=bucket_name)
        print("\n[Bucket CORS]")
        for rule in cors.get('CORSRules', []):
            print(f"  Rule: AllowedOrigins={rule.get('AllowedOrigins')}, AllowedMethods={rule.get('AllowedMethods')}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchCORSConfiguration':
            print("\n[Bucket CORS] No CORS configuration found.")
        else:
            print(f"Error getting CORS: {e}")

    # 3. List recent files to check paths
    try:
        response = s3_client.list_objects_v2(Bucket=bucket_name, MaxKeys=10, Prefix='frontend/')
        print("\n[Files in 'frontend/'] (First 10)")
        if 'Contents' in response:
            for obj in response['Contents']:
                print(f"  - {obj['Key']} ({obj['Size']} bytes)")
        else:
            print("  No files found with prefix 'frontend/'")
    except ClientError as e:
        print(f"Error listing objects: {e}")

if __name__ == "__main__":
    check_s3_config()
