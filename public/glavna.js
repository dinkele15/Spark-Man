var 

br_skoka = 0, // Sluzi nam za dupli skok
fps = 0, //Varijabla fps ima razne primjene, ctrl+f za biste vidjeli
trenutno_stanje_igre, //Predstavlja jedno od 4 stanja
ukupan_score = 0, //Sluzi za spremanje u ukupan skor nakon gubljenja zivota
da_ne_bjezi_score = true; //Da se skor nebi povecavao nakon sto propadnemo

//4 stanja igre
stanja = {
	Menu: 0, Game: 1, Score: 2, Spica: 3 
},
igranje = 1, //predstavlja zivote

wave = 1, //Ako je wave % 5 == 0, da se generira rekvizit
stit = 0, //Stit kada pokupimo "sabirnicu", stiti nas jedno vrijeme od neprijatelja

zadnja_animacija = 0.7, //Kada pokupimo stit da treperi zutom bojom.
prom_zadnje_animacije = -0.01, //Ovo se dodaje na zadnja_animacija, il se oduzima.

problem = 0, //Konacni skor koji se pohranjuje u JSON

c_width = 1187, //Sirina canvasa
c_height = 668; //Velicina canvasa

//startGame je prva funkcija koja se poziva, od nje dalje idu ostale. Jednom se poziva
function startGame(){
	moj_canvas.start();
}

