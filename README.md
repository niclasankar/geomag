# geomag Javascript class

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

This is a Javascript class used for calculating the magnetic anomalities
on earth from a geomagnetic model from [NOAA](https://www.ncei.noaa.gov/products/world-magnetic-model)

The code was originally created by Github user cmweiss some years ago and have not been updated in a long time.
I have created a javascript class from the code for use in my own projects.

**Usage:
- Import the geomag class in your script
- Load the COF file via AJAX or some other method

´´´bash
         // Init object
         var objGeoMag = new GeoMag(strCOFClassData);

         // Calculate model
         objGeoMag.calculate(floatLat, floatLon, floatAlt, dteCalcDate);

´´´