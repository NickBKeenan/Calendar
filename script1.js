const puppeteer = require('C:\\Users\\micro\\node_modules\\puppeteer');
var page;
puppeteer.launch({headless:false}).then(async browser => 

{
  page = await browser.newPage();
  page.setDefaultNavigationTimeout(90000);
await  Login();


// logged in

await GotoSearchPage();
await GetASeason("Palisades", "03/18/2019", "06/14/2019", ["Monday", "Wednesday", "Thursday", "Friday"], "3:00 PM", "4:00 PM", true); // palisades

await AddToCart();


//  await page.setViewport({ width: 1280, height: 800 })
   
 // await browser.close();

});




async function Login()
{
// login page
await page.goto('https://web1.vermontsystems.com/wbwsc/dcwashingtonwt.wsc/splash.html?InterfaceParameter=WebTrac', {waitUntil: 'networkidle2'});
await page.focus('#weblogin_username');
await page.keyboard.type('DC Stoddert');


await page.focus('#weblogin_password');
//await page.keyboard.type('DCST2018!'); // password 2
await page.keyboard.type("password5"); // password 1
await Promise.all([
  page.waitForNavigation({waitUntil: 'networkidle2'}),
  page.click('#xxproclogin', {waitUntil: 'networkidle2'})
]);

}


async function ConfirmHeadCount()
{

await Promise.all([
  page.waitForNavigation(),
page.click('#webpreaddtocart_buttoncontinue', {waitUntil: 'networkidle2'})
]);


}

async function GotoSearchPage()
{

// go to search page
const URL='https://web1.vermontsystems.com/wbwsc/dcwashingtonwt.wsc/search.html?display=detail&module=FR&sort=description';
await page.goto(URL, {waitUntil: 'networkidle2'});

}

async function GetASeason( ID,  begindate, enddate,  DOWs,  beginTime,  endTime,  isturf)
{
	var beginHour=new Date('1970-01-01 '+beginTime).getHours();
	var endHour= new Date('1970-01-01 '+endTime).getHours();
	console.log(beginHour);
	console.log(endHour);
	var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var x;
	for(x=0; x< DOWs.length; x++)
	{

		var DOW=weekdays.indexOf(DOWs[x]);
   var dtBegin =  new Date(begindate);
   dtBegin.setHours(3); // set time to 3AM to avoid DST isues
   var dtEnd = new Date(enddate);
   dtEnd.setHours(6); // set time to 6AM so greater than when dates match

   var addTime = DOW - dtBegin.getDay();
   if (addTime < 0)
   {
		addTime += 7;
   }
   const OneDay=1000*60*60*24;
    dtBegin.setTime(dtBegin.getTime()+(addTime)*OneDay);

   while(dtBegin.getTime() < dtEnd.getTime())
            {
                var datestring = (dtBegin.getMonth() + 1) + '/' + dtBegin.getDate() + '/' + dtBegin.getFullYear();;
                await AddADay(ID, datestring, beginHour,endHour, isturf);
                dtBegin.setTime(dtBegin.getTime()+7*OneDay);

            }

			console.log("Done adding days");
	await page.waitFor(1000);
	}

}


async function AddADay(ID, datestring, beginHour, endHour, isturf)
{
console.log("Adding Day "+datestring);
// put in search parameters
//await page.select("#location", ID);
await page.evaluate(function(fieldName) {
var location = document.getElementById("location");
var options= location.getElementsByTagName("option");
var x;
for(x=0; x< options.length; x++)
{
	if(options[x].innerHTML.indexOf(fieldName)==0)
	{
		location.value=options[x].value;
	
	}
}

}, ID);


if(isturf)
{
	await page.select("#frclass", "Field Synthetic");
}
else
{
	await page.select("#frclass", "Field Grass")
}

await page.evaluate(function(datestring, beginHour, endHour) {
	document.getElementById("date").value=datestring;
	var hourformat="";
	if(beginHour < 12)
	{
		if(beginHour < 10)
		{
			hourformat=" ";
		}
		hourformat+=beginHour+":00 am";
	}
	if(beginHour==12)
	{
		hourformat="12:00 pm";
	}
	if(beginHour > 12)
	{
		if(beginHour < 22)
		{
			hourformat=" ";
		}
		hourformat+=(beginHour-12)+":00 pm";
	}
	document.getElementById("begintime").value=hourformat;
		document.getElementById("frheadcount").value=15;

}, datestring, beginHour, endHour);



// run search

 /*  console.log("about to start waiting");

await page.waitFor(10000);
   console.log("done waiting");
   */
const [response] = await Promise.all([
  page.waitForNavigation(),
	await page.evaluate(() => {
	document.getElementById("frwebsearch_buttonsearch").click();
	})

  
]);
  /* console.log("about to start waiting");

await page.waitFor(10000);
   console.log("done waiting");
   */
// go through search results, look for the desired result, and click on it.
 var done=false;

 while(!done)
 {

 var result;
result = await  page.evaluate((beginHour, endHour) => {

  const elements = document.getElementsByClassName( 'button multi-select' );

  	console.log(beginHour);


    for ( let i = 0; i < elements.length; i++ )
    {
	
	var text=elements[i].getElementsByClassName("ui-button-text")[0].innerHTML;
	if(text.indexOf("Available") >0)
	{

		console.log(text);
		var hour=Number(text.substring(0,2));
		if(text.substr(6,1)=="p" && hour < 12)
		{
			hour+=12;
		}
			console.log(hour);

		if(hour >= beginHour&& hour < endHour)
		{
			elements[i].click();
			return text;
		}
	}
    }
	return "";


    }, beginHour, endHour);




   console.log(result);
await page.waitFor(1000);
   if(result.length==0)
   {
		done=true;
   }
}
}
async function AddToCart()
{
await Promise.all([
  page.waitForNavigation(),
	await page.evaluate(() => {
	document.getElementById("websearch_multiselect_buttonaddtocart").click();
	})
  //page.click('#websearch_multiselect_buttonaddtocart', {waitUntil: 'networkidle2'}),
]);

await ConfirmHeadCount();
await SetUser();

await SetPermitDetails();


}

