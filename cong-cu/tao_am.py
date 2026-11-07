"""Tạo tiếng hát cho Công Viên Cầu Vồng bằng ZeroTTS (chạy trên máy, không cần mạng sau khi tải mô hình).

Mỗi chữ (âm tiết) được đọc riêng, cắt khoảng lặng, cân âm lượng, rồi ghép vào một file am/kinh.mp3.
am/kinh.json ghi vị trí từng chữ trong file. Trang phát từng chữ một theo nhịp trống, kèm nốt nhạc.

Chạy:  PYTHONUTF8=1 <python có zerotts> cong-cu/tao_am.py [giọng]
"""
import json, re, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from zerotts import ZeroTTS

GOC = Path(__file__).resolve().parent.parent
GIONG = sys.argv[1] if len(sys.argv) > 1 else 'hamy'
SR_RA = 24000
KHOANG = 0.12  # giây lặng giữa các chữ trong file ghép

data = (GOC / 'data.js').read_text(encoding='utf-8')
kinh = data.split('window.QUA')[0]
cau = re.findall(r"'([^']+)'", kinh)
cau += []  # bài hát, đếm số, tạm biệt đều nằm trong data.js


def khoa(tu):
    return re.sub(r'[^\wÀ-ỹ]', '', tu.lower())


chu = []
for c in cau:
    for tu in c.split():
        k = khoa(tu)
        if k and k not in chu:
            chu.append(k)
print('Số chữ cần đọc:', len(chu))

tts = ZeroTTS.from_pretrained('zeroweight-ai/ZeroTTS')
sr = tts.sample_rate


def cat_lang(a):
    e = np.abs(a)
    nguong = max(1e-3, e.max() * 0.04)
    i = np.where(e > nguong)[0]
    if not len(i):
        return a
    return a[max(0, i[0] - int(.01 * sr)): i[-1] + int(.05 * sr)]


doan, vi_tri, t = [], {}, 0.0
for n, k in enumerate(chu):
    tot = None
    for lan in range(4):
        a = cat_lang(tts.synthesize(k.capitalize() + '.', voice=GIONG).reshape(-1))
        dai = len(a) / sr
        if 0.15 <= dai <= 0.95:
            tot = a
            break
        tot = a if tot is None or abs(dai - 0.45) < abs(len(tot) / sr - 0.45) else tot
    a = tot
    # cân âm lượng theo RMS rồi chặn đỉnh
    rms = np.sqrt(np.mean(a ** 2)) or 1e-6
    a = a * (0.12 / rms)
    a = np.clip(a, -0.95, 0.95)
    # vuốt hai đầu cho khỏi lụp bụp
    m = min(len(a) // 4, int(.008 * sr))
    if m:
        a[:m] *= np.linspace(0, 1, m)
        a[-m:] *= np.linspace(1, 0, m)
    a = resample_poly(a, SR_RA, sr).astype(np.float32)
    vi_tri[k] = [round(t, 4), round(len(a) / SR_RA, 4)]
    doan += [a, np.zeros(int(KHOANG * SR_RA), np.float32)]
    t += len(a) / SR_RA + KHOANG
    print(f'{n + 1}/{len(chu)} {k} {len(a) / SR_RA:.2f}s', flush=True)

(GOC / 'am').mkdir(exist_ok=True)
sf.write(GOC / 'am' / 'kinh.mp3', np.concatenate(doan), SR_RA, format='MP3', subtype='MPEG_LAYER_III')
(GOC / 'am' / 'kinh.json').write_text(json.dumps({'giong': GIONG, 'chu': vi_tri}, ensure_ascii=False), encoding='utf-8')
print('Xong:', round(t, 1), 'giây')
