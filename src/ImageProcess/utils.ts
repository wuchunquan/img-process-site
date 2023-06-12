function rgb2hsl(r:number,g:number,b:number):[number,number,number]{
    let R=0,G=0,B=0,Max=0,Min=0,H=0, S=0, L=0,a=0,k=0,D=0;
    R = r;
    G = g;
    B = b;
    Max = Math.max(R,Math.max(G,B));
    Min = Math.min(R,Math.min(G,B));
    L=(Max + Min)/2
    D = Max - Min;

    if (D !== 0) {
        S = (L === 0 || L === 1) ? 0 : (Max - L) / Math.min(L, 1 - L);
        if(Max==R){
            H = (G - B) / D + (G < B ? 6 : 0);
        } else if(Max==G){
            H = (B - R) / D + 2;
        } else if(Max==B){
            H = (R - G) / D + 4;
        }
        H = H /6;
    }
    return [H,S,L]
}

function rgb2hsv(r:number,g:number,b:number):[number,number,number]{
    let R=0,G=0,B=0,Max=0,Min=0,H=0, S=0, L=0,a=0,k=0,D=0,V=0;
    R = r;
    G = g;
    B = b;
    Max = Math.max(R,Math.max(G,B));
    Min = Math.min(R,Math.min(G,B));
    L=(Max + Min)/2
    D = Max - Min;
    if (D !== 0) {
        S = (L === 0 || L === 1) ? 0 : (Max - L) / Math.min(L, 1 - L);
        if(Max==R){
            H = (G - B) / D + (G < B ? 6 : 0);
        }else if(Max==G){
            H = (B - R) / D + 2;
        }else if(Max==B){
            H = (R - G) / D + 4;
        }
        H = H /6;
    }
    V = L + S * Math.min(L, 1 - L);
    S= V === 0? 0 : 2 * (1 - L / V)
    return [H,S,V]
}
export {rgb2hsl,rgb2hsv}