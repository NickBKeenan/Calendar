function PopulatePublishTab(divisionlist)
{

    // get the table tag by id
    // go through the divisionlist array
    // for each row, add a row to the table
    var table;
    table = document.getElementById("PublishTable");
    while (table.rows.length > 0)
    {
        table.deleteRow(0);
    }
    var x;
    for (x = 0;
        x < divisionlist.length;
        x++)
    {
        var row;
        var cell;
        row = table.insertRow(-1);
        cell = row.insertCell(-1);
        cell.innerHTML = divisionlist[x].AgeGroup;
        cell = row.insertCell(-1);
        cell.innerHTML = divisionlist[x].Description;
        cell = row.insertCell(-1);
        cell.innerHTML = '<a href="#" onclick="PrepareExport(\'' + divisionlist[x].Spreadsheet_Key +'\',\''+ divisionlist[x].AgeGroup+'\')">Prepare Export of Schedule</a>';
        cell = row.insertCell(-1);
        cell.innerHTML = '<a href="https://docs.google.com/spreadsheet/ccc?key=' + divisionlist[x].Spreadsheet_Key+'" target="_blank">Open Spreadsheet</a>';
        cell = row.insertCell(-1);
        cell.innerHTML = '<a href="Scheduler.html?key=' + divisionlist[x].Spreadsheet_Key + '" target="_blank">Launch Scheduler App</a>';

    }
}

function PrepareExport(divisionKey, divisionPrefix)
{ 
	
	googleApi.GetDivisionSchedule(divisionKey, divisionPrefix);
}
function DivisionSlotsPosted(retval)
{
	var table = document.getElementById("ReleaseTable");
    var row= table.rows[retval[0]];
	var cell=row.cells[row.cells.length-1];
	cell.innerHTML="Done";

//alert(retval);
}

function DivisionScheduleReceived (retval)
{
	// called when GetDivisionSchedule returns
	try 
	{
	console.log(retval);
	var prefix=retval[0];
	var fname=prefix+"-Schedule Export.csv";
	var teams=CreateTeamList(retval[1][1]);

	var schedule=retval[2][1];
        
        var schedOut = [["Date", "Start Time", "Game Duration (in minutes)", "Field Name", "Division Name", "Home Team Name", "Home Team Score", "Away Team Name", "Away Team Score", "External Game ID"]];



            //[["Start_Date", "Start_Time", "End_Date", "End_Time", "Title", "Description", "Location", "Location_URL", "Location_Details", "All_Day_Event", "Event_Type", "Tags", "Team1_ID", "Team1_Division_ID", "Team1_Is_Home", "Team2_ID", "Team2_Division_ID", "Team2_Name", "Custom_Opponent", "Event_ID", "Game_ID", "Affects_Standings", "Points_Win", "Points_Loss", "Points_Tie", "Points_OT_Win", "Points_OT_Loss", "Division_Override"]]


//        [["Format", "Start_Date", "Start_Time", "End_Date", "End_Time", "Location", "Location_Url",	"Event_Type","Team1_ID","Team1_Is_Home","Team2_ID"]];
	var x;
	var headers=schedule[0];
	var nDate= SafeHeader(headers, "Date");
	var nDOW= SafeHeader(headers, "Day-Of-Week");
	var nTime= SafeHeader(headers, "Start Time");
	var nHome= SafeHeader(headers, "Home");
	var nAway= SafeHeader(headers, "Away");
	var nField=SafeHeader(headers, "Field Name");
	
        var GameLength = dataStore.Divisions.GetGameLength(prefix);
        var DivisionName = prefix;
	console.log(GameLength);
	for(x=1; x< schedule.length; x++)
	{
		var row=[];
		var gameDate;
		var beginTime;
        var location;
        
        var HomeTeam;
        var AwayTeam;
        
		
		gameDate=DtoS(CreateGameDate(schedule[x][nDate], schedule[x][nDOW]));
        beginTime = schedule[x][nTime];
        HomeTeam = schedule[x][nHome];
        AwayTeam = schedule[x][nAway];
	
		var field=schedule[x][nField];
		var pound;
		var suffix="";
		pound=field.indexOf(" #");
		if(pound != -1)
		{
			suffix=field.substring(pound );
			field=field.substring(0,pound);
		}

		location=MakeLocation(field)+ suffix;
	
	    var y;
        for (y = 0; y < schedOut[0].length; y++) {
            row[y] = "";
        }

		row[0]=gameDate;
        row[1] = toHHMM(beginTime);
        row[2] = GameLength;
        row[5] = HomeTeam;
        row[7] = AwayTeam;
        row[4] = DivisionName;
        row[3] = location;


		schedOut.push(row);
	}
	DownloadSchedule(schedOut, fname);//

	alert("Schedule Export File Created");
	}
	catch(e)
	{
		console.log(e);
		alert(e);
	}

}

