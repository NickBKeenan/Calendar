// JavaScript source code
var dataStore;

function LoadPages()
{
    //entry point, called by onload
    //    setInterval(CheckLongPoll, 120000);
    //setInterval(CheckForUpdatedFile, 90000);
    window.onblur = LostFocus;
    window.onfocus = GainedFocus;
    var season = window.localStorage.getItem('Season');
    LogTime("LoadPages");
    Show("Loading");


    if (season == undefined)
    {
        season = "";
    }
    else
    {
        document.getElementById("LoadingSeasonName").innerHTML="Season = "+season;

    }
    googleApi.GetAllData(season); // in googleapi.js, calls LoadPageData on return
}

function RefreshSeason()
{
    var season;
    var SeasonSelect = document.getElementById("SeasonSelect");
    var RefreshButton = document.getElementById("RefreshButton");
    RefreshButton.disabled = true;
    openTab(undefined, "");
        Show("Loading");
    season = SeasonSelect.value;

    googleApi.GetAllData(season); // in googleapi.js, calls LoadPageData on return
    
}

function LoadPageData(NewData)
{
    // called when Google API call returns
    LogTime("LoadPageData");
    dataStore = new DataStore();
    dataStore.Populate(NewData);
    LogTime("Datastore Populated");
    document.getElementById("SeasonName").innerHTML =" &mdash; "+ dataStore.Season.Current();

    var AllAvailability = dataStore.GetAllAvailability();
    CreateFieldsSummary(AllAvailability);
    LogTime("Field Summary Created");
    var d = dataStore.GetDivisions();
    CreateDivisionSummary(d);
    LogTime("Division Summary Created");
    PopulatePublishTab(d);
    PopulateReleaseTab(d);
    Hide("Loading");


	if(dataStore.Errors.length == 0)
	{
		document.getElementById("defaultOpen").click();
	}
	else
	{
		document.getElementById("errorOpen").click();
	}
    Show("fieldlist");
    PopulateErrors(dataStore.Errors);
    CreateSeasonSummary();

    window.localStorage.setItem("Season", dataStore.Season.Current());
    StartLongPoll();
}
var weHaveFocus = true;
var lastUpdateCheckTime = new Date();
function LostFocus()
{
    weHaveFocus = false;
    console.log(FormattedTime(new Date()), "Focus Lost");

};
function GainedFocus()
{
    weHaveFocus = true;
    console.log(FormattedTime(new Date()), "Focus Gained");
    var now = new Date();
    if (now.getTime() - lastUpdateCheckTime.getTime() > 120000)
    {
        CheckForUpdatedFile();
    }
}

function CheckForUpdatedFile()
{
    return;
    var now = new Date();
    // only check 
    if (weHaveFocus)
    {
        console.log("Checking for updates", FormattedTime(now));
        googleApi.CheckForUpdatedFile(dataStore.Season.CurrentRec().Spreadsheet_Key);
        lastUpdateCheckTime = now;
    }
    else
    {
        console.log("Skipping update check because we don't have focus.", FormattedTime(now));
    }
    //calls OnCheckForUpdatedFile()
}
function OnUpdateDataLine(e)
{
    // e[0] is the time this update ran
    //e[1] is the last update of the file when this update started
    // it's possible there was an undetected update when this update ran
    // if so, get it.
    statusBar.Show("All Changes Saved", "");

    if (e[1] > dataStore.Season.LastUpdate)
    {
        console.log("OnUpdateDataLine detected changes");
        InitiateUpdateCheck();
    }
    // keep a second update check from happening while this one is pending, when the current one returns this will get updated
    dataStore.Season.LastUpdate = e[0];
}

function OnCheckForUpdatedFile(e)
{
    console.log(FormattedTime(new Date()), FormattedTime(e[0]));
    if (e[1] != dataStore.Season.CurrentRec().Spreadsheet_Key)
    {
        // just return, season has changed
        return;
    }
    if (e[0] > dataStore.Season.LastUpdate)
    {
        var now = new Date();
        var lu = new Date(dataStore.Season.LastUpdate);
        var go = new Date(e[0]);
        console.log("OnCheckForUpdatedFile detected changes, now="+FormattedTime(now)+", LU="+FormattedTime(lu)+",Go="+FormattedTime(go));
        InitiateUpdateCheck();
    }
    else
    {
        var now = new Date();
        console.log("No Updates", FormattedTime(now));
    }
}

