import os
import shutil

def generate_quran_pages():
    template_path = 'quran.html'
    output_dir = 'quran'
    
    if not os.path.exists(template_path):
        print(f"Template {template_path} not found!")
        return

    # Read the template
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Create the main quran directory
    os.makedirs(output_dir, exist_ok=True)

    # Adjust paths for 2-level depth (e.g., quran/2/index.html)
    # Replace root-relative paths with ../../ relative paths
    content = content.replace('href="css/style.css"', 'href="../../css/style.css"')
    content = content.replace('src="js/', 'src="../../js/')
    content = content.replace('href="images/favicon.svg"', 'href="../../images/favicon.svg"')
    content = content.replace('href="quran.html"', 'href="../../quran.html"')
    content = content.replace('href="hadith.html"', 'href="../../hadith.html"')
    content = content.replace('href="bookmarks.html"', 'href="../../bookmarks.html"')
    content = content.replace('href="learn.html"', 'href="../../learn.html"')
    content = content.replace('href="qa.html"', 'href="../../qa.html"')
    content = content.replace('href="videos.html"', 'href="../../videos.html"')
    content = content.replace('href="media.html"', 'href="../../media.html"')
    content = content.replace('href="index.html"', 'href="../../index.html"')

    # Fix Phosphor Icons CDN link (should stay absolute)
    content = content.replace('src="../../https://', 'src="https://')

    for i in range(1, 115):
        surah_dir = os.path.join(output_dir, str(i))
        os.makedirs(surah_dir, exist_ok=True)
        
        # Inject the Surah ID into the page
        surah_content = content.replace(
            '</head>',
            f'    <script>window.SURAH_ID = {i};</script>\n</head>'
        )
        
        output_file = os.path.join(surah_dir, 'index.html')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(surah_content)
            
    print(f"Successfully generated 114 Surah pages in /{output_dir}")

if __name__ == "__main__":
    generate_quran_pages()