import boto3
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class SNSHandler:
    def __init__(self):
        self.sns = boto3.client(
            'sns',
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.topic_arn = os.getenv('SNS_TOPIC_ARN')
        print("✅ SNS Ready!")

    def send_high_alert(self, description, people_count):
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            message = f"""
🚨 HIGH THREAT DETECTED! 🚨

Time: {timestamp}
People Detected: {people_count}
Description: {description}

⚠️ Immediate action required!

Ring Guard AI Pro
            """
            
            self.sns.publish(
                TopicArn=self.topic_arn,
                Message=message,
                Subject="🚨 HIGH THREAT - Ring Guard AI Pro"
            )
            print("🚨 HIGH Alert sent!")
            
        except Exception as e:
            print(f"❌ SNS Error: {e}")

    def send_medium_alert(self, description):
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            message = f"""
⚠️ MEDIUM THREAT DETECTED

Time: {timestamp}
Description: {description}

Please check your camera feed.

Ring Guard AI Pro
            """
            
            self.sns.publish(
                TopicArn=self.topic_arn,
                Message=message,
                Subject="⚠️ MEDIUM THREAT - Ring Guard AI Pro"
            )
            print("⚠️ MEDIUM Alert sent!")
            
        except Exception as e:
            print(f"❌ SNS Error: {e}")

    def send_package_alert(self, description):
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            message = f"""
📦 PACKAGE DETECTED!

Time: {timestamp}
Description: {description}

Your package has arrived!

Ring Guard AI Pro
            """
            
            self.sns.publish(
                TopicArn=self.topic_arn,
                Message=message,
                Subject="📦 Package Detected - Ring Guard AI Pro"
            )
            print("📦 Package Alert sent!")
            
        except Exception as e:
            print(f"❌ SNS Error: {e}")

    def send_test_alert(self):
        try:
            self.sns.publish(
                TopicArn=self.topic_arn,
                Message="✅ Ring Guard AI Pro - System Working!",
                Subject="✅ Test Alert - Ring Guard AI Pro"
            )
            print("✅ Test Alert sent!")
            
        except Exception as e:
            print(f"❌ Test Alert Error: {e}")

# Test
if __name__ == "__main__":
    sns = SNSHandler()
    sns.send_test_alert()