(function() {
  /*
  Setup some global variables
  */  var Location, Photo, Photos, apiKey, geolocationUrl, photoInfoUrl, photos, url, userid;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  apiKey = '7a2f5d3ce2023cc47b01aa04dcc11c92';
  userid = '20232234@N00';
  url = 'http://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&per_page=100&page=1&format=json&jsoncallback=?';
  geolocationUrl = 'http://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&format=json&jsoncallback=?';
  photoInfoUrl = 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&jsoncallback=?';
  photos = null;
  /*
  Object that represents a Set of public photos. 
  Has collection of Photos
  */
  Photos = (function() {
    function Photos() {
      this.items = [];
    }
    Photos.prototype.add = function(Photo) {
      return this.items.push(Photo);
    };
    return Photos;
  })();
  /*
  Helper object representing the location data
  */
  Location = (function() {
    function Location(item) {
      this.latitude = item.latitude;
      this.longitude = item.longitude;
      this.content = item.locality._content;
      this.region = item.region._content;
      this.url = 'http://www.flickr.com/map?fLat=' + this.latitude + '&fLon=' + item.longitude + '&zl=1" target="_blank">' + this.content + ', ' + this.region;
    }
    return Location;
  })();
  /*
  Object representing a photo from flickr
  */
  Photo = (function() {
    var renderComments, renderDescription, renderLocation, renderTags;
    function Photo(item) {
      this.id = item.id;
      this.title = item.title;
      this.farm = item.farm;
      this.owner = item.owner;
      this.secret = item.secret;
      this.server = item.server;
      this.location = [];
      this.realname = '';
      this.url = 'http://farm' + this.farm + '.static.flickr.com/' + this.server + '/' + this.id + '_' + this.secret + '_m.jpg';
    }
    /*
       	Makes call to get the Geolocation for a picture, and renders it if it exists.
       	*/
    Photo.prototype.getGeo = function() {
      return $.getJSON(geolocationUrl, {
        photo_id: this.id,
        api_key: apiKey
      }, __bind(function(data) {
        if (data.stat !== 'fail') {
          return renderLocation(new Location(data.photo.location), this.id);
        }
      }, this));
    };
    /*
    	Renders a photo from flickr
    	*/
    Photo.prototype.render = function() {
      return $.getJSON(photoInfoUrl, {
        photo_id: this.id,
        api_key: apiKey
      }, __bind(function(data) {
        var anchor, container, imageinfo, span;
        container = $("<div/>").attr("id", this.id).attr("class", "image-container").attr("style", "background:url('" + this.url + "');");
        imageinfo = $("<div/>").attr("class", "image-info").attr("id", this.id + "_info");
        anchor = $("<a/>").attr("class", "title").attr("href", "http://www.flickr.com/photos/" + this.owner + "/" + this.id).text(this.title);
        span = $("<span/>").attr("class", "author").text(" by " + data.photo.owner.realname);
        span.appendTo(anchor);
        anchor.appendTo(imageinfo);
        imageinfo.appendTo(container);
        container.appendTo("#container");
        renderComments(data, this.id);
        renderTags(data, this.id);
        renderDescription(data, this.id);
        return this.getGeo();
      }, this));
    };
    renderTags = function(data, id) {
      var count, len, tag, tagTitle, tags, _i, _len, _ref;
      tagTitle = $("<span/>").attr("class", "infoTitle").attr("id", id + "_title").text("Tags: ");
      len = data.photo.tags.tag.length;
      count = 1;
      _ref = data.photo.tags.tag;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        tags = $("<a/>").attr("href", "http://www.flickr.com/photos/tags/" + tag._content).text(tag.raw);
        if (count < len) {
          $("<span/>").text(", ").appendTo(tags);
        }
        tags.appendTo(tagTitle);
        count++;
      }
      return tagTitle.appendTo("#" + id + "_info");
    };
    renderComments = function(data, id) {
      var comment, span;
      comment = $("<span/>").attr("class", "infoTitle").attr("id", id + "_comments").text("Comments: ");
      span = $("<span/>").text(data.photo.comments._content);
      span.appendTo(comment);
      return comment.appendTo("#" + id + "_info");
    };
    renderDescription = function(data, id) {
      var desc, span;
      desc = $("<span/>").attr("class", "infoTitle").attr("id", id + "_desc").text("Description: ");
      span = $("<span/>").text(data.photo.description._content);
      span.appendTo(desc);
      return desc.appendTo("#" + id + "_info");
    };
    renderLocation = function(objLocation, id) {
      var anchor, location;
      location = $("<span/>").attr("class", "infoTitle").attr("id", id + "_location").text("Location: ");
      anchor = $("<a/>").attr("href", objLocation.url).text(objLocation.content + ", " + objLocation.region);
      anchor.appendTo(location);
      return location.appendTo("#" + id + "_info");
    };
    return Photo;
  })();
  $(".image-container").live('mouseover', function(event) {
    return $(this).children('div').attr('class', 'image-info-active');
  });
  $(".image-container").live('mouseout', function(event) {
    return $(this).children('div').attr('class', 'image-info');
  });
  $(document).ready(function() {
    return $.getJSON(url, {
      api_key: apiKey,
      user_id: userid
    }, function(data) {
      var item, p, _i, _len, _ref, _results;
      photos = new Photos();
      _ref = data.photos.photo;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        p = new Photo(item);
        photos.add(p);
        _results.push(p.render());
      }
      return _results;
    });
  });
}).call(this);