function InitiateUpdateCheck()
{
    statusBar.Show("Updating", "Yellow");

    var season = dataStore.Season.Current();;
    googleApi.GetUpdatedData(season); // callbacks CheckForUpdates()
}



function CheckForUpdates(newData)
{
    //callbacked by InitiateUpdateCheck
    dataStore.UpdatedDataset(newData);

    statusBar.Hide();

    console.log("Update Complete");
    StartLongPoll();
}

var lastLongPoll = 0;
function CheckLongPoll()
{
    if (lastLongPoll == 0)
    {
        return;
    }
    var now = new Date();
    if (now.getTime() - lastLongPoll > 180000)
    {
        console.log("Dead LongPoll detected, restarting");
        StartLongPoll();
    }
    else
    {
        console.log("LongPoll is alive");
    }
}

function StartLongPoll()
{
    return;
    //establish connection to server to check for updates
    console.log("Starting long poll", new Date());
    var now = new Date();
    lastLongPoll = now.getTime();
    googleApi.StartLongPoll(dataStore.Season.CurrentRec().Spreadsheet_Key, dataStore.Season.LastUpdate);
}

function OnLongPoll(e)
{
    console.log(new Date(), e);
    if (e[1] != dataStore.Season.CurrentRec().Spreadsheet_Key)
    {
        console.log("Season changed while longpoll was pending");
        // just return, loading a new season will restart the longpoll
        return;
    }
    if (e[0] != "TimeOut")
    {
            if (e[0] > dataStore.Season.LastUpdate)
            {
                console.log("Long Poll detected changes");
                InitiateUpdateCheck();
            }
            else
            {
                console.log("Long Poll ended by another update");
                StartLongPoll();

            }
    }
    else
    {
        console.log("Long Poll timed out");
        StartLongPoll();
    }
}

function openTab(evt, tabName)
{
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++)
    {
        tabcontent[i]
			.style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++)
    {
        tablinks[i]
			.className = tablinks[i]
			.className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    if (evt != undefined)
    {
        document.getElementById(tabName).style.display = "inline-block";
        evt.currentTarget.className += " active";
    }
}

function PopulateErrors(elist)
{
    var table = document.getElementById("errorlist");
    // console.log(v);
    while (table.rows.length > 0)
    {
        table.deleteRow(0);
    }
    var row, cell;
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.innerHTML = "<b>Tab</b>";;
    cell = row.insertCell(-1);
    cell.innerHTML = "<b>Line</b>";;
    cell = row.insertCell(-1);
    cell.innerHTML = "<b>Error</b>";;

    for (var x = 0; x < elist.length; x++)
    {
        row = table.insertRow(-1);
        cell = row.insertCell(-1);
        cell.innerHTML = "<a href='javascript:;' onclick='EditAssignment(event, \"" + elist[x].sheet + "\"," +
                        elist[x].line + ");'" +
                        
                    ">" +elist[x].sheet;

        
        cell = row.insertCell(-1);
        cell.innerHTML = elist[x].line+1;;
        cell = row.insertCell(-1);
        cell.innerHTML = elist[x].msg;;


    }

    if (elist.length == 0)
    {
        var row, cell;
        row = table.insertRow(-1);
        cell = row.insertCell(0);
        cell.innerHTML = "None!";;

    }

}

var begintime = -1;
function LogTime( param)
{
    var d = new Date();
    if (begintime == -1)
    {
        begintime = d.getTime();
    }
    console.log((d.getTime()-begintime)/1000, param);
}

class StatusBar
{
    Show(status, color)
    {
        var bar = document.getElementById("StatusBar");
        bar.style.backgroundColor= color;
        bar.innerHTML=status;
    }
    Hide()
    {
        var bar = document.getElementById("StatusBar");
        bar.innerHTML="";
    }
}
var statusBar = new StatusBar();


function FormattedTime(d)
{
    var dd = new Date(d);
    retval = dd.getHours() + ":" + dd.getMinutes() + ":" + dd.getSeconds();
    return retval;
}