/*
	moj_canvas:
		canvas -->  pravi element canvas
		start() --> postavlja width i height canvasa na zadane vrijednosti, i poziva metodu getContext kako bi 
					smo mogli crtati na canvas. Onda dodaje na body kao "dijete" canvas element.
					Ujedno i stavlja na window objekt keyup, keydown i click eventove.


*/
var moj_canvas = {
	canvas: document.createElement("canvas"),
	
	start: function(){
		this.canvas.width = c_width;
		this.canvas.height = c_height;
		ctx = this.canvas.getContext("2d");
		document.body.appendChild(this.canvas);
		
		window.addEventListener("keydown", function(e){

			//Na pritisak na tipku, br_skoka se povecava za 1. Ako je br_skoka >= 2, necemo moci vise skociti dok
			//ne dodirnemo zemlju, tj. koordinatu lik.y
			if(e.keyCode == 97 || e.keyCode == 65 && lik.uvjet_skoka == false && lik.dupli_skok < 3 && br_skoka < 2){
				lik.uvjet_skoka = true;
				br_skoka++;
			}
		});
		
		window.addEventListener("keyup", function(e){
				lik.dupli_skok++;
		});
		
		window.addEventListener("click", function(e){

			if(trenutno_stanje_igre === stanja.Score){
				trenutno_stanje_igre = stanja.Game;
				ljudi.x = c_width + 200;
				score.br = 0;
				score.rez = 0;
				score.ukupno_zivota--;
				score.moj_zivot = [srca[0],srca[0],srca[0],srca[0],
				srca[0],srca[0],srca[0]];
				igranje++;
				zivoti.ukupno_zivota--;
				if(igranje > 3){
					igranje = 1;
					zivoti.ukupno_zivota = 3;
					problem = ukupan_score;
					ukupan_score = 0;
				}
				da_ne_bjezi_score = true;
			}
			
			if(trenutno_stanje_igre === stanja.Menu){
				if((e.clientX > 734 && e.clientX < 940) &&
					(e.clientY > 220 && e.clientY < 280)){
						trenutno_stanje_igre = stanja.Game;
					}
			}
		});
		
		trenutno_stanje_igre = stanja.Spica; // Pocetno stanje igre
		
		zvuk_1.play();

		run(); // Pozivanje funkcije run()
	},
	
	//Za brisanje svega, te ponovno renderovanje
	clear: function(){
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

var lik = {
	x: 100, // x_koordinata
	y: c_height - 250, //y_koordinata
	w: 154, //sirina slike glavnog lika
	h: 220, //visina
	tr_ani: 0, //trenutna animacija, sve su animacije u nizu
	accY: 0, //Akceleracija za Y
	uvjet_skoka: false, //Dopustenje za prvi skok
	dupli_skok: 0, //Mozemo dva puta skocit
	g: 0, //Ubrzanje prema dole
	
	collision: function(otherobj){
		var myleft = this.x;
        var myright = this.x + (this.w);
        var mytop = this.y;
        var mybottom = this.y + (this.h);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.w);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.h);
        var crash = true;
        if ((mybottom < othertop) ||
               (mytop > otherbottom) ||
               (myright < otherleft) ||
               (myleft > otherright)) {
           crash = false;
        }
		if(crash && ljudi.a_k_c){
			ljudi.a_k_c = false;
			return true;
		}
	},
	
	//Funkcija skok, ako je this.uvjet_skoka true, onda smo jednom skocili, te nam se this.accY promjeni na 0.7.
	//this.accY se dodaje na this.g. Te se onda this.g dodaje na this.y . 
	skok: function(){
		if(this.uvjet_skoka){
			this.accY = 0.7;
		}
		
		//Ako "gravitacija" predje 13, akceleraciju postavljamo u suprotnom smjeru da vuce, tj. prema dole
		//this.uvjet_skoka na znaci da mozemo jos jednom skocit
		if(this.g > 13){
			this.accY = -0.7;
			this.uvjet_skoka = false;
		}
		
		//Kontrola da ne prodje ispod zemlje. Ako this.y dosegne odredjenu vrijednost, sve se vraca na nulu.
		if(this.y > c_height - 250){
			this.accY = 0;
			this.g = 0;
			this.y = c_height - 250;
			this.dupli_skok = 0;
			br_skoka = 0; //Kod pada, this.y postane vece od c_height - 250 onda br_skoka
						//se resetira na nulu i onda mozemo dva puta skakat ponovo
		}
		
	},
	
	//Animirani lik, posto je 15 slika a ne gif.
	promjena_animacije: function(){
		//Ako je fps moodle od 3, mjenjanja se this.tr_ani koja sluzi za animiranje lika
		if(fps % 3 == 0){
			this.tr_ani == 14 ? this.tr_ani = 1 : this.tr_ani++;
		}
	},
	
	//Update vrsi promjenu animacije te skok() funkciju poziva, i sluzi za skok.
	update: function(){
		
		this.promjena_animacije();
		
		this.skok();
		
		this.g += this.accY;
		this.y -= this.g;

		
	},
	
	//Crta lika i stit provjerava.
	draw: function(){
		ctx.drawImage(moj_lik[this.tr_ani], this.x, this.y);
		//ctx.strokeRect(this.x, this.y, this.w, this.h);
		
		if(stit != 0){
			zadnja_animacija += prom_zadnje_animacije;
			ctx.fillStyle = "rgba(255,255,0, " + zadnja_animacija +")";
			ctx.beginPath();
			ctx.arc(lik.x + lik.w/2, lik.y + lik.h/2, 100, 0, Math.PI * 2);
			ctx.fill();

			if(zadnja_animacija < 0.4){
				prom_zadnje_animacije = 0.01;
			}else if(zadnja_animacija > 0.7){
				prom_zadnje_animacije = -0.01;
			}
		}
	}
}

