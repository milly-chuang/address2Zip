// Generated by CoffeeScript 1.6.3
(function() {
  var CONN_STRING, MongoClient, async, db, fs, getArea, getCity, getZipCode, insertTaiwanArea, insertTaiwanCity, insertTaiwanZipCode, restify, server, taiwanAreaFile, taiwanCityFile, taiwanZipCodeFile, zipUtility;

  restify = require('restify');

  async = require('async');

  fs = require('fs');

  MongoClient = require('mongodb').MongoClient;

  zipUtility = require('./zipCodeUtility');

  db = require('./config/my.conf');

  CONN_STRING = 'mongodb://' + (db.DB_USER !== '' ? db.DB_USER : '') + (db.DB_PASSWORD !== '' ? ':' + db.DB_PASSWORD : '') + (db.DB_USER !== '' ? '@' : '') + db.DB_HOST + ':' + db.DB_PORT + '/' + db.DB_NAME;

  taiwanCityFile = 'tmpData/TWcity.data';

  taiwanAreaFile = 'tmpData/TWarea.data';

  taiwanZipCodeFile = 'tmpData/zip5.data';

  insertTaiwanCity = function(req, res, next) {
    var cities, taiwanCity, token;
    token = '1658F7ED9FBACF737B58FE3DA1933';
    taiwanCity = fs.readFileSync(taiwanCityFile, 'utf8');
    cities = taiwanCity.split('\n');
    if (!req.params.token || req.params.token !== token) {
      res.write('Error, please recheck to administrator');
      res.end();
    } else {
      MongoClient.connect(CONN_STRING, function(err, db) {
        if (err) {
          console.log(err);
          next();
        }
        db.createCollection('country', function(err, collection) {
          var i;
          if (err) {
            console.log(err);
            next();
          }
          i = 0;
          while (i < (cities.length - 1)) {
            collection.insert({
              country: 'TW',
              city: cities[i]
            }, function() {});
            i++;
          }
        });
      });
      res.write('Done!');
      res.end();
    }
  };

  insertTaiwanArea = function(req, res, next) {
    var areas, taiwanArea, token;
    token = '1658F7ED9FBACF737B58FE3DA1933';
    taiwanArea = fs.readFileSync(taiwanAreaFile, 'utf8');
    areas = taiwanArea.split('\n');
    if (!req.params.token || req.params.token !== token) {
      res.write('Error, please recheck to administrator');
      res.end();
    } else {
      MongoClient.connect(CONN_STRING, function(err, db) {
        if (err) {
          console.log(err);
          next();
        }
        db.createCollection('city', function(err, collection) {
          var areaElement, i;
          if (err) {
            console.log(err);
            next();
          }
          i = 0;
          while (i < (areas.length - 1)) {
            areaElement = areas[i].split(',');
            collection.insert({
              city: areaElement[0],
              area: areaElement[1]
            }, function() {});
            i++;
          }
        });
      });
      res.write('Done!');
      res.end();
    }
  };

  insertTaiwanZipCode = function(req, res, next) {
    var taiwanZipCodes, token, zipCodes;
    token = '1658F7ED9FBACF737B58FE3DA1933';
    taiwanZipCodes = fs.readFileSync(taiwanZipCodeFile, 'utf8');
    zipCodes = taiwanZipCodes.split('\n');
    if (!req.params.token || req.params.token !== token) {
      res.write('Error, please recheck to administrator');
      res.end();
    } else {
      MongoClient.connect(CONN_STRING, function(err, db) {
        if (err) {
          console.log(err);
          next();
        }
        db.createCollection('zip', function(err, collection) {
          var area, city, i, road, scope, scopeEle, zipCode, zipElement;
          if (err) {
            console.log(err);
            next();
          }
          i = 0;
          while (i < (zipCodes.length - 1)) {
            zipElement = zipCodes[i].split(',');
            zipCode = zipElement[0];
            city = zipElement[1];
            area = zipElement[2];
            road = zipUtility.numberToChinese(zipUtility.numberFullToHalf(zipElement[3]));
            scope = zipElement[4];
            scopeEle = zipUtility.decomposeScope(scope, i);
            if (scopeEle != null) {
              collection.insert({
                zipcode: zipCode,
                city: city,
                area: area,
                road: road,
                laneOdevity: scopeEle[0][0],
                laneMin: scopeEle[0][1],
                laneMax: scopeEle[0][2],
                alleyOdevity: scopeEle[1][0],
                alleyMin: scopeEle[1][1],
                alleyMax: scopeEle[1][2],
                noOdevity: scopeEle[2][0],
                noMin: scopeEle[2][1],
                noMax: scopeEle[2][2],
                floorOdevity: scopeEle[3][0],
                floorMin: scopeEle[3][1],
                floorMax: scopeEle[3][2]
              }, function() {});
            }
            i++;
          }
        });
      });
      res.write('Done!');
      res.end();
    }
  };

  getCity = function(req, res, next) {
    var country, token;
    token = '1658F7ED9FBACF737B58FE3DA1933';
    res.setHeader('X-Powered-By', 'ZipCode');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
    country = req.params.country;
    if (!req.params.token || req.params.token !== token || !country) {
      res.write(req.params);
      res.write('Error, please recheck to administrator');
      res.end();
    } else {
      MongoClient.connect(CONN_STRING, function(err, db) {
        var countryCollection;
        if (err) {
          console.log(err);
          next();
        }
        countryCollection = db.collection('country');
        return countryCollection.find({
          country: country
        }).toArray(function(err, cities) {
          if (err) {
            console.log(err);
            next();
          }
          res.write(JSON.stringify(cities));
          res.end();
          return db.close;
        });
      });
    }
  };

  getArea = function(req, res, next) {
    var city, token;
    token = '1658F7ED9FBACF737B58FE3DA1933';
    res.setHeader('X-Powered-By', 'ZipCode');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
    city = req.params.city;
    if (!req.params.token || req.params.token !== token || !city) {
      res.write('Error, please recheck to administrator');
      res.write(req.params);
      res.end();
    } else {
      MongoClient.connect(CONN_STRING, function(err, db) {
        var cityCollection;
        if (err) {
          console.log(err);
          next();
        }
        cityCollection = db.collection('city');
        return cityCollection.find({
          city: city
        }).toArray(function(err, areas) {
          if (err) {
            console.log(err);
            next();
          }
          res.write(JSON.stringify(areas));
          res.end();
          return db.close;
        });
      });
    }
  };

  getZipCode = function(req, res, next) {
    var addrElement, addrSource, token, zipJSON, zipQuery;
    token = '1658F7ED9FBACF737B58FE3DA1933';
    res.setHeader('X-Powered-By', 'ZipCode');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
    addrSource = req.params.addr;
    zipJSON = {
      zipCode: '',
      addrSource: addrSource
    };
    if (!req.params.token || req.params.token !== token || !addrSource) {
      res.write('Error, please recheck to administrator');
      res.end();
    } else {
      addrElement = zipUtility.decomposeAddr(addrSource);
      zipQuery = {
        city: addrElement.city,
        area: addrElement.area,
        road: addrElement.road
      };
      MongoClient.connect(CONN_STRING, function(err, db) {
        var addrZip, zipCollection;
        if (err) {
          console.log(err);
          next();
        }
        zipCollection = db.collection('zip');
        addrZip = void 0;
        return async.waterfall([
          function(callback) {
            if (addrElement.road) {
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null);
                }
              });
            } else {
              return callback('failure');
            }
          }, function(callback) {
            var roadAdjust;
            roadAdjust = /[〇ㄧ一二三四五六七八九十]+鄰/.exec(addrElement.road);
            if (roadAdjust) {
              addrElement.road = addrElement.road.replace(roadAdjust, '');
              zipQuery.road = addrElement.road;
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null, addrElement);
                }
              });
            } else {
              return callback(null, addrElement);
            }
          }, function(addrElement, callback) {
            var roadAdjust;
            roadAdjust = addrElement.road.split(/^.里里|^.里村|^.村里|^.{2}[里村]/)[1];
            if (roadAdjust) {
              addrElement.road = roadAdjust;
              zipQuery.road = addrElement.road;
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null, addrElement);
                }
              });
            } else {
              return callback(null, addrElement);
            }
          }, function(addrElement, callback) {
            var flag;
            flag = false;
            if (addrElement.lane && (addrElement.lane % 1) !== 0) {
              addrElement.lane = parseInt(addrElement.lane);
              flag = true;
            }
            if (addrElement.alley && (addrElement.alley % 1) !== 0) {
              addrElement.alley = parseInt(addrElement.alley);
              flag = true;
            }
            if (addrElement.no && (addrElement.no % 1) !== 0) {
              addrElement.no = parseInt(addrElement.no);
              flag = true;
            }
            if (flag) {
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null, addrElement);
                }
              });
            } else {
              return callback(null, addrElement);
            }
          }, function(addrElement, callback) {
            var reg;
            reg = /村$|里$/;
            if (reg.test(addrElement.road)) {
              zipQuery.road = addrElement.road.replace(reg, '');
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null, addrElement);
                }
              });
            } else {
              return callback(null, addrElement);
            }
          }, function(addrElement, callback) {
            if (addrElement.road.indexOf('十') > 0) {
              zipQuery.road = addrElement.road.replace('十', '');
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null, addrElement);
                }
              });
            } else {
              return callback(null, addrElement);
            }
          }, function(addrElement, callback) {
            var flag;
            flag = false;
            if (addrElement.lane) {
              addrElement.road = addrElement.road + zipUtility.numberToChinese(addrElement.lane) + '巷';
              addrElement.lane = '';
              flag = true;
            } else if (addrElement.alley) {
              addrElement.road = addrElement.road + zipUtility.numberToChinese(addrElement.alley) + '弄';
              addrElement.alley = '';
              flag = true;
            }
            if (flag) {
              zipQuery.road = addrElement.road;
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null, addrElement);
                }
              });
            } else {
              return callback(null, addrElement);
            }
          }, function(addrElement, callback) {
            if (addrElement.road.indexOf('十') > 0) {
              zipQuery.road = addrElement.road.replace('十', '');
              return zipCollection.find(zipQuery).toArray(function(err, zipDatas) {
                var zipData, _i, _len;
                if (err) {
                  console.log(err);
                  next();
                }
                for (_i = 0, _len = zipDatas.length; _i < _len; _i++) {
                  zipData = zipDatas[_i];
                  if (zipUtility.isInZipDataScope(zipData, addrElement)) {
                    addrZip = zipData;
                  }
                }
                if (addrZip) {
                  return callback('success', addrZip);
                } else {
                  return callback(null, addrElement);
                }
              });
            } else {
              return callback('failure');
            }
          }
        ], function(message, addrZip) {
          if (message === 'success') {
            zipJSON.zipCode = addrZip.zipcode;
          }
          res.write(JSON.stringify(zipJSON));
          res.end();
          return db.close();
        });
      });
    }
  };

  /*
  Creat a server
  */


  server = restify.createServer({
    name: 'ZipCodeApi',
    version: '1.0.0'
  });

  server.use(restify.queryParser());

  server.use(restify.bodyParser());

  server.use(restify.jsonp());

  server.use(restify.gzipResponse());

  server.get('/insertTaiwanCity', insertTaiwanCity);

  server.get('/insertTaiwanArea', insertTaiwanArea);

  server.get('/insertTaiwanZipCode', insertTaiwanZipCode);

  server.post('/getZipCode', getZipCode);

  server.post('/getCity', getCity);

  server.post('/getArea', getArea);

  server.listen(1339, function() {
    return console.log('%s listening at %s', server.name, server.url);
  });

}).call(this);
