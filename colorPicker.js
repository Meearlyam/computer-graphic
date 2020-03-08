let rgb = new RGB(0, 0, 0);
let xyz = new XYZ(0, 0, 0);
let lab = new LAB(0, 0, 0);

function palette(event) {
    rgb = hexToRgb(event.target.value);
    calculate(rgb);
}

function sliderMoveRGB(s) {
    solveAll(rgb, s);
}

function sliderMoveXYZ(s) {
    solveAll(xyz, s);
}

function sliderMoveLAB(s) {
    solveAll(lab, s);
}

function getVals(s) {
    return parseInt($('#' + s).val());
}

function solveAll(color, id) {
    color[id.toLowerCase()] = getVals(id);
    calculate(color);
}

function calculate(color){
    rgb = ColorConverter.toRGB(color);
    xyz = ColorConverter.toXYZ(color);
    lab = ColorConverter.toLAB(color);
    correctSliders();
}

function correctSliders() {
    [rgb, xyz, lab].forEach(function (scheme) {
        Object.keys(scheme).forEach(function (elem) {
        	$('#' + elem.toUpperCase()).val(scheme[elem]);
        })
    });
    console.log("rgb: " + rgb.r + "|" + rgb.g + "|" + rgb.b);
    console.log("xyz: " + xyz.x + "|" + xyz.y + "|" + xyz.z);
    console.log("lab: " + lab.l + "|" + lab.a + "|" + lab.d);
    $('#colorWell').val(rgbToHex(rgb));
}

function RGB(r, g, b) {
    if (r <= 0) {
        r = 0;
    }
    if (g <= 0) {
        g = 0;
    }
    if (b <= 0) {
        b = 0;
    }

    if (r > 255) {
        r = 255;
    }
    if (g > 255) {
        g = 255;
    }
    if (b > 255) {
        b = 255;
    }

    this.r = Math.round(r);
    this.g = Math.round(g);
    this.b = Math.round(b);
}

function XYZ(x, y, z) {
    if (x <= 0) {
        x = 0;
    }
    if (y <= 0) {
        y = 0;
    }
    if (z <= 0) {
        z = 0;
    }

    if (x > 100) {
        x = 100;
    }
    if (y > 100) {
        y = 100;
    }
    if (z > 100) {
        z = 100;
    }

    this.x = Math.round(x);
    this.y = Math.round(y);
    this.z = Math.round(z);
}

function LAB(l, a, d) {
    if (l <= 0) {
        l = 0;
    }
    if (a <= -128) {
        a = -128;
    }
    if (d <= -128) {
        d = -128;
    }

    if (l > 100) {
        l = 100;
    }
    if (a > 127) {
        a = 127;
    }
    if (d > 127) {
        d = 127;
    }
    

    this.l = Math.round(l);
    this.a = Math.round(a);
    this.d = Math.round(d);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new RGB(
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16))
        : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
    return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
}

var ColorConverter = {

    _RGBtoXYZ: function (RGB) {

        function F1(x) {
            if (x < 0.04045) {
                return x / 12.92;
            }
            else {
                return Math.pow((x + 0.055) / 1.055, 2.4);
            }
        }

        var Rn = F1(RGB.r/255)*100;
        var Gn = F1(RGB.g/255)*100;
        var Bn = F1(RGB.b/255)*100;

        var x = 0.412453*Rn + 0.357580*Gn + 0.180423*Bn;
        var y = 0.212671*Rn + 0.715160*Gn + 0.072169*Bn;
        var z = 0.019334*Rn + 0.119193*Gn + 0.950227*Bn;

        return new XYZ(x, y, z);
    },

    _XYZtoRGB: function (XYZ) {
                
        function F1(x) {
            if(x >= 0.0031308) {
                return 1.055*Math.pow(x, 1/2.4) - 0.055;
            }
            else {
                return 12.92*x;
            }
        }

        var x = XYZ.x/100;
        var y = XYZ.y/100;
        var z = XYZ.z/100;

        var Rn = 3.2406*x - 1.5372*y - 0.4986*z;
        var Gn = -0.9689*x + 1.8758*y + 0.0415*z;
        var Bn = 0.0557*x - 0.2040*y + 1.0570*z;

        var r = F1(Rn)*255;
        var g = F1(Gn)*255;
        var b = F1(Bn)*255;

        return new RGB(r, g, b);
    },

    _LABtoXYZ: function(LAB) {

        function F2(x) {
            var r = Math.pow(x, 3);
            if (r < 0.008856) {
                return (x - 16 / 116) / 7.787;
            }
            else {
                return r;
            }
        }

        var y = F2((LAB.l + 16) / 116) * 95.047;
        var x = F2(LAB.a / 500 + (LAB.l + 16) / 116) * 100;
        var z = F2((LAB.l + 16) / 116 - LAB.d / 200) * 108.883;

        return new XYZ(x, y, z);
    },

    _XYZtoLAB: function(XYZ) {

        function F3(x) {
            if (x < 0.008856) {
                return 7.787 * x + 16 / 116;
            }
            else {
                return Math.pow(x, 1 / 3);
            }
        }

        var Xw = 95.047;
        var Yw = 100.0;
        var Zw = 108.883;

        var x = XYZ.x;
        var y = XYZ.y;
        var z = XYZ.z;

        var l = 116*F3(y/Yw) - 16;
        var a = 500*(F3(x/Xw) - F3(y/Yw));
        var d = 200*(F3(y/Yw) - F3(z/Zw));

        return new LAB(l, a, d);
    },

    toRGB: function (o) {
        if (o instanceof RGB) {
            return o;
        }
        if (o instanceof XYZ) {
            return this._XYZtoRGB(o);
        }
        if (o instanceof LAB) {
            return this._XYZtoRGB(this._LABtoXYZ(o));
        }
    },


    toXYZ: function (o) {
        if (o instanceof RGB) {
            return this._RGBtoXYZ(o);
        }
        if (o instanceof XYZ) {
            return o;
        }
        if (o instanceof LAB) {
            return this._LABtoXYZ(o);
        }
    },

    toLAB: function (o) {
        if (o instanceof RGB) {
            return this._XYZtoLAB(this._RGBtoXYZ(o));
        }
        if (o instanceof XYZ) {
            return this._XYZtoLAB(o);
        }
        if (o instanceof LAB) {
            return o;
        }
    }
}

var showingTooltip;
var tooltipElem;
var field;

document.onmousedown = function(e) {
      var target = e.target;
      var tooltip = target.value;
      field = document.getElementById(target.id + "F");
      if (!tooltip) return;

      tooltipElem = document.createElement('div');
      tooltipElem.className = 'tooltip';
      tooltipElem.innerHTML = tooltip;
      document.body.appendChild(tooltipElem);

      var coords = target.getBoundingClientRect();

      var left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2;
      if (left < 0) left = 0;

      var top = coords.top - tooltipElem.offsetHeight - 5;
      if (top < 0) {
        top = coords.top + target.offsetHeight + 5;
      }

      tooltipElem.style.left = left + 'px';
      tooltipElem.style.top = top + 'px';

      showingTooltip = tooltipElem;
};

document.onmouseup = function(e) {

	if (showingTooltip) {
	    document.body.removeChild(showingTooltip);
	    showingTooltip = null;
	}
}

document.onmousemove = function(e) {
	if (showingTooltip) {
	    tooltipElem.innerHTML = e.target.value;
        field.value = e.target.value;
	}
}
