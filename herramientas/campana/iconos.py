from PIL import Image; import numpy as np, json
from scipy import ndimage as nd
D='assets/campana/castillos'; O='docs/img/campana'
names={'lamina_pantano_bosque':['pantano','bosque'],'lamina_volcan_nieve':['volcan','nieve'],'lamina_praderas_desierto':['praderas','desierto']}
def hsv(a):
    rgb=a[...,:3]/255.; mx=rgb.max(2); mn=rgb.min(2); d=mx-mn+1e-9; r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]
    h=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))/6.; return h,(mx-mn)/(mx+1e-9),mx
geo={}
for sheet,(top,bot) in names.items():
    a=np.asarray(Image.open(f'{D}/{sheet}.png').convert('RGBA')).copy()
    core=a[...,3]>200
    lab,n=nd.label(nd.binary_closing(core,iterations=3)); sz=nd.sum(core,lab,range(n+1)); objs=nd.find_objects(lab)
    big=[i for i in np.argsort(-sz) if i>0 and sz[i]>20000][:4]
    for i in big:
        sl=objs[i-1]; y0,y1,x0,x1=max(0,sl[0].start-2),sl[0].stop+2,max(0,sl[1].start-2),sl[1].stop+2
        kid=top if (y0+y1)/2<512 else bot; kind='vasallo' if (x0+x1)/2<640 else 'real'
        m=nd.binary_dilation(lab==i,iterations=2)[y0:y1,x0:x1]
        c=a[y0:y1,x0:x1].copy(); c[~m,3]=0
        c[...,3]=np.where(c[...,3]>200,255,np.where(c[...,3]>60,c[...,3],0))
        cim=Image.fromarray(c); W=360 if kind=='real' else 240; s=W/cim.width; cim=cim.resize((W,round(cim.height*s)),Image.LANCZOS)
        n2=f'icono_{kid}_{kind}'; cim.save(f'{O}/{n2}.png',optimize=True); cim.save(f'{D}/{n2}.png')
        ca=np.asarray(cim).astype(float); h,s2,v=hsv(ca); pm=(h>=0.70)&(h<=0.86)&(s2>0.35)&(v>0.2)&(ca[...,3]>0)
        l2,k2=nd.label(pm); bn=[]
        for sl2 in nd.find_objects(l2):
            hh=sl2[0].stop-sl2[0].start; ww=sl2[1].stop-sl2[1].start
            if hh>ca.shape[0]*0.18 and hh>ww*1.2: bn.append([round(sl2[1].start/ca.shape[1],4),round(sl2[0].start/ca.shape[0],4),round(ww/ca.shape[1],4),round(hh/ca.shape[0],4)])
        geo[n2]={'w':cim.width,'h':cim.height,'banners':bn}
        print(n2, cim.size, len(bn),'estandartes', bn)
json.dump(geo,open(f'{O}/iconos.json','w'))
