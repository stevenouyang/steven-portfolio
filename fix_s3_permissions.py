import os
import boto3
import json
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def apply_public_read_policy():
    # S3 Configuration from environment
    endpoint_url = os.getenv('AWS_S3_ENDPOINT_URL')
    access_key = os.getenv('AWS_ACCESS_KEY_ID')
    secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')

    print(f"--- Applying Public Read Policy to Bucket: {bucket_name} ---")

    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

    # Define the Public Read policy
    # This allows anyone to GetObject (read) from any path in the bucket
    public_read_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
            }
        ]
    }

    try:
        # Apply the policy
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(public_read_policy)
        )
        print("Successfully applied public read policy.")
        
        # Also try to set the bucket ACL to public-read if supported
        try:
            s3_client.put_bucket_acl(Bucket=bucket_name, ACL='public-read')
            print("Successfully set bucket ACL to public-read.")
        except ClientError as e:
            print(f"Note: Could not set bucket ACL to public-read (some providers don't support it): {e}")

    except ClientError as e:
        print(f"Error applying policy: {e}")

if __name__ == "__main__":
    apply_public_read_policy()
