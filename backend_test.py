#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Mouvement ECHO
Tests all API endpoints according to contracts.md
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://mouvement-echo.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test data storage
test_data = {
    "users": [],
    "sessions": [],
    "episodes": [],
    "admin_session": None
}

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
    elif status == "WARN":
        print(f"{Colors.YELLOW}⚠ WARN{Colors.END} - {test_name}")
        if message:
            print(f"  {message}")
    print()

def test_health_check():
    """Test 1: Health Check"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST 1: Health Check{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    try:
        response = requests.get(f"{BASE_URL}/", headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                log_test("GET /api/", "PASS", f"Response: {data}")
                return True
            else:
                log_test("GET /api/", "FAIL", "Missing 'message' in response")
                return False
        else:
            log_test("GET /api/", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        log_test("GET /api/", "FAIL", f"Exception: {str(e)}")
        return False

def test_user_registration():
    """Test 2: User Registration"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST 2: User Registration{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    results = []
    timestamp = int(time.time())
    
    # Test 2.1: Register user without 2FA
    try:
        user_data = {
            "username": f"alice_echo_{timestamp}",
            "email": f"alice.echo.{timestamp}@example.com",
            "password": "SecurePass123!",
            "enable_2fa": False
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "username" in data and data.get("requires_2fa") == False:
                log_test("POST /auth/register (without 2FA)", "PASS", f"User ID: {data['id']}")
                test_data["users"].append({"user_data": user_data, "response": data})
                results.append(True)
            else:
                log_test("POST /auth/register (without 2FA)", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("POST /auth/register (without 2FA)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("POST /auth/register (without 2FA)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 2.2: Register user with 2FA
    try:
        user_data_2fa = {
            "username": f"bob_echo_{timestamp}",
            "email": f"bob.echo.{timestamp}@example.com",
            "password": "SecurePass456!",
            "enable_2fa": True
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data_2fa, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("requires_2fa") == True:
                log_test("POST /auth/register (with 2FA)", "PASS", f"User ID: {data['id']}, 2FA enabled")
                test_data["users"].append({"user_data": user_data_2fa, "response": data})
                results.append(True)
            else:
                log_test("POST /auth/register (with 2FA)", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("POST /auth/register (with 2FA)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("POST /auth/register (with 2FA)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 2.3: Register duplicate username (should fail)
    try:
        duplicate_data = {
            "username": user_data["username"],  # Same as first user
            "email": f"different.{timestamp}@example.com",
            "password": "AnotherPass789!",
            "enable_2fa": False
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=duplicate_data, headers=HEADERS, timeout=10)
        
        if response.status_code == 400:
            log_test("POST /auth/register (duplicate username)", "PASS", "Correctly rejected duplicate username")
            results.append(True)
        else:
            log_test("POST /auth/register (duplicate username)", "FAIL", f"Expected 400, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /auth/register (duplicate username)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def test_user_login():
    """Test 3: User Login"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST 3: User Login{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    results = []
    
    if not test_data["users"]:
        log_test("User Login Tests", "FAIL", "No users registered in previous tests")
        return False
    
    # Test 3.1: Login with correct credentials and captcha
    try:
        user = test_data["users"][0]  # User without 2FA
        login_data = {
            "username": user["user_data"]["username"],
            "password": user["user_data"]["password"],
            "captcha_verified": True
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "session_token" in data and "user" in data:
                log_test("POST /auth/login (valid credentials)", "PASS", f"Session token received")
                test_data["sessions"].append({
                    "username": user["user_data"]["username"],
                    "token": data["session_token"]
                })
                results.append(True)
            else:
                log_test("POST /auth/login (valid credentials)", "FAIL", f"Missing session_token or user: {data}")
                results.append(False)
        else:
            log_test("POST /auth/login (valid credentials)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("POST /auth/login (valid credentials)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 3.2: Login without captcha verification (should fail)
    try:
        user = test_data["users"][0]
        login_data = {
            "username": user["user_data"]["username"],
            "password": user["user_data"]["password"],
            "captcha_verified": False
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, headers=HEADERS, timeout=10)
        
        if response.status_code == 400:
            log_test("POST /auth/login (no captcha)", "PASS", "Correctly rejected login without captcha")
            results.append(True)
        else:
            log_test("POST /auth/login (no captcha)", "FAIL", f"Expected 400, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /auth/login (no captcha)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 3.3: Login with wrong password (should fail)
    try:
        user = test_data["users"][0]
        login_data = {
            "username": user["user_data"]["username"],
            "password": "WrongPassword123!",
            "captcha_verified": True
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, headers=HEADERS, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /auth/login (wrong password)", "PASS", "Correctly rejected wrong password")
            results.append(True)
        else:
            log_test("POST /auth/login (wrong password)", "FAIL", f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("POST /auth/login (wrong password)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def test_session_management():
    """Test 4: Session Management"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST 4: Session Management{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    results = []
    
    if not test_data["sessions"]:
        log_test("Session Management Tests", "FAIL", "No active sessions from previous tests")
        return False
    
    # Test 4.1: GET /auth/me with valid token
    try:
        session = test_data["sessions"][0]
        headers = {**HEADERS, "Authorization": f"Bearer {session['token']}"}
        
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "username" in data and "email" in data:
                log_test("GET /auth/me (with valid token)", "PASS", f"User: {data['username']}")
                results.append(True)
            else:
                log_test("GET /auth/me (with valid token)", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("GET /auth/me (with valid token)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("GET /auth/me (with valid token)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 4.2: GET /auth/me without token (should fail)
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=HEADERS, timeout=10)
        
        if response.status_code == 401:
            log_test("GET /auth/me (without token)", "PASS", "Correctly rejected request without token")
            results.append(True)
        else:
            log_test("GET /auth/me (without token)", "FAIL", f"Expected 401, got {response.status_code}")
            results.append(False)
    except Exception as e:
        log_test("GET /auth/me (without token)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 4.3: POST /auth/logout with valid token
    try:
        # Create a new session for logout test
        timestamp = int(time.time())
        user_data = {
            "username": f"charlie_echo_{timestamp}",
            "email": f"charlie.echo.{timestamp}@example.com",
            "password": "LogoutTest123!",
            "enable_2fa": False
        }
        
        # Register
        requests.post(f"{BASE_URL}/auth/register", json=user_data, headers=HEADERS, timeout=10)
        
        # Login
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"],
            "captcha_verified": True
        }
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data, headers=HEADERS, timeout=10)
        
        if login_response.status_code == 200:
            logout_token = login_response.json()["session_token"]
            headers = {**HEADERS, "Authorization": f"Bearer {logout_token}"}
            
            # Logout
            response = requests.post(f"{BASE_URL}/auth/logout", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    log_test("POST /auth/logout (with valid token)", "PASS", f"Response: {data['message']}")
                    results.append(True)
                else:
                    log_test("POST /auth/logout (with valid token)", "FAIL", f"Invalid response: {data}")
                    results.append(False)
            else:
                log_test("POST /auth/logout (with valid token)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
                results.append(False)
        else:
            log_test("POST /auth/logout (with valid token)", "FAIL", "Could not create session for logout test")
            results.append(False)
    except Exception as e:
        log_test("POST /auth/logout (with valid token)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def create_admin_session():
    """Helper: Create admin user and session in MongoDB"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}SETUP: Creating Admin User{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    try:
        import subprocess
        timestamp = int(time.time())
        user_id = f"admin-{timestamp}"
        session_token = f"admin_session_{timestamp}"
        
        mongo_script = f"""
use('test_database');
var userId = '{user_id}';
var sessionToken = '{session_token}';
db.users.insertOne({{
  id: userId,
  username: 'admin_echo_{timestamp}',
  email: 'admin.echo.{timestamp}@example.com',
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
            test_data["admin_session"] = session_token
            log_test("Admin User Creation", "PASS", f"Session token: {session_token}")
            return True
        else:
            log_test("Admin User Creation", "FAIL", f"MongoDB error: {result.stderr}")
            return False
    except Exception as e:
        log_test("Admin User Creation", "FAIL", f"Exception: {str(e)}")
        return False

def test_episodes_management():
    """Test 5: Episodes Management"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST 5: Episodes Management{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    results = []
    
    # Test 5.1: GET /episodes (empty initially)
    try:
        response = requests.get(f"{BASE_URL}/episodes", headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("GET /episodes (initial)", "PASS", f"Returned {len(data)} episodes")
                results.append(True)
            else:
                log_test("GET /episodes (initial)", "FAIL", f"Expected list, got: {type(data)}")
                results.append(False)
        else:
            log_test("GET /episodes (initial)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("GET /episodes (initial)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Create admin session
    if not test_data["admin_session"]:
        if not create_admin_session():
            log_test("Episodes Management", "FAIL", "Could not create admin session")
            return False
    
    admin_headers = {**HEADERS, "Authorization": f"Bearer {test_data['admin_session']}"}
    
    # Test 5.2: POST /episodes (as admin)
    try:
        episode_data = {
            "season": 1,
            "episode": 1,
            "title": "Épisode 1 — Le Réveil",
            "description": "Premier épisode de la série ECHO",
            "duration": "52 min",
            "thumbnail_url": "https://example.com/thumb1.jpg",
            "video_url": "/videos/s1e1.mp4",
            "is_published": True
        }
        
        response = requests.post(f"{BASE_URL}/episodes", json=episode_data, headers=admin_headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data["title"] == episode_data["title"]:
                log_test("POST /episodes (as admin)", "PASS", f"Episode ID: {data['id']}")
                test_data["episodes"].append(data)
                results.append(True)
            else:
                log_test("POST /episodes (as admin)", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("POST /episodes (as admin)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("POST /episodes (as admin)", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 5.3: GET /episodes?season=1
    try:
        response = requests.get(f"{BASE_URL}/episodes?season=1", headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET /episodes?season=1", "PASS", f"Found {len(data)} episode(s) in season 1")
                results.append(True)
            else:
                log_test("GET /episodes?season=1", "FAIL", f"Expected non-empty list, got: {data}")
                results.append(False)
        else:
            log_test("GET /episodes?season=1", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("GET /episodes?season=1", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 5.4: PUT /episodes/{id} (as admin)
    if test_data["episodes"]:
        try:
            episode_id = test_data["episodes"][0]["id"]
            updated_data = {
                "season": 1,
                "episode": 1,
                "title": "Épisode 1 — Le Réveil (Updated)",
                "description": "Description mise à jour",
                "duration": "52 min",
                "thumbnail_url": "https://example.com/thumb1_updated.jpg",
                "video_url": "/videos/s1e1.mp4",
                "is_published": True
            }
            
            response = requests.put(f"{BASE_URL}/episodes/{episode_id}", json=updated_data, headers=admin_headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data["title"] == updated_data["title"]:
                    log_test("PUT /episodes/{id} (as admin)", "PASS", "Episode updated successfully")
                    results.append(True)
                else:
                    log_test("PUT /episodes/{id} (as admin)", "FAIL", f"Title not updated: {data}")
                    results.append(False)
            else:
                log_test("PUT /episodes/{id} (as admin)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
                results.append(False)
        except Exception as e:
            log_test("PUT /episodes/{id} (as admin)", "FAIL", f"Exception: {str(e)}")
            results.append(False)
    
    # Test 5.5: DELETE /episodes/{id} (as admin)
    if test_data["episodes"]:
        try:
            # Create another episode to delete
            episode_data = {
                "season": 1,
                "episode": 2,
                "title": "Épisode 2 — Test Delete",
                "description": "Episode to be deleted",
                "duration": "45 min",
                "thumbnail_url": "https://example.com/thumb2.jpg",
                "video_url": "/videos/s1e2.mp4",
                "is_published": False
            }
            
            create_response = requests.post(f"{BASE_URL}/episodes", json=episode_data, headers=admin_headers, timeout=10)
            
            if create_response.status_code == 200:
                episode_id = create_response.json()["id"]
                
                # Delete it
                response = requests.delete(f"{BASE_URL}/episodes/{episode_id}", headers=admin_headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if "message" in data:
                        log_test("DELETE /episodes/{id} (as admin)", "PASS", f"Response: {data['message']}")
                        results.append(True)
                    else:
                        log_test("DELETE /episodes/{id} (as admin)", "FAIL", f"Invalid response: {data}")
                        results.append(False)
                else:
                    log_test("DELETE /episodes/{id} (as admin)", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
                    results.append(False)
            else:
                log_test("DELETE /episodes/{id} (as admin)", "FAIL", "Could not create episode for deletion test")
                results.append(False)
        except Exception as e:
            log_test("DELETE /episodes/{id} (as admin)", "FAIL", f"Exception: {str(e)}")
            results.append(False)
    
    return all(results)

def test_video_progress():
    """Test 6: Video Progress"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST 6: Video Progress{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    results = []
    
    if not test_data["sessions"]:
        log_test("Video Progress Tests", "FAIL", "No active sessions from previous tests")
        return False
    
    if not test_data["episodes"]:
        log_test("Video Progress Tests", "FAIL", "No episodes from previous tests")
        return False
    
    session = test_data["sessions"][0]
    episode = test_data["episodes"][0]
    headers = {**HEADERS, "Authorization": f"Bearer {session['token']}"}
    
    # Test 6.1: POST /progress
    try:
        progress_data = {
            "episode_id": episode["id"],
            "season": episode["season"],
            "episode": episode["episode"],
            "current_time": 300.5,  # 5 minutes
            "duration": 3120.0  # 52 minutes
        }
        
        response = requests.post(f"{BASE_URL}/progress", json=progress_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                log_test("POST /progress", "PASS", f"Response: {data['message']}")
                results.append(True)
            else:
                log_test("POST /progress", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("POST /progress", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("POST /progress", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 6.2: GET /progress/{episode_id}
    try:
        response = requests.get(f"{BASE_URL}/progress/{episode['id']}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and "episode_id" in data and "current_time" in data:
                log_test("GET /progress/{episode_id}", "PASS", f"Progress: {data['progress_percent']:.1f}%")
                results.append(True)
            else:
                log_test("GET /progress/{episode_id}", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("GET /progress/{episode_id}", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("GET /progress/{episode_id}", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    # Test 6.3: GET /progress/last-watched
    try:
        response = requests.get(f"{BASE_URL}/progress/last-watched", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and "episode_id" in data:
                log_test("GET /progress/last-watched", "PASS", f"Last watched: {data.get('title', 'N/A')}")
                results.append(True)
            else:
                log_test("GET /progress/last-watched", "FAIL", f"Invalid response: {data}")
                results.append(False)
        else:
            log_test("GET /progress/last-watched", "FAIL", f"Status: {response.status_code}, Body: {response.text}")
            results.append(False)
    except Exception as e:
        log_test("GET /progress/last-watched", "FAIL", f"Exception: {str(e)}")
        results.append(False)
    
    return all(results)

def main():
    """Run all tests"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Mouvement ECHO Backend API Test Suite{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")
    
    test_results = {}
    
    # Run tests
    test_results["Health Check"] = test_health_check()
    test_results["User Registration"] = test_user_registration()
    test_results["User Login"] = test_user_login()
    test_results["Session Management"] = test_session_management()
    test_results["Episodes Management"] = test_episodes_management()
    test_results["Video Progress"] = test_video_progress()
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = f"{Colors.GREEN}PASS{Colors.END}" if result else f"{Colors.RED}FAIL{Colors.END}"
        print(f"{status} - {test_name}")
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Total: {passed}/{total} test suites passed{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
