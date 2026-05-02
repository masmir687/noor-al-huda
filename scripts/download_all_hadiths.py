import json
import os
import urllib.request
import re

collections = [
    {"id": "bukhari", "bn": "ben-bukhari", "en": "eng-bukhari", "ar": "ara-bukhari"},
    {"id": "muslim", "bn": "ben-muslim", "en": "eng-muslim", "ar": "ara-muslim"},
    {"id": "abudawud", "bn": "ben-abudawud", "en": "eng-abudawud", "ar": "ara-abudawud"},
    {"id": "tirmidhi", "bn": "ben-tirmidhi", "en": "eng-tirmidhi", "ar": "ara-tirmidhi"},
    {"id": "nasai", "bn": "ben-nasai", "en": "eng-nasai", "ar": "ara-nasai"},
    {"id": "ibnmajah", "bn": "ben-ibnmajah", "en": "eng-ibnmajah", "ar": "ara-ibnmajah"}
]

final_counts = {}

def clean_bengali_text(text):
    if not text: return ""
    arabic_pattern = r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0870-\u089F]+'
    text = re.sub(arabic_pattern, '', text)
    invisible_chars = r'[\u00ad\u200b\u200c\u200d\u200e\u200f\ufeff]'
    text = re.sub(invisible_chars, '', text)
    whitelist = r'[^\u0980-\u09FF\u0964\u0965a-zA-Z0-9\s\.\,\!\?\#\%\&\(\)\*\+\-\/\:\;\<\=\>\@\[\]\^\_\`\{\|\}\~\–\—\’\‘\”\“\৳]'
    text = re.sub(whitelist, '', text)
    for _ in range(3):
        text = re.sub(r'\(\s*[\.\,]*\s*\)', '', text)
        text = re.sub(r'\[\s*[\.\,]*\s*\]', '', text)
        text = re.sub(r'\{\s*[\.\,]*\s*\}', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip(' .।,:/-()[]{}').strip()

def fetch_json(slug):
    url = f"https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{slug}.json"
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed: {e}")
        return None

# --- Enrichment Logic ---
CATEGORY_MAP = {
    "Purity (Tahara)": ["ablution", "wudu", "wash", "water", "clean", "purity", "taharat", "ghusl", "bath", "tooth-stick", "siwak", "menstruation", "menses", "impurity", "urine", "stool"],
    "Prayer (Salah)": ["prayer", "salah", "rak'a", "prostration", "sujud", "imam", "mosque", "masjid", "fajr", "zuhr", "asr", "maghrib", "isha", "adhan", "iqama", "friday", "jumu'ah", "prostrate"],
    "Charity (Zakat)": ["zakat", "charity", "alms", "poor", "wealth", "gold", "silver", "sadaqah", "giving", "spend", "beggar"],
    "Fasting (Sawm)": ["fast", "ramadan", "suhoor", "iftar", "moon", "laylat", "i'tikaf", "bbreak the fast"],
    "Pilgrimage (Hajj)": ["hajj", "pilgrimage", "makkah", "ka'ba", "ihram", "tawaf", "safa", "marwa", "arafat", "mina", "umrah", "tulaifa", "stoning"],
    "Marriage & Family": ["marriage", "nikah", "divorce", "wife", "husband", "wedding", "walima", "children", "parents", "kinship", "orphan", "suckling", "dowry", "bridal"],
    "Business & Riba": ["trade", "sale", "buying", "selling", "debt", "interest", "usury", "profit", "bargain", "contract", "mortgage", "riba", "loan", "partnership", "commerce"],
    "Ethics & Manners": ["manners", "character", "truth", "lie", "parents", "neighbor", "guest", "kindness", "modesty", "shame", "anger", "envy", "pride", "backbiting", "slander", "hypocrisy", "honest"],
    "End of Times": ["resurrection", "day of judgment", "last day", "hour", "trumpet", "sign of the hour", "judgment", "reckoning", "kiamah", "qiyamah", "antichrist", "dajjal", "masih", "gog", "magog", "fitna", "trials"],
    "Faith & Creed": ["belief", "iman", "faith", "allah", "messenger", "prophet", "revelation", "shirk", "monotheism", "tawhid", "angels", "jinn", "destiny", "qadar"],
    "Knowledge": ["knowledge", "learn", "teach", "scholar", "book", "writing", "wisdom", "education", "ink"],
    "Death & Funerals": ["funeral", "death", "grave", "shrouding", "janaza", "burial", "mourning", "will", "inheritance", "legacy"],
    "Food & Halal": ["food", "eat", "drink", "meat", "honey", "date", "bread", "water", "fruit", "milk", "halal", "haram", "forbidden", "permitted", "slaughter", "sacrifice"],
    "Clothing & Decor": ["clothing", "dress", "perfume", "hair", "sleep", "etiquette", "medicine", "health", "dream", "garment", "gold", "silk", "silver", "dye", "ring"],
    "Jihad & Governance": ["jihad", "fight", "war", "battle", "sword", "martyr", "horse", "armor", "captive", "expedition", "booty", "spoils", "leader", "ruler", "caliph", "justice", "judge"],
    "Prophetic Medicine": ["medicine", "health", "disease", "cure", "honey", "cupping", "hijama", "black seed", "fever", "illness", "cauterization"]
}

TAG_MAP = {
    "halal": ["halal", "permissible", "lawful", "allowed", "permitted"],
    "haram": ["haram", "forbidden", "prohibited", "unlawful", "shirk", "sin", "major sin", "hell"],
    "sunnah": ["sunnah", "tradition", "practice", "prophet did", "messenger did", "acted", "behavior"],
    "lifestyle": ["sleep", "clothing", "perfume", "home", "eating", "drinking", "etiquette", "habit"],
    "reward": ["reward", "paradise", "jannah", "pleasure of allah", "forgiveness"],
    "food": ["bread", "meat", "dates", "honey", "milk", "water", "vinegar", "olive", "fruit"],
    "afterlife": ["grave", "hell", "paradise", "intercession", "sirat", "pond", "kawthar"],
    "social": ["neighbor", "guest", "friend", "community", "brotherhood", "peace"]
}

def extract_metadata(english_text):
    text = english_text.lower()
    
    # Extract Narrator
    narrator = "Prophet's Companion"
    match = re.search(r"Narrated\s+([^:]+)[:\.]", english_text)
    if match:
        narrator = match.group(1).strip()
        # Clean up common additions
        narrator = re.sub(r'\s*\(.*\)', '', narrator)
        narrator = re.sub(r'r\.a\.|may allah be pleased with (him|her)', '', narrator, flags=re.I).strip()
        # Ensure it's not too long
        if len(narrator) > 50: narrator = narrator[:50] + "..."
    
    # Determine Category (Collect ALL matching categories)
    found_categories = []
    for cat, keywords in CATEGORY_MAP.items():
        if any(k in text for k in keywords):
            found_categories.append(cat)
    
    # If too many, keep first 2, or default to General
    primary_category = found_categories[0] if found_categories else "General"
            
    # Determine Tags
    found_tags = []
    for tag, keywords in TAG_MAP.items():
        if any(k in text for k in keywords):
            found_tags.append(tag)
            
    # Add any extra categories as tags
    if len(found_categories) > 1:
        found_tags.extend(found_categories[1:])
    
    return narrator, primary_category, ", ".join(list(set(found_tags)))

def process_collection(coll):
    cid = coll['id']
    print(f"\n=== Processing {cid.upper()} ===")
    
    bn_data = fetch_json(coll['bn'])
    en_data = fetch_json(coll['en'])
    ar_data = fetch_json(coll['ar'])
    
    if not bn_data or not en_data or not ar_data:
        print(f"Skipping {cid} due to missing data.")
        return

    # Map Arabic and Bengali by hadithnumber
    bn_map = {int(float(h['hadithnumber'])): clean_bengali_text(h['text']) for h in bn_data['hadiths']}
    ar_map = {int(float(h['hadithnumber'])): h['text'] for h in ar_data['hadiths']}
    
    vols = {}
    all_hadiths_meta = []
    seen_numbers = {} # number -> count
    
    # Process all entries from English data
    for h in en_data['hadiths']:
        orig_num = str(h['hadithnumber'])
        
        # Handle unique numbers (sub-numbering for duplicates)
        if orig_num in seen_numbers:
            seen_numbers[orig_num] += 1
            unique_id = f"{orig_num}_{seen_numbers[orig_num]}"
        else:
            seen_numbers[orig_num] = 1
            unique_id = orig_num
            
        # Determine volume (every 500 entries)
        vol_num = (len(all_hadiths_meta) // 500) + 1
        
        en_text = h['text'].strip()
        bn_text = bn_map.get(int(float(orig_num)), "")
        ar_text = ar_map.get(int(float(orig_num)), "")
        
        # Extract rich metadata
        narrator, category, tags = extract_metadata(en_text)
        
        # 1. Content Object (for volume files)
        content_obj = {
            "id": unique_id,
            "number": orig_num,
            "arabic": ar_text or " (No text available) ",
            "english": en_text or " (No text available) ",
            "bengali": bn_text or " (কোন অনুবাদ উপলব্ধ নেই) "
        }

        # 2. Metadata Object (for index file)
        meta_hadith_obj = {
            "id": unique_id,
            "number": orig_num,
            "narrator": narrator,
            "grade": "Sahih", # API doesn't provide structured grade
            "vol": vol_num,
            "category": category,
            "tags": tags
        }
        
        if vol_num not in vols: vols[vol_num] = []
        vols[vol_num].append(content_obj)
        all_hadiths_meta.append(meta_hadith_obj)

    final_counts[cid] = f"{len(all_hadiths_meta):,}"
    print(f"Total: {len(all_hadiths_meta)} hadiths mapped and enriched.")

    os.makedirs(f'data/{cid}', exist_ok=True)
    
    books_meta = []
    for vol_num in sorted(vols.keys()):
        batch = vols[vol_num]
        filename = f"{cid}_v{vol_num}.json"
        with open(f'data/{cid}/{filename}', 'w', encoding='utf-8') as f:
            json.dump({"hadiths": batch}, f, ensure_ascii=False, indent=0) # Use indent=0 to save space
        
        # Min/Max numbers for display
        min_n = batch[0]['number']
        max_n = batch[-1]['number']
        
        books_meta.append({
            "number": vol_num,
            "nameEn": f"Volume {vol_num} (H: {min_n}-{max_n})",
            "nameBn": f"খণ্ড {vol_num} (হা: {min_n}-{max_n})",
            "nameAr": f"الجزء {vol_num}",
            "file": filename
        })
    
    # Save Index (Metadata Only)
    with open(f'data/{cid}/{cid}_index.json', 'w', encoding='utf-8') as f:
        json.dump({"hadiths": all_hadiths_meta}, f, ensure_ascii=False, indent=0)

    # Update Meta
    meta_path = f'data/{cid}_meta.json'
    names = {
        "muslim": ("Sahih Muslim", "صحيح مسلم", "সহীহ মুসলিম", "Imam Muslim ibn al-Hajjaj"),
        "abudawud": ("Sunan Abu Dawud", "سنন أبي داود", "সুনান আবু দাউদ", "Imam Abu Dawud"),
        "tirmidhi": ("Jami At-Tirmidhi", "جامع الترمذي", "জামি আত-তিরমিযী", "Imam Abu Isa Muhammad at-Tirmidhi"),
        "nasai": ("Sunan An-Nasai", "سنن النسائي", "সুনান আন-নাসায়ী", "Imam Ahmad an-Nasai"),
        "ibnmajah": ("Sunan Ibn Majah", "سنن ابن ماجه", "সুনান ইবনে মাজাহ", "Imam Ibn Majah"),
        "bukhari": ("Sahih Al-Bukhari", "صحيح البخاري", "সহীহ আল-বুখারী", "Imam Muhammad al-Bukhari")
    }
    
    info = names.get(cid)
    meta_obj = {
        "id": cid,
        "titleEn": info[0], "titleAr": info[1], "titleBn": info[2], "author": info[3],
        "books": books_meta,
        "indexFile": f"{cid}_index.json"
    }
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta_obj, f, ensure_ascii=False, indent=2)

def update_hadith_list():
    with open('data/hadith.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    for item in data:
        if item['id'] in final_counts:
            item['count'] = final_counts[item['id']]
    with open('data/hadith.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Updated hadith.json with correct counts.")

if __name__ == "__main__":
    for c in collections:
        process_collection(c)
    update_hadith_list()
