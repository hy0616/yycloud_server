var EventEmitter = require('events').EventEmitter,
  _ = require('lodash'),
  util = require('util'),
  Promise = require('bluebird'),
  db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis'),
  baiduMap = require('../../utils/BaiduMapService');

require('../../utils/log_entrance/cmlog');

var GeoGroupData = function () {
  EventEmitter.call(this);
};

util.inherits(GeoGroupData, EventEmitter);
var geoGroupDataGlobal = new GeoGroupData();
module.exports = GeoGroupData;
module.exports.geoGroupData = geoGroupDataGlobal;

GeoGroupData.prototype.autoGeoGroup = function (data) {
  if (undefined === data.remote_address) {
    data.remote_address = {};
    data.remote_address.ip = "";
  }
  baiduMap.getCoorByIp(data.remote_address.ip)
    .then(function (addrInfo) {
      var lat = data.lat,
        lng = data.lng;
      return getLocationInfo(addrInfo, lat, lng);
    }).then(function (location) {
      addSmartGateToGroup(location, data.sn)
        .then(function (err) {
        })
    })
};

function getAddressByXY(lat, lng) {
  return new Promise(function (resolve, reject) {
    baiduMap.getAddressByCoor(lat, lng).then(function (data) {
      resolve(data);
    }).catch(function (error) {
      reject(error);
    })
  });
};

function getLocationInfo(addrInfo, lat, lng) {
  if (lat != undefined && lng != undefined && _.isNumber(lat) && _.isNumber(lng)) {
    return new Promise(function (resolve, reject) {
      getAddressByXY(lat, lng)
        .then(function (address) {
          var result = address.result;
          var location = {};
          location.address = result.formatted_address;
          location.country = result.addressComponent.country;
          location.province = result.addressComponent.province;
          location.city = result.addressComponent.city;
          location.city_code = result.cityCode;
          location.district = result.addressComponent.district;
          location.street = result.addressComponent.street;
          location.street_number = result.addressComponent.street_number;
          location.lat = lat;
          location.lng = lng;
          resolve(location);
        });
    });
  } else {
    return new Promise(function (resolve, reject) {
      var location = {};
      var detail = addrInfo.content.address_detail;
      location.address = addrInfo.content.address;
      location.country = addrInfo.address.split('|')[0];
      location.province = detail.province;
      location.city = detail.city;
      location.city_code = detail.city_code;
      location.district = detail.district;
      location.street = detail.street;
      location.street_number = detail.street_number;
      location.lat = addrInfo.content.point.y;
      location.lng = addrInfo.content.point.x;
      resolve(location);
    });
  }
}

function addSmartGateToGroup(location, smartGateSn) {
  return new Promise(function (resolve, reject) {
    var country = location.country,
      province = location.province,
      city = location.city,
      district = location.district;

    if (province == city) {
      var province_real = province + '(直辖)';
    } else {
      var province_real = province;
    }

    var queryCondition = {
      country: country,
      province: province_real,
      city: city,
      district: district
    };

    db.findOne(TableNames.GEOGROUP, queryCondition)
      .then(function (geogroup) {
        if (undefined === geogroup) {
          queryCondition.lat = location.lat,
            queryCondition.lng = location.lng;
          return db.create(TableNames.GEOGROUP, queryCondition)
            .then(function (geogroup) {
              return geogroup;
            })
        } else {
          return geogroup;
        }
      }).then(function (geogroup) {
        geogroup.smartgates.add(smartGateSn);
        return geogroup;
      }).then(function (geogroup) {
        geogroup.save(function (err) {
          if (err) {
          }
          resolve(err);
        })
      })
  })
}