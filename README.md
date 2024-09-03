# geomag Javascript class
This is a Javascript class used for calculating the magnetic anomalities
on earth from a geomagnetic model from [NOAA](https://www.ncei.noaa.gov/products/world-magnetic-model)

##Usage:
- Import the geomag class in your script
- Load the COF file via AJAX or some other method

´´´bash
         // Init object
         var objGeoMag = new GeoMag(strCOFClassData);

         // Calculate model
         objGeoMag.calculate(floatLat, floatLon, floatAlt, dteCalcDate);

´´´