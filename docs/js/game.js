var canvas = document.getElementById("canvas");
if(canvas.webkitRequestFullScreen) {
	canvas.webkitRequestFullScreen();
}
else {
	canvas.mozRequestFullScreen();
}
var processing = new Processing(canvas, function(processing) {
	processing.size(320, 568);
	processing.background(0,0,0,0);

	if( $(".container").length ) {
		var container = $( ".container" );
	} else {
		var container = $( "body > div" );
	}

    ////////////////////////////////////////////////////////
    // For use in websites: External start and stop events
	var canvas = $( "canvas", container ),
        drawFn = null;

    canvas.on( "startProgram", function() {
        if( drawFn ) processing.draw = drawFn;
    } ).on( "stopProgram", function() {
        processing.draw = function() {};
    } );

    /////////////////////////////////////////////////////////
    // Mouse and touch handling
	var mouseIsPressed = false;
	container.on("mousedown touchstart", function(e) {
		mouseIsPressed = true;

        var pageX = e.changedTouches && e.changedTouches[0].pageX || e.pageX,
            pageY = e.changedTouches && e.changedTouches[0].pageY || e.pageY,
            offset = $( "canvas", container ).offset();

		processing.mouseX = pageX - offset.left;
		processing.mouseY = pageY - offset.top;

		if( processing.mousePressed ) processing.mousePressed();

	}).on("mouseup touchend", function(e) {
		mouseIsPressed = false;

        var pageX = e.changedTouches && e.changedTouches[0].pageX || e.pageX,
            pageY = e.changedTouches && e.changedTouches[0].pageY || e.pageY,
            offset = $( "canvas", container ).offset();

		processing.mouseX = pageX - offset.left;
		processing.mouseY = pageY - offset.top;

		if( processing.mouseReleased ) processing.mouseReleased();

	}).on("mousemove touchmove", function(e) {

        var pageX = e.changedTouches && e.changedTouches[0].pageX || e.pageX,
            pageY = e.changedTouches && e.changedTouches[0].pageY || e.pageY,
            offset = $( "canvas", container ).offset();

		processing.mouseX = pageX - offset.left;
		processing.mouseY = pageY - offset.top;

		if( processing.mouseMoved ) processing.mouseMoved();
	});

	var keyIsPressed = false;
	processing.keyPressed = function () { keyIsPressed = true; };
	processing.keyReleased = function () { keyIsPressed = false; };

	function getSound(s) {
		var url = "sounds/" + s + ".mp3";
		return new Audio(url);
	}

	function playSound(s) {
		s.play();
	}

	function stopSound(s) {
		s.pause();
		sound.currentTime = 0;
	}

	function debug() {
	}

	function getImage(s) {
		var url = "img/" + s + ".png";
		return processing.loadImage(url);
	}

	var rotateFn = processing.rotate;
	processing.rotate = function(angle) {
		rotateFn(processing.radians(angle));
	}
	var arcFn = processing.arc;
	processing.arc = function(x,y,w,h,a1,a2) {
		return arcFn(x,y,w,h,processing.radians(a1), processing.radians(a2));
	}
	var sinFn = processing.sin;
	processing.sin = function(angle) {
		return sinFn(processing.radians(angle));
	}
	var asinFn = processing.asin;
	processing.asin = function(value) {
		return processing.degrees(asinFn(value));
	}
	var cosFn = processing.cos;
	processing.cos = function(angle) {
		return cosFn(processing.radians(angle));
	}
	var acosFn = processing.acos;
	processing.acos = function(value) {
		return processing.degrees(acosFn(value));
	}
	var tanFn = processing.tan;
	processing.tan = function(angle) {
		return tanFn(processing.radians(angle));
	}
	var atanFn = processing.atan;
	processing.atan = function(value) {
		return processing.degrees(atanFn(value));
	}
	var atan2Fn = processing.atan2;
	processing.atan2 = function(y, x) {
		return processing.degrees(atan2Fn(y,x));
	}

	with (processing) {
	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Programm-Code hier einfügen ...
// Vier gewinnt

rectMode( CENTER );
imageMode( CENTER );
textAlign( CENTER, CENTER );

var zeilen = 6;     // ~~~ Anzahl der Zeilen im Spielfeld
var spalten = 7;    // ~~~ Anzahl der Spalten
var margin = 3;     // ~~~ Abstand zwischen den Spielsteinen in Pixel (Punkten)

var durchmesser = min( 320 / spalten - margin, 576 / zeilen - margin );
var hoehe = (durchmesser + margin) * zeilen;
var breite = (durchmesser + margin) * spalten;
var spielfeld = [];
var modus = 0; // 0: Titel, 1: Spiel, 2: Ende
var zug = 1; // 1: rot, 2: blau
var mouseWasPressed = false;
var hits = null;

var roterKreis = function( x, y, zoom ) {
    translate( x, y );
    scale( zoom );
    
    /////////////////////////////////////////////////////////////
    // Roten Kreis zeichnen

    noStroke();    
    fill(189, 23, 23);
    ellipse( 0, 0, durchmesser, durchmesser );
    
    /////////////////////////////////////////////////////////////
    resetMatrix();
};

var blauerKreis = function( x, y, zoom ) {
    translate( x, y );
    scale( zoom );
    
    /////////////////////////////////////////////////////////////
    // Blauen Kreis zeichnen
    
    stroke(40, 45, 200);
    fill(20, 25, 133);
    ellipse( 0, 0, durchmesser, durchmesser );
    
    /////////////////////////////////////////////////////////////
    resetMatrix();
};


var spielfeldLoeschen = function() {
    spielfeld = [];
    for( var i=0 ; i < zeilen ; i++ ) {
        spielfeld.push( [] );
        for( var j=0 ; j < spalten ; j++ ) {
            spielfeld[i].push( 0 );
        }
    }
    hits = null;
};

var Knopf = function( y, t, f, hf, cb ) {
    textSize( 20 );
    var w = textWidth( t ) + 40;
    
    fill( hf );
    rect( 160, y, w, 40, 10 );
    fill( f );

    if( mouseX > 160 - w/2 && mouseX < 160 + w/2 && mouseY > y-20 && mouseY < y+20 ) {
        fill(255, 0, 0);
        
        if( mouseIsPressed ) {
            cb( true );
        }
    }

    text( t, 160, y );
};

var pruefen = function( zeile, spalte ) {
    var hits = [[zeile, spalte]];
    
    // Waagerecht
    for( var i=1 ; i<4 ; i++ ) {
        if( spalte-i >= 0 && spielfeld[zeile][spalte-i] === zug ) {
            hits.push([zeile, spalte-i]);
        } else {
            break;
        }
    }
    for( var i=1 ; i<4 ; i++ ) {
        if( spalte+i < spalten && spielfeld[zeile][spalte+i] === zug ) {
            hits.push([zeile, spalte+i]);
        } else {
            break;
        }
    }
    if( hits.length === 4 ) {
        return hits;
    }

    // Senkrecht
    hits = [[zeile, spalte]];
    for( var z=0, i=1 ; i<4 ; i++ ) {
        if( zeile-i >= 0 && spielfeld[zeile-i][spalte] === zug ) {
            hits.push([zeile-i, spalte]);
        } else {
            break;
        }
    }
    for( var i=1 ; i<4 ; i++ ) {
        if( zeile+i < zeilen && spielfeld[zeile+i][spalte] === zug ) {
            hits.push([zeile+i, spalte]);
        } else {
            break;
        }
    }
    if( hits.length === 4 ) {
        return hits;
    }

    // Schräg links
    hits = [[zeile, spalte]];
    for( var i=1 ; i<4 ; i++ ) {
        if( spalte-i >= 0 && zeile-i >= 0 && spielfeld[zeile-i][spalte-i] === zug ) {
            hits.push([zeile-i, spalte-i]);
        } else {
            break;
        }
    }
    for( var i=1 ; i<4 ; i++ ) {
        if( spalte+i < spalten && zeile+i < zeilen && spielfeld[zeile+i][spalte+i] === zug ) {
            hits.push([zeile+i, spalte+i]);
        } else {
            break;
        }
    }
    if( hits.length === 4 ) {
        return hits;
    }

    // Schräg rechts
    hits = [[zeile, spalte]];
    for( var z=0, i=1 ; i<4 ; i++ ) {
        if( spalte-i >= 0 && zeile+i < zeilen && spielfeld[zeile+i][spalte-i] === zug ) {
            hits.push([zeile+i, spalte-i]);
        } else {
            break;
        }
    }
    for( var i=1 ; i<4 ; i++ ) {
        if( spalte+i < spalten && zeile-i >= 0 && spielfeld[zeile-i][spalte+i] === zug ) {
            hits.push([zeile-i, spalte+i]);
        } else {
            break;
        }
    }
    if( hits.length === 4 ) {
        return hits;
    }
};

spielfeldLoeschen();

var draw = function() {
    background(255);
    
    // Spielfeld zeichnen
    fill(24, 24, 97, 70);
    textSize( 43 );
    text( "VIER GEWINNT", 160, 30 );
    fill(24, 24, 97);
    rect( 160, 568 - hoehe/2, breite, hoehe );
    noStroke();
    for( var i=0 ; i < zeilen ; i++ ) {
        for( var j=0 ; j < spalten ; j++ ) {
            var x = (j+0.5)*(durchmesser + margin) + (320-breite)/2,
                y = 568 - (i+0.5)*(durchmesser + margin);

            switch( spielfeld[i][j] ) {
            case 0:
                fill( color(255) );
                ellipse( x, y, durchmesser, durchmesser );
                break;
            case 1: 
                roterKreis( x, y, 1 );
                break;
            case 2: 
                blauerKreis( x, y, 1 );
                break;
            }
        }
    }
    
    if( hits ) {
        for( var i=0 ; i<4 ; i++ ) {
            fill(255, 242, 0);
            ellipse(
                (hits[i][1]+0.5)*(durchmesser + margin) + (320-breite)/2,
                568 - (hits[i][0]+0.5)*(durchmesser + margin), 
                durchmesser/3, 
                durchmesser/3
            );
        }
    }
  
    if( modus === 0 ) {
        // TITEL-Modus
        Knopf( 100, "Spiel starten", color(36, 36, 214), color(192, 190, 247), 
            function( res ) {
                if( res ) {
                    modus = 1;
                }
            });
    } else if( modus === 1 ) {
        // SPIEL-Modus

        // Zug-Anzeige
        if( zug === 1 ) {
            roterKreis( 70, 568 - hoehe - 70, 2 );
            fill(189, 23, 23, 60);
        } else {
            blauerKreis( 250, 568 - hoehe - 70, 2 );
            fill(20, 25, 133, 60);
        }

        // Auswahlbalken
        if( mouseX > 160-breite/2 && mouseX < 160+breite/2 && mouseY > 568 - hoehe ) {
            var spalte = floor((mouseX - (160-breite/2))/(durchmesser+margin));
            rect( 
                (spalte+0.5) * (durchmesser+margin) + 160-breite/2, 
                568-hoehe/2, 
                durchmesser+margin/2, 
                hoehe
            );
            
            if( !mouseWasPressed && mouseIsPressed ) {
                mouseWasPressed = true;
                for( var i=0 ; i < zeilen ; i++ ) {
                    if( spielfeld[i][spalte] === 0 ) {
                        spielfeld[i][spalte] = zug;
                        
                        hits = pruefen( i, spalte );
                        if( hits ) {
                            
                            modus = 2;
                            break;
                        }

                        zug = 3-zug;
                        break;
                    }
                }
            } else if( !mouseIsPressed ) {
                mouseWasPressed = false;
            }
        }
    } else if( modus === 2 ) {
  
          // Zug-Anzeige
        if( zug === 1 ) {
            roterKreis( 70, 568 - hoehe - 70, 2 );
            fill(189, 23, 23, 60);
            textSize( 20 );
            text( "Rot hat gewonnen!", 120, 568 - hoehe - 21 );
        } else {
            blauerKreis( 250, 568 - hoehe - 70, 2 );
            fill(20, 25, 133, 60);
            textSize( 20 );
            text( "Blau hat gewonnen!", 200, 568 - hoehe - 21 );
        }         

        Knopf( 511, "Neu starten?", color(14, 14, 15), color(192, 190, 247, 150), 
            function( res ) {
                if( res ) {
                    modus = 1;
                    spielfeldLoeschen();
                }
            });

    }
};	/////////////////////////////////////////////////////////////////////////////////////////////
	

	};

	if (typeof draw !== 'undefined') processing.draw = draw;
    drawFn = processing.draw;
});
