#!/usr/bin/env python3
"""
Focused test for Video Progress API after VideoProgressCreate fix
Tests the POST /progress endpoint with the new VideoProgressCreate model
"""

import requests
import json
import time
import subprocess

# Configuration
BASE_URL = "https://mouvement-echo.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Color codes for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(test_name, status, message=""):
    """Log test result with color"""
    if status == "PASS":
        print(f"{Colors.GREEN}✓ PASS{Colors.END} - {test_name}")
        if message:
            print(f"  {message}")
    elif status == "FAIL":
        print(f"{Colors.RED}✗ FAIL{Colors.END} - {test_name}")
        if message:
            print(f"  {Colors.RED}{message}{Colors.END}")
    elif status == "INFO":
        print(f"{Colors.BLUE}ℹ INFO{Colors.END} - {test_name}")
        if message:
            print(f"  {message}")
    print()

def create_admin_session():
    """Create admin user and session in MongoDB"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}SETUP: Creating Admin User{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    try:
        timestamp = int(time.time())
        user_id = f"admin-{timestamp}"
        session_token = f"admin_session_{timestamp}"
        
        mongo_script = f"""
use('test_database');
var userId = '{user_id}';
var sessionToken = '{session_token}';
db.users.insertOne({{
  id: userId,
  username: 'admin_progress_{timestamp}',
  email: 'admin.progress.{timestamp}@example.com',
  password_hash: '$2b$12$dummy',
  role: 'admin',
  is_2fa_enabled: false,
  created_at: new Date()
}});
db.user_sessions.insertOne({{
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('Admin session created: ' + sessionToken);
"""
        
        result = subprocess.run(
            ["mongosh", "--quiet", "--eval", mongo_script],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            log_test("Admin User Creation", "PASS", f"Session token: {session_token}")
            return session_token
        else:
            log_test("Admin User Creation", "FAIL", f"MongoDB error: {result.stderr}")
            return None
    except Exception as e:
        log_test("Admin User Creation", "FAIL", f"Exception: {str(e)}")
        return None

def test_video_progress_api():
    """Test Video Progress API with VideoProgressCreate model"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Video Progress API Test (After Fix){Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    results = []
    timestamp = int(time.time())
    
    # Step 1: Create a test user and login
    print(f"{Colors.BLUE}Step 1: Create test user and login{Colors.END}\n")
    
    user_data = {
        "username": f"progress_tester_{timestamp}",
        "email": f"progress.tester.{timestamp}@example.com",
        "password": "ProgressTest123!",
        "enable_2fa": False
    }
    
    try:
        # Register user
        reg_response = requests.post(f"{BASE_URL}/auth/register", json=user_data, headers=HEADERS, timeout=10)
        if reg_response.status_code != 200:
            log_test("User Registration", "FAIL", f"Status: {reg_response.status_code}, Body: {reg_response.text}")
            return False
        
        log_test("User Registration", "PASS", f"User created: {user_data['username']}")
        
        # Login
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"],
            "captcha_verified": True
        }
        
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data, headers=HEADERS, timeout=10)
        if login_response.status_code != 200:
            log_test("User Login", "FAIL", f"Status: {login_response.status_code}, Body: {login_response.text}")
            return False
        
        session_token = login_response.json()["session_token"]
        user_headers = {**HEADERS, "Authorization": f"Bearer {session_token}"}
        log_test("User Login", "PASS", "Session token obtained")
        
    except Exception as e:
        log_test("User Setup", "FAIL", f"Exception: {str(e)}")
        return False
    
    # Step 2: Create an episode (need admin)
    print(f"{Colors.BLUE}Step 2: Create test episode{Colors.END}\n")
    
    admin_session = create_admin_session()
    if not admin_session:
        log_test("Episode Creation", "FAIL", "Could not create admin session")
        return False
    
    admin_headers = {**HEADERS, "Authorization": f"Bearer {admin_session}"}
    
    try:
        episode_data = {
            "season": 1,
            "episode": 99,
            "title": f"Test Episode {timestamp}",
            "description": "Episode for progress testing",
            "duration": "50 min",
            "thumbnail_url": "https://example.com/test.jpg",
            "video_url": "/videos/test.mp4",
            "is_published": True
        }
        
        ep_response = requests.post(f"{BASE_URL}/episodes", json=episode_data, headers=admin_headers, timeout=10)
        if ep_response.status_code != 200:
            log_test("Episode Creation", "FAIL", f"Status: {ep_response.status_code}, Body: {ep_response.text}")
            return False
        
        episode = ep_response.json()
        episode_id = episode["id"]
        log_test("Episode Creation", "PASS", f"Episode ID: {episode_id}")
        
    except Exception as e:
        log_test("Episode Creation", "FAIL", f"Exception: {str(e)}")
        return False
    
    # Step 3: POST /progress with VideoProgressCreate model
    print(f"{Colors.BLUE}Step 3: Save progress (middle of video){Colors.END}\n")
    
    try:
        progress_data = {
            "episode_id": episode_id,
            "season": 1,
            "episode": 99,
            "current_time": 1500.0,  # 25 minutes (50% of 3000 seconds)
            "duration": 3000.0  # 50 minutes
        }
        
        response = requests.post(f"{BASE_URL}/progress", json=progress_data, headers=user_headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                log_test("POST /progress (VideoProgressCreate)", "PASS", f"Response: {data['message']}")
                results.append(True)
            else:
                log_test("POST /progress (VideoProgressCreate)", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("POST /progress (VideoProgressCreate)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("POST /progress (VideoProgressCreate)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Step 4: GET /progress/{episode_id} - verify progress was saved
    print(f"{Colors.BLUE}Step 4: Get progress for episode{Colors.END}\n")
    
    try:
        response = requests.get(f"{BASE_URL}/progress/{episode_id}", headers=user_headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and "episode_id" in data and "current_time" in data and "progress_percent" in data:
                expected_progress = (1500.0 / 3000.0) * 100  # 50%
                actual_progress = data["progress_percent"]
                
                if abs(actual_progress - expected_progress) < 0.1:
                    log_test("GET /progress/{episode_id}", "PASS", f"Progress: {actual_progress:.1f}% (expected ~50%)")
                    results.append(True)
                else:
                    log_test("GET /progress/{episode_id}", "FAIL", f"Progress mismatch: {actual_progress:.1f}% (expected ~50%)")
                    results.append(False)
            else:
                log_test("GET /progress/{episode_id}", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("GET /progress/{episode_id}", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("GET /progress/{episode_id}", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Step 5: GET /progress/last-watched - verify it returns the progress
    print(f"{Colors.BLUE}Step 5: Get last watched episode{Colors.END}\n")
    
    try:
        response = requests.get(f"{BASE_URL}/progress/last-watched", headers=user_headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and "episode_id" in data and data["episode_id"] == episode_id:
                log_test("GET /progress/last-watched", "PASS", f"Last watched: {data.get('title', 'N/A')}")
                results.append(True)
            else:
                log_test("GET /progress/last-watched", "FAIL", f"Invalid response or wrong episode: {data}")
                results.append(False)
        else:
            log_test("GET /progress/last-watched", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("GET /progress/last-watched", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Step 6: POST /progress with progress > 95% - verify it gets cleared
    print(f"{Colors.BLUE}Step 6: Save progress > 95% (should clear){Colors.END}\n")
    
    try:
        progress_data = {
            "episode_id": episode_id,
            "season": 1,
            "episode": 99,
            "current_time": 2900.0,  # 96.67% of 3000 seconds
            "duration": 3000.0
        }
        
        response = requests.post(f"{BASE_URL}/progress", json=progress_data, headers=user_headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "cleared" in data["message"].lower():
                log_test("POST /progress (>95%)", "PASS", f"Response: {data['message']}")
                results.append(True)
            else:
                log_test("POST /progress (>95%)", "FAIL", f"Expected 'cleared' message, got: {data}")
                results.append(False)
        else:
            log_test("POST /progress (>95%)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
        
        # Verify it was actually cleared
        verify_response = requests.get(f"{BASE_URL}/progress/{episode_id}", headers=user_headers, timeout=10)
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            if verify_data is None:
                log_test("Verify progress cleared (>95%)", "PASS", "Progress was cleared from database")
                results.append(True)
            else:
                log_test("Verify progress cleared (>95%)", "FAIL", f"Progress still exists: {verify_data}")
                results.append(False)
        else:
            log_test("Verify progress cleared (>95%)", "FAIL", f"Could not verify: {verify_response.status_code}")
            results.append(False)
            
    except Exception as e:
        log_test("POST /progress (>95%)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Step 7: POST /progress with progress < 5% - verify it gets cleared
    print(f"{Colors.BLUE}Step 7: Save progress < 5% (should clear){Colors.END}\n")
    
    try:
        progress_data = {
            "episode_id": episode_id,
            "season": 1,
            "episode": 99,
            "current_time": 100.0,  # 3.33% of 3000 seconds
            "duration": 3000.0
        }
        
        response = requests.post(f"{BASE_URL}/progress", json=progress_data, headers=user_headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "cleared" in data["message"].lower():
                log_test("POST /progress (<5%)", "PASS", f"Response: {data['message']}")
                results.append(True)
            else:
                log_test("POST /progress (<5%)", "FAIL", f"Expected 'cleared' message, got: {data}")
                results.append(False)
        else:
            log_test("POST /progress (<5%)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
        
        # Verify it was actually cleared
        verify_response = requests.get(f"{BASE_URL}/progress/{episode_id}", headers=user_headers, timeout=10)
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            if verify_data is None:
                log_test("Verify progress cleared (<5%)", "PASS", "Progress was cleared from database")
                results.append(True)
            else:
                log_test("Verify progress cleared (<5%)", "FAIL", f"Progress still exists: {verify_data}")
                results.append(False)
        else:
            log_test("Verify progress cleared (<5%)", "FAIL", f"Could not verify: {verify_response.status_code}")
            results.append(False)
            
    except Exception as e:
        log_test("POST /progress (<5%)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    passed = sum(1 for result in results if result)
    total = len(results)
    
    if passed == total:
        print(f"{Colors.GREEN}✓ ALL TESTS PASSED: {passed}/{total}{Colors.END}\n")
    else:
        print(f"{Colors.RED}✗ SOME TESTS FAILED: {passed}/{total} passed{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    success = test_video_progress_api()
    exit(0 if success else 1)
