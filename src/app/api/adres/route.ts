const ILLER = [
  {_id:1,city:"Adana"},{_id:2,city:"Adıyaman"},{_id:3,city:"Afyonkarahisar"},
  {_id:4,city:"Ağrı"},{_id:5,city:"Amasya"},{_id:6,city:"Ankara"},
  {_id:7,city:"Antalya"},{_id:8,city:"Artvin"},{_id:9,city:"Aydın"},
  {_id:10,city:"Balıkesir"},{_id:11,city:"Bilecik"},{_id:12,city:"Bingöl"},
  {_id:13,city:"Bitlis"},{_id:14,city:"Bolu"},{_id:15,city:"Burdur"},
  {_id:16,city:"Bursa"},{_id:17,city:"Çanakkale"},{_id:18,city:"Çankırı"},
  {_id:19,city:"Çorum"},{_id:20,city:"Denizli"},{_id:21,city:"Diyarbakır"},
  {_id:22,city:"Edirne"},{_id:23,city:"Elazığ"},{_id:24,city:"Erzincan"},
  {_id:25,city:"Erzurum"},{_id:26,city:"Eskişehir"},{_id:27,city:"Gaziantep"},
  {_id:28,city:"Giresun"},{_id:29,city:"Gümüşhane"},{_id:30,city:"Hakkari"},
  {_id:31,city:"Hatay"},{_id:32,city:"Isparta"},{_id:33,city:"Mersin"},
  {_id:34,city:"İstanbul"},{_id:35,city:"İzmir"},{_id:36,city:"Kars"},
  {_id:37,city:"Kastamonu"},{_id:38,city:"Kayseri"},{_id:39,city:"Kırklareli"},
  {_id:40,city:"Kırşehir"},{_id:41,city:"Kocaeli"},{_id:42,city:"Konya"},
  {_id:43,city:"Kütahya"},{_id:44,city:"Malatya"},{_id:45,city:"Manisa"},
  {_id:46,city:"Kahramanmaraş"},{_id:47,city:"Mardin"},{_id:48,city:"Muğla"},
  {_id:49,city:"Muş"},{_id:50,city:"Nevşehir"},{_id:51,city:"Niğde"},
  {_id:52,city:"Ordu"},{_id:53,city:"Rize"},{_id:54,city:"Sakarya"},
  {_id:55,city:"Samsun"},{_id:56,city:"Siirt"},{_id:57,city:"Sinop"},
  {_id:58,city:"Sivas"},{_id:59,city:"Tekirdağ"},{_id:60,city:"Tokat"},
  {_id:61,city:"Trabzon"},{_id:62,city:"Tunceli"},{_id:63,city:"Şanlıurfa"},
  {_id:64,city:"Uşak"},{_id:65,city:"Van"},{_id:66,city:"Yozgat"},
  {_id:67,city:"Zonguldak"},{_id:68,city:"Aksaray"},{_id:69,city:"Bayburt"},
  {_id:70,city:"Karaman"},{_id:71,city:"Kırıkkale"},{_id:72,city:"Batman"},
  {_id:73,city:"Şırnak"},{_id:74,city:"Bartın"},{_id:75,city:"Ardahan"},
  {_id:76,city:"Iğdır"},{_id:77,city:"Yalova"},{_id:78,city:"Karabük"},
  {_id:79,city:"Kilis"},{_id:80,city:"Osmaniye"},{_id:81,city:"Düzce"},
];

