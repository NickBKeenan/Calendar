
class GoogleApi
{
    Constructor()
    {
    }

    SetDefaultSeason(seasonName)
    {
        var params = {};
        params.CallBack = "SeasonCreated"; // in SeasonsDisplay.js
        params.OnFail = "OnFail";
        params.SeasonName = seasonName;
        params.Action = "SetDefaultSeason";
        this.GetGoogleData(params);
    }
    CreateNewSeason(seasonName, copySeason, gameDays, begindate, enddate)
    {
        var params = {};
        params.CallBack = "SeasonCreated"; // in SeasonsDisplay.js
        params.OnFail = "OnFail";
        params.SeasonName = seasonName;
        params.copySeason = copySeason;
        var daystr = "";
        var x;
        for (x = 0; x < gameDays.length; x++)
        {
            if (daystr.length > 0)
            {
                daystr += ";";
            }
            daystr += DtoS(gameDays[x]);
        }
        params.gameDays = daystr;
        params.begindate = begindate;
        params.enddate = enddate;
        params.Action = "CreateNewSeason";
        this.GetGoogleData(params);
    }
	GetDivisionSchedule(key, prefix)
	{
	   var params = {};
        params.CallBack = "DivisionScheduleReceived"; // in Divisions.js
        params.OnFail = "OnFail";
        params.DivisionKey = key;
		params.DivisionPrefix=prefix;
        params.Action = "GetDivisionSchedule";
        this.GetGoogleData(params);
    }
	PopulateDivisionTeams(SpreadsheetID, DivisionName, Prefix)
	{
	  var params = {};
        params.CallBack = "DivisionTeamsPopulated"; // in Divisions.js
        params.OnFail = "OnFail";
        params.SpreadsheetID = SpreadsheetID;
        params.DivisionName = DivisionName;
        params.Prefix = Prefix;
        params.Action = "PopulateDivisionTeams";
        this.GetGoogleData(params);
	}
	PopulateAllDivisionTeams()
	{
	  var params = {};
        params.CallBack = "DivisionTeamsPopulated"; // in Divisions.js
        params.OnFail = "OnFail";
        params.Action = "PopulateAllDivisionTeams";
        this.GetGoogleData(params);
	}
	PostDivisionSlots(DivisionID, SlotData, rownum)
	{
		var params = {};
        params.CallBack = "DivisionSlotsPosted"; // in Divisions.js
        params.OnFail = "OnFail";
        params.Action = "PostDivisionSlots";
		params.SlotData=SlotData;
		params.DivisionID=DivisionID;
		params.rownum=rownum;


        this.GetGoogleData(params);
    }	
    GetAllData(season)
    {
        var params = {};
        params.CallBack = "LoadPageData";
        params.OnFail = "OnFail";
        params.Season = season;
        params.Action = "GetAllData";
        this.GetGoogleData(params);
    }
    GetUpdatedData(season)
    {
        var params = {};
        params.CallBack = "CheckForUpdates";
        params.OnFail = "OnFail";
        params.Season = season;
        params.Action = "GetAllData";
        this.GetGoogleData(params);
    }

    StartLongPoll(key, lastupdate)
    {
        var params = {};
        params.CallBack = "OnLongPoll";
        params.OnFail = "OnFail";
        params.key = key;
        params.lupdate = lastupdate;
        params.Action = "LongPoll";
        this.GetGoogleData(params);
    }
    CheckForUpdatedFile(key)
    {
        var params = {};

        params.CallBack = "OnCheckForUpdatedFile";
        params.OnFail = "OnFail";
        params.key = key;
        params.Action = "CheckForUpdatedFile";
        this.GetGoogleData(params);

    }
    UpdateDataLine(season, sheet, line, newline, oldline, LastUpdate)
    {
        var params = {};
        statusBar.Show("Saving", "Yellow");

        params.CallBack = "OnUpdateDataLine";
        params.OnFail = "OnFail";
        params.Action = "UpdateDataLine";
        params.Season = season;
        params.Sheet = sheet;
        params.Line = line;
        params.Newline = JSON.stringify(newline);
        params.Oldline = JSON.stringify(oldline);
        params.LastUpdate = LastUpdate;
        console.log(params);
        this.GetGoogleData(params);
    }


    GetGoogleData(params)
    {

        var script = document.createElement("script");
        // This script has a callback function that will run when the script has
        // finished loading.
	// Script is "Assignments Back End"
// URL is https://script.google.com/home/projects/12TOM9UthtmESecvDTcfA0KgsEYXnK3V2-YjwTX-MzjTRo_0B2l5NZ9ca/edit

        var key = "AKfycbzfPXbeTCDAQ__dHCcbv3UJa2B8-nSRqvAVeXlMGnzP09OI6yVc1iVZJt-U4FNce74X";

        script.src = "https://script.google.com/macros/s/"+key+"/exec";
        //script.src = "https://script.google.com/macros/s/AKfycbzHfGHAaXEFP8hApPkEiXDr8URZZcwg8FwImwqRi1fFW2JyDA8kbMIaOtfrKChVH3Lywg/exec";
        var paramstr = "";
        for (var name in params)
        {
            if (paramstr.length > 0)
            {
                paramstr += "&";
            }
            paramstr += name + "=" + encodeURIComponent(params[name]);
        }
        if (paramstr.length > 0)
        {
            script.src += "?" + paramstr;
        }

        console.log(script.src);
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);


    }
    
}

function OnFail(e)
{
    console.log(e);
    alert(e.toString());
}
var googleApi = new GoogleApi();
