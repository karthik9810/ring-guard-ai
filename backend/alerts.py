import boto3
import json
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class AlertSystem:
    def __init__(self):
        self.sns = boto3.client(
            'sns',
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.topic_arn = os.getenv('SNS_TOPIC_ARN')
        print("✅ Alert System Ready!")

    def send_alert(self, threat_level, description, screenshot=None):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        message = f"""
🚨 RING GUARD AI ALERT 🚨
        
Time: {timestamp}
Threat Level: {threat_level}
Description: {description}

Stay safe!
Ring Guard AI Pro
        """

        try:
            if threat_level == "HIGH":
                # SMS + Email alert
                self.sns.publish(
                    TopicArn=self.topic_arn,
                    Message=message,
                    Subject=f"🚨 HIGH THREAT DETECTED - Ring Guard AI"
                )
                print(f"🚨 HIGH ALERT SENT!")
                
            elif threat_level == "MEDIUM":
                # Email only
                self.sns.publish(
                    TopicArn=self.topic_arn,
                    Message=message,
                    Subject=f"⚠️ MEDIUM THREAT - Ring Guard AI"
                )
                print(f"⚠️ MEDIUM ALERT SENT!")
                
            else:
                print(f"✅ LOW threat - No alert needed")

        except Exception as e:
            print(f"❌ Alert Error: {e}")

    def send_test_alert(self):
        print("📤 Sending test alert...")
        self.send_alert(
            "HIGH",
            "Test alert - System working correctly!"
        )

# Test
if __name__ == "__main__":
    alert = AlertSystem()
    alert.send_test_alert()