function CreateGameDate(date, CDOW)
{
	var checkDate=new Date(date);
	if(checkDate.getDay() !=6) //Saturday
	{
		throw "Date is not a Saturday:"+ date;
	}
    if (CDOW.length == 0) // if empty, default to Saturday
    {
        return date;
    }

    var DOW;
    DOW = DecodeDOW(CDOW);

    if (DOW == -1) {
        throw CDOW;
    }

    var ndays;
    if (DOW < 2) // Sunday or Monday
    {
        ndays = DOW + 1;
    } else {
        //all the other days
        ndays = DOW - 6;
    }



    var retval = AddDaysToDate(new Date(date), ndays);

    return retval;

}

function makeEndTime(StartTime, duration)
{
	var EndTime=new Date();
	StartTime=new Date(StartTime);
	console.log(StartTime, duration);
    EndTime.setTime(StartTime.getTime() + duration * 60 * 1000);
	return EndTime;
}

function MakeLocation(field)
{
	var loc=dataStore.Fields.GetExportLocation(field);
	var fieldName=dataStore.Fields.GetExportFieldName(field);
	var retval=loc;
	if(fieldName.length > 0)
	{
		retval+=' - '+ fieldName;
	}
	return retval;
}
function MakeLocationURL(field)
{
	var address=dataStore.Fields.GetAddress(field);
	var retval= '"'+"https://www.google.com/maps/place/" +address.replace(/ /g, "+")+'"'; 
	return retval;

}
function LookupTeamID(teamName, teamlist)
{
	var x=teamlist.Names.indexOf(teamName);
	return teamlist.IDs[x];
}
function CreateTeamList(rawTeamList)
{
	try {
	var retval={};
	retval.Names=[];
	retval.IDs=[];
	var headers=rawTeamList[0];
	var nName=SafeHeader(headers, "Name");
	var nID=SafeHeader(headers, "TeamID");
	var x;
	for(x=1; x< rawTeamList.length; x++)
	{
		retval.Names.push(rawTeamList[x][nName]);
		retval.IDs.push(rawTeamList[x][nID]);

	}
	return retval;
		}
	catch(e)
	{
		console.log(e);
		alert(e);
	}

}

  function DownloadSchedule(data, fileName)
        {
            var content = '';
            var mimeType = 'text/csv;encoding:utf-8';

            for (var x = 0; x < data.length; x++)
            {
				if(x>0)
					content += '\n';
				var row=data[x];
                content += row.join(",");
            }

            var a = document.createElement('a');
            mimeType = mimeType || 'application/octet-stream';

            if (navigator.msSaveBlob)
            { // IE10
                console.log("IE10");
                navigator.msSaveBlob(new Blob([content],
                {
                    type: mimeType
                }), fileName);
            }
            else if (URL && 'download' in a)
            { //html5 A[download]
                a.href = URL.createObjectURL(new Blob([content],
                {
                    type: mimeType
                }));
                a.setAttribute('download', fileName);
                document.body.appendChild(a);
                var result = a.click();

                document.body.removeChild(a);
            }
            else
            {
                console.log("Default");
                location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
            }
        }

