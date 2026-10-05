import boto3
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid

load_dotenv()

class DynamoDBHandler:
    def __init__(self):
        self.dynamodb = boto3.resource(
            'dynamodb',
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.table = self.dynamodb.Table('ring-guard-events')
        print("✅ DynamoDB Ready!")

    def save_event(self, analysis, screenshot_url=None):
        try:
            event = {
                'event_id': str(uuid.uuid4()),
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'threat_level': analysis['threat_level'],
                'description': analysis['description'],
                'people_count': str(analysis['people_count']),
                'suspicious': str(analysis['suspicious']),
                'package_detected': str(analysis['package_detected']),
                'alert_message': analysis['alert_message'],
                'screenshot_url': screenshot_url or 'none'
            }
            
            self.table.put_item(Item=event)
            print(f"✅ Event saved: {event['event_id']}")
            return event['event_id']
            
        except Exception as e:
            print(f"❌ DynamoDB Error: {e}")
            return None

    def get_all_events(self):
        try:
            response = self.table.scan()
            events = response['Items']
            print(f"✅ Got {len(events)} events")
            return events
        except Exception as e:
            print(f"❌ Get Events Error: {e}")
            return []

    def get_high_threat_events(self):
        try:
            response = self.table.scan(
                FilterExpression='threat_level = :level',
                ExpressionAttributeValues={':level': 'HIGH'}
            )
            return response['Items']
        except Exception as e:
            print(f"❌ Filter Error: {e}")
            return []

# Test
if __name__ == "__main__":
    db = DynamoDBHandler()
    print("✅ DynamoDB initialized!")