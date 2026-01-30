import os
from PIL import Image
import numpy as np

def get_image_diff(img1_path, img2_path):
    try:
        img1 = Image.open(img1_path).convert('RGB').resize((64, 64))
        img2 = Image.open(img2_path).convert('RGB').resize((64, 64))
        
        arr1 = np.array(img1, dtype=np.float32)
        arr2 = np.array(img2, dtype=np.float32)
        
        diff = np.mean(np.abs(arr1 - arr2))
        return diff
    except Exception as e:
        print(f"Error comparing {img1_path} and {img2_path}: {e}")
        return 999999

mapping = {}

files = os.listdir('.')

# Target files: 01_..., 02_...
targets = [f for f in files if f[:2].isdigit() and f.endswith('.jpg')]

SOURCE_DIR = r"E:\AI_girl_flux_dev\APP_VID\FACES\converted_2048_jpg"
source_files = os.listdir(SOURCE_DIR)
candidates = [os.path.join(SOURCE_DIR, f) for f in source_files if f.lower().endswith('.jpg')]

print(f"Found {len(targets)} targets in current dir and {len(candidates)} candidates in source dir.")

with open('rename_source_script.ps1', 'w', encoding='utf-8') as script_file:
    script_file.write(f'$dir = "{SOURCE_DIR}"\n')
    script_file.write('cd $dir\n\n')
    
    # Sort targets to ensure 01, 02, 03 order
    targets.sort()

    for t in targets:
        best_match = None
        best_diff = 50 # Threshold
        
        for c in candidates:
            diff = get_image_diff(t, c)
            if diff < best_diff:
                best_diff = diff
                best_match = c
                
        if best_match:
            # best_match is full path. We need just the filename.
            source_filename = os.path.basename(best_match)
            
            # PowerShell Rename-Item
            cmd = f'Rename-Item -LiteralPath "{source_filename}" -NewName "{t}" -ErrorAction SilentlyContinue'
            print(f"{t} MATCHES {source_filename} (Diff: {best_diff:.2f})")
            script_file.write(cmd + '\n')
        else:
            print(f"{t} NO MATCH FOUND")
            
print("Script generated: rename_source_script.ps1")


