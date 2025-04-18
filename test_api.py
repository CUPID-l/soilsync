import requests
import json
import time

# API endpoint for Hugging Face Space
API_URL = "https://cupid-i-fertilizer-pred.hf.space/predict"

# Fertilizer encodings:
# 0: DAP
# 1: DAP and MOP
# 2: Good NPK
# 3: MOP
# 4: Urea
# 5: Urea and DAP
# 6: Urea and MOP

# Soil type encodings:
# 0: Clayey
# 1: alluvial
# 2: clay loam
# 3: coastal
# 4: laterite
# 5: sandy
# 6: silty clay

# Crop type encodings:
# 0: Coconut
# 1: rice

# Test cases with actual values from the dataset
test_cases = [
    # Test Case 1: DAP and MOP (Clayey soil with rice)
    {
        "topsoil": [23.5, 85.1, 6.5, 2.5, 3.0, 2.0],
        "subsoil": [24.0, 86.2, 6.4, 2.6, 3.1, 2.1],
        "deepsoil": [24.5, 87.3, 6.3, 2.7, 3.2, 2.2],
        "soil_type": 0,  # Clayey
        "crop_type": 1   # rice
    },
    # Test Case 2: Good NPK (Sandy soil with coconut)
    {
        "topsoil": [27.0, 92.0, 5.4, 4.0, 4.1, 3.9],
        "subsoil": [27.5, 93.1, 5.3, 4.2, 4.3, 4.0],
        "deepsoil": [28.0, 94.2, 5.2, 4.4, 4.5, 4.1],
        "soil_type": 5,  # sandy
        "crop_type": 0   # Coconut
    },
    # Test Case 3: MOP (Silty clay soil with rice)
    {
        "topsoil": [25.0, 81.0, 6.9, 4.0, 4.0, 2.0],
        "subsoil": [24.5, 79.0, 6.7, 4.1, 4.1, 2.1],
        "deepsoil": [24.0, 77.0, 6.5, 4.2, 4.2, 2.2],
        "soil_type": 6,  # silty clay
        "crop_type": 1   # rice
    },
    # Test Case 4: Urea and DAP (Sandy soil with coconut)
    {
        "topsoil": [26.0, 94.0, 5.6, 2.0, 2.1, 3.5],
        "subsoil": [26.5, 95.0, 5.5, 2.1, 2.2, 3.6],
        "deepsoil": [27.0, 96.0, 5.4, 2.2, 2.3, 3.7],
        "soil_type": 5,  # sandy
        "crop_type": 0   # Coconut
    },
    # Test Case 5: Urea and MOP (Coastal soil with coconut)
    {
        "topsoil": [24.0, 96.0, 6.2, 2.0, 3.9, 2.1],
        "subsoil": [24.5, 97.0, 6.1, 2.1, 4.0, 2.2],
        "deepsoil": [25.0, 98.0, 6.0, 2.2, 4.1, 2.3],
        "soil_type": 3,  # coastal
        "crop_type": 0   # Coconut
    },
    # Test Case 6: Urea (Clay loam soil with rice)
    {
        "topsoil": [21.0, 85.0, 6.4, 2.5, 4.0, 3.0],
        "subsoil": [21.5, 86.0, 6.3, 2.6, 4.1, 3.1],
        "deepsoil": [22.0, 87.0, 6.2, 2.7, 4.2, 3.2],
        "soil_type": 2,  # clay loam
        "crop_type": 1   # rice
    },
    # Test Case 7: DAP (Clayey soil with rice)
    {
        "topsoil": [26.0, 82.0, 7.0, 4.2, 2.3, 3.2],
        "subsoil": [25.5, 83.0, 6.9, 4.3, 2.4, 3.3],
        "deepsoil": [25.0, 84.0, 6.8, 4.4, 2.5, 3.4],
        "soil_type": 0,  # Clayey
        "crop_type": 1   # rice
    }
]

def test_api():
    print("Testing API with multiple samples...\n")
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test Case {i}:")
        
        try:
            # Add retry logic with exponential backoff
            max_retries = 3
            retry_delay = 1  # seconds
            
            for attempt in range(max_retries):
                try:
                    response = requests.post(API_URL, json=test_case, timeout=10)
                    
                    if response.status_code == 200:
                        result = response.json()
                        print(f"Predicted Fertilizer Class Index: {result['predicted_class']}")
                        print(f"Predicted Fertilizer: {result['fertilizer']}")
                        break
                    elif response.status_code == 404:
                        print("Error: Endpoint not found. Please check if the Space is running and the URL is correct.")
                        print(f"Current URL: {API_URL}")
                        break
                    elif response.status_code == 503:
                        print(f"Service temporarily unavailable. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                        time.sleep(retry_delay)
                        retry_delay *= 2
                    else:
                        print(f"Error: {response.status_code}")
                        print(f"Response: {response.text}")
                        break
                
                except requests.exceptions.Timeout:
                    print(f"Request timed out. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                
                except requests.exceptions.ConnectionError:
                    print(f"Connection error. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay)
                    retry_delay *= 2
        
        except Exception as e:
            print(f"Error making request: {str(e)}")
        
        print("\n" + "-"*50 + "\n")

if __name__ == "__main__":
    test_api() 