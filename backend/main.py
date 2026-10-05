from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import base64
import json
from camera import CameraCapture
from ai_engine import AIEngine
from alerts import AlertSystem
from datetime import datetime

app = FastAPI(title="Ring Guard AI Pro")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize systems
camera = CameraCapture()
ai = AIEngine()
alert = AlertSystem()

# Events store
events = []

@app.get("/")
def home():
    return {
        "status": "✅ Ring Guard AI Pro Running!",
        "version": "1.0.0"
    }

@app.get("/events")
def get_events():
    return {"events": events}

@app.get("/status")
def get_status():
    return {
        "camera": "active",
        "ai": "active",
        "alerts": "active",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    camera.start_camera()
    
    prev_frame = None
    
    try:
        while True:
            # Capture frame
            frame = camera.capture_frame()
            if frame is None:
                continue

            # Motion detect
            if prev_frame is not None:
                if camera.detect_motion(prev_frame, frame):
                    
                    # AI analyze
                    frame_base64 = camera.frame_to_base64(frame)
                    analysis = ai.analyze_frame(frame_base64)
                    
                    # Event save
                    event = {
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "threat_level": analysis["threat_level"],
                        "description": analysis["description"],
                        "people_count": analysis["people_count"],
                        "suspicious": analysis["suspicious"]
                    }
                    events.append(event)
                    
                    # Send alert
                    if analysis["suspicious"]:
                        alert.send_alert(
                            analysis["threat_level"],
                            analysis["description"]
                        )
                    
                    # Send to dashboard
                    await websocket.send_json({
                        "type": "analysis",
                        "data": analysis,
                        "frame": frame_base64
                    })

            prev_frame = frame
            await asyncio.sleep(0.1)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        camera.stop_camera()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)