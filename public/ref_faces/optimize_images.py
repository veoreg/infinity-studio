import os
from PIL import Image

files = os.listdir('.')
print(f"Found {len(files)} files")

for filename in files:
    if filename.lower().endswith('.png'):
        try:
            print(f"Processing {filename}...")
            img = Image.open(filename)
            rgb_img = img.convert('RGB')
            
            # Resize if too big (max 1536px)
            max_size = 1536
            if max(img.size) > max_size:
                rgb_img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
            new_filename = os.path.splitext(filename)[0] + '.jpg'
            rgb_img.save(new_filename, 'JPEG', quality=85)
            
            print(f"Converted: {new_filename}")
            
            img.close()
            os.remove(filename)
        except Exception as e:
            print(f"Error converting {filename}: {e}")

print("Optimization complete.")