async function SetUser()
{
await  page.evaluate(() => {

  const elements = document.getElementsByClassName( 'checkbox valid' );


    const result = [];


    for ( let i = 0; i < elements.length; i++ )
    {
	var text=elements[i].innerHTML;
		elements[i].click();
		return ;
	}
    


    });

await Promise.all([
  page.waitForNavigation(),
page.click('#button201', {waitUntil: 'networkidle2'})
]);


}

async function SetPermitDetails()
{

await  page.evaluate(() => {
            var responses = [
			["Event Type", "Athletic Event" ],
                [ "Athletic Event Type", "Soccer" ],
                [ "Event Description", "Youth Soccer"],
                [ "List on site contact name:", "Jennifer Gootman" ],
                [ "List on site contact's phone number:", "2023381910"],
                [ "Do you charge your participants to enter your organization? (Fee-based Permit and Fees may be required)", "Yes" ],
                ["Do you charge your participants to attend this event? (Fee-based Permit and Fee may be required)", "No" ],
                ["Are you requesting to have amplified sound at your event? (Letter of approval from local ANC will be require, 7 days required to process)", "No" ]
                ];

				var list = document.getElementsByTagName("LABEL");
				var x;
				for(x=0; x< list.length; x++)
				{
					var label=list[x];
					var id=label.htmlFor;
					var spans=label.getElementsByTagName("SPAN");
					var y;
					for(y=0; y< spans.length; y++)
					{
						var z;
						for(z=0; z < responses.length; z++)
						{
							if(spans[y].innerHTML==responses[z][0])
							{
								document.getElementById(id).value=responses[z][1];
							}
						}
					}
				}

				var checkbox=document.getElementById("processingprompts_waivercheckbox");
				if(checkbox !=undefined)
				{
					checkbox.click();
				}
				checkbox=document.getElementById("processingprompts_questioncopytoggle");
				if(checkbox !=undefined)
				{
					checkbox.click();
				}


});

/*
// event type
await page.select("#question10371780", "Athletic Event");
// athletic event type
await page.select("#question213345","Soccer");
await page.focus('#question10371779');
await page.keyboard.type('Youth Soccer');
await page.focus('#question10371781');
await page.keyboard.type('Jennifer Gootman');
await page.focus('#question10371782');
await page.keyboard.type('2022222222');
await page.select("#question20674157","Yes");
await page.select("#question20674156","No");
await page.select("#question10371799","No");
await page.select("#question10371796","No");
await page.click("#processingprompts_waivercheckbox");
*/
await Promise.all([
  page.waitForNavigation(),
page.click('#processingprompts_buttoncontinue', {waitUntil: 'networkidle2'})

]);


}

async function GetSessionId()
{
/*  await page.goto('https://web1.vermontsystems.com/wbwsc/dcwashingtonwt.wsc/splash.html?InterfaceParameter=WebTrac', {waitUntil: 'networkidle2'});
await page.focus('#weblogin_username');
await page.keyboard.type('DC Stoddert2');


await page.focus('#weblogin_password');
await page.keyboard.type('DCST2018!');
  await page.click('#xxproclogin', {waitUntil: 'networkidle2'});
var cookies= await page.cookies();
//console.log(cookies);
var SessionID;
for (var x=0; x< cookies.length; x++)
{
	var cookie=cookies[x];
	if( cookie.name=='_webtracsessionid')
	{
		SessionID=cookie.value;
	}
}
console.log(SessionID);

cookies= await page.cookies();
console.log(cookies);

for (var x=0; x< cookies.length; x++)
{
	var cookie=cookies[x];
	if( cookie.name=='_webtracsessionid')
	{
		SessionID=cookie.value;
	}
}
console.log(SessionID);
*/
 
}