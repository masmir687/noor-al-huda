import json
import os
import urllib.request
import re

def clean_bengali_text(text):
    if not text:
        return text
    
    # 1. Remove blocks of Arabic script explicitly
    arabic_pattern = r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0870-\u089F]+'
    text = re.sub(arabic_pattern, '', text)
    
    # 2. Remove specific invisible/control characters that escape general patterns
    # \u00ad is soft hyphen, \u200b-\u200f are various zero-width marks
    invisible_chars = r'[\u00ad\u200b\u200c\u200d\u200e\u200f\ufeff]'
    text = re.sub(invisible_chars, '', text)
    
    # 3. Whitelist: Keep only Bengali, English, Digits, and common Punctuation
    whitelist = r'[^\u0980-\u09FF\u0964\u0965a-zA-Z0-9\s\.\,\!\?\#\%\&\(\)\*\+\-\/\:\;\<\=\>\@\[\]\^\_\`\{\|\}\~\–\—\’\‘\”\“\৳]'
    text = re.sub(whitelist, '', text)
    
    # 4. Clean up leftover empty brackets or braces (repeatedly)
    for _ in range(3):
        text = re.sub(r'\(\s*[\.\,]*\s*\)', '', text)
        text = re.sub(r'\[\s*[\.\,]*\s*\]', '', text)
        text = re.sub(r'\{\s*[\.\,]*\s*\}', '', text)
    
    # 5. Clean up double spaces and artifacts
    text = re.sub(r'\s+', ' ', text)
    
    # 6. Final strip of any non-alphanumeric leading/trailing characters
    # We want to keep the text if it starts with Bengali or English
    text = text.strip(' .।,:/-()[]{}')
    
    return text.strip()

def download_bengali_bukhari():
    url = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-bukhari.json"
    print(f"Downloading Bengali Bukhari from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('hadiths', [])
    except Exception as e:
        print(f"Failed to download: {e}")
        return []

def translate_files():
    bn_hadiths = download_bengali_bukhari()
    if not bn_hadiths:
        print("No Bengali hadiths found. Aborting.")
        return

    # Create a map for quick lookup and clean text
    bn_map = {int(h['hadithnumber']): clean_bengali_text(h['text']) for h in bn_hadiths}
    
    data_dir = 'data/bukhari'
    for i in range(1, 17):
        file_path = os.path.join(data_dir, f'bukhari_v{i}.json')
        if not os.path.exists(file_path):
            print(f"File {file_path} not found. Skipping.")
            continue
            
        print(f"Translating {file_path}...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'hadiths' in data:
                count = 0
                for hadith in data['hadiths']:
                    try:
                        num = int(hadith.get('number'))
                        if num in bn_map:
                            hadith['bengali'] = bn_map[num]
                            count += 1
                    except (ValueError, TypeError):
                        continue
                
                print(f"Added {count} Bengali translations to Volume {i}.")
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    # Also update the index file if it exists
    index_path = 'data/bukhari/bukhari_index.json'
    if os.path.exists(index_path):
        print(f"Translating {index_path}...")
        try:
            with open(index_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'hadiths' in data:
                for hadith in data['hadiths']:
                    try:
                        num = int(hadith.get('number'))
                        if num in bn_map:
                            hadith['bengali'] = bn_map[num]
                    except (ValueError, TypeError):
                        continue
            
            with open(index_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print("Index file translated.")
        except Exception as e:
            print(f"Error processing index: {e}")

if __name__ == "__main__":
    translate_files()