const ILCELER: Record<number, {_id:number,name:string}[]> = {
  1:[{_id:101,name:"Aladağ"},{_id:102,name:"Ceyhan"},{_id:103,name:"Çukurova"},{_id:104,name:"Feke"},{_id:105,name:"İmamoğlu"},{_id:106,name:"Karaisalı"},{_id:107,name:"Karataş"},{_id:108,name:"Kozan"},{_id:109,name:"Pozantı"},{_id:110,name:"Saimbeyli"},{_id:111,name:"Sarıçam"},{_id:112,name:"Seyhan"},{_id:113,name:"Tufanbeyli"},{_id:114,name:"Yumurtalık"},{_id:115,name:"Yüreğir"}],
  2:[{_id:201,name:"Besni"},{_id:202,name:"Çelikhan"},{_id:203,name:"Gerger"},{_id:204,name:"Gölbaşı"},{_id:205,name:"Kahta"},{_id:206,name:"Merkez"},{_id:207,name:"Samsat"},{_id:208,name:"Sincik"},{_id:209,name:"Tut"}],
  3:[{_id:301,name:"Başmakçı"},{_id:302,name:"Bayat"},{_id:303,name:"Bolvadin"},{_id:304,name:"Çay"},{_id:305,name:"Çobanlar"},{_id:306,name:"Dazkırı"},{_id:307,name:"Dinar"},{_id:308,name:"Emirdağ"},{_id:309,name:"Evciler"},{_id:310,name:"Hocalar"},{_id:311,name:"İhsaniye"},{_id:312,name:"İscehisar"},{_id:313,name:"Kızılören"},{_id:314,name:"Merkez"},{_id:315,name:"Sandıklı"},{_id:316,name:"Sinanpaşa"},{_id:317,name:"Sultandağı"},{_id:318,name:"Şuhut"}],
  4:[{_id:401,name:"Diyadin"},{_id:402,name:"Doğubayazıt"},{_id:403,name:"Eleşkirt"},{_id:404,name:"Hamur"},{_id:405,name:"Merkez"},{_id:406,name:"Patnos"},{_id:407,name:"Taşlıçay"},{_id:408,name:"Tutak"}],
  5:[{_id:501,name:"Göynücek"},{_id:502,name:"Gümüşhacıköy"},{_id:503,name:"Hamamözü"},{_id:504,name:"Merkez"},{_id:505,name:"Merzifon"},{_id:506,name:"Suluova"},{_id:507,name:"Taşova"}],
  6:[{_id:601,name:"Altındağ"},{_id:602,name:"Ayaş"},{_id:603,name:"Bala"},{_id:604,name:"Beypazarı"},{_id:605,name:"Çamlıdere"},{_id:606,name:"Çankaya"},{_id:607,name:"Çubuk"},{_id:608,name:"Elmadağ"},{_id:609,name:"Etimesgut"},{_id:610,name:"Evren"},{_id:611,name:"Gölbaşı"},{_id:612,name:"Güdül"},{_id:613,name:"Haymana"},{_id:614,name:"Kalecik"},{_id:615,name:"Kazan"},{_id:616,name:"Keçiören"},{_id:617,name:"Kızılcahamam"},{_id:618,name:"Mamak"},{_id:619,name:"Nallıhan"},{_id:620,name:"Polatlı"},{_id:621,name:"Pursaklar"},{_id:622,name:"Sincan"},{_id:623,name:"Şereflikoçhisar"},{_id:624,name:"Yenimahalle"}],
  7:[{_id:701,name:"Akseki"},{_id:702,name:"Aksu"},{_id:703,name:"Alanya"},{_id:704,name:"Demre"},{_id:705,name:"Döşemealtı"},{_id:706,name:"Elmalı"},{_id:707,name:"Finike"},{_id:708,name:"Gazipaşa"},{_id:709,name:"Gündoğmuş"},{_id:710,name:"İbradı"},{_id:711,name:"Kaş"},{_id:712,name:"Kemer"},{_id:713,name:"Kepez"},{_id:714,name:"Konyaaltı"},{_id:715,name:"Korkuteli"},{_id:716,name:"Kumluca"},{_id:717,name:"Manavgat"},{_id:718,name:"Muratpaşa"},{_id:719,name:"Serik"}],
  8:[{_id:801,name:"Ardanuç"},{_id:802,name:"Arhavi"},{_id:803,name:"Borçka"},{_id:804,name:"Hopa"},{_id:805,name:"Kemalpaşa"},{_id:806,name:"Merkez"},{_id:807,name:"Murgul"},{_id:808,name:"Şavşat"},{_id:809,name:"Yusufeli"}],
  9:[{_id:901,name:"Bozdoğan"},{_id:902,name:"Buharkent"},{_id:903,name:"Çine"},{_id:904,name:"Didim"},{_id:905,name:"Efeler"},{_id:906,name:"Germencik"},{_id:907,name:"İncirliova"},{_id:908,name:"Karacasu"},{_id:909,name:"Karpuzlu"},{_id:910,name:"Koçarlı"},{_id:911,name:"Köşk"},{_id:912,name:"Kuşadası"},{_id:913,name:"Kuyucak"},{_id:914,name:"Merkez"},{_id:915,name:"Nazilli"},{_id:916,name:"Söke"},{_id:917,name:"Sultanhisar"},{_id:918,name:"Yenipazar"}],
  10:[{_id:1001,name:"Altıeylül"},{_id:1002,name:"Ayvalık"},{_id:1003,name:"Balya"},{_id:1004,name:"Bandırma"},{_id:1005,name:"Bigadiç"},{_id:1006,name:"Burhaniye"},{_id:1007,name:"Dursunbey"},{_id:1008,name:"Edremit"},{_id:1009,name:"Erdek"},{_id:1010,name:"Gömeç"},{_id:1011,name:"Gönen"},{_id:1012,name:"Havran"},{_id:1013,name:"İvrindi"},{_id:1014,name:"Karesi"},{_id:1015,name:"Kepsut"},{_id:1016,name:"Manyas"},{_id:1017,name:"Marmara"},{_id:1018,name:"Merkez"},{_id:1019,name:"Savaştepe"},{_id:1020,name:"Sındırgı"},{_id:1021,name:"Susurluk"}],
  16:[{_id:1601,name:"Büyükorhan"},{_id:1602,name:"Gemlik"},{_id:1603,name:"Gürsu"},{_id:1604,name:"Harmancık"},{_id:1605,name:"İnegöl"},{_id:1606,name:"İznik"},{_id:1607,name:"Karacabey"},{_id:1608,name:"Keles"},{_id:1609,name:"Kestel"},{_id:1610,name:"Mudanya"},{_id:1611,name:"Mustafakemalpaşa"},{_id:1612,name:"Nilüfer"},{_id:1613,name:"Orhaneli"},{_id:1614,name:"Orhangazi"},{_id:1615,name:"Osmangazi"},{_id:1616,name:"Yenişehir"},{_id:1617,name:"Yıldırım"}],
  20:[{_id:2001,name:"Acıpayam"},{_id:2002,name:"Babadağ"},{_id:2003,name:"Baklan"},{_id:2004,name:"Bekilli"},{_id:2005,name:"Beyağaç"},{_id:2006,name:"Bozkurt"},{_id:2007,name:"Buldan"},{_id:2008,name:"Çal"},{_id:2009,name:"Çameli"},{_id:2010,name:"Çardak"},{_id:2011,name:"Çivril"},{_id:2012,name:"Güney"},{_id:2013,name:"Honaz"},{_id:2014,name:"Kale"},{_id:2015,name:"Merkezefendi"},{_id:2016,name:"Pamukkale"},{_id:2017,name:"Sarayköy"},{_id:2018,name:"Serinhisar"},{_id:2019,name:"Tavas"}],
  27:[{_id:2701,name:"Araban"},{_id:2702,name:"İslahiye"},{_id:2703,name:"Karkamış"},{_id:2704,name:"Nizip"},{_id:2705,name:"Nurdağı"},{_id:2706,name:"Oğuzeli"},{_id:2707,name:"Şahinbey"},{_id:2708,name:"Şehitkamil"},{_id:2709,name:"Yavuzeli"}],
  31:[{_id:3101,name:"Altınözü"},{_id:3102,name:"Antakya"},{_id:3103,name:"Belen"},{_id:3104,name:"Dörtyol"},{_id:3105,name:"Erzin"},{_id:3106,name:"Hassa"},{_id:3107,name:"İskenderun"},{_id:3108,name:"Kırıkhan"},{_id:3109,name:"Kumlu"},{_id:3110,name:"Payas"},{_id:3111,name:"Reyhanlı"},{_id:3112,name:"Samandağ"},{_id:3113,name:"Yayladağı"}],
  34:[{_id:3401,name:"Adalar"},{_id:3402,name:"Arnavutköy"},{_id:3403,name:"Ataşehir"},{_id:3404,name:"Avcılar"},{_id:3405,name:"Bağcılar"},{_id:3406,name:"Bahçelievler"},{_id:3407,name:"Bakırköy"},{_id:3408,name:"Başakşehir"},{_id:3409,name:"Bayrampaşa"},{_id:3410,name:"Beşiktaş"},{_id:3411,name:"Beykoz"},{_id:3412,name:"Beylikdüzü"},{_id:3413,name:"Beyoğlu"},{_id:3414,name:"Büyükçekmece"},{_id:3415,name:"Çatalca"},{_id:3416,name:"Çekmeköy"},{_id:3417,name:"Esenler"},{_id:3418,name:"Esenyurt"},{_id:3419,name:"Eyüpsultan"},{_id:3420,name:"Fatih"},{_id:3421,name:"Gaziosmanpaşa"},{_id:3422,name:"Güngören"},{_id:3423,name:"Kadıköy"},{_id:3424,name:"Kağıthane"},{_id:3425,name:"Kartal"},{_id:3426,name:"Küçükçekmece"},{_id:3427,name:"Maltepe"},{_id:3428,name:"Pendik"},{_id:3429,name:"Sancaktepe"},{_id:3430,name:"Sarıyer"},{_id:3431,name:"Silivri"},{_id:3432,name:"Sultanbeyli"},{_id:3433,name:"Sultangazi"},{_id:3434,name:"Şile"},{_id:3435,name:"Şişli"},{_id:3436,name:"Tuzla"},{_id:3437,name:"Ümraniye"},{_id:3438,name:"Üsküdar"},{_id:3439,name:"Zeytinburnu"}],
  35:[{_id:3501,name:"Aliağa"},{_id:3502,name:"Balçova"},{_id:3503,name:"Bayındır"},{_id:3504,name:"Bayraklı"},{_id:3505,name:"Bergama"},{_id:3506,name:"Beydağ"},{_id:3507,name:"Bornova"},{_id:3508,name:"Buca"},{_id:3509,name:"Çeşme"},{_id:3510,name:"Çiğli"},{_id:3511,name:"Dikili"},{_id:3512,name:"Foça"},{_id:3513,name:"Gaziemir"},{_id:3514,name:"Güzelbahçe"},{_id:3515,name:"Karabağlar"},{_id:3516,name:"Karaburun"},{_id:3517,name:"Karşıyaka"},{_id:3518,name:"Kemalpaşa"},{_id:3519,name:"Kınık"},{_id:3520,name:"Kiraz"},{_id:3521,name:"Konak"},{_id:3522,name:"Menderes"},{_id:3523,name:"Menemen"},{_id:3524,name:"Narlıdere"},{_id:3525,name:"Ödemiş"},{_id:3526,name:"Seferihisar"},{_id:3527,name:"Selçuk"},{_id:3528,name:"Tire"},{_id:3529,name:"Torbalı"},{_id:3530,name:"Urla"}],
  38:[{_id:3801,name:"Akkışla"},{_id:3802,name:"Bünyan"},{_id:3803,name:"Develi"},{_id:3804,name:"Felahiye"},{_id:3805,name:"Hacılar"},{_id:3806,name:"İncesu"},{_id:3807,name:"Kocasinan"},{_id:3808,name:"Melikgazi"},{_id:3809,name:"Özvatan"},{_id:3810,name:"Pınarbaşı"},{_id:3811,name:"Sarıoğlan"},{_id:3812,name:"Sarız"},{_id:3813,name:"Talas"},{_id:3814,name:"Tomarza"},{_id:3815,name:"Yahyalı"},{_id:3816,name:"Yeşilhisar"}],
  41:[{_id:4101,name:"Başiskele"},{_id:4102,name:"Çayırova"},{_id:4103,name:"Darıca"},{_id:4104,name:"Derince"},{_id:4105,name:"Dilovası"},{_id:4106,name:"Gebze"},{_id:4107,name:"Gölcük"},{_id:4108,name:"İzmit"},{_id:4109,name:"Kandıra"},{_id:4110,name:"Karamürsel"},{_id:4111,name:"Kartepe"},{_id:4112,name:"Körfez"}],
  42:[{_id:4201,name:"Ahırlı"},{_id:4202,name:"Akören"},{_id:4203,name:"Akşehir"},{_id:4204,name:"Altınekin"},{_id:4205,name:"Beyşehir"},{_id:4206,name:"Bozkır"},{_id:4207,name:"Cihanbeyli"},{_id:4208,name:"Çeltik"},{_id:4209,name:"Çumra"},{_id:4210,name:"Derbent"},{_id:4211,name:"Derebucak"},{_id:4212,name:"Doğanhisar"},{_id:4213,name:"Emirgazi"},{_id:4214,name:"Ereğli"},{_id:4215,name:"Güneysınır"},{_id:4216,name:"Hadim"},{_id:4217,name:"Halkapınar"},{_id:4218,name:"Hüyük"},{_id:4219,name:"Ilgın"},{_id:4220,name:"Kadınhanı"},{_id:4221,name:"Karapınar"},{_id:4222,name:"Karatay"},{_id:4223,name:"Kulu"},{_id:4224,name:"Meram"},{_id:4225,name:"Sarayönü"},{_id:4226,name:"Selçuklu"},{_id:4227,name:"Seydişehir"},{_id:4228,name:"Taşkent"},{_id:4229,name:"Tuzlukçu"},{_id:4230,name:"Yalıhüyük"},{_id:4231,name:"Yunak"}],
  45:[{_id:4501,name:"Ahmetli"},{_id:4502,name:"Akhisar"},{_id:4503,name:"Alaşehir"},{_id:4504,name:"Demirci"},{_id:4505,name:"Gölmarmara"},{_id:4506,name:"Gördes"},{_id:4507,name:"Kırkağaç"},{_id:4508,name:"Köprübaşı"},{_id:4509,name:"Kula"},{_id:4510,name:"Merkez"},{_id:4511,name:"Salihli"},{_id:4512,name:"Sarıgöl"},{_id:4513,name:"Saruhanlı"},{_id:4514,name:"Selendi"},{_id:4515,name:"Soma"},{_id:4516,name:"Turgutlu"},{_id:4517,name:"Yunusemre"}],
  48:[{_id:4801,name:"Bodrum"},{_id:4802,name:"Dalaman"},{_id:4803,name:"Datça"},{_id:4804,name:"Fethiye"},{_id:4805,name:"Kavaklıdere"},{_id:4806,name:"Köyceğiz"},{_id:4807,name:"Marmaris"},{_id:4808,name:"Menteşe"},{_id:4809,name:"Milas"},{_id:4810,name:"Ortaca"},{_id:4811,name:"Seydikemer"},{_id:4812,name:"Ula"},{_id:4813,name:"Yatağan"}],
  55:[{_id:5501,name:"Alaçam"},{_id:5502,name:"Asarcık"},{_id:5503,name:"Atakum"},{_id:5504,name:"Ayvacık"},{_id:5505,name:"Bafra"},{_id:5506,name:"Canik"},{_id:5507,name:"Çarşamba"},{_id:5508,name:"Havza"},{_id:5509,name:"İlkadım"},{_id:5510,name:"Kavak"},{_id:5511,name:"Ladik"},{_id:5512,name:"Salıpazarı"},{_id:5513,name:"Tekkeköy"},{_id:5514,name:"Terme"},{_id:5515,name:"Vezirköprü"},{_id:5516,name:"Yakakent"}],
  61:[{_id:6101,name:"Akçaabat"},{_id:6102,name:"Araklı"},{_id:6103,name:"Arsin"},{_id:6104,name:"Beşikdüzü"},{_id:6105,name:"Çarşıbaşı"},{_id:6106,name:"Çaykara"},{_id:6107,name:"Dernekpazarı"},{_id:6108,name:"Düzköy"},{_id:6109,name:"Hayrat"},{_id:6110,name:"Köprübaşı"},{_id:6111,name:"Maçka"},{_id:6112,name:"Of"},{_id:6113,name:"Ortahisar"},{_id:6114,name:"Sürmene"},{_id:6115,name:"Şalpazarı"},{_id:6116,name:"Tonya"},{_id:6117,name:"Vakfıkebir"},{_id:6118,name:"Yomra"}],
};

// Geri kalan iller için merkez ilçe ekle
for (let i = 1; i <= 81; i++) {
  if (!ILCELER[i]) {
    ILCELER[i] = [{_id: i * 100, name: "Merkez"}];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tip = searchParams.get("tip");
  const id = searchParams.get("id");

  if (tip === "iller") {
    return Response.json(ILLER);
  }

  if (tip === "ilceler" && id) {
    const ilceler = ILCELER[Number(id)] ?? [];
    return Response.json({ towns: ilceler });
  }

  if (tip === "mahalleler" && id) {
    // Mahalleler için Supabase'den çek
    return Response.json({ districts: [] });
  }

  return Response.json({ error: "Geçersiz istek" }, { status: 400 });
}