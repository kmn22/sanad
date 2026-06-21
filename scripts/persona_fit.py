#!/usr/bin/env python3
"""Sanad persona-fit matrix — horizontal comparison chart.
Shows how Sanad serves 4 user personas across 5 capability dimensions.
"""
import matplotlib.font_manager as fm
fm.fontManager.addfont('/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf')
fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams['font.sans-serif'] = ['Noto Sans SC', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# Personas (rows) x Capabilities (columns)
# Score 0-5: 0=useless, 5=core daily use
personas = ['محامٍ خاص', 'محلل قانوني', 'طالب حقوق', 'مواطن / شخص عام']
capabilities = [
    'إدارة القضايا\nوالعملاء',
    'تتبع الامتثال\nوالتجديدات',
    'الفوترة\nوساعات العمل',
    'الموجز اليومي\nللأنظمة',
    'إدارة المستندات\nوالعقود',
]

# Score matrix [persona][capability]
scores = np.array([
    [5, 5, 5, 5, 5],   # محامٍ خاص — كل ميزة جوهرية
    [4, 4, 2, 5, 4],   # محلل قانوني — الفوترة أقل أهمية
    [2, 2, 1, 5, 3],   # طالب حقوق — الموجز اليومي أهم شيء
    [1, 3, 0, 4, 1],   # شخص عام — فقط الموجز وبعض الامتثال الشخصي
])

fig, ax = plt.subplots(figsize=(13, 6.5), constrained_layout=True)

# Heatmap with custom colormap (white → emerald)
from matplotlib.colors import LinearSegmentedColormap
cmap = LinearSegmentedColormap.from_list(
    'sanad', ['#F7F9F5', '#D1E7D8', '#7BC093', '#2D8B57', '#0F5132']
)

im = ax.imshow(scores, cmap=cmap, aspect='auto', vmin=0, vmax=5)

# Ticks
ax.set_xticks(np.arange(len(capabilities)))
ax.set_xticklabels(capabilities, fontsize=11, fontweight='medium')
ax.set_yticks(np.arange(len(personas)))
ax.set_yticklabels(personas, fontsize=12, fontweight='semibold')

# Move x-axis labels to top
ax.xaxis.tick_top()
ax.xaxis.set_label_position('top')

# Annotate cells with score + descriptor
descriptors = {
    5: 'أساسي',
    4: 'مفيد',
    3: 'ثانوي',
    2: 'هامشي',
    1: 'نادراً',
    0: 'لا يستخدم',
}
for i in range(len(personas)):
    for j in range(len(capabilities)):
        s = scores[i, j]
        color = 'white' if s >= 4 else '#1a3a28'
        ax.text(j, i, f'{s}\n{descriptors[s]}',
                ha='center', va='center',
                fontsize=11, fontweight='semibold', color=color)

# Grid
ax.set_xticks(np.arange(len(capabilities)+1) - .5, minor=True)
ax.set_yticks(np.arange(len(personas)+1) - .5, minor=True)
ax.grid(which='minor', color='white', linewidth=3)
ax.tick_params(which='minor', length=0)
ax.tick_params(which='major', length=0)

# Remove spines
for spine in ax.spines.values():
    spine.set_visible(False)

# Colorbar
cbar = fig.colorbar(im, ax=ax, shrink=0.6, pad=0.02)
cbar.set_ticks([0, 1, 2, 3, 4, 5])
cbar.set_ticklabels(['لا يستخدم', 'نادراً', 'هامشي', 'ثانوي', 'مفيد', 'أساسي'])
cbar.ax.tick_params(labelsize=10)

# Title
fig.suptitle('سند — مدى الفائدة لكل شريحة',
             fontsize=18, fontweight='bold', y=1.02, color='#0F5132')
ax.set_title('كلما اشتد اللون الأخضر، زادت أهمية المنصة لهذه الشريحة',
             fontsize=11, color='#6b7280', pad=12, fontstyle='italic')

# RTL: invert x-axis so reading goes right-to-left
ax.invert_xaxis()

plt.savefig('/home/z/my-project/download/sanad-persona-fit.png',
            dpi=200, bbox_inches='tight', facecolor='white')
print('OK: /home/z/my-project/download/sanad-persona-fit.png')