//Objekat ljudi ima x,y visinu i sirinu te jos neke dodatne parametre
var ljudi = {
	x: c_width + 200,
	y: c_height - 246,
	w: 133,
	h: 226,
	sansa: 0,
	oduzi: 7, // 7 je bilo
	d_k_ub: 9, // Dodatak kod brzine, sto vise igra brze ce mu prilazit
	a_k_c: true, // Ako_kolision_ se desi, da se nebi ponavljo vise puta
	
	update: function(){
		this.x -= this.oduzi; //Za kretanje neprijatelja prema nama oduzimamo im od x vrijednosti this.oduzi
		if(this.x < -143){ // Ako neprijatelj prodje iza ekrana
			score.rez++; // Povecamo score za 1.
			this.a_k_c = true; //Postavimo da se moze desit sa sljedecim collision
			var gl = Math.floor(Math.random() * 5); //Trenutna varijabla gl, predstavlja sansu
			if(gl == 4){
				this.sansa = 1; //Ako je gl bilo 4, this.sansa ce bit 1, a to ce predstavljat plave ljude koji su jaci
				this.oduzi = this.d_k_ub; //I oni ce se kretat brze
			}else{
				this.sansa = 0; //Obicni zeleni neprijatelji
				this.oduzi = this.d_k_ub - 2; //Brzina da im je manja nego kod plavih
			}
			this.x = c_width + 200 + Math.floor(Math.random() * 700); //Generira se ponovno x koordinata na nasumicnom mjestu
			wave++; // poveca se varijabla wave za 1.
			//Ako je wave dijeljivo sa 5, onda se generira rekvizit.
			if(wave % 5 == 0){ //PROMJENI NA 5!!!!!!!!!!!!!!!!!!!!!!!!!!!
				ostali_rekviziti();
			}
		}
	},
	
	//Crtaju se neprijatelji
	draw: function(){
		ctx.drawImage(neprijatelji[this.sansa], this.x, this.y); 
		//ctx.strokeRect(this.x, this.y, this.w, this.h);
	}
}

//Pozadina objekt, x i y koordinatu samo ima.
var pozadina = {
	x: 0,
	y: 0,
	
	//Update provjerava dali je slika koa se crta na 0, 0 i koja zauzima cijeli ekran, prosla cijelu sirinu canvasa.
	//Ako jeste, postavlja joj se vrijednost na 0.
	update: function(){
		this.x -= 5;
		if(this.x < -(c_width)){
			this.x = 0;
		}
	},
	
	//Crtanje dvije pozadine. Jedna koja se vidi s pocetka, i kako idemo ona nestaje a druga dolazi nama.
	//I kada je update true, ponovo se crta jedna na nula, a druga skroz daleko od nje da izgleda ko beskonacna
	//slika
	draw: function(){
		ctx.drawImage(moja_pozadina, this.x, this.y);
		ctx.drawImage(moja_pozadina, this.x + c_width - 1, this.y);
	}
}

