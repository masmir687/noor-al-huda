import json
import os
import re

def natural_sort_key(s):
    return [float(text) if re.match(r'^\d+(\.\d+)?$', text) else text.lower()
            for text in re.split(r'(\d+(?:\.\d+)?)', s)]

def reorganize_bukhari():
    summary_file = 'bukhari_summary.txt'
    data_dir = 'data'
    new_data_dir = os.path.join(data_dir, 'bukhari')
    
    if not os.path.exists(new_data_dir):
        os.makedirs(new_data_dir)
        print(f"Created directory: {new_data_dir}")

    # 1. Parse summary to know where each hadith is
    hadith_map = {} # hadith_num_str -> original_book_num
    original_counts = {} # original_book_num -> count
    
    with open(summary_file, 'r', encoding='utf-8') as f:
        for line in f:
            if ':' not in line: continue
            book_num_str, hadiths_str = line.split(':', 1)
            book_num = int(book_num_str.strip())
            h_nums = [n.strip() for n in hadiths_str.split(',') if n.strip()]
            original_counts[book_num] = len(h_nums)
            for h_num in h_nums:
                hadith_map[h_num] = book_num

    # 2. Sort hadith numbers naturally
    sorted_h_nums = sorted(hadith_map.keys(), key=natural_sort_key)
    print(f"Total unique hadiths found: {len(sorted_h_nums)}")

    # 3. Load all original hadiths into memory (cached by book)
    book_cache = {}
    def get_hadith_data(h_num, b_num):
        if b_num not in book_cache:
            file_path = os.path.join(data_dir, f'bukhari_{b_num}.json')
            with open(file_path, 'r', encoding='utf-8') as f:
                book_cache[b_num] = json.load(f)['hadiths']
        
        # Find the hadith by its original number (as string or int)
        for h in book_cache[b_num]:
            if str(h.get('number')) == h_num:
                return h
        return None

    # 4. Collect all hadith data in order
    all_hadiths_ordered = []
    for i, h_num in enumerate(sorted_h_nums):
        b_num = hadith_map[h_num]
        h_data = get_hadith_data(h_num, b_num)
        if h_data:
            # Create a copy and update number to be sequential
            new_h = h_data.copy()
            new_h['number'] = i + 1
            all_hadiths_ordered.append(new_h)
        else:
            print(f"Warning: Could not find hadith {h_num} in book {b_num}")

    # 5. Write back into 97 books using original distribution
    current_idx = 0
    for b_num in range(1, 98):
        count = original_counts.get(b_num, 0)
        if count == 0:
            print(f"Warning: Original book {b_num} had no hadiths. Skipping.")
            continue
        
        new_book_hadiths = all_hadiths_ordered[current_idx : current_idx + count]
        current_idx += count
        
        output_file = os.path.join(new_data_dir, f'bukhari_{b_num}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({"hadiths": new_book_hadiths}, f, ensure_ascii=False, indent=2)
            
    print("Re-organization complete.")

if __name__ == "__main__":
    reorganize_bukhari()
