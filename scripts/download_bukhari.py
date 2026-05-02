import urllib.request
import json
import os

print("Downloading Sahih Al-Bukhari metadata...")
# Metadata to map book numbers to names
req_meta = urllib.request.Request(
    'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-bukhari.json',
    headers={'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req_meta) as response:
        bukhari_data = json.loads(response.read().decode('utf-8'))
        print("Data downloaded.")
        
        # We need the english translation as well to build our files properly
        print("Downloading English translation...")
        req_en = urllib.request.Request(
            'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/eng-bukhari.json',
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        
        with urllib.request.urlopen(req_en) as res_en:
            bukhari_en_data = json.loads(res_en.read().decode('utf-8'))
            print("English data downloaded.")

            # Processing and matching hadiths
            hadiths_ar = bukhari_data.get('hadiths', [])
            hadiths_en = bukhari_en_data.get('hadiths', [])

            # Group hadiths by 'book' or 'reference' (if available).
            # The API usually provides: hadithnumber, arabicnumber, text, grades, reference.book
            
            books = {}
            for i, h_ar in enumerate(hadiths_ar):
                book_num = h_ar.get('reference', {}).get('book')
                if not book_num:
                    book_num = 1 # Fallback
                
                if book_num not in books:
                    books[book_num] = []

                # Find matching english
                h_en = next((item for item in hadiths_en if item.get('hadithnumber') == h_ar.get('hadithnumber')), None)
                eng_text = h_en.get('text', '') if h_en else ''

                hadith_obj = {
                    "number": h_ar.get('hadithnumber'),
                    "arabic": h_ar.get('text', ''),
                    "english": eng_text,
                    "narrator": "Varies", # API doesn't cleanly separate narrator
                    "grade": "Sahih" # All Bukhari is Sahih
                }
                books[book_num].append(hadith_obj)

            # Output the files
            os.makedirs('data', exist_ok=True)
            meta_books = []
            for book_num in sorted(books.keys()):
                file_name = f'data/bukhari_{book_num}.json'
                with open(file_name, 'w', encoding='utf-8') as f:
                    json.dump({"hadiths": books[book_num]}, f, ensure_ascii=False, indent=2)
                
                meta_books.append({
                    "number": book_num,
                    "nameEn": f"Book {book_num}",
                    "nameAr": f"كتاب {book_num}"
                })
                print(f"Generated {file_name} with {len(books[book_num])} hadiths.")

            # Write meta file
            meta_obj = {
              "id": "bukhari",
              "titleAr": "صحيح البخاري",
              "titleEn": "Sahih Al-Bukhari",
              "author": "Imam Muhammad al-Bukhari",
              "books": meta_books
            }
            with open('data/bukhari_meta.json', 'w', encoding='utf-8') as f:
                json.dump(meta_obj, f, ensure_ascii=False, indent=2)

            print("Done! All 97 books generated.")

except Exception as e:
    print(f"An error occurred: {e}")