//score nam sluzi za bijeli krug te skor kao broj
var score = {
	x_y: 50, //x_y koordinata bijelog kruga
	r: 40, //radius kruga
	rez: 0, //trenutni rezultat
	mjesto_rez: 8, //Sluzi kako nebi neki n-znamenkasti brojevi bili na pogresnom mjestu, nego na sredini.
	br: 0, //Vrlo bitna jer predstavlja prekid igre i slike srca.
	moj_zivot: [srca[0],srca[0],srca[0],srca[0],
				srca[0],srca[0],srca[0]], //Niz napunimo zdravim srcima
	

	update: function(){
		
		//Ako se desi collision izmedju lika i ljudi, prvo se provjerava dali je lik imo stit, ako jeste, vraca se.
		//Nista se ne izvodi. Ali ako nije, onda provjerava dali je se zabio u plave ljude ili zelene. I u zavisnosti od
		//kojih se zabio, od njih gubi 1 ili 2 srca.
		//Else if provjerava kolision sa rekvizitima, te u koji se rekvizit trenutno zabio
		if(lik.collision(ljudi)){
			
			if(stit != 0){
				return;
			}
			
			if(ljudi.sansa == 1){
					this.moj_zivot[this.br] = srca[1];
					this.moj_zivot[this.br + 1] = srca[1];
					this.br += 2;
			}else{
				this.moj_zivot[this.br] = srca[1];
				this.br++;
			}
		}else if(lik.collision(trenutni_ob)){
			trenutni_ob.x = -50;
			if(trenutni_ob.ani == ostalo[2]){
				score.rez += 5;
			}else if(trenutni_ob.ani == ostalo[3]){
				score.rez += 10;
			}else if(trenutni_ob.ani == ostalo[0]){
				score.rez += 50;
			}else{
				stit = 5;
			}
		}
		
	},
	
	//Crta na ekran krug, na njoj trenutni score te for petljom srca koja predstavljaju trenutni zivot, energiju.
	draw: function(){
		// Gore je za score i krug 
		ctx.beginPath();
		ctx.fillStyle = "rgba(255,255,255,0.9)";
		ctx.arc(this.x_y, this.x_y, this.r, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "rgba(0,0,0,1)";
		ctx.font = "30px ComicSans";
		ctx.fillText(this.rez, this.x_y - (this.mjesto_rez * String(this.rez).length),this.x_y + 12);
		// Ispod je srca
		for(var i = 1; i < 7; i++){
			ctx.drawImage(this.moj_zivot[i - 1],c_width -(80 * i), 20);
		}
	}	
}

//Zivoti su plava srca, te ih ima 3 s pocetka.
var zivoti = {
	x: 100,
	y: 30,
	ukupno_zivota: 3,
	
	//Renderuje tri srca s razlicitim x_koordinatama
	draw: function(){
		for(var i = 0; i < this.ukupno_zivota; i++){
			ctx.drawImage(zivot, this.x + (60 * i), this.y);
		}
	}
}

//Ovdje stoje rekviziti
//trenutni_ob ima x, y koordinatu te visini i sirinu. Sluze nam radi prilaska liku te radi collision-a
var trenutni_ob = {
	x: c_width + 600,
	y: c_height - 446,
	w: 130,
	h: 130,
	ani: 0,
	postoji: false,
	
	//Ako this.x predje ispod -50, postavljamo rekvizit na false. Rekvizit se renderuje samo kada je this.postoji == true
	update: function(){
		this.x -= ljudi.oduzi + 2; //Ide slicnom brzinom kao neprijatelji
		if(this.x < -50){
			this.postoji = false;
		}
	},
	
	//Renderovanje rekvizita
	draw: function(){
		ctx.drawImage(this.ani, this.x, this.y);
	}
}

//Funkcija koja ako je wave % 5 == 0, renderovat ce neki rekvizit.
//Svaki rekvizit ima svoju sansu za render, neki vecu neki manju sanasu.
function ostali_rekviziti(){
	var rekvizit = Math.floor(Math.random() * 10000);
	if(rekvizit < 7000){
		trenutni_ob.ani = ostalo[2];
	}else if(rekvizit > 7000 && rekvizit < 9000){
		trenutni_ob.ani = ostalo[3];
	}else if(rekvizit > 9000 && rekvizit < 9500){
		trenutni_ob.ani = ostalo[0];
	}else if(rekvizit > 9500){
		trenutni_ob.ani = ostalo[1];
	}
	
	trenutni_ob.postoji = true;
	trenutni_ob.x = c_width + 600;
}

//Kada se run pozove, loop postaje funkcija, odnosno clousure, tj. lokalna funkcija funkcije run.
//I onda se rekurzivno poziva preko window.requestAnimationFrame(loop), jer window.requestAnimationFrame(loop)
//je trik umjesto setIntervala, jer tada igra tece ljepse te se ne opterecuje CPU kad se izgubi fokus sa te kartice 
function run(){
	var loop = function(){
		update();
		draw();
		window.requestAnimationFrame(loop);
	}
	window.requestAnimationFrame(loop);
}

//Update() provjerava logiku igre
function update(){
	fps++; // fps se uvjek povecava
	
	//Ako je fps modul 100 == 0, stit se smanji za jedan. Ako je stit manji od nula, vrati se stit na nulu
	//i prekida mu se koristenje
	if(fps % 100 == 0){
		stit--;
		if(stit < 0){
			stit = 0;
		}
	}
	
	//fps % 1000 == 0, povecamo property ljudi.d_k_ub za jedan. To predstavlja brzinu prilaska neprijatelja.
	//Plavi su brzi od zeleni
	if(fps % 1000 == 0){
		ljudi.d_k_ub += 1;
	}
	
	//Pozivanje clear-a
	moj_canvas.clear();
	
	//Ako je trenutno_stanje_igre === stanja.Game onda crtamo sve potrebno
	if(trenutno_stanje_igre === stanja.Game){			
		pozadina.update();
		lik.update();
		score.update();
		ljudi.update();
		if(trenutni_ob.postoji){
			trenutni_ob.update();
		}
	}
	
	//Provjera srca, ako je vece ili jednako 6 mjenja se stanje u stanja.Score jer smo izgubili zivot
	if(score.br >= 6){
		trenutno_stanje_igre = stanja.Score;

		//Pri renderovanju stanja.Score, trenutni skor se doda ukupnom. Ali se idalje nastavi dodavat, te ga
		// 'da_ne_bjezi_score' varijabla kontrolira od naknadnog dodavanja skora na ukupno.
		if(da_ne_bjezi_score){
			ukupan_score += score.rez;
			da_ne_bjezi_score = false;
			ljudi.d_k_ub = 9; // Vracanje brzine neprijatelja na nulu
			ljudi.oduzi = 8; // -||-
		}
	}
	
}

//Draw() renderuje elemente
function draw(){

	//Render pri stanja.Game
	if(trenutno_stanje_igre === stanja.Game){
		pozadina.draw();
		lik.draw();
		score.draw();
		ljudi.draw();
		zivoti.draw();
		if(trenutni_ob.postoji){
			trenutni_ob.draw();
		}
	}
	
	//Render pri stanja.Score, renderujemo dva zelena pravokutnika, te tekst na njima sa ukupnim skorom, te neprijatelje i lika.
	if(trenutno_stanje_igre === stanja.Score){
		ctx.fillStyle = "Crimson";
		ctx.fillRect(0,0, c_width, c_height);
		ctx.fillStyle = "PaleGreen";
		ctx.fillRect(c_width/2 - 205, c_height/2 - 145, 400, 60);
		ctx.fillRect(c_width/2 - 205, c_height/2 - 45, 400, 60);
		ctx.fillStyle = "rgba(0,0,0,1)";
		ctx.font = "50px ComicSans";
		ctx.fillText(String(igranje) + ". igranje je: " + String(score.rez), c_width/2 - 150, c_height/2 - 100);
		ctx.fillText("Ukupno: " + String(ukupan_score), c_width/2 - 110, c_height/2);
		ctx.drawImage(neprijatelji[0], c_width - 400, c_height - 300);
		ctx.drawImage(neprijatelji[1], c_width - 250, c_height - 350);
		ctx.drawImage(moj_lik[3], 150, c_height - 330);
	}
	
	//Zasebna funkcija spica() koja se poziva pri uvjetu
	if(trenutno_stanje_igre === stanja.Spica){
		spica();
	}
	
	//Menu igre, renderuje se lik i neprijatelji i pozadina te pravokutnik sa play buttonom.
	if(trenutno_stanje_igre === stanja.Menu){
		ctx.drawImage(slikice_za_animaciju[1], 0, 0);
		ctx.drawImage(slikice_za_animaciju[0], 200, c_height/2);
		ctx.drawImage(slikice_za_animaciju[3], 700, c_height/2);
		ctx.drawImage(slikice_za_animaciju[4], 900, c_height/2);
		ctx.fillStyle = "Lightblue";
		ctx.fillRect(c_width/2 - 60, c_height/2 - 120, 210, 60);
		ctx.fillStyle = "black";
		ctx.font = "60px Arial";
		ctx.fillText("PLAY", c_width/2 - 30, c_height/2 - 70);
	}

	if(trenutno_stanje_igre !== stanja.Spica){
		if(zvuk.paused){
			zvuk.play();
		}
	}
}