function PopulateReleaseTab(divisionlist)
{
    var table;
    table = document.getElementById("ReleaseTable");
    while (table.rows.length > 0)
    {
        table.deleteRow(0);
    }
    var x;
    for (x = 0;
        x < divisionlist.length;
        x++)
    {
        var row;
        var cell;
        row = table.insertRow(-1);
        cell = row.insertCell(-1);
        cell.innerHTML = divisionlist[x].AgeGroup;
        cell = row.insertCell(-1);
        cell.innerHTML = divisionlist[x].Description;
        cell = row.insertCell(-1);
        cell.innerHTML = cell.innerHTML = "<button  onclick='PopulateOneSlots(\"" + divisionlist[x].Spreadsheet_Key + "\","+x+",\""+divisionlist[x].AgeGroup+"\")'>Populate Slots Tab</button>";
        
        cell = row.insertCell(-1);
        cell.innerHTML = "<button  onclick='PopulateOneTeams(\"" + divisionlist[x].Spreadsheet_Key + "\",\"" + divisionlist[x].Description+ "\",\"" + divisionlist[x].Prefix+"\")'>Populate Teams Tab</button>";
        cell = row.insertCell(-1);
        cell.innerHTML = '<a href="Scheduler.html?key=' + divisionlist[x].Spreadsheet_Key + '" target="_blank">Launch Scheduler App</a>';
        cell = row.insertCell(-1);
        cell.innerHTML = '<a href="https://docs.google.com/spreadsheet/ccc?key=' + divisionlist[x].Spreadsheet_Key + '" target="_blank">Open Spreadsheet</a>';
		cell = row.insertCell(-1);
    }
}

function PopulateOneSlots(DivisionID, rownum, AgeGroup)
{
	//
	/*
	var Popform=document.getElementById("PostSlots");
	Popform.payload=["Test data", 0];
	Popform.Action="PopulateSlots";
	Popform.submit();*/
	var table = document.getElementById("ReleaseTable");
    var row= table.rows[rownum];
	var cell=row.cells[row.cells.length-1];
	cell.innerHTML="processing...";

	var slotData=dataStore.GetDivisionGameSlots(AgeGroup);		
	console.log(slotData);
	slotData=JSON.stringify(slotData);
	
	

	googleApi.PostDivisionSlots(DivisionID, slotData, rownum);
	
}
function PopulateAllSlots( rownum)
{
	    var divisionlist = dataStore.GetDivisions();

  var x;
	for(x=rownum; x<rownum+20 && x< divisionlist.length; x++)
	{
		PopulateOneSlots( divisionlist[x].Spreadsheet_Key ,x, divisionlist[x].AgeGroup);
     }
	 return;
	if(x< divisionlist.length )
	{
	       setTimeout(function () { PopulateAllSlots( x); }, 1000);

	}

}

function PopulateOneTeams(SpreadsheetID, DivisionName, Prefix)
{
	googleApi.PopulateDivisionTeams(SpreadsheetID, DivisionName, Prefix)
}
function PopulateAllTeams()
{
	googleApi.PopulateAllDivisionTeams();
}
function DivisionTeamsPopulated()
{
	alert("Teams Tab populated");
}
function CreateDivisionSummary(divisionArray)
{
    var table = document.getElementById("divlist");
    // console.log(v);
    while (table.rows.length > 0)
    {
        table.deleteRow(0);
    }

    if (divisionArray.length == 0)
    {
        var row, cell;
        row = table.insertRow(-1);
        cell = row.insertCell(0);
        cell.innerHTML = "No Data is Available";;
        return;
    }
    divisionArray.sort(function (a, b) {  return (a.YearOfPlay > b.YearOfPlay?1 : -1); });
    var x;
    var row;
    row = table.insertRow(-1);
    var cell = row.insertCell(-1);
    cell.innerHTML = "Division";
    var cell = row.insertCell(-1);
    cell.innerHTML = "Games Per Week";
    for (x = 0; x < divisionArray.gameDates.length; x++)
    {
        var cell = row.insertCell(-1);
        cell.innerHTML = DtoS(divisionArray.gameDates[x]);
    }

    cell = row.insertCell(-1);
    cell.innerHTML = "Field Quality";
    for (x = 0; x < divisionArray.length; x++)
    {

        var display = new DivisionDisplayRow(divisionArray[x]); //in datastructures.js
        display.CreateDisplayRow(table, x, dataStore);

    }

    return;

}

