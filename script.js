var url =  'https://jsonplaceholder.typicode.com';
var users;//Lista użytkowników
var row;
var posts;//Lista wszystkich postów.
var userPosts = [];//Posty posortowane zgodnie z autorami.
var comments;//wszsytkie komentarze
var postComments = []; //Komentarze przyporządkowane do numeru postu.
var stats = [];//Statystyka przyporządkowana do numeru postu.
var returnButton;

$.ajax({//Ładowanie listy użytkowników z api (odbywa się tylko raz).
  url: url + '/users',
  method: 'GET'
  }).then(function(usersGet) {
    users = usersGet;
    returnButton = document.getElementById("button");

    userList();//Ustawienie poprawnego wyświetlania się tabel i przycisku powrotu.

    usersTable = document.getElementById("userTable");
    row = usersTable.insertRow(0);//Pierwszy wiersz tabeli.
    row.style.backgroundColor = "#4CB050";
    row.style.color = "black";
    number = row.insertCell(0);
    user = row.insertCell(1);
    number.innerHTML = "Lp.";
    user.innerHTML = " Nazwa użytkownika";


    for (var i = 1; i <= users.length; i++){//Wypełnianie tabeli nazwami użytkowników.
         row = usersTable.insertRow(i);
         number = row.insertCell(0);
         user = row.insertCell(1);
         number.innerHTML = i + ". ";

         user.innerHTML = " " + users[i-1].name;
         row.onclick = function(i){
                         return function() {
                          displayPosts(i);
                          }
                      }(i)
       }
   });

 function userList(){//Funkcja wyświetlania listy użytkowników. Zrealizowana została poprzez ukrywanie/wyświetlanie poszczególnych elementów strony.
   document.getElementById("userTable").style.display="inline";
   document.getElementById("postsTable").style.display="none";
   document.getElementById('header').innerHTML = "Lista użytkowników."//Ustawienie tekstu nagłówka.
   returnButton.style.display = "none"//Ukrycie przycisku powrotu.

   $("#userTable").mouseover(function(){document.getElementById('onHooverText').innerHTML = "Wybierz użytkownika z listy by wyświetlić listę postów posty.";});
   $("#userTable").mouseleave(function(){document.getElementById('onHooverText').innerHTML = "";});
 }

 function postList(userId){//Funkcja wyświetlająca bierzącą listę postów.
     document.getElementById("postsTable").style.display="inline";
     document.getElementById("statsTable").style.display="none";
     document.getElementById('header').innerHTML = "Lista postów użytkownika" + " " + users.filter(function(user){ return user.id == userId })[0].name + ".";
     returnButton.onclick = function(){userList()};
     returnButton.innerHTML = "Powrót do listy użytkowników.";
     $("#postsTable").mouseover(function(){document.getElementById('onHooverText').innerHTML = "Wybierz post użytkownika z listy by wyświetlić statystykę użytych wyrazów.";});
     $("#postsTable").mouseleave(function(){document.getElementById('onHooverText').innerHTML = "";});
 }


 function displayPosts(userId){
   returnButton.style.display = "none";//Ukrywa przycisk powrotu.
   if(posts == null){//Jeżeli posty zostały już przedtem pobrane nie ma potrzeby ponownie łączyć się z serwerem.
       $.ajax({
         url: url + '/posts',
         method: 'GET'
       }).then(function(getPosts) {
         posts = getPosts;
         fillPostsTable(userId);
     })
   }else fillPostsTable(userId);


 }

function fillPostsTable(userId){

  returnButton.style.display = "inline"
  document.getElementById("userTable").style.display="none";
  postList(userId);//Funkcja ustawiająca poprawne wyświetlanie tabel i działanie przycisku powrotnego.


  if(typeof userPosts[userId] === 'undefined'){//Jeżeli lista postów danego użytkownika została uprzednio utworzona nie ma potrzeby robić tego ponownie.
    userPosts[userId] = posts.filter(function(post){
      return post.userId == userId;
    });
  }

  postsTable = document.getElementById("postsTable");

  row = postsTable.insertRow(0);
  row.style.textAlign = "center";
  row.style.backgroundColor = "#4CB050";
  row.style.color = "black";

  numeration = row.insertCell(0);
  title = row.insertCell(1);
  beginning = row.insertCell(2);

  numeration.innerHTML = "Lp.";
  title.innerHTML = "Tytuł";
  beginning.innerHTML = "Początek";

  while(postsTable.rows.length > 1)  postsTable.deleteRow(1);
  postsTable.style.display = "inline"

  for (var i = 1; i <= userPosts[userId].length; i++){//Wypełnianie tabeli postów użytkownika.
      row = postsTable.insertRow(i);
      numeration = row.insertCell(0);
      title = row.insertCell(1);
      beginning = row.insertCell(2);
      numeration.innerHTML = i + ".";
      title.innerHTML = userPosts[userId][i-1].title;
      beginning.innerHTML =userPosts[userId][i-1].body.substring(0,75) + "...";
      row.onclick = function(postId){
                      return function() {statistics(postId);}
                  }(userPosts[userId][i-1].id)
    }

}

