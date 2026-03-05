import os
import re

def main():
    files_to_fix = [
        ('src/components/layout/Header.tsx', 'React'),
        ('src/pages/ECHOLink.tsx', 'React'),
        ('src/pages/Home.tsx', 'React'),
        ('src/pages/Support.tsx', 'React'),
        ('src/components/partners/PartnerModal.tsx', 'cn'),
        ('src/pages/AdminPartners.tsx', 'Eye'),
        ('src/pages/AdminPartners.tsx', 'Filter'),
        ('src/pages/Home.tsx', 'ArrowRight'),
        ('src/pages/Home.tsx', 'Card')
    ]
    for filepath, symbol in files_to_fix:
        if not os.path.exists(filepath): continue
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if symbol == 'React':
            content = re.sub(r"import React(?:,|\s+from)[^\n]*\n", lambda m: m.group(0).replace("React, ", "import ") if "React," in m.group(0) else "", content)
        else:
            content = re.sub(r',\s*' + symbol + r'\b', '', content)
            content = re.sub(r'\b' + symbol + r'\s*,', '', content)
            content = re.sub(r'\{\s*' + symbol + r'\s*\}', '{ }', content)
            content = re.sub(r'import { } from [^\n]*\n', '', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    main()
