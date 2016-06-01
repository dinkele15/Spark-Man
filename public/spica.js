//Uvodna spica
var

//Tekst koji se pojavljuje u uvodnoj spici
tekst = ["One man...","One cesta...","1 GUY!!!","Actualy two guys","Second pair",
		"They will fight","Battery...","And even sabirnica u.u","Don't miss this","THE GUYS :O"],

//Promjene po x i y, kako bi mogao kontrolirati pojavu teksta na canvasu, na pravom mjestu
x_pozicije_po_vremenu = [350,200,200,550,550,450,350,500,500,350],
y_pozicije_po_vremenu = [-100,100,-100,-100,-100,-100,-100,100,-100,100],

//Dali da tekst koji se pojavi kod uvodne spice ide u ljevo ili desno
vrste_prom = [10, -10, 10, 10, 10, -10, 10, -10, 10,-10],

//Sluzi za prelazak preko svih gore nizova, te niza 'slikice_za_animaciju'
brojac_slicica = 0,

//Ova varijabila se odnosi na rendering, pomalo ga svaki put nestaje bijlog teksta jer mu se Alpha vrijednost
//smanje, rgba --> a Alpha ili Opacity; prozirnost
animacija_spice = 1,

//Bez ove varijable bi islo direktno na tekst, ali trebaju nam i slike izmedju tekstova
uvjet_za_animaciju = true,

//Slike izmedju tekstova
slikice_za_animaciju = [moj_lik[3], moja_pozadina, zeleni_ciko_1, neprijatelji[0], neprijatelji[1], mobitel_slika, baterija_slika,
						sabirnica_slika],

//Varijabla koja ne prelazi 100 ili ne pada ispod -100
pomak_spice = 10;

