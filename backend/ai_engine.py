import boto3
import base64
import json
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

class AIEngine:
    def __init__(self):
        self.bedrock = boto3.client(
            service_name='bedrock-runtime',
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
        print("✅ AI Engine Ready!")

    def analyze_frame(self, frame_base64):
        # AWS Bedrock Claude analyze பண்றது
        prompt = """
        Analyze this security camera image and provide:
        1. What do you see? (person, animal, object, package)
        2. Is there suspicious activity? (yes/no)
        3. Threat level: (LOW/MEDIUM/HIGH)
        4. How many people visible?
        5. Any packages or deliveries visible?
        6. Brief description of the scene
        
        Respond in JSON format:
        {
            "what_detected": "",
            "suspicious": true/false,
            "threat_level": "LOW/MEDIUM/HIGH",
            "people_count": 0,
            "package_detected": true/false,
            "description": "",
            "alert_message": ""
        }
        """

        try:
            response = self.bedrock.invoke_model(
                modelId=self.model_id,
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 1000,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": "image/jpeg",
                                        "data": frame_base64
                                    }
                                },
                                {
                                    "type": "text",
                                    "text": prompt
                                }
                            ]
                        }
                    ]
                })
            )

            result = json.loads(response['body'].read())
            ai_response = result['content'][0]['text']
            
            # JSON parse பண்றது
            analysis = json.loads(ai_response)
            print(f"🤖 AI Analysis: {analysis['threat_level']} - {analysis['description']}")
            return analysis

        except Exception as e:
            print(f"❌ AI Error: {e}")
            return {
                "what_detected": "unknown",
                "suspicious": False,
                "threat_level": "LOW",
                "people_count": 0,
                "package_detected": False,
                "description": "Analysis failed",
                "alert_message": ""
            }

    def get_threat_score(self, analysis):
        # Threat score calculate பண்றது
        if analysis['threat_level'] == 'HIGH':
            return 90
        elif analysis['threat_level'] == 'MEDIUM':
            return 50
        else:
            return 10

# Test பண்ண
if __name__ == "__main__":
    ai = AIEngine()
    print("✅ AI Engine initialized successfully!")