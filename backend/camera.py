import cv2
import time
import base64
from datetime import datetime

class CameraCapture:
    def __init__(self):
        self.camera = None
        self.is_running = False

    def start_camera(self):
        # Laptop webcam start
        self.camera = cv2.VideoCapture(0)
        self.is_running = True
        print("✅ Camera Started!")

    def stop_camera(self):
        self.is_running = False
        if self.camera:
            self.camera.release()
        print("🛑 Camera Stopped!")

    def capture_frame(self):
        if not self.camera:
            return None
        
        ret, frame = self.camera.read()
        if not ret:
            return None
            
        return frame

    def detect_motion(self, frame1, frame2):
        # Motion detection
        diff = cv2.absdiff(frame1, frame2)
        gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 20, 255, cv2.THRESH_BINARY)
        
        # Motion level calculate
        motion_level = cv2.countNonZero(thresh)
        return motion_level > 1000

    def frame_to_base64(self, frame):
        # Frame to base64 convert
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        return frame_base64

    def save_screenshot(self, frame):
        # Screenshot save
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"suspicious_{timestamp}.jpg"
        cv2.imwrite(f"docs/{filename}", frame)
        print(f"📸 Screenshot saved: {filename}")
        return filename

# Test பண்ண
if __name__ == "__main__":
    cam = CameraCapture()
    cam.start_camera()
    
    print("📷 Camera running... Press Q to quit")
    prev_frame = None
    
    while True:
        frame = cam.capture_frame()
        if frame is None:
            break
            
        # Motion detect
        if prev_frame is not None:
            if cam.detect_motion(prev_frame, frame):
                print("🚨 MOTION DETECTED!")
                cam.save_screenshot(frame)
        
        prev_frame = frame
        
        # Show camera feed
        cv2.imshow("Ring Guard AI - Camera Feed", frame)
        
        # Q press பண்ணா quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cam.stop_camera()
    cv2.destroyAllWindows()