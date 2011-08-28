###
Setup some global variables
###
apiKey = '7a2f5d3ce2023cc47b01aa04dcc11c92'
userid = '20232234@N00'
url = 'http://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&per_page=100&page=1&format=json&jsoncallback=?'
geolocationUrl = 'http://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&format=json&jsoncallback=?'
photoInfoUrl = 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&jsoncallback=?'
photos = null


###
Object that represents a Set of public photos. 
Has collection of Photos
###
class Photos
	constructor:() ->
		@items = []
	add: (Photo) ->
    @items.push(Photo)

###
Helper object representing the location data
###
class Location
	constructor: (item) ->
		@latitude = item.latitude
		@longitude = item.longitude
		@content = item.locality._content
		@region = item.region._content
		@url = 'http://www.flickr.com/map?fLat=' + @latitude + '&fLon='+ item.longitude + '&zl=1" target="_blank">' + @content + ', ' + @region

###
Object representing a photo from flickr
###
class Photo
	constructor: (item) ->
    	@id = item.id
    	@title = item.title
   		@farm = item.farm
   		@owner = item.owner
   		@secret = item.secret
   		@server = item.server
   		@location = []
   		@realname = ''
   		@url = 'http://farm' + @farm + '.static.flickr.com/' + @server + '/' + @id + '_' + @secret + '_m.jpg'

   	###
   	Makes call to get the Geolocation for a picture, and renders it if it exists.
   	###
   	getGeo:->$.getJSON geolocationUrl,{photo_id:@id,api_key:apiKey},
   		(data)=>
   			if data.stat != 'fail' then renderLocation(new Location(data.photo.location),@id)
	
	###
	Renders a photo from flickr
	###
	render:->$.getJSON photoInfoUrl,{photo_id:@id,api_key:apiKey},
		(data)=>
			container = $("<div/>").attr("id",@id).attr("class","image-container").attr("style","background:url('" + @url + "');");
			imageinfo = $("<div/>").attr("class","image-info").attr("id",@id + "_info")
			anchor = $("<a/>").attr("class","title").attr("href","http://www.flickr.com/photos/" + @owner + "/" + @id).text(@title)
			span = $("<span/>").attr("class","author").text(" by " + data.photo.owner.realname)
			span.appendTo(anchor)
			anchor.appendTo(imageinfo)
			imageinfo.appendTo(container)
			container.appendTo("#container")
			renderComments(data,@id)
			renderTags(data,@id)
			renderDescription(data,@id)
			@getGeo()
			
	#little issue with function scope and parameter passing.  Really want these functions to be part
	#of the class prototype.....will come back to...for now this works.
	renderTags=(data,id) ->
			tagTitle = $("<span/>").attr("class","infoTitle").attr("id",id+"_title").text("Tags: ")
			len = data.photo.tags.tag.length
			count = 1
			for tag in data.photo.tags.tag
				tags = $("<a/>").attr("href","http://www.flickr.com/photos/tags/" + tag._content).text(tag.raw)
				if count < len then $("<span/>").text(", ").appendTo(tags)
				tags.appendTo(tagTitle)
				count++
			tagTitle.appendTo("#" + id + "_info")
	
	renderComments=(data,id) ->
		comment = $("<span/>").attr("class","infoTitle").attr("id",id+"_comments").text("Comments: ")
		span = $("<span/>").text(data.photo.comments._content)
		span.appendTo(comment)
		comment.appendTo("#" + id + "_info")
		
	renderDescription=(data,id) ->
		desc = $("<span/>").attr("class","infoTitle").attr("id",id+"_desc").text("Description: ")
		span = $("<span/>").text(data.photo.description._content)
		span.appendTo(desc)
		desc.appendTo("#" + id + "_info")
		
	renderLocation=(objLocation,id) ->
		location = $("<span/>").attr("class","infoTitle").attr("id",id+"_location").text("Location: ")
		anchor = $("<a/>").attr("href",objLocation.url).text(objLocation.content + ", " + objLocation.region)
		anchor.appendTo(location)
		location.appendTo("#" + id + "_info")
		
	#end scope issue functions

		
$(".image-container").live 'mouseover', (event) ->
	$(this).children('div').attr('class', 'image-info-active');

$(".image-container").live 'mouseout', (event) ->
	$(this).children('div').attr('class', 'image-info');

$(document).ready ->
	$.getJSON url,{api_key:apiKey,user_id:userid},
		(data)->
			photos = new Photos()
			for item in data.photos.photo
				p = new Photo(item)
				photos.add(p)
				p.render()

	