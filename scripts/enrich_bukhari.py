import json
import os

def smart_enrich_hadiths():
    data_dir = 'data/bukhari'
    
    # Define keyword mappings for automatic categorization
    keyword_map = {
        "Salah": ["prayer", "salah", "rak'a", "prostration", "sujud", "imam", "mosque", "masjid", "fajr", "zuhr", "asr", "maghrib", "isha"],
        "Wudu": ["ablution", "wudu", "wash", "water", "clean", "purity", "taharat", "ghusl", "bath"],
        "Zakat": ["zakat", "charity", "alms", "poor", "wealth", "gold", "silver"],
        "Hajj": ["hajj", "pilgrimage", "makkah", "ka'ba", "ihram", "tawaf", "safa", "marwa", "arafat"],
        "Fasting": ["fast", "ramadan", "suhoor", "iftar", "moon"],
        "Knowledge": ["knowledge", "learn", "teach", "scholar", "book", "writing"],
        "Jihad": ["jihad", "fight", "war", "battle", "sword", "martyr", "horse"],
        "Manners": ["manners", "character", "truth", "lie", "parents", "neighbor", "guest", "kindness"],
        "Kiamah": ["resurrection", "day of judgment", "last day", "hell", "paradise", "heaven", "trumpet"],
        "Dajjal": ["dajjal", "antichrist", "deceiver", "masih"],
        "Belief": ["belief", "iman", "faith", "allah", "messenger", "prophet", "revelation"]
    }

    for i in range(1, 98):
        file_path = os.path.join(data_dir, f'bukhari_{i}.json')
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'hadiths' in data:
                for hadith in data['hadiths']:
                    text = (hadith.get('english', '') + " " + hadith.get('arabic', '')).lower()
                    
                    found_category = "General"
                    found_tags = ["Sahih", "Bukhari"]
                    
                    for category, keywords in keyword_map.items():
                        if any(k in text for k in keywords):
                            found_category = category
                            found_tags.append(category)
                            # Break or continue depending on if we want multiple categories? 
                            # User said "category" (single value).
                            break 
                    
                    hadith['category'] = found_category
                    hadith['tags'] = ", ".join(found_tags)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            if i % 10 == 0 or i == 97:
                print(f"Smart processed book {i}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    smart_enrich_hadiths()
