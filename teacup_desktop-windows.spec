# -*- mode: python -*-

block_cipher = None


a = Analysis(['teacup_desktop.py'],
             pathex=['C:\\Windows\\System32\\downlevel', 'D:\\Users\\Drew Dearing\\Desktop\\dev\\teacup-desktop'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
a.datas += [('icon.png','D:\\Users\\Drew Dearing\\Desktop\\dev\\teacup-desktop\\icon.png', "DATA")]
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
          name='teacup_desktop',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=False,
          runtime_tmpdir=None,
          console=False , icon='icon.ico')
