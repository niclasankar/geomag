# geomag Javascript class

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

This is a Javascript class used for calculating the magnetic anomalities
on earth from a geomagnetic model from [NOAA](https://www.ncei.noaa.gov/products/world-magnetic-model)

The code was originally created by Github user cmweiss some years ago and have not been updated in a long time.
I have created a javascript class from the code for use in my own projects.

##Usage:
- Import the geomag class in your script
- Load the COF file by AJAX or some other method

```bash
  // Init object
  var objGeoMag = new GeoMag(strCOFClassData);

  // Calculate model
  objGeoMag.calculate(floatLat, floatLon, floatAlt, dteCalcDate);

  // Geomagnetic declination
  floatDec = objGeoMag.getDec;
  // Geomagnetic inclination
  floatDip = objGeoMag.getDip;
  // Total intensity of the geomagnetic field
  floatTi = objGeoMag.getTi;
  // Horizontal intensity of the geomagnetic field
  floatBh = objGeoMag.getBh;
  // Northern component of the geomagnetic field
  floatBx = objGeoMag.getBx;
  // Eastern component of the geomagnetic field
  floatBy = objGeoMag.getBy;
  // Vertical component of the geomagnetic field
  floatBz = objGeoMag.getBz;
  // Epoch
  varEpoch = objGeoMag.getEpoch;
  // Latitude
  floatLat = objGeoMag.getLatDec;
  // Longitude
  floatLon = objGeoMag.getLonDec;

```