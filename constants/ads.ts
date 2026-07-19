// 画像・リンク・計測ピクセルは A8 サーバー直リンクで、サイズ改変・最適化は規約上禁止。
// そのため next/image ではなく生の <img> をネイティブ寸法で表示する（AdBannerCarousel 参照）。
export interface AdBanner {
  /** アフィリエイトリンク先 (px.a8.net) */
  href: string;
  /** バナー画像 (A8 サーバー直リンク・改変不可) */
  imgSrc: string;
  /** インプレッション計測ピクセル (1x1 gif) */
  pixelSrc: string;
  /** バナー実寸 (px)。この寸法のまま表示する */
  width: number;
  height: number;
}

export const AD_BANNERS: AdBanner[] = [
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+8MSBBU+2Y0E+HWI5T",
    imgSrc:
      "https://www24.a8.net/svt/bgt?aid=260712043522&wid=002&eno=01&mid=s00000013739003007000&mc=1",
    pixelSrc: "https://www11.a8.net/0.gif?a8mat=4B7YP7+8MSBBU+2Y0E+HWI5T",
    width: 336,
    height: 280,
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+8G8JOA+328C+25FMXT",
    imgSrc:
      "https://www20.a8.net/svt/bgt?aid=260712043511&wid=002&eno=01&mid=s00000014286013006000&mc=1",
    pixelSrc: "https://www11.a8.net/0.gif?a8mat=4B7YP7+8G8JOA+328C+25FMXT",
    width: 300,
    height: 250,
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+9E695M+4CRM+1BNBJL",
    imgSrc:
      "https://www27.a8.net/svt/bgt?aid=260712043568&wid=002&eno=01&mid=s00000020317008003000&mc=1",
    pixelSrc: "https://www15.a8.net/0.gif?a8mat=4B7YP7+9E695M+4CRM+1BNBJL",
    width: 300,
    height: 250,
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+8IMA3E+1USQ+4GVBNL",
    imgSrc:
      "https://www27.a8.net/svt/bgt?aid=260712043515&wid=002&eno=01&mid=s00000008657027020000&mc=1",
    pixelSrc: "https://www14.a8.net/0.gif?a8mat=4B7YP7+8IMA3E+1USQ+4GVBNL",
    width: 300,
    height: 250,
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+8IMA3E+1USQ+4GROHD",
    imgSrc:
      "https://www20.a8.net/svt/bgt?aid=260712043515&wid=002&eno=01&mid=s00000008657027003000&mc=1",
    pixelSrc: "https://www10.a8.net/0.gif?a8mat=4B7YP7+8IMA3E+1USQ+4GROHD",
    width: 300,
    height: 250,
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+8JT5AY+4CRM+ZRXQP",
    imgSrc:
      "https://www23.a8.net/svt/bgt?aid=260712043517&wid=002&eno=01&mid=s00000020317006009000&mc=1",
    pixelSrc: "https://www19.a8.net/0.gif?a8mat=4B7YP7+8JT5AY+4CRM+ZRXQP",
    width: 300,
    height: 250,
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+8HFEVU+4RWC+HXKQP",
    imgSrc:
      "https://www24.a8.net/svt/bgt?aid=260712043513&wid=002&eno=01&mid=s00000022278003012000&mc=1",
    pixelSrc: "https://www18.a8.net/0.gif?a8mat=4B7YP7+8HFEVU+4RWC+HXKQP",
    width: 300,
    height: 250,
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7YP7+8XI47U+4GNW+TSBE9",
    imgSrc:
      "https://www27.a8.net/svt/bgt?aid=260712043540&wid=002&eno=01&mid=s00000020822005003000&mc=1",
    pixelSrc: "https://www19.a8.net/0.gif?a8mat=4B7YP7+8XI47U+4GNW+TSBE9",
    width: 300,
    height: 250,
  },
];
