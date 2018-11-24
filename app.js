
(function() {
  	'use strict';

  	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyAcRjzg_B-IOGruZmoSpnV8_os2YYO9vjY",
		authDomain: "photo-schedule-app.firebaseapp.com",
		databaseURL: "https://photo-schedule-app.firebaseio.com",
		projectId: "photo-schedule-app",
		storageBucket: "photo-schedule-app.appspot.com",
		messagingSenderId: "870169582210"
	};
	firebase.initializeApp(config);

	// App wide variables - STATE
	var app = {
		// isLoading: true,
		// visibleCards: {},
		// selectedCities: [],
		// spinner: document.querySelector('.loader'),
		cardTemplate: document.querySelector('.cardTemplate'),
		container: document.querySelector('.main'),
		// addDialog: document.querySelector('.dialog-container'),
		user: null,
		userInfo: null,
		database: firebase.database(),
		weddings: {},
	};


	function isUserLoggedIn() {
		console.log(localStorage.getItem("username"));
		var username = localStorage.getItem("username");
		if (localStorage.getItem("username")) {
			// log in the user and switch pages
  			logIn(username);
		}
		else {
			// prompt to enter username/phone number
			document.getElementById('cardLogin').removeAttribute('hidden');
		}
	}
	isUserLoggedIn();

  	// var user1 = app.database.ref('users/' + 'user1');

  	/**
  	 * Get the user object so we can retrieve the weddings associated with them
  	 */
	// user1.on('value', function(snapshot) {
	// 	var weddings = snapshot.val()['weddings'];
	// 	retreiveWeddingData(weddings);
	// });


	/**
	 * Get the wedding data for the user
	 */
	function retreiveWeddingData(weddings) {
		var completeWeddings = {};
		for(var key in weddings) {
			console.log('key: ', key);
			completeWeddings[key] = null;
			
			// get the wedding
			app.database.ref('/weddings/' + key).once('value').then(function(snapshot) {
			  	completeWeddings[key] = snapshot.val();

			  	// get the schedule
			  	if (snapshot.val()['schedule']) {
			  		app.database.ref('/schedules/' + key).once('value').then(function(snapshot) {
					  	completeWeddings[key]['schedule'] = snapshot.val();

					  	// can now display this to the user
					  	displayWedding(completeWeddings[key]);
					});
			  	}
			  	else {
			  		// when user clicks on wedding, it would prompt you to insert the schedule
			  	}
			});
		}
	}


	/** 
	 * Take the Wedding and Add to list of wedding cards 
	 */
	function displayWedding(wedding) {
		// append to wedding list
		app.weddings[wedding['title']] = wedding;

	  	var weddingSummaryCard = document.getElementById('weddingSummaryCard');

	  	var div = document.createElement('div');
		div.setAttribute('id', wedding['title']);
		div.setAttribute('class', 'card');
		div.onclick = selectWeddingToView;

		var h3 = document.createElement('h3');
		h3.innerHTML = wedding['title'];
		var p = document.createElement('p');
		p.innerHTML = wedding.date;
		var span = document.createElement('span');
		span.setAttribute('class', 'right-arrow');
		div.appendChild(h3);
		div.appendChild(p);
		div.appendChild(span);

	  	weddingSummaryCard.append(div);	
	}

	// function getSchedule(key) {
	// 	return app.database.ref('/schedules/' + key).once('value').then(function(snapshot) {
	// 		console.log('snapshot.val(): ', snapshot.val());
	// 	  	return snapshot.val();
	// 	});
	// }

 //  	function createWeddingList(e) {
  	
	//   	var wSC = document.getElementById('weddingSummaryCard');

	//   	for (var identifier in weddingData) {
	//   		console.log('identifier: ', identifier);
	//   		var data = weddingData[identifier];
	//   		// console.log(data);
	// 	  	// for (var i = 0; i < Object.keys(weddingData).length; i++) {
	// 	  		// console.log('i:', i);
	// 		var div = document.createElement('div');
	// 		div.setAttribute('id', identifier);
	// 		div.setAttribute('class', 'card');
	// 		div.onclick = selectWeddingToView;

	// 		var h3 = document.createElement('h3');
	// 		h3.innerHTML = data.title;
	// 		var p = document.createElement('p');
	// 		p.innerHTML = data.date;
	// 		var span = document.createElement('span');
	// 		span.setAttribute('class', 'right-arrow');
	// 		div.appendChild(h3);
	// 		div.appendChild(p);
	// 		div.appendChild(span);
	// 		wSC.append(div);
	// 	  	// }
	// 	}
	// }
  // createWeddingList();

  	function selectWeddingToView(e) {
	  	// console.log('hi:', e.target.parentElement.id);

	  	console.log('this.in', this.id);

	  	var weddingDetails = app.weddings[this.id];

	  	console.log('weddingDetails: ', weddingDetails);

	  	// will then hide the first page cards
		document.getElementById('card1').setAttribute('hidden', true);
		document.getElementById('weddingSummaryCard').setAttribute('hidden', true);

	  	// show the detail card with correct detail
	  		// can use card2 - but need dynamic data
		document.getElementById('card2').removeAttribute('hidden');
		document.getElementById('wedding_title').innerHTML = weddingDetails['title'];
		document.getElementById('wedding_date').innerHTML = weddingDetails['date'];
		

		// create the elements for the wedding schedule
		var parentDiv = document.getElementById('wedding_schedule');
		createDetails(parentDiv, weddingDetails['schedule']);
		// document.getElementById('wedding_schedule').innerHTML = createEntry2(weddingDetails['schedule']);;
  	}


  	/**
  	 * Handle the log in - sign up the user or load the profile
  	 */
  	document.getElementById('loginBtn').onclick = function() {
  		var input = document.getElementById('login-input').value;
  		console.log('input:', input, input.length);
  		logIn(input);
 		return false;
  	}

  	/**
  	 * Actually log in the user
  	 */
  	function logIn(username) {
  		var weddings = null;
  		app.database.ref('/users/' + username).once('value').then(function(snapshot) {
		  	
		  	// set the user
		  	app.user = username;
		  	localStorage.setItem('username', username);

		  	if (snapshot.val() === null) {
		  		// add the new user
		  		app.database.ref('users/' + username).set({
					weddings: null
			  	});
		  	}
		  	else {
		  		app.userInfo = snapshot.val();
		  		console.log('app:', app);
		  		weddings = app.userInfo['weddings'];
		  	}

		  	// show card1
		  	document.getElementById('cardLogin').setAttribute('hidden', true);
			document.getElementById('card1').removeAttribute('hidden');
			document.getElementById('weddingSummaryCard').removeAttribute('hidden');
			retreiveWeddingData(weddings);
		});	
  	}

  // document.getElementById('weddingSummaryCard').addEventListener("click", doSomething, false);

  // function doSomething(e) {
  // 	if (e.target !== e.currentTarget) {

  //       var clickedItem = e.target.id;
  //       // alert("Hello " + clickedItem);
  //       console.log('e:', e.target, e.target.nodeName);
  //   }
  //   e.stopPropagation();
  // }

  document.getElementById('send').onclick = function() {
 	var file = document.getElementById('csv_file').files[0];
 	console.log('file:', file);

 	var wedding_title = document.getElementById('form_wedding_title').value;
 	var wedding_date = document.getElementById('form_wedding_date').value;

 	var reader  = new FileReader();

 	reader.onload = function(e) {
		var content = reader.result; 	

		var rows = content.split('\r\n');

		// for(var i=0; i<=rows.length; i++) {
		// 	// var columns = rows[i].split(',');
		// 	console.log('cols:', rows[i], rows[i].length);
		// }


		// TODO : save the content to a DB somewhere!

		// TODO: loop through to see if row is empty to get the start place
		// could have first couple rows that are empty
		console.log(rows[0]);

		// get the headers - title, description, notes
		var descriptors = rows[0].split(',');

		// get all the real data
		var schedule = rows.slice(1,);

		var parentDiv = document.getElementById('wedding_schedule');

		// parse through the data
		var formattedSchedule = schedule.map((schedule,i) => {
			console.log('schedule: ', schedule);

			var items = CSVtoArray(schedule);

			console.log('items: ', items);
			console.log(descriptors[0], ' : ', items[0]);
			console.log(descriptors[1], ' : ', items[1]);
			console.log(descriptors[2], ' : ', items[2]);

			// parentDiv.appendChild(createEntry(items));

			// IDEA if have more than 3 columns, add the rest into notes ?

			return {
				time: items[0],
				description: items[1],
				notes: items[2],
			}

			// // set to card2
			// document.getElementById('card1').setAttribute('hidden', true);
			// document.getElementById('card2').removeAttribute('hidden');

			// // set elements in card2
			// document.getElementById('wedding_title').innerHTML = wedding_title;
			// document.getElementById('wedding_date').innerHTML = wedding_date;
		});



		saveSchedule(wedding_title, wedding_date, formattedSchedule);
 	}

 	reader.readAsText(file);

 	// stop page from loading
 	return false;
  }


  function saveSchedule(title, date, schedule) {
		console.log('schedule:2: ', schedule);

		// save wedding
		app.database.ref('weddings/' + title).set({
			uid: app.user,
			title: title,
			date: date,
			schedule: true,
		});

		// save wedding to user
		app.database.ref('users/' + app.user + '/weddings/').update({
			[title]: true
		});

		// save schedule
		app.database.ref('schedules/' + title).set(schedule)

  		// firebase.database().ref('users/' + 'user1').set({
	//     // username: name,
	//     // email: email,
	//     // profile_picture : imageUrl
	//     description: 'I created a new user, son.'
 //  	});
  }


  function createEntry(items) {
  	var div = document.createElement('div');
  	div.setAttribute('class', 'row');

  	var leftDiv = document.createElement('div');
  	leftDiv.setAttribute('class', 'leftContent');
  	leftDiv.innerHTML = items[0];

  	var rightDiv = document.createElement('div');
  	rightDiv.setAttribute('class', 'rightContent');

  	var p1 = document.createElement('p');
  	p1.innerHTML = items[1];
  	var p2 = document.createElement('p');
  	p2.innerHTML = items[2];

  	rightDiv.appendChild(p1);
  	rightDiv.appendChild(p2);

  	div.appendChild(leftDiv);
  	div.appendChild(rightDiv);

  	return div;
  }

  	function createDetails(parent, schedule) {
	  	if (schedule) {
		  	schedule.map(item => {
		  		parent.appendChild(createEntry2(item));
		  	})
		  	return parent;
		}
	  	return;
  	}

  function createEntry2(item) {
  	var div = document.createElement('div');
  	div.setAttribute('class', 'row');

  	var leftDiv = document.createElement('div');
  	leftDiv.setAttribute('class', 'leftContent');
  	leftDiv.innerHTML = item.time;

  	var rightDiv = document.createElement('div');
  	rightDiv.setAttribute('class', 'rightContent');

  	var p1 = document.createElement('p');
  	p1.innerHTML = item.description;
  	var p2 = document.createElement('p');
  	p2.innerHTML = item.notes;

  	rightDiv.appendChild(p1);
  	rightDiv.appendChild(p2);

  	div.appendChild(leftDiv);
  	div.appendChild(rightDiv);

  	return div;
  }

  	// props to https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
  	// Return array of string values, or NULL if CSV string not well formed.
	function CSVtoArray(text) {
	    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
	    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
	    // Return NULL if input string is not well formed CSV string.
	    if (!re_valid.test(text)) return null;
	    var a = [];                     // Initialize array to receive values.
	    text.replace(re_value, // "Walk" the string using replace with callback.
	        function(m0, m1, m2, m3) {
	            // Remove backslash from \' in single quoted values.
	            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
	            // Remove backslash from \" in double quoted values.
	            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
	            else if (m3 !== undefined) a.push(m3);
	            return ''; // Return empty string.
	        });
	    // Handle special case of empty last value.
	    if (/,\s*$/.test(text)) a.push('');
	    return a;
	};

})();