 /**
  * Javascript for determination of magnetic declination
  *
  * Based on the works by Christopher Weiss Github:cmweiss
  *
  * @package geomag
  * @filesource geomag.class.js
  * @author Niclas Ankar
  * @copyright 2024 niclasankar
  * @link https://github.com/niclasankar/geomag
  * @version 1.0
  *
  */

// Define constants
 var a = 6378.137; // WGS 1984 Equatorial axis (km)
 var b = 6356.7523142; // WGS 1984 Polar axis (km)
 var re = 6371.2;
 var wmm = "";
 var maxord = 12;
 var dec = 0;
 var a2 = a * a;
 var b2 = b * b;
 var c2 = a2 - b2;
 var a4 = a2 * a2;
 var b4 = b2 * b2;
 var c4 = a4 - b4;
 var z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
 var unnormalizedWMM;

 /**
  *  Class definition
  *
  */
 class GeoMag {

   /**
    *  Class constructor
    *
    * @param {string|object} model COF data in object or string
    * @returns {object} GeoMag object
    */
   constructor(model) {

     if (model !== undefined) { // initialize

       if (typeof model === 'string') {

         this.wmm = this.parseCOF(model);
         this.unnormalizedWMM = this.unnormalize(this.wmm);

       } else if (typeof model === 'object') {

         console.log("Object COF data");
         this.setUnnorm(model);

       } else {

         throw new Error("Invalid argument type!");

       }

     } else {
       throw new Error("No model was given!");
     }

     this.a = a;
     this.b = b;
   }

   /**
    *  Parse COF data provided as string
    *
    *  @param {string} cof COF data from file
    *  @returns {object}
    */
   parseCOF(cof) {

     let modelLines = cof.split('\n');
     let wmm = [];
     let vals = "";
     let epoch = "";
     let model = "";
     let modelDate = "";
     var i;
     for (i in modelLines) {
       if (modelLines.hasOwnProperty(i)) {
         vals = modelLines[i].replace(/^\s+|\s+$/g, "").split(/\s+/);
         if (vals.length === 3) {
           epoch = parseFloat(vals[0]);
           model = vals[1];
           modelDate = vals[2];
         } else if (vals.length === 6) {
           wmm.push({
             n: parseInt(vals[0], 10),
             m: parseInt(vals[1], 10),
             gnm: parseFloat(vals[2]),
             hnm: parseFloat(vals[3]),
             dgnm: parseFloat(vals[4]),
             dhnm: parseFloat(vals[5])
           });
         }
       }
     }

     this.wmm = wmm;
     return {
       epoch: epoch,
       model: model,
       modelDate: modelDate,
       wmm: wmm
     };
   }

   /**
    *  Unnormalize WMM
    *
    *  @param {string} wmm WMM data
    *  @returns {object}
    */
   unnormalize(wmm) {
     var i, j, m, n, D2, flnmj,
             c = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice()],
             cd = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice()],
             k = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice()],
             snorm = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice()],
             model = wmm.wmm;
     for (i in model) {
       if (model.hasOwnProperty(i)) {
         if (model[i].m <= model[i].n) {
           c[model[i].m][model[i].n] = model[i].gnm;
           cd[model[i].m][model[i].n] = model[i].dgnm;
           if (model[i].m !== 0) {
             c[model[i].n][model[i].m - 1] = model[i].hnm;
             cd[model[i].n][model[i].m - 1] = model[i].dhnm;
           }
         }
       }
     }
     /* CONVERT SCHMIDT NORMALIZED GAUSS COEFFICIENTS TO UNNORMALIZED */
     snorm[0][0] = 1;
     for (n = 1; n <= maxord; n++) {
       snorm[0][n] = snorm[0][n - 1] * (2 * n - 1) / n;
       j = 2;
       for (m = 0, D2 = (n - m + 1); D2 > 0; D2--, m++) {
         k[m][n] = (((n - 1) * (n - 1)) - (m * m)) /
                 ((2 * n - 1) * (2 * n - 3));
         if (m > 0) {
           flnmj = ((n - m + 1) * j) / (n + m);
           snorm[m][n] = snorm[m - 1][n] * Math.sqrt(flnmj);
           j = 1;
           c[n][m - 1] = snorm[m][n] * c[n][m - 1];
           cd[n][m - 1] = snorm[m][n] * cd[n][m - 1];
         }
         c[m][n] = snorm[m][n] * c[m][n];
         cd[m][n] = snorm[m][n] * cd[m][n];
       }
     }
     k[1][1] = 0.0;

     return {
       epoch: wmm.epoch,
       k: k,
       c: c,
       cd: cd
     };

   }

   /**
    *  Convert angle from radians to degrees
    *
    *  @param {float} rad Angle in radians
    *  @returns {float} Angle in degrees
    */
   rad2deg(rad) {
     return rad * (180 / Math.PI);
   }

   /**
    *  Convert angle from degrees to radians
    *
    *  @param {deg} deg Angle in degrees
    *  @returns {float} Angle in radians
    */
   deg2rad(deg) {
     return deg * (Math.PI / 180);
   }

   /**
    *  Convert given date to object of Calculate magnetic for given point
    *
    *  @param {date} date Date to convert
    *  @returns {object} Object containing all calculated values
    */
   decimalDate(date) {
     date = date || new Date();
     var year = date.getFullYear(),
             daysInYear = 365 +
             (((year % 400 === 0) || (year % 4 === 0 && (year % 100 > 0))) ? 1 : 0),
             msInYear = daysInYear * 24 * 60 * 60 * 1000;
     return date.getFullYear() + (date.valueOf() - (new Date(year, 0)).valueOf()) / msInYear;
   }

   /**
    *  Calculate magnetic data for given point
    *
    *  @param {float} glat Latitude of point to be calculated
    *  @param {float} glon Longitude of point to be calculated
    *  @param {float} h Height MSL of point to be calculated
    *  @param {date} date Date object
    *  @returns {object} Object containing all calculated values
    */
   calculate(glat, glon, h, date) {

     if (this.unnormalizedWMM === undefined) {
       throw new Error("A World Magnetic Model has not been set.");
     }

     if (glat === undefined || glon === undefined) {
       throw new Error("Latitude and longitude are required arguments.");
     }

     var epoch = this.unnormalizedWMM.epoch,
             k = this.unnormalizedWMM.k,
             c = this.unnormalizedWMM.c,
             cd = this.unnormalizedWMM.cd,
             altf = (h / 3280.8399) || 0, // convert h (in feet) to kilometers (default, 0 km)
             alt = (h / 1000) || 0, // convert h (in feet) to kilometers (default, 0 km)
             dt = this.decimalDate(date) - epoch,
             rlat = this.deg2rad(glat),
             rlon = this.deg2rad(glon),
             srlon = Math.sin(rlon),
             srlat = Math.sin(rlat),
             crlon = Math.cos(rlon),
             crlat = Math.cos(rlat),
             srlat2 = srlat * srlat,
             crlat2 = crlat * crlat,
             q,
             q1,
             q2,
             ct,
             st,
             r2,
             r,
             d,
             ca,
             sa,
             aor,
             ar,
             br = 0.0,
             bt = 0.0,
             bp = 0.0,
             bpp = 0.0,
             par,
             temp1,
             temp2,
             parp,
             D4,
             m,
             n,
             fn = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
             fm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
             z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
             tc = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice()],
             sp = z.slice(),
             cp = z.slice(),
             pp = z.slice(),
             p = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice()],
             dp = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
               z.slice()],
             bx,
             by,
             bz,
             bh,
             ti,
             dec,
             dip,
             gv;
     sp[0] = 0.0;
     sp[1] = srlon;
     cp[1] = crlon;
     tc[0][0] = 0;
     cp[0] = 1.0;
     pp[0] = 1.0;
     p[0][0] = 1;
     /* CONVERT FROM GEODETIC COORDS. TO SPHERICAL COORDS. */
     q = Math.sqrt(a2 - c2 * srlat2);
     q1 = alt * q;
     q2 = ((q1 + a2) / (q1 + b2)) * ((q1 + a2) / (q1 + b2));
     ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
     st = Math.sqrt(1.0 - (ct * ct));
     r2 = (alt * alt) + 2.0 * q1 + (a4 - c4 * srlat2) / (q * q);
     r = Math.sqrt(r2);
     d = Math.sqrt(a2 * crlat2 + b2 * srlat2);
     ca = (alt + d) / r;
     sa = c2 * crlat * srlat / (r * d);
     for (m = 2; m <= maxord; m++) {
       sp[m] = sp[1] * cp[m - 1] + cp[1] * sp[m - 1];
       cp[m] = cp[1] * cp[m - 1] - sp[1] * sp[m - 1];
     }

     aor = re / r;
     ar = aor * aor;
     for (n = 1; n <= maxord; n++) {
       ar = ar * aor;
       for (m = 0, D4 = (n + m + 1); D4 > 0; D4--, m++) {

         /*
          COMPUTE UNNORMALIZED ASSOCIATED LEGENDRE POLYNOMIALS
          AND DERIVATIVES VIA RECURSION RELATIONS
          */
         if (n === m) {
           p[m][n] = st * p[m - 1][n - 1];
           dp[m][n] = st * dp[m - 1][n - 1] + ct *
                   p[m - 1][n - 1];
         } else if (n === 1 && m === 0) {
           p[m][n] = ct * p[m][n - 1];
           dp[m][n] = ct * dp[m][n - 1] - st * p[m][n - 1];
         } else if (n > 1 && n !== m) {
           if (m > n - 2) {
             p[m][n - 2] = 0;
           }
           if (m > n - 2) {
             dp[m][n - 2] = 0.0;
           }
           p[m][n] = ct * p[m][n - 1] - k[m][n] * p[m][n - 2];
           dp[m][n] = ct * dp[m][n - 1] - st * p[m][n - 1] -
                   k[m][n] * dp[m][n - 2];
         }

         /*
          TIME ADJUST THE GAUSS COEFFICIENTS
          */

         tc[m][n] = c[m][n] + dt * cd[m][n];
         if (m !== 0) {
           tc[n][m - 1] = c[n][m - 1] + dt * cd[n][m - 1];
         }

         /*
          ACCUMULATE TERMS OF THE SPHERICAL HARMONIC EXPANSIONS
          */
         par = ar * p[m][n];
         if (m === 0) {
           temp1 = tc[m][n] * cp[m];
           temp2 = tc[m][n] * sp[m];
         } else {
           temp1 = tc[m][n] * cp[m] + tc[n][m - 1] * sp[m];
           temp2 = tc[m][n] * sp[m] - tc[n][m - 1] * cp[m];
         }
         bt = bt - ar * temp1 * dp[m][n];
         bp += (fm[m] * temp2 * par);
         br += (fn[n] * temp1 * par);
         /*
          SPECIAL CASE:  NORTH/SOUTH GEOGRAPHIC POLES
          */
         if (st === 0.0 && m === 1) {
           if (n === 1) {
             pp[n] = pp[n - 1];
           } else {
             pp[n] = ct * pp[n - 1] - k[m][n] * pp[n - 2];
           }
           parp = ar * pp[n];
           bpp += (fm[m] * temp2 * parp);
         }
       }
     }

     bp = (st === 0.0 ? bpp : bp / st);
     /*
      ROTATE MAGNETIC VECTOR COMPONENTS FROM SPHERICAL TO
      GEODETIC COORDINATES
      */
     bx = -bt * ca - br * sa;
     by = bp;
     bz = bt * sa - br * ca;
     /*
      COMPUTE DECLINATION (DEC), INCLINATION (DIP) AND
      TOTAL INTENSITY (TI)
      */
     bh = Math.sqrt((bx * bx) + (by * by));
     ti = Math.sqrt((bh * bh) + (bz * bz));
     dec = this.rad2deg(Math.atan2(by, bx));
     dip = this.rad2deg(Math.atan2(bz, bh));
     /*
      COMPUTE MAGNETIC GRID VARIATION IF THE CURRENT
      GEODETIC POSITION IS IN THE ARCTIC OR ANTARCTIC
      (I.E. GLAT > +55 DEGREES OR GLAT < -55 DEGREES)
      OTHERWISE, SET MAGNETIC GRID VARIATION TO -999.0
      */

     if (Math.abs(glat) >= 55.0) {
       if (glat > 0.0 && glon >= 0.0) {
         gv = dec - glon;
       } else if (glat > 0.0 && glon < 0.0) {
         gv = dec + Math.abs(glon);
       } else if (glat < 0.0 && glon >= 0.0) {
         gv = dec + glon;
       } else if (glat < 0.0 && glon < 0.0) {
         gv = dec - Math.abs(glon);
       }
       if (gv > 180.0) {
         gv -= 360.0;
       } else if (gv < -180.0) {
         gv += 360.0;
       }
     }

     this.dt = dt;
     this.dec = dec;
     this.dip = dip;
     this.ti = ti;
     this.bh = bh;
     this.bx = bx;
     this.by = by;
     this.bz = bz;
     this.glat = glat;
     this.glon = glon;
     this.gv = gv;

     return {
       dec: dec,
       dip: dip,
       ti: ti,
       bh: bh,
       bx: bx,
       by: by,
       bz: bz,
       lat: glat,
       lon: glon,
       gv: gv
     };
   }

   /**
    *  Getter for complete magnetic object
    *
    *  @returns {object} Object containing the calculated data
    */
   get getMagObject() {
     return {
       dec: this.dec,
       dip: this.dip,
       ti: this.ti,
       bh: this.bh,
       bx: this.bx,
       by: this.by,
       bz: this.bz,
       lat: this.glat,
       lon: this.glon,
       gv: this.gv
     };
   }

   /**
    *  Getter for COF data
    *
    *  @returns {string} String containing the read data
    */
   get getCof() {
     return this.cof;
   }
   /**
    *  Setter for COF data
    *
    *  @param {string} cof String containing the data to be parsed
    *  @returns {null}
    */
   set setCof(cof) {
     this.wmm = this.parseCOF(cof);
     this.unnormalizedWMM = this.unnormalize(this.wmm);
   }

   /**
    *  Getter for ellipsoid data
    *
    *  @returns {object} Object containing the a and b variable
    */
   get getEllipsoid() {
     return {
       a: this.a,
       b: this.b
     };
   }

   /**
    *  Setter for ellipsoid data
    *
    *  @param {object} objE Object containing the a and b variable {a: n, b: n}
    *  @returns {null}
    */
   setEllipsoid(objE) {
     this.a = objE.a;
     this.b = objE.b;
     this.re = 6371.2;
     this.a2 = a * a;
     this.b2 = b * b;
     this.c2 = a2 - b2;
     this.a4 = a2 * a2;
     this.b4 = b2 * b2;
     this.c4 = a4 - b4;
   }

   /**
    *  Getter for VMM Unnormalized
    *
    *  @returns {object} Object VMM
    */
   get getWMMunnormalized() {
     return this.unnormalizedWMM;
   }

   /**
    *  Getter for VMM
    *
    *  @returns {object} Object VMM
    */
   get getWMM() {
     return this.wmm;
   }

   /**
    *  Epoch
    *
    *  @returns {integer} Epoch
    */
   get getEpoch() {
     return this.unnormalizedWMM.epoch;
   }

   /**
    *  Decimal date minus epoch
    *
    *  @returns {float} Decimal date minus epoch
    */
   get getDt() {
     return this.dt;
   }

   /**
    *  Geomagnetic declination (variation)
    *  in decimal degrees, east is positive
    *
    *  @returns {float} Geomagnetic declination (variation)
    */
   get getDec() {
     return this.dec;
   }

   /**
    *  Geomagnetic dip in decimal degrees, down is positive
    *
    *  @returns {float} Geomagnetic dip
    */
   get getDip() {
     return this.dip;
   }

   /**
    *  Total Intensity of the geomagnetic field in  nanoteslas
    *
    *  @returns {float} Total Intensity of the geomagnetic field in  nanoteslas
    */
   get getTi() {
     return this.ti;
   }

   /**
    *  Horizontal Intensity of the geomagnetic field in nT
    *
    *  @returns {float} Horizontal Intensity of the geomagnetic field in nT
    */
   get getBh() {
     return this.bh;
   }

   /**
    *  North Component of the geomagnetic field in nT
    *
    *  @returns {float} North Component of the geomagnetic field in nT
    */
   get getBx() {
     return this.bx;
   }

   /**
    *  East Component of the geomagnetic field in nT
    *
    *  @returns {float} East Component of the geomagnetic field in nT
    */
   get getBy() {
     return this.by;
   }

   /**
    *  Vertical Component of the geomagnetic field (down is positive)
    *
    *  @returns {float} Vertical Component of the geomagnetic field
    */
   get getBz() {
     return this.bz;
   }

   /**
    *  Latitude for calculation in degrees
    *
    *  @returns {float} Latitude for calculation in degrees
    */
   get getLatDec() {
     return this.glat;
   }

   /**
    *  Longitude for calculation in degrees
    *
    *  @returns {float} Longitude for calculation in degrees
    */
   get getLonDec() {
     return this.glon;
   }

 }

 export { GeoMag as default };