# GeoMag Javascript class

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

This is a Javascript class used for calculating the magnetic anomalities
on earth from a geomagnetic model from [NOAA](https://www.ncei.noaa.gov/products/world-magnetic-model)

The code was originally created by Github user cmweiss some years ago and have not been updated in a long time.
I have created a javascript class from the code for use in my own projects.

## Usage:
- Import the geomag class in your script
- Load the COF file by AJAX or some other method
- Create a GeoMag instance
- Call the calculate method supplying longitude, latitude, altitude and date

```javascript
  import GeoMag from './js/geomag.class.js';

  var path = window.location.href.split("/");
  path.pop();
  var path = path.join("/");

  var cofdata = "";
  var cofrequest = $.ajax({
   url: path + "./cof/WMM2020.COF",
    statusCode: {
     404: function () {
      console.log("Could not load the COF file");
     }
    }
  });

  cofrequest.done(function (data) {
   console.log("Success loading COF...");
   cofdata = data;
  });

  // Input
  var lat = 56.137759749100034
  var lon = 8.965967415150057
  var alt = 58
  var epochdate = new Date("2024-02-13");

  // Init object
  var gm = new GeoMag(cofdata);

  // Calculate model
  gm.calculate(lat, lon, alt, epochdate);

  // Geomagnetic declination
  var dec = gm.getDec;
  // Geomagnetic inclination
  dip = gm.getDip;
  // Total intensity of the geomagnetic field
  ti = gm.getTi;
  // Horizontal intensity of the geomagnetic field
  bh = gm.getBh;
  // Northern component of the geomagnetic field
  bx = gm.getBx;
  // Eastern component of the geomagnetic field
  by = gm.getBy;
  // Vertical component of the geomagnetic field
  bz = gm.getBz;
  // Epoch
  epoch = gm.getEpoch;
  // Latitude
  latout = gm.getLatDec;
  // Longitude
  lonout = gm.getLonDec;

```
