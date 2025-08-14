#!/usr/bin/env python3
"""
Simple test script to verify authentication endpoints work correctly.
"""
import requests
import json

BASE_URL = "http://localhost:8000"


def test_login_endpoint():
    """Test the login endpoint with existing user"""
    url = f"{BASE_URL}/auth/login/"
    data = {"username": "testuser", "password": "testpass123"}

    try:
        response = requests.post(url, json=data)
        print(f"Login Status Code: {response.status_code}")
        print(f"Login Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            return response.json()
        else:
            print("Login failed - user may not exist")
            return None

    except requests.exceptions.ConnectionError:
        print("Server is not running on localhost:8000")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None


def test_projects_endpoint(token):
    """Test that projects are filtered by user"""
    url = f"{BASE_URL}/projects/"
    headers = {"Authorization": f"Token {token}"}

    try:
        response = requests.get(url, headers=headers)
        print(f"Projects Status Code: {response.status_code}")
        print(f"Projects Response: {json.dumps(response.json(), indent=2)}")

    except Exception as e:
        print(f"Error testing projects: {e}")


if __name__ == "__main__":
    print("Testing Authentication Endpoints...")
    print("=" * 50)

    # Test login
    auth_data = test_login_endpoint()

    if auth_data and "token" in auth_data:
        print("\n" + "=" * 50)
        print("Testing Projects Endpoint...")
        test_projects_endpoint(auth_data["token"])
    else:
        print("\nSkipping projects test - login failed")
