import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
// Portable source archive: dependencies and generated build caches are excluded.
// Python's standard-library ZIP implementation is used when available.
const candidates=[process.env.PYTHON_PATH,'python','python3'].filter(Boolean);
const python=candidates.find(p=>spawnSync(p,['--version'],{stdio:'ignore'}).status===0);
if(!python)throw new Error('Install Python 3 or set PYTHON_PATH to create the ZIP.');
if(!existsSync('QA-REPORT.md'))throw new Error('Run QA and write QA-REPORT.md before packaging.');
const code=String.raw`
from pathlib import Path
import zipfile
root=Path.cwd()
output=root/'WOK-WAVE-template.zip'
files=[p for p in root.iterdir() if p.is_file() and p.suffix in {'.json','.ts','.mjs','.md'}]
files.append(root/'.gitignore')
for folder in ['src','public','assets','assets-src','docs','showcase']:
    files.extend(p for p in (root/folder).rglob('*') if p.is_file())
for name in ['extract-frames.sh','extract-frames.mts','subset-font.mts','qa.mjs','checkpoint-a.mjs','lifecycle-qa.mjs','readme-media.mjs','optimize-menu-images.mjs','menu-images-qa.mjs','record-showcase.mjs','edit-showcase.mjs','package-template.mjs']:
    files.append(root/'scripts'/name)
for name in ['functional-report.json','lifecycle-report.json','checkpoint-a.json','checkpoint-2x.json','lighthouse-mobile.json','menu-images-report.json']:
    files.append(root/'qa'/name)
files.extend((root/'qa'/'screenshots').glob('*.png'))
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    for path in sorted(set(files)):
        archive.write(path,Path('WOK-WAVE')/path.relative_to(root))
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    print(f'{len(archive.namelist())} files; {output.stat().st_size/1_000_000:.1f} MB; archive verified: {output}')
`;
const result=spawnSync(python,['-c',code],{stdio:'inherit'});
process.exitCode=result.status??1;