function ShowDivisionDetail()
{
    
    var dialog = document.getElementById("DisplayAgeGroup");
    dialog.style.display = "block";
    var table = document.getElementById("DivisionDetail");
    while (table.rows.length > 0)
    {
        table.deleteRow(0);
    }

    var value = dataStore.Divisions.get(this.agegroup);
    var records = value.records;
    var x;
    var row = table.insertRow(-1);
    var cell = row.insertCell(-1);
    cell.innerHTML = "Field";
    cell = row.insertCell(-1);
    cell.innerHTML = "Day-of-Week";
    cell = row.insertCell(-1);
    cell.innerHTML = "Start Date";
    cell = row.insertCell(-1);
    cell.innerHTML = "End Date";
    cell = row.insertCell(-1);
    cell.innerHTML = "Start Time";
    cell = row.insertCell(-1);
    cell.innerHTML = "End Time";
    cell = row.insertCell(-1);
    cell.innerHTML = "Except";


    for (x = 0; x < records.length; x++)
    {
        var dataItem = records[x].dataItem;
        console.log(dataItem);
         row = table.insertRow(-1);
        cell = row.insertCell(-1);
        cell.innerHTML = "<a href='javascript:;' onclick='EditDivAssignment(event, \"" + dataItem.Source + "\"," +
                    dataItem.line + ");'" +
                    'title="' + dataItem.Source + ':' + dataItem.line + '"' +
                ">" + dataItem.Field;
        if (dataItem.SplitString.length > 0)
        {
            cell.innerHTML += " #" + dataItem.SplitString;
        }
        cell.innerHTML += "</a>";
        cell = row.insertCell(-1);
        var y;
        for (y = 0; y < dataItem.DowList.length; y++)
        {
            cell.innerHTML += dataItem.DowList[y].cDOW;
        }

        cell = row.insertCell(-1);
        cell.innerHTML = DtoC(dataItem.StartDate);
        cell = row.insertCell(-1);
        cell.innerHTML = DtoC(dataItem.EndDate);
        cell = row.insertCell(-1);
        var starttime = new Date(dataItem.StartTime);
        var endtime = new Date(dataItem.EndTime);
        var starthour = starttime.getHours() + starttime.getMinutes() / 60;
        var endhour = endtime.getHours() + endtime.getMinutes() / 60;

        cell.innerHTML = PrettyHour(starthour);
        cell = row.insertCell(-1);
        cell.innerHTML = PrettyHour(endhour);;
        cell = row.insertCell(-1);
        for (y = 0; y < dataItem.Except.length; y++)
        {
            if (cell.innerHTML.length > 0)
            {
                cell.innerHTML += ", ";
            }
			
            cell.innerHTML += DtoC(dataItem.Except[y]);
        }

    }
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.innerHTML = "<a href='javascript:;' onclick='CreateNewAssignment(\"Rec Games\");'>Add</a>";
}
function DoClose(e)
{
    var dialog = document.getElementById(e); 
    dialog.style.display = "none";


}
function EditDivAssignment(e, source, line)
{
    DoClose("DisplayAgeGroup");
    EditAssignment(e, source, line);
}

