import json
import os

def summarize_bukhari():
    output_file = 'bukhari_summary.txt'
    data_dir = 'data'
    
    with open(output_file, 'w', encoding='utf-8') as f_out:
        for i in range(1, 98):
            file_path = os.path.join(data_dir, f'bukhari_{i}.json')
            if not os.path.exists(file_path):
                print(f"Warning: {file_path} not found.")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f_in:
                    data = json.load(f_in)
                    hadiths = data.get('hadiths', [])
                    numbers = [str(h.get('number')) for h in hadiths if h.get('number') is not None]
                    
                    if numbers:
                        line = f"{i}: {', '.join(numbers)}\n"
                        f_out.write(line)
                    else:
                        f_out.write(f"{i}: No hadiths found\n")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    summarize_bukhari()
