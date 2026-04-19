import os
import marshal
import depyf

target_dir = r"c:\Users\tanma\OneDrive\Desktop\SEProject\ecommerce_backend\app"

for root, dirs, files in os.walk(target_dir):
    if '__pycache__' in root:
        for file in files:
            if file.endswith('.pyc'):
                pyc_path = os.path.join(root, file)
                orig_name = file.split('.')[0] + '.py'
                target_py_path = os.path.join(os.path.dirname(root), orig_name)
                
                try:
                    with open(pyc_path, 'rb') as f:
                        f.seek(16)
                        code_obj = marshal.load(f)
                        source_code = depyf.decompile(code_obj)
                        with open(target_py_path, 'w', encoding='utf-8') as out:
                            out.write(source_code)
                    print(f"Recovered {target_py_path} successfully!")
                except Exception as e:
                    print(f"Failed to recover {target_py_path}: {e}")
