import urllib.request
import json
import time
from datetime import datetime

url = "http://localhost:8080/logs"

def send_log(event):
    req = urllib.request.Request(
        url,
        data=json.dumps(event).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.status
    except Exception as e:
        print(f"Error sending event: {e}")
        return None

def trigger_brute_force(tenant_id, ip):
    print(f"[SSH] Simulating SSH Brute Force on {tenant_id} from {ip}...")
    for i in range(5):
        event = {
            "tenant_id": tenant_id,
            "source": "ssh",
            "event_type": "auth_failure",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "severity": "HIGH",
            "ip_address": ip,
            "hostname": f"auth-server-{tenant_id}",
            "message": f"Failed password for root from {ip} port 52311 ssh2",
            "payload": {}
        }
        status = send_log(event)
        print(f"  [{i+1}/5] Sent log. Status: {status}")
        time.sleep(0.2)

def trigger_web_scan(tenant_id, ip):
    print(f"[HTTP] Simulating Web Directory Scan on {tenant_id} from {ip}...")
    paths = [
        "/admin",
        "/wp-admin",
        "/wp-login.php",
        "/.env",
        "/config.php"
    ]
    for i, path in enumerate(paths):
        event = {
            "tenant_id": tenant_id,
            "source": "nginx",
            "event_type": "web_access",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "severity": "INFO",
            "ip_address": ip,
            "hostname": f"nginx-server-{tenant_id}",
            "message": f"IP {ip} requested suspicious path {path}",
            "payload": {"path": path, "status_code": 404}
        }
        status = send_log(event)
        print(f"  [{i+1}/5] Sent request to {path}. Status: {status}")
        time.sleep(0.2)

if __name__ == "__main__":
    print("Starting Multi-Tenant SIEM Attack Simulation...")
    print("Make sure your backend ingestion-service is running on http://localhost:8080")
    print("-" * 60)
    
    # Trigger attacks for tenant_1
    trigger_brute_force("tenant_1", "192.168.42.100")
    time.sleep(1)
    trigger_web_scan("tenant_1", "192.168.42.100")
    
    print("-" * 60)
    time.sleep(2)
    
    # Trigger attacks for tenant_2
    trigger_brute_force("tenant_2", "203.0.113.88")
    time.sleep(1)
    trigger_web_scan("tenant_2", "203.0.113.88")
    
    print("-" * 60)
    print("Simulation complete! Toggle your API key between tenant1-secret-key and tenant2-secret-key on the dashboard to check data isolation.")