//spica() se poziva ako je trenutno_stanje_igre === stanja.Spica
function spica(){

		//Ako je fps varijabla dijeljiva sa 10, animacija_spice se smanji za 0.1, a to je Alpha vrijednost teksta
		//Te se pomak spice poveca odnosno smanji u zavisnosti sto je treutna varijabla brojac_slicica, tj.iz niza se
		//Uzima vrsta promjene (-10 ili 10)(lijevo ili desno)
		if(fps % 10 == 0){
			animacija_spice -= 0.1;
			pomak_spice += vrste_prom[brojac_slicica];
		}
		
		/*
			Ako je uvjet za animaciju true, renderujemo prvo crni pravokutnik kao pozadinu, te promjenimo fill na bijelo sa
			opacitiem, i stavimo font na 100px Arial.
		*/
		if(uvjet_za_animaciju){
			ctx.fillStyle = "black";
			ctx.fillRect(0,0, c_width, c_height);
			ctx.fillStyle = "rgba(255,255,255," + animacija_spice + ")";
			ctx.font = "100px Arial";

			/*
				ctx.fillText renderuje tekst na podlogu crnu, crni pravokutnik. prvi parametar je element iz niza tekst
				drugi je polovina sirine canvasa - x_pozicija koju smo htjeli. Neki tekstovi radi duljine prelaze van canvasa,
				zbog toga sam rucno odredjivao mjesto teksta na canvasu, mjesto pojedinog teksta. I jos se na to dodaje pomak spice
				koji moze biti 10 pa 20 pa 30 do 100 ili 10, 0, -10 do -100. Jedino je pomak_spice utjece na poziciju x teksta.
				Treci parametar je polovina visine canvasa + trenutni element niza y_pozicije_po_vremenu
			 */

			ctx.fillText(tekst[brojac_slicica], c_width/2 - x_pozicije_po_vremenu[brojac_slicica] + pomak_spice, c_height/2 + y_pozicije_po_vremenu[brojac_slicica]);
			/*
				Gornji tekst se renderuje svejedno, ali kod odredjenog teksta, maleni ulomak se renderuje ispod njega, zato jer
				je takav tekst pre dugacak da bi stao na canvas. Renderuje se obicno ispod njega.
			*/
			if(tekst[brojac_slicica] == "Actualy two guys"){
				ctx.fillText("but they are same u.u", c_width/2 - x_pozicije_po_vremenu[brojac_slicica] + pomak_spice + 80, c_height/2 + y_pozicije_po_vremenu[brojac_slicica] + 150);
			}else if(tekst[brojac_slicica] == "Second pair"){
				ctx.fillText("of one GUY!!!", c_width/2 - x_pozicije_po_vremenu[brojac_slicica] + pomak_spice + 80, c_height/2 + y_pozicije_po_vremenu[brojac_slicica] + 150);
			}else if(tekst[brojac_slicica] == "They will fight"){
				ctx.fillText("for mobile phone... ", c_width/2 - x_pozicije_po_vremenu[brojac_slicica] + pomak_spice + 80, c_height/2 + y_pozicije_po_vremenu[brojac_slicica] + 150);
			}else if(tekst[brojac_slicica] == "Don't miss this"){
				ctx.fillText("epic clash of...", c_width/2 - x_pozicije_po_vremenu[brojac_slicica] + pomak_spice + 80, c_height/2 + y_pozicije_po_vremenu[brojac_slicica] + 150);
			}

		}
/*
		Ako je uvjet za pomak_spice veci od 100 ili manji od -100,
		pomak_spice resetirat na 10, promjenut animacija_spice na 1 kako bi smo kasnije ponovo dobili tekst
		bijele boje sa opacity vrijednoscu 100% ili 1, provjerava se ujedno i uvjet_za_animaciju,
		Ako je true bit ce false i obratno, brojac_slicica se povecava za 1, jer nam on sluzi za pristup svakom
		elemntu deklariranog niza u spica.js . Posto je 10 animacija, ako brojac_slicica predje 10, stanje igre mjenja se
		u stanja.Menu
		*/
		if(pomak_spice > 100 || pomak_spice < -100){
			pomak_spice = 10;
			animacija_spice = 1;
			if(uvjet_za_animaciju == true){
				uvjet_za_animaciju = false;
			}else{
				uvjet_za_animaciju = true;
			}
			if(uvjet_za_animaciju){
				brojac_slicica++;
			}
			if(brojac_slicica >= 10){
				trenutno_stanje_igre = stanja.Menu;
				zvuk_1.pause();
				return false;
			}
		}


		/*
			Kada tekst zavrsi sa prijelazom, sljede slike. Slike su spremljene u niz, te se renderuje bijeli pravokutnik
			na citavome canvasu. I onda se na canvasu renderuje odredjeni frame.
			Switch case-om samo mjenjamo vrijednost brojac slicica, a ako predje 9, spica prestaje.
		*/
		if(uvjet_za_animaciju == false){
			ctx.fillStyle = "white";
			ctx.fillRect(0,0,c_width, c_height);
			switch (brojac_slicica){
				case 0:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], c_width/2 - 125, c_height/2 - 150);
					break;
				case 1:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], 0, 0);
					break;
				case 2:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], c_width/2 - 125, c_height/2 - 150);
					break;
				case 3:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], c_width/2 - 125, c_height/2 - 150);
					break;
				case 4:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], c_width/2 - 125, c_height/2 - 150);
					break;
				case 5:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], c_width/2 - 131/2, c_height/2 - 129/2);
					break;
				case 6:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], c_width/2 - 131/2, c_height/2 - 129/2);
					break;
				case 7:
					ctx.drawImage(slikice_za_animaciju[brojac_slicica], c_width/2 - 129/2, c_height/2 - 129/2);
					break;
				case 8:
					ctx.drawImage(slikice_za_animaciju[1], 0, 0);
					break;
				case 9:
					ctx.drawImage(slikice_za_animaciju[1], 0, 0);
					ctx.drawImage(slikice_za_animaciju[0], 200, c_height/2);
					ctx.drawImage(slikice_za_animaciju[3], 700, c_height/2);
					ctx.drawImage(slikice_za_animaciju[4], 900, c_height/2);
					break;
			}
		}
}