function statistics(postId){

    userId = posts[postId-1].userId;
   if(comments == null){//Pobiera dane z serwera tylko w przypadku gdy lista komentarzy nie została już uprzednio załadowana.
    $.ajax({
      url: url + '/comments',
      method: 'GET'
    }).then(function(commentsGet) {
      comments = commentsGet;
      displayStats(comments,postId,userId);
    });
  }else displayStats(comments,postId,userId);

}

function displayStats(comments,postId,userId){//Funkcja ładująca statystykę do odpowiedniej tabeli.
  if (postComments[postId] == null){//Znalezienie komentarzy do danego posta.
    postComments[postId] = comments.filter(function (comment) { return comment.postId == postId;});
  }
   document.getElementById('header').innerHTML = "Statystyka najcześciej używanych słów w wybranym poście użytkownika " + " " + users.filter(function(user){ return user.id == userId })[0].name +" (uwzględnia komentarze).";
   document.getElementById("postsTable").style.display="none";
   document.getElementById("statsTable").style.display="inline";


   while(statsTable.rows.length > 0)  statsTable.deleteRow(0);//Usuwanie poprzedniej zawartości tabeli.

   returnButton.onclick = function(){postList(userId)};
   returnButton.innerHTML = "Powrót do listy postów użytkownika.";
  statsString = posts.filter(function (post) {
    return post.id == postId;
  })[0].body;

  for (var i = 0; i < postComments[postId].length; i++){//Doklejanie komentarzy do stringa na podstawie którego zostanie obliczona statystyka występowania wyrazów.
     statsString = statsString + " " + postComments[postId][i].body;

   }
   if(stats[postId] == null){//Jezeli statystyka dla danego postu została juz przedtem obliczona, jest ona ładowana z pamięci.
     stats[postId] = wordStats(statsString);//Statystyka jest zapisywana w tablicy pod numerem postu.
   }
   statsTable = document.getElementById('statsTable');

   row = statsTable.insertRow(0);
   row.style.backgroundColor = "#4CB050";
   row.style.color = "black";

   word = row.insertCell(0);
   repeats = row.insertCell(1);
   word.innerHTML = "Słowo";
   repeats.innerHTML = "Ilość użyć";

   for (var i = 1; i <= stats[postId].length; i++){//Wypełnianie tabeli w pętli.
     row = statsTable.insertRow(i);
     word = row.insertCell(0);
     repeats = row.insertCell(1);
     word.innerHTML = stats[postId][i-1][0];
     repeats.innerHTML =stats[postId][i-1][1];
   }
}

function wordStats(inputString){//Funkcja zwraca posortowaną tablicę 10 najczęściej użytych słów na podstawie dostarczonego Stringa.

  var string = inputString.replace(/[.]/g, '').split(/\s/);
  var wordStatObj = {};//Obiekt w którym znajdą się słowa wraz z liczbą wystąpień.

  string.forEach(function(word){
  if (!wordStatObj[word]){
        wordStatObj[word] = 0;
      }
      wordStatObj[word]++;
  });

  var wordStatArray = [];
  for (var word in wordStatObj) {//Zamiana obiektu na tablicę by umożliwić posortowanie zawartości.
      wordStatArray.push([word, wordStatObj[word]]);
      }

  return wordStatArray.sort(function(a,b) {
    if (a[1] === b[1]) {
      if (a[0] === b[0]) return 0;
      if (a[0] > b[0]) return 1;
      return -1;
    } else {
      if (a[1] === b[1]) return 0;
      if (a[1] > b[1]) return -1;
      return 1;
    }//Sortuje słowa alfabetycznie i wg ilości użyć jednocześnie.
  }).slice(0,10);

    //Być może wydajniej było by najpierw posortować tablicę wg ilości użyć, obciąć tablicę do 10 pozycji po czym ponownie posortować wyrazy alfabetycznie i wg ilości użyć.
}
