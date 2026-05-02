import json
import os

def generate_global_index():
    data_dir = 'data/bukhari'
    all_hadiths = []
    
    for i in range(1, 98):
        file_path = os.path.join(data_dir, f'bukhari_{i}.json')
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Add book number to each hadith for reference in global view
                for h in data.get('hadiths', []):
                    h['bookNumber'] = i
                    all_hadiths.append(h)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    output_path = os.path.join(data_dir, 'bukhari_all.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"hadiths": all_hadiths}, f, ensure_ascii=False)
    
    print(f"Generated global index: {output_path} with {len(all_hadiths)} hadiths.")

if __name__ == "__main__":
    generate_global_index()
