# Zet het logo-pad uit assets/img/logo.svg in index.html
import re, pathlib
root = pathlib.Path(__file__).parent
d = re.search(r' d="([^"]+)"', (root/'assets/img/logo.svg').read_text()).group(1)
(root/'index.html').write_text((root/'index.src.html').read_text().replace('{{LOGO_D}}', d))
print('index.html gebouwd')
