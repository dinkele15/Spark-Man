var moja_pozadina; // Slika ulice
var moj_lik = []; // Posto je gif rastavljen od glavnog lika, sve slike se stavljaju u niz
var srca = []; // Imamo dvije vrsta srca; puna i prazna
var neprijatelji = []; // Dvije vrste neprijatelja; plavi i zeleni
var zivot; // Plavo srce
var ostalo = []; //Rekviziti u igri ostalo


moja_pozadina = new Image(); // Pravimo objekat slika od konstruktora Image
moja_pozadina.src = "spriteovi/pozadina_mala.png"; //postavljamo src kako bi imali sliku, bez src nebi mogli renderovat

/*
gif glavnog lika smo rastavili na 15 dijelova, te zatim for petljom smo punili 'moj_lik' niz
*/
for(var i = 1; i <= 15; i++){
	var dio_slika = new Image(); // Pravimo lokalni objekt Image
	dio_slika.src = "spriteovi/tmp-" + i + ".gif"; //stavljamo src
	moj_lik.push(dio_slika); //Punimo niz sa desne strane
}

//Slike srca; sluze za energiju
srce_1 = new Image();
srce_1.src = "spriteovi/puno_srce.png";
srce_2 = new Image();
srce_2.src = "spriteovi/slomljeno_srce.png";
srca.push(srce_1, srce_2);

//Slike neprijatelja; neprijatelji
zeleni_ciko = new Image();
zeleni_ciko.src = "spriteovi/cike_zelene.png";
plavi_ciko = new Image();
plavi_ciko.src = "spriteovi/ciko_plavi.png";
neprijatelji.push(zeleni_ciko, plavi_ciko);

//Predstavlja zivote u igri; plava srca
zivot = new Image();
zivot.src = "spriteovi/zivot.png";

//Zeleni ciko sam je potreban kod uvodne spice
zeleni_ciko_1 = new Image();
zeleni_ciko_1.src = "spriteovi/zeleni_ciko_1.png";

//Mobitel --> 50 bodova
mobitel_slika = new Image();
mobitel_slika.src = "spriteovi/mobitel.png";

//Baterija --> 20
baterija_slika = new Image();
baterija_slika.src = "spriteovi/baterija.png";

//Sabirnica --> Stit
sabirnica_slika = new Image();
sabirnica_slika.src = "spriteovi/sabirnica.png";

//Dolari --> 5 bodova
dolari_slika = new Image();
dolari_slika.src = "spriteovi/dolariii.png";

//Sluzi za rekvizite u igri
ostalo.push(mobitel_slika, sabirnica_slika, dolari_slika, baterija_slika);

//Zvuk kod menu i kod igre
zvuk = document.createElement("audio");
zvuk.src = "Glavna_muzika.wav";
zvuk.setAttribute("preload", "auto");
zvuk.setAttribute("controls", "none");
zvuk.style.display = "none";

play = function(){
    zvuk.play();
}
stop = function(){
    zvuk.pause();
}

zvuk_1 = document.createElement("audio");
zvuk_1.src = "Epic.wav";
zvuk_1.setAttribute("preload", "auto");
zvuk_1.setAttribute("controls", "none");
zvuk_1.style.display = "none";

play_1 = function(){
    zvuk_1.play();
}
stop_1 = function(){
    zvuk_1.pause();
}


