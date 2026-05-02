import json
import os
import re

def standardize_narrator(name):
    if not name:
        return "Unknown"
    
    # 1. Character Normalization (Early)
    name = name.replace('ã', 'a').replace('`', "'").replace('’', "'")
    
    # 2. Truncation (Case Insensitive)
    # Truncate at common separators
    separators = [r"\sfrom\s", r"\sthat\s", r"\swho\s", r"\sreporting\s", r"\sregarding\s", r"\sasked\s", r"\ssaid\s", r"\sheard\s"]
    for sep_pat in separators:
        match = re.search(sep_pat, name, re.IGNORECASE)
        if match:
            name = name[:match.start()]
    
    # 3. Handle "and" / "or" (Case Insensitive)
    for sep_pat in [r"\sand\s", r"\sor\s"]:
        match = re.search(sep_pat, name, re.IGNORECASE)
        if match:
            name = name[:match.start()]

    # 4. Basic Cleaning
    # Remove leading/trailing dots, quotes, spaces, non-alpha (mostly)
    name = re.sub(r'^[^a-zA-Z\']+|[^a-zA-Z\']+$', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    
    # 5. Mapping (Canonical Names)
    # Use a normalization for keys (no quotes, no dashes, lowercase)
    def normalize_for_key(s):
        return re.sub(r'[^a-z0-9]', '', s.lower())

    mapping = {
        "Aisha": "'Aisha",
        "Aishah": "'Aisha",
        "Abu Huraira": "Abu Huraira",
        "Abu Hurairah": "Abu Huraira",
        "Anas bin Malik": "Anas bin Malik",
        "Anas": "Anas bin Malik",
        "Ibn Umar": "Ibn 'Umar",
        "Abdullah bin Umar": "Ibn 'Umar",
        "Abdullah bin 'Umar": "Ibn 'Umar",
        "Ibn Abbas": "Ibn 'Abbas",
        "Abdullah bin Abbas": "Ibn 'Abbas",
        "Abdullah bin 'Abbas": "Ibn 'Abbas",
        "Umar bin Al-Khattab": "'Umar bin Al-Khattab",
        "Umar": "'Umar bin Al-Khattab",
        "Jabir bin Abdullah": "Jabir bin 'Abdullah",
        "Jabir": "Jabir bin 'Abdullah",
        "Abu Said Al-Khudri": "Abu Said Al-Khudri",
        "Ali bin Abi Talib": "Ali bin Abi Talib",
        "Ali": "Ali bin Abi Talib",
        "Abdullah bin Amr": "Abdullah bin 'Amr",
        "Abdullah bin 'Amr": "Abdullah bin 'Amr",
        "Abdullah bin Amr bin Al-As": "Abdullah bin 'Amr",
        "Abdullah bin 'Amr bin Al-'As": "Abdullah bin 'Amr",
        "Abdullah bin 'Amr bin Al-As": "Abdullah bin 'Amr"
    }
    
    norm_name = normalize_for_key(name)
    for key, canonical in mapping.items():
        if norm_name == normalize_for_key(key):
            return canonical

    # If it's a very long name that survived, it's likely a sentence
    if len(name) > 40:
         # Try one more aggressive truncation if it has ' told ' etc
         for word in [" told ", " informed ", " went ", " related "]:
             if word in name.lower():
                 name = name.lower().split(word)[0].strip()
                 # Re-run mapping on shorter name
                 norm_name = normalize_for_key(name)
                 for key, canonical in mapping.items():
                    if norm_name == normalize_for_key(key):
                        return canonical

    return name

def fix_narrators_standardized():
    data_dir = 'data/bukhari'
    pattern = re.compile(r'Narrated\s+([^:(]+)')
    
    for i in range(1, 98):
        file_path = os.path.join(data_dir, f'bukhari_{i}.json')
        if not os.path.exists(file_path): continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'hadiths' in data:
                for hadith in data['hadiths']:
                    eng = hadith.get('english', '')
                    match = pattern.search(eng)
                    raw_name = match.group(1).strip() if match else hadith.get('narrator', 'Unknown')
                    hadith['narrator'] = standardize_narrator(raw_name)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            if i % 20 == 0 or i == 97: print(f"Pass 2: Standardized book {i}")
        except Exception as e: print(f"Error {file_path}: {e}")

if __name__ == "__main__":
    fix_narrators_standardized()
