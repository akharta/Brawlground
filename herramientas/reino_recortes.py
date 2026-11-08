# Recorta cada lugar del fondo del reino (assets/reino/reino_fondo.png) usando las piezas sueltas como guía:
# encaja cada pieza, sigue el contorno azul marino del propio fondo y guarda docs/img/reino/sel_<lugar>.png.
# Necesita match.json (posición de cada pieza sobre el fondo). Uso: python3 herramientas/reino_recortes.py desde assets/reino
import numpy as np, json
from PIL import Image
from scipy import ndimage
S='/tmp/claude-0/-home-user/722dfb01-0ab4-5431-b832-a5b93d00f5d6/scratchpad/'
m=json.load(open('match.json'))
RECT={'trono':(222,0,866,560),'cripta':(10,430,425,640),'sanctum':(760,240,1060,645),'consulado':(352,648,735,1005),'cuartel':(712,700,1086,1062),'taberna':(0,690,356,1022),'murallas':(226,1080,862,1448)}
bg=Image.open('reino_fondo.png').convert('RGBA'); W,H=bg.size; arr=np.asarray(bg).astype(np.float32)/255
mx=arr[...,:3].max(-1); dark=mx<0.36
prev=Image.new('RGBA',(W,H),(30,30,40,255)); out={}
for n,(x,y,w,h,d) in m.items():
    sp=Image.open(n+'.png'); a=sp.getchannel('A').point(lambda v:255 if v>128 else 0); sp=sp.crop(a.getbbox()).resize((w,h))
    full=Image.new('L',(W,H),0); full.paste(sp.getchannel('A'),(x,y)); core=ndimage.binary_dilation(np.asarray(full)>128,iterations=3)
    x0,y0,x1,y1=RECT[n]; R=np.zeros((H,W),bool); R[y0:y1,x0:x1]=True
    nd=(~dark)&R
    lab,nl=ndimage.label(nd)
    border=R & ~ndimage.binary_erosion(R,iterations=1)
    keep=np.zeros((H,W),bool)
    sizes=ndimage.sum(np.ones_like(lab),lab,range(1,nl+1)); ov=ndimage.sum(core,lab,range(1,nl+1)); tb=ndimage.sum(border,lab,range(1,nl+1))
    for i in range(nl):
        f=ov[i]/max(1,sizes[i])
        if (tb[i]==0 and f>0.35) or (tb[i]>0 and f>0.8): keep|= lab==i+1
    keep|= ndimage.binary_dilation(keep,iterations=4)&dark&R
    keep|= ndimage.binary_erosion(np.asarray(full)>128,iterations=9)&R
    keep=ndimage.binary_fill_holes(keep)
    if n!='cripta':
        rgb=arr[...,:3]; mn=rgb.min(-1); dd=mx-mn+1e-9; r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]
        hue=np.where(mx==r,((g-b)/dd)%6,np.where(mx==g,(b-r)/dd+2,(r-g)/dd+4))/6
        green=(hue>0.17)&(hue<0.45)&((mx-mn)/(mx+1e-9)>0.35)&(mx>0.3)
        gl,gn=ndimage.label(green&keep); 
        if gn: keep&=~np.isin(gl,[i+1 for i,sz in enumerate(ndimage.sum(green&keep,gl,range(1,gn+1))) if sz>30])
        keep=ndimage.binary_opening(keep,iterations=2)
    lab2,n2=ndimage.label(keep); 
    if n2>1:
        sz=ndimage.sum(keep,lab2,range(1,n2+1)); keep=np.isin(lab2,[i+1 for i,s in enumerate(sz) if s>800])
    al=(ndimage.gaussian_filter(keep.astype(np.float32),0.6)*255).clip(0,255).astype(np.uint8)
    rgba=np.asarray(bg).copy(); rgba[...,3]=al
    im=Image.fromarray(rgba); bb=Image.fromarray(al).point(lambda v:255 if v>20 else 0).getbbox(); cut=im.crop(bb)
    k=min(1, 560/max(cut.size))
    cut.resize((round(cut.width*k),round(cut.height*k)),Image.LANCZOS).quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save('/home/user/brawlground/docs/img/reino/sel_'+n+'.png',optimize=True)
    out[n]=[round(bb[0]/W*100,3),round(bb[1]/H*100,3),round((bb[2]-bb[0])/W*100,3),round((bb[3]-bb[1])/H*100,3)]
    prev.alpha_composite(im)
prev.resize((W//2,H//2)).save(S+'cut_prev3.png'); print(json.dumps(out))
