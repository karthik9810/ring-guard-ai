import boto3
import json
import os
import base64
from dotenv import load_dotenv

load_dotenv()

class BedrockHandler:
    def __init__(self):
        self.bedrock = boto3.client(
            service_name='bedrock-runtime',
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
        print("✅ Bedrock Handler Ready!")

    def analyze_security_image(self, frame_base64):
        prompt = """
You are a professional security AI system.
Analyze this security camera image and respond 
ONLY in JSON format:

{
    "what_detected": "person/animal/object/empty",
    "suspicious": true/false,
    "threat_level": "LOW/MEDIUM/HIGH",
    "people_count": 0,
    "package_detected": true/false,
    "night_time": true/false,
    "loitering": true/false,
    "description": "brief scene description",
    "alert_message": "alert text if suspicious",
    "recommended_action": "what to do"
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
            ai_text = result['content'][0]['text']
            
            # Clean JSON
            ai_text = ai_text.strip()
            if ai_text.startswith("```"):
                ai_text = ai_text.split("```")[1]
                if ai_text.startswith("json"):
                    ai_text = ai_text[4:]
            
            analysis = json.loads(ai_text)
            print(f"🤖 Bedrock: {analysis['threat_level']} - {analysis['description']}")
            return analysis

        except Exception as e:
            print(f"❌ Bedrock Error: {e}")
            return {
                "what_detected": "unknown",
                "suspicious": False,
                "threat_level": "LOW",
                "people_count": 0,
                "package_detected": False,
                "night_time": False,
                "loitering": False,
                "description": "Analysis failed",
                "alert_message": "",
                "recommended_action": "Manual check required"
            }

    def generate_security_report(self, events):
        try:
            events_text = json.dumps(events, indent=2)
            
            response = self.bedrock.invoke_model(
                modelId=self.model_id,
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 2000,
                    "messages": [
                        {
                            "role": "user",
                            "content": f"""
Generate a professional security report 
for these events:

{events_text}

Include:
1. Summary
2. High risk events
3. Patterns detected
4. Recommendations
                            """
                        }
                    ]
                })
            )
            
            result = json.loads(response['body'].read())
            report = result['content'][0]['text']
            print("✅ Security Report Generated!")
            return report
            
        except Exception as e:
            print(f"❌ Report Error: {e}")
            return "Report generation failed"

# Test
if __name__ == "__main__":
    bedrock = BedrockHandler()
    print("✅ Bedrock initialized!")