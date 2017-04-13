var sLoc = '';
var resultsArr = {};

function localVenues(userIP,uid){
  axios.get('https://freegeoip.net/json/' + userIP).then(function(data){sLoc = data.data.city;findRest(uid);}).catch(function(err){console.log(err);});
}
function findRest(uid){
  if(!sessionStorage.getItem("place")){
  if(document.getElementById('searchLoc').value !== ''){
    sLoc = document.getElementById('searchLoc').value.toLowerCase();
  }else{
    sLoc = sLoc.toLowerCase();
  }
}else{
  sLoc = sessionStorage.getItem("place");
  sessionStorage.removeItem("place");
}
  var searchString = 'https://api.foursquare.com/v2/venues/explore?near=' + sLoc + '&query=' + document.getElementById('selOpt').value + '&venuePhotos=1&limit=10&radius=2000&client_id=0U5IBPKKCPUE0IYGZYZELA250GCYUHHBN145VJYH4OFGXPQJ&client_secret=OFOS3R50FERIN13NZJEJILX5ETHOQGVQXOQKE0W454XKBIDM&v=20170408';
  axios.post('/checkGuests/'+ sLoc).then(function(data){resultsArr = data;}).catch(function(err){console.log(err);});
  axios.get(searchString).then(function(response){
    var linkString = '<h6>' + document.getElementById('selOpt').value.toUpperCase() + ' in ' + sLoc.toUpperCase() + '</h6>';
    for(var x=0;x<response.data.response.groups[0].items.length;x++){
    var curMem = '0';
    var memCount = 0;
    var rating = response.data.response.groups[0].items[x].venue.rating.toString();
    for(var y=0;y<resultsArr.data.length;y++){
      if(resultsArr.data[y].venueID == response.data.response.groups[0].items[x].venue.id){
        if(resultsArr.data[y].userList.indexOf(uid) > -1){
        curMem = 'You are ';
        memCount = resultsArr.data[y].userList.length -1;
        }
        else{
        curMem = resultsArr.data[y].userList.length.toString();
        memCount = resultsArr.data[y].userList.length;
        }
      }
    }
    linkString += '<div class="venueCont"><img class="pull-left" src="'+ response.data.response.groups[0].items[x].venue.photos.groups[0].items[0].prefix + '70x70' +response.data.response.groups[0].items[x].venue.photos.groups[0].items[0].suffix + '">';
    linkString += '<div class="rating">' + rating + '</div><h5>' + response.data.response.groups[0].items[x].venue.name + '</h5><button onclick="userGo(this)" data-id="' + response.data.response.groups[0].items[x].venue.id.toString() +
    '" data-name="' + response.data.response.groups[0].items[x].venue.name + '" data-mems="' + memCount + '" class="ordinary" style="margin-right:30px;border:none;height:20px;">' + curMem + ' going</button><p>' +
    response.data.response.groups[0].items[x].tips[0].text.substring(0,40) +'...</p><button onclick="tweetIt(this)" data-name="' + response.data.response.groups[0].items[x].venue.name + '" data-address="' + response.data.response.groups[0].items[x].venue.location.address + '('
    + response.data.response.groups[0].items[x].venue.location.crossStreet +  ')" class="tweet fa fa-twitter"></button></div>';
  }
    document.getElementById('links').innerHTML = linkString;
  }).catch(function(error){
    console.log(error);
  });
}
function userGo(element){
  var isGoing = true;
  axios.post('/'+ element.dataset.name + '/' + element.dataset.id + '/' + sLoc).then(function(data){
    if(data.status == 202) isGoing = false;
    if(isGoing){
    element.innerHTML = 'You are going';}
    else{element.innerHTML = element.dataset.mems + ' are going';}}).catch(function(err){location.href='/login/twitter';});
    sessionStorage.setItem("place", sLoc);
}
function tweetIt(elemental){
  tweetWindow = window.open('https://twitter.com/intent/tweet?text=' + elemental.dataset.name.toString() + ' at ' + elemental.dataset.address.toString() + ' tonight! Anyone in?', "twitter popup","height=300,width=450");
  tweetWindow.moveTo(screen.width/2 - 225,200);
}
function logIn(){
  location.href = '/login/twitter';
  sessionStorage.setItem("place", sLoc);
}
