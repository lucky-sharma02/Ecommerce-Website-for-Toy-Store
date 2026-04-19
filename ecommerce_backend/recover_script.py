import os
import json
import shutil
from urllib.parse import unquote

target_dir = r"c:\Users\tanma\OneDrive\Desktop\SEProject\ecommerce_backend\app"
history_dir = os.path.expandvars(r'%APPDATA%\Code\User\History')

print("Starting recovery...")
for root, _, files in os.walk(history_dir):
    if 'entries.json' in files:
        entries_path = os.path.join(root, 'entries.json')
        try:
            with open(entries_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            resource = data.get('resource', '')
            resource = unquote(resource)
            
            if 'ecommerce_backend' in resource and 'app' in resource:
                entries = data.get('entries', [])
                if entries:
                    latest_entry = entries[-1]
                    latest_file = os.path.join(root, latest_entry.get('id'))
                    
                    local_path = resource.replace('file:///', '')
                    local_path = os.path.normpath(local_path)
                    
                    if os.path.exists(latest_file):
                        # Ensure directory exists just in case
                        os.makedirs(os.path.dirname(local_path), exist_ok=True)
                        print(f"Restoring {local_path} from {latest_file}")
                        # Copy original file content back
                        with open(latest_file, 'rb') as src, open(local_path, 'wb') as dst:
                            dst.write(src.read())
        except Exception as e:
            pass
print("Recovery finish.")
