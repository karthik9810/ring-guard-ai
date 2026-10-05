import boto3
import os
import base64
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class S3Handler:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.bucket = os.getenv('S3_BUCKET', 'ring-guard-footage')
        print("✅ S3 Ready!")

    def upload_screenshot(self, frame_base64, threat_level):
        try:
            # Base64 to image convert
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshots/{threat_level}_{timestamp}.jpg"
            
            # Decode base64
            image_data = base64.b64decode(frame_base64)
            
            # S3-ல upload
            self.s3.put_object(
                Bucket=self.bucket,
                Key=filename,
                Body=image_data,
                ContentType='image/jpeg'
            )
            
            # Public URL generate
            url = f"https://{self.bucket}.s3.amazonaws.com/{filename}"
            print(f"✅ Screenshot uploaded: {url}")
            return url
            
        except Exception as e:
            print(f"❌ S3 Upload Error: {e}")
            return None

    def upload_video_clip(self, video_path, threat_level):
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"videos/{threat_level}_{timestamp}.mp4"
            
            with open(video_path, 'rb') as video:
                self.s3.put_object(
                    Bucket=self.bucket,
                    Key=filename,
                    Body=video,
                    ContentType='video/mp4'
                )
            
            url = f"https://{self.bucket}.s3.amazonaws.com/{filename}"
            print(f"✅ Video uploaded: {url}")
            return url
            
        except Exception as e:
            print(f"❌ S3 Video Error: {e}")
            return None

    def get_all_screenshots(self):
        try:
            response = self.s3.list_objects_v2(
                Bucket=self.bucket,
                Prefix='screenshots/'
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        'key': obj['Key'],
                        'url': f"https://{self.bucket}.s3.amazonaws.com/{obj['Key']}",
                        'size': obj['Size'],
                        'date': str(obj['LastModified'])
                    })
            
            print(f"✅ Got {len(files)} screenshots")
            return files
            
        except Exception as e:
            print(f"❌ S3 List Error: {e}")
            return []

# Test
if __name__ == "__main__":
    s3 = S3Handler()
    print("✅ S3 initialized!")