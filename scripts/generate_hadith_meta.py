import urllib.request
import json
import os

collections = [
    {"id": "muslim", "nameEn": "Sahih Muslim", "nameAr": "صحيহ مسلم", "nameBn": "সহীহ মুসলিম", "author": "Imam Muslim ibn al-Hajjaj"},
    {"id": "abudawud", "nameEn": "Sunan Abu Dawud", "nameAr": "سنن أبي داود", "nameBn": "সুনান আবু দাউদ", "author": "Imam Abu Dawud"},
    {"id": "tirmidhi", "nameEn": "Jami At-Tirmidhi", "nameAr": "جامع الترمذي", "nameBn": "জামি আত-তিরমিযী", "author": "Imam Abu Isa Muhammad at-Tirmidhi"},
    {"id": "nasai", "nameEn": "Sunan An-Nasai", "nameAr": "سنن النسائي", "nameBn": "সুনান আন-নাসায়ী", "author": "Imam Ahmad an-Nasai"},
    {"id": "ibnmajah", "nameEn": "Sunan Ibn Majah", "nameAr": "سنন ابن ماجه", "nameBn": "সুনান ইবনে মাজাহ", "author": "Imam Ibn Majah"}
]

def generate_meta():
    for coll in collections:
        cid = coll['id']
        meta_path = f'data/{cid}_meta.json'
        
        print(f"Generating metadata for {coll['nameEn']}...")
        
        # We'll create a basic structure. Since we don't have the individual volume files yet,
        # we'll list a "Volume 1" as a placeholder or fetch the sections if possible.
        # For simplicity and to fix the immediate UI issue, let's just create the meta object.
        
        meta_obj = {
            "id": cid,
            "titleAr": coll['nameAr'],
            "titleEn": coll['nameEn'],
            "titleBn": coll['nameBn'],
            "author": coll['author'],
            "books": [
                {
                    "number": 1,
                    "nameEn": "Volume 1",
                    "nameBn": "খণ্ড ১",
                    "nameAr": "الجزء 1",
                    "file": f"{cid}_v1.json"
                }
            ],
            "indexFile": f"{cid}_index.json"
        }
        
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump(meta_obj, f, ensure_ascii=False, indent=2)
        
        print(f"Created {meta_path}")

if __name__ == "__main__":
    generate_meta()
