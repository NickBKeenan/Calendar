

//What are our datastructures?

// There is an ojbect that represents one line in the MFC sheet. Retrieve those at the beginning of the program. About 120 permit lines and 620 assignment lines

// an array of objects that represents the status of each field. This is an array by field, then by slot and week. Each object contains its own status variables, plus an array of MFC objects representing the lines in the MFC that the permit and assignment info comes from. The ojbect also has a pointer to the TD object that is the display of this status


// an array of objects that represent the status of each division, by division then by week. 

// arrays to handle the fields, the game weeks, the divisions

// to begin, all of the rows are retrieved from the MFC. Then each row is applied to the field array and the division array to create the initial status

// when a row is changed or added, the change order is sent back to the spreadsheet. Then the old row is removed from the fields array and the division array, and the new row is applied to both. 



class DataStore
{
    // public interfaces
    constructor()
    {
        this.Fields = new FieldList();
        this.GameDays = new GameDays();
        this.Season = new Season();
        this.Divisions = new Divisions();
        // private interfaces
        this.m_Permits = new Permits();
        this.m_Assignments = new Assignments();
        this.Errors = [];
    }
    // public members
    Populate(indata)
    {
        this.Errors = [];
        this.RawData = indata;
		try
		{
        for (var x = 0; x < indata.length; x++)
        {
            switch (indata[x][0])
            {
                case "Seasons":
                    this.Season.Populate(this, indata[x][1]);
                    break;
                case "Rec Divisions":
                    this.Divisions.Populate(this, indata[x][1]);
                    break;
                case "Fields":
                    this.Fields.Populate(this, indata[x][1]);
                    break;
                case "Game Dates":
                    this.GameDays.Populate(this, indata[x][1]);
                    break;
                case "Permits":
                    this.m_Permits.Populate(this, indata[x][1]);
                    break;
                case "Assignments":
                    this.m_Assignments.Populate(this, indata[x][1]);
                    break;
                case "Season":
                    this.Season.SetSeason(indata[x][1]);
                    this.Season.SetLastUpdate(indata[x][2]);
                    break;
                default:
                    throw indata[x][0];
            }

        }
	}
	catch(e)
	{
		console.log(e);
		alert(e);
	}
    }
    UpdatedDataset(newRawData)
    {
        // when new  raw data is detected, check all of the permits and assignments
        // go through row by row and compare the new row with the old row
        // if the row has changed, update the row, and parse it and update the corresponding container. Add the field name to the list of rows to be redrawn
        // When done, redraw all the fields that have changed
        // If there are more than zero changes, redraw the divisions
        var Fields = [];
        var tempFields = [];
        for (var x = 0; x < newRawData.length; x++)
        {
            if (newRawData[x][0] == "Permits")
            {
                var oldRawData=this.FindRawSection(newRawData[x][0]);
                var retval;
                // compare the header lines of the old and new arrays
                if(!CompareArray(oldRawData[0], newRawData[x][1][0]))
                {
                    alert("Header row in sheet " + newRawData[x][0] + " has changed outside of this program. You must refresh the page to continue.");
                    return;
                }
                retval = this.m_Permits.CompareNewData(oldRawData, newRawData[x][1], newRawData[x][0]);
                tempFields.push(retval);
            }
            if (newRawData[x][0] == "Assignments")
            {
                var data = newRawData[x][1];
                var y;
                for (y = 0; y < data.length; y++)
                {
                    var newData, sheetName;
                    sheetName = data[y][0];
                    if (sheetName != "NCSL Games")
                    {
                        newData = data[y][1];
                        var oldRawData = this.FindRawSection(sheetName);
                        var retval;
                        // compare the header lines of the old and new arrays
                        if (!CompareArray(oldRawData[0], newData[0]))
                        {
                            alert("Header row in sheet " + sheetName + " has changed outside of this program. You must refresh the page to continue.");
                            return;
                        }

                        retval = this.m_Assignments.CompareNewData(oldRawData, newData, sheetName);
                        tempFields.push(retval);
                    }
                }

            }
            if (newRawData[x][0] == "Season")
            {

                this.Season.SetLastUpdate(newRawData[x][2]);
            }
        }
        // now create the Fields array;
        for (var x = 0; x < tempFields.length; x++)
        {
            for (var y = 0; y < tempFields[x].length; y++)
            {
                var field = tempFields[x][y];
                if (Fields.indexOf(field) == -1)
                {
                    Fields.push(field);
                }
            }
        }

        for (var x = 0; x < Fields.length; x++)
        {
            if (Fields[x].length > 0)
            {
                UpdateFieldDisplay(Fields[x]);
            }
        }
        if (Fields.length > 0)
        {
            CreateDivisionSummary(this.GetDivisions());
        }
        PopulateErrors(this.Errors);

    }
    GetFieldAllAvailability(field)
    {
        var beginHour = 0;
        var endHour = 24;
        var begindate = this.Season.BeginDate();
        var enddate = this.Season.EndDate();
        var retval = this.GetAvailability(field, begindate, enddate, beginHour, endHour);
        return retval;
    }
    GetAllAvailability()
    {
        var iterator = this.Fields.keys();
        var retval = [];
        var x;
        for (x = 0; x < this.Fields.size ; x++)
        {
            var row = {};
            row.Field = iterator.next().value;
            row.availabilityData = this.GetFieldAllAvailability(row.Field);

            if (row.availabilityData.availabilities.length > 0)
            {
                retval.push(row);
            }
        }
        return retval;


    }
    GetAvailability(field, begindate, enddate, beginHour, endHour)
    {
        var availability = [];
        //retval is going to be an array of objects, each object representing one time slot. Inside the time slot is an array of dates;
        // inside the array of dates is an availability object for that field, time and date


        var hour;
        var alldates = [];
        // first, establish the dates
        //        dates=GetDateRange(cDOW, begindate, enddate);

        for (hour = beginHour; hour < endHour; hour += 0.5)
        {
            var hours = 0;
            var row = [];
            var nDOW;
            alldates = [];
            for (nDOW = 0; nDOW < 7; nDOW++)
            {
                var cDOW = weekdays[(nDOW + 6) % 7];
                var dates = GetDateRange(cDOW, begindate, enddate);
                var x;
                for (x = 0; x < dates.length; x++)
                {
                    var date = dates[x];
                    alldates.push(date);
                    var avail = new Availability(this.m_Permits.GetAvailability(field, cDOW, date, hour), this.m_Assignments.GetAvailability(field, cDOW, date, hour));
                    hours += avail.count;

                    row.push(avail);
                }
            }
            if (hours > 0)
            {

                // not an empty row
                row.hour = hour;
                availability.push(row);

            }
        }
        var retval = {};

        retval.dates = alldates;
        retval.availabilities = availability;

        return retval;
    }
    GetLineData(sheet, line)
    {
        var x;
        for (x = 0; x < this.RawData.length ; x++)
        {
            if (this.RawData[x][0] == "Permits" && sheet == "Permits")
            {
                if (line == -1)
                {
                    return [];
                }
                var thisData = this.RawData[x][1];
                console.log(thisData);
                this.m_Permits.GetHeaders(thisData[0]);
                return this.m_Permits.ParseRow(thisData[line], line, sheet);

            }
            if (this.RawData[x][0] == "Assignments")
            {
                var y;
                for (y = 0; y < this.RawData[x][1].length; y++)
                {
                    var thisData = this.RawData[x][1][y];
                    if (thisData[0] == sheet)
                    {
                        this.m_Assignments.GetHeaders(thisData[1][0]);
                        return this.m_Assignments.ParseRow(thisData[1][line], line, sheet);

                    }
                }
            }
        }
        throw sheet;
        console.log(sheet, line, x, y);
    }

    GetDivisions()
    {
        var x;
        var retval = [];
        retval.gameDates = this.GameDays;
        var iterator = this.Divisions.keys();
        for (x = 0; x < this.Divisions.size; x++)
        {
            var row = {};
            var value = this.Divisions.get(iterator.next().value);
            row.Prefix = value.Prefix;
            row.AgeGroup = value.Age_Group;
            row.Description = value.Description;
            row.Spreadsheet_Key = value.Spreadsheet_Key;
            row.GamesPerWeek = value["Games_needed per week"];
            row.Slots = this.GetDivisionInfo(row.AgeGroup);
            row.YearOfPlay = value.YearOfPlay;
            retval.push(row);
        }

        return retval;
    }
	GetDivisionGameSlots(agegroup)
	{
		//returns an array formatted for the scheduler Slots table
		var value = this.GetDivisionInfo(agegroup);
        
		console.log(value);
        var weeks = this.Divisions.gameDates;
		var retval=[["Field", "Day-of-Week", "Time"]];
		var x;
		for(x=0; x< weeks.length; x++)
		{
			retval[0].push(DtoS(weeks[x]));
		}
		var week;
		for(week=0; week< value.length; week++)
		{
			var weekData=value[week];
			var fieldNo;
			for(fieldNo=0; fieldNo< weekData.length; fieldNo++)
			{
				var fieldData=weekData[fieldNo];
				for(x=0; x<fieldData.length; x++)
				{
					var FieldName=fieldData[x].field;
					if(fieldData[x].source.dataItem.SplitString.length > 0)
					{
						FieldName+=" #"+fieldData[x].source.dataItem.SplitString;
					}
					var Fields=ExpandSplitField(FieldName);
					var DOW=fieldData[x].source.dataItem.DowList[0].cDOW;
					var time=PrettyHour(fieldData[x].time)+"m";
					var split;
					for(split=0; split < Fields.length; split++)
					{
						// insert this time and field into return array
						var thisSplit=Fields[split];
						var y;
						var slotindex=-1;
						for(y=1; y< retval.length && slotindex==-1; y++)
						{
							if(thisSplit==retval[y][0] && DOW==retval[y][1] && time==retval[y][2])
							{
								slotindex=y;
							}
						}
						if(slotindex==-1)
						{
							slotindex=retval.length;
							var newRow=[thisSplit, DOW, time];
							var z;
							for(z=0; z<weeks.length; z++)
							{
								newRow.push("No");
							}
							retval.push(newRow);
						}
						
						retval[slotindex][week+3]="";
					}
				}
			}
		}

		return retval;
	}
    GetDivisionInfo(agegroup)
    {
        var value = this.Divisions.get(agegroup);
        var gameslots = value.records;
        var weeks = this.Divisions.gameDates;
        var retval = [];
        var week;
        for (week = 0; week < weeks.length; week++)
        {
            retval[week] = [];
            retval[week].slotcount = 0;
        }
		if(value.Game_length=="")
		{
		   this.LogError("Division "+agegroup+" has an invalid game length", "Divisions", 0)
 
			return retval;
		}
        var x;
        for (x = 0; x < gameslots.length; x++)
        {
            
            for (week = 0; week < weeks.length; week++)
            {
                var games = gameslots[x].GetGameSlotCount(weeks[week], value.Game_length);
                if (games.length > 0)
                {
                    retval[week].push(games);
                    var slotcount = 0;
                    for (var z = 0; z < games.length; z++)
                    {
                        var splits = gameslots[x].dataItem.splits;
                        
                        if(splits==0)
                        {
                            splits=1;
                        }
                        slotcount+=splits;
                    }
                    retval[week].slotcount += slotcount;
                }
            }
        }
        
        return retval;
    }
    FindRawSection(source)
    {
        if (source==undefined || source.length == 0)
        {
            throw "Spreadsheet must be specified.";
        }
        for (var x = 0; x < this.RawData.length; x++)
        {
            if (source == "Permits")
            {
                if (this.RawData[x][0] == "Permits")
                {
                    return this.RawData[x][1];
                }
            }
            else
            {
                if (this.RawData[x][0] == "Assignments")
                {
                    var data=this.RawData[x][1];

                    for (var y = 0; y < data.length; y++)
                    {
                        var line, sheetName;
                        sheetName = data[y][0];
                        line = data[y][1];

                        if (sheetName == source)

                        {
                            return line;
                        }
                    }
                }

            }
        }
        return [];
         
    }
    DeleteCalendarLine(calendarLine)
    {
        var rawSection = this.FindRawSection(calendarLine.Source);
        var oldline = rawSection[calendarLine.line];
        rawSection[calendarLine.line] = BlankArray(oldline.length);
        if (calendarLine.Source == "Permits")
        {
            this.m_Permits.RemoveSingleLine(calendarLine);
        }
        else
        {
            this.m_Assignments.RemoveSingleLine(calendarLine);
            if (calendarLine.Source == "Rec Games")
            {
                this.Divisions.RemoveLine(calendarLine);
            }
        }
        if (calendarLine.Field.length > 0)
        {
            UpdateFieldDisplay(calendarLine.Field);
        }
        CreateDivisionSummary(this.GetDivisions());
        var newline = BlankArray(oldline.length);
        googleApi.UpdateDataLine(this.Season.Current(), calendarLine.Source, calendarLine.line, newline, oldline, this.Season.LastUpdate);

    }
    AddCalendarLine(calendarLine)
    {
        var rawSection = this.FindRawSection(calendarLine.Source);
        calendarLine.line = rawSection.length;
        rawSection[calendarLine.line] = calendarLine.FormattedArray(rawSection[0], false);
        if (calendarLine.Source == "Permits")
        {
            this.m_Permits.AddSingleLine(calendarLine, rawSection);
        }
        else
        {
            this.m_Assignments.AddSingleLine(calendarLine, rawSection);

        }
        UpdateFieldDisplay(calendarLine.Field);
        CreateDivisionSummary(this.GetDivisions());
        var newline = calendarLine.FormattedArray(rawSection[0], true);
        var oldline = BlankArray(newline.length);
        googleApi.UpdateDataLine(this.Season.Current(), calendarLine.Source, calendarLine.line, newline, oldline, this.Season.LastUpdate);
    }
    UpdateCalendarLine(calendarLine)
    {
        var rawSection = this.FindRawSection(calendarLine.Source);
        var oldline = rawSection[calendarLine.line];
        rawSection[calendarLine.line] = calendarLine.FormattedArray(rawSection[0], false);
        var newline = calendarLine.FormattedArray(rawSection[0], true);

        if (calendarLine.Source == "Permits")
        {
            this.m_Permits.UpdateLine(calendarLine, rawSection);
        }
        else
        {
            if(calendarLine.Source=="Rec Games")
            {
                this.Divisions.RemoveLine(calendarLine);
            }
            this.m_Assignments.UpdateLine(calendarLine, rawSection);
        }
        UpdateFieldDisplay(calendarLine.Field);
        CreateDivisionSummary(this.GetDivisions());
        googleApi.UpdateDataLine(this.Season.Current(), calendarLine.Source, calendarLine.line, newline, oldline, this.Season.LastUpdate);

    }
    LogError(e, sheet, line)
    {
        if (e.length > 0)
        {
            this.Errors.push({ msg: e, sheet: sheet, line: line  });
        }
    }

}
// end of datastore;

class DivisionDisplayRow
{
    constructor(data)
    {
        this.data = data;
    }
    CreateDisplayRow(table, rownumber, datastore)
    {

        var row = table.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.innerHTML = this.data.AgeGroup;
        cell.agegroup = this.data.AgeGroup;
        cell.onclick = ShowDivisionDetail;

        cell = row.insertCell(-1);
        cell.innerHTML = this.data.GamesPerWeek;
        var x;
        var percentages = { "Artificial": 0, "Grass Good": 0, "Grass Poor": 0 };
        var slotcount = 0;
        for (x = 0; x < this.data.Slots.length; x++)
        {
            var slot = this.data.Slots[x];
            cell = row.insertCell(-1);
            cell.innerHTML = slot.slotcount;
            if (slot.slotcount != this.data.GamesPerWeek)
            {
                var difference = slot.slotcount - this.data.GamesPerWeek;
                if (difference < -2)
                {
                    cell.className = "Short3plus";
                }
                else
                {
                    if (difference > 2)
                    {
                        cell.className = "Extra3plus";
                    }
                    if (difference == 2)
                    {
                        cell.className = "Extra2";
                    }
                    if (difference == 1)
                    {
                        cell.className = "Extra1";
                    }
                    if (difference == -1)
                    {
                        cell.className = "Short1";
                    }
                    if (difference == -2)
                    {
                        cell.className = "Short2";
                    }
                }

            }
            var mouseover = "";
            var lasttitle = "";
            var lastsurface = "";
            for (var j = 0; j < slot.length; j++)
            {
                var title = slot[j][0].field;

                if (slot[j][0].source.dataItem.SplitString.length > 0)
                {
                    title += " #" + slot[j][0].source.dataItem.SplitString;
                }
                if (title != lasttitle)
                {
                    if (mouseover.length > 0)
                    {
                        mouseover += "\r";
                    }
                    mouseover += title+":";
                    lasttitle = title;
                    lastsurface = datastore.Fields.GetSurface(slot[j][0].field);
                }
                else
                {
                    mouseover += ",";
                }
                for (var z = 0; z < slot[j].length; z++)
                {
                    mouseover += " " + FormatTime(slot[j][z].time);
                    var splitcount = slot[j][z].source.dataItem.splits;
                    if (splitcount== 0)
                    {
                        splitcount = 1;
                    }
                    percentages[lastsurface]+=splitcount;
                    slotcount+=splitcount;
                    if (z < slot[j].length - 1)
                    {
                        mouseover += ",";
                    }
                }
            }
            cell.title = mouseover;


        }
        cell = row.insertCell(-1);
        if (slotcount > 0)
        {
            var innerHTML ;
            innerHTML = "";
            var bgcolors = ["#006666", "#62dd01", "#cc9900"];
            var surfaces = ["Artificial", "Grass Good", "Grass Poor"];
            for (x = 0; x < surfaces.length; x++)
            {
                if (percentages[surfaces[x]] > 0)
                {
                    var percentage = Math.floor(percentages[surfaces[x]] / slotcount*100);
                    innerHTML += "<div style='float:left; background-color: " + bgcolors[x] + "; width: " + percentage  + "px; height:1.25em' title='" + surfaces[x] + ":" + percentage  + "%'></div>";
                }
            }
            cell.innerHTML = innerHTML;
        }
        //////////////////////////////////////////
    }
}



////////////////////////////////////////////////////////////////

class FieldList extends Map
    // a list of the fields in this calendar
{

    Populate(parentDataStore, indata)
    {
        var headers = indata[0];
        var nName, nSlotcount, nSurface, nAddress, nExportLocation, nExportFieldName;
        nName = SafeHeader(headers, "Name");
        nSlotcount = SafeHeader(headers, "Capacity");
        nSurface = SafeHeader(headers, "Surface");
		nAddress= SafeHeader(headers, "Address");
		nExportLocation =headers.indexOf( "Location Name For Export");
		nExportFieldName =headers.indexOf( "Field Name For Export");
		


        this.m_parentDataStore = parentDataStore;
        var x;

        for (x = 1; x < indata.length; x++)
        {
			try{
            var item = {};
            item.Name = indata[x][nName];
            item.Slotcount = indata[x][nSlotcount];

			if(!(item.Slotcount > 0))
			{
			   parentDataStore.LogError(item.Name+ " invalid slot count", "Fields", x);
				
			}
            item.Surface = indata[x][nSurface];
			item.Address=indata[x][nAddress];
			if(nExportLocation > -1)
			{
				item.ExportLocationName=indata[x][nExportLocation];
			}
			else
			{
				item.ExportLocationName="";
			
			}
			if(nExportFieldName > -1)
			{
				item.ExportFieldName=indata[x][nExportFieldName];
			}
			else
			{
				item.ExportFieldName="";
			}
            if (item.Name.length > 0)
            {
                this.set(item.Name, item);
            }
			}
			catch(e)
			{
			   parentDataStore.LogError(e, "Fields", x);
			
			}
        }

    }
    GetSlotCount(field)
    {
        var item = this.get(field);
        return item.Slotcount;
    }
    GetSurface(field)
    {
        var item = this.get(field);
        return item.Surface;
    }
	GetAddress(field)
	{
	    var item = this.get(field);
        return item.Address;
    
	}
	GetExportLocation(field)
	{
	    var item = this.get(field);
		if(item==undefined)
			throw "Invalid Field Name "+field;
        return item.ExportLocationName;
    }
	GetExportFieldName(field)
	{
	    var item = this.get(field);
		if(item==undefined)
			throw "Invalid Field Name "+field;
        return item.ExportFieldName;
    
	}
}
class Availability
    //container that holds a permits object and an assignment object that have been populate for information about a particular field at a particular time
    // has a method to create a single cell that represents this status
{

    constructor(permits, assignments)
    {
        this.permits = permits;
        this.assignments = assignments;
        this.count = permits.length + assignments.length;
    }

    formatCell(cell, fieldID, slotcapacity, isMinimized)
    {

        var assigned;
        var permitted;
        var description = "";
        //    cell.style.width = "100%";
        assigned = this.assignments.length;
        permitted = this.permits.length;

        var WholeField = 0;
        var slots = 0;
        var splits = 0;
        var x;
        for (x = 0; x < assigned; x++)
        {
            if (!isMinimized)
            {
                if (description.length > 0)
                {
                    description += "/";
                }
                description += "<a href='javascript:;' onclick='EditAssignment(event, \"" + this.assignments[x].source + "\"," +
                    this.assignments[x].lineno + ");'" +
                    'title="' + this.assignments[x].source + ':' + (this.assignments[x].lineno+1) + '"' +
                ">" + this.assignments[x].Description;
                if (this.assignments[x].Description.length == 0)
                {
                    // if the description is empty, put in something you can mouseover or click on
                    description += "***";
                    
                }

                if (this.assignments[x].SplitString.length > 0)
                {
                    description += " #" + this.assignments[x].SplitString;
                }
                description+= "</a> ";
            }
            if (this.assignments[x].WholeField)
            {
                WholeField++;
            }
            else
            {
                slots += Number(this.assignments[x].slots);
                splits += Number(this.assignments[x].splits);
            }
        }
        if (isMinimized)
        {
            cell.innerHTML = '';
        }
        else
        {
            cell.innerHTML = description;
        }

        if (permitted == 0)
        {
            if (!isMinimized)
            {
                cell.lineNo = -1;
                cell.addEventListener("click", EditPermit, false);
            }
            if (WholeField + splits + slots == 0)
            {
                cell.className = "unavailable";
            }
            else
            {
                cell.className = "overbooked";
            }
        }
        else //we have a permit
        {
            if (!isMinimized)
            {
                cell.title = this.permits[0].source + ':' + (this.permits[0].lineno+1);
                cell.lineNo = this.permits[0].lineno;
                cell.addEventListener("click", EditPermit, false);
            }
            if (WholeField > 0)
            {
                if (WholeField > 1 || (splits + slots > 0))
                {
                    cell.className = "overbooked";
                }
                else
                {
                    cell.className = "full";
                }

            }
            else
            {// we have splits and /or slots
                if (slots > 0)
                {
                    if (splits > 0)
                    {
                        cell.className = "overbooked";
                    }
                    else
                    {

                        if (slots > slotcapacity)
                        {
                            cell.className = "overbooked";

                        }
                        else
                        {
                            if (slots == slotcapacity)
                            {
                                cell.className = "full";
                            }
                            else
                            {

                                cell.className = "partial";

                            }
                        }
                    }
                }
                else
                {
                    if (splits > 0)
                    {
                        cell.className = "full";
                    }
                    else
                    {
                        cell.className = "free";
                    }
                }

            }
        }

    }
}
/////////////////////////////////////////////////////////////////////
class Season extends Map
    // information about the current season and all seasons
{
    Populate(parentDataStore, data)
    {
        var headers = data[0];
        var x;
        for (x = 1; x < data.length; x++)
        {
            var row = {};
            var y;
            for (y = 0; y < headers.length; y++)
            {
                if (headers[y].length > 0)
                {
                    var attribute = headers[y].replace(" ", "_");
                    row[attribute] = data[x][y];
                }
            }

            this.set(row.Season_Name, row);
        }

    }
    SetSeason(season)
    {
        this.Season = season;
    }
    SetLastUpdate(lupdate)
    {
        this.LastUpdate = new Date(lupdate);
        this.LastUpdate = this.LastUpdate.getTime();
        console.log(this.LastUpdate);
    }
    Default()
    {
        return this.get("CURRENT").Spreadsheet_Key;
    }
    Current()
    {
        if (this.Season != undefined)
        {
            return this.Season;
        }
        return this.get("CURRENT").Spreadsheet_Key;
    }
    CurrentRec()
    {
        return this.get(this.Current());
    }
    BeginDate()
    {
        return new Date(this.CurrentRec().Begin_Date);

    }
    EndDate()
    {
        return new Date(this.CurrentRec().End_Date);

    }
}
class Divisions extends Map
{
    Populate(parentDataStore, data)
    {
        this.gameDates = parentDataStore.GameDays;
        this.m_parentDataStore = parentDataStore;
        //  console.log(data);
        var headers = data[0];
        var x;
        for (x = 1; x < data.length; x++)
        {
            var row = {};
            var y;
            for (y = 0; y < headers.length; y++)
            {
                if (headers[y].length > 0)
                {
                    var attribute = headers[y].replace(" ", "_");
                    row[attribute] = data[x][y];
                }
            }
            row.records = [];
            this.set(row.Age_Group, row);
        }
    }
	GetGameLength(prefix)
	{
		var row=this.get(prefix);
		console.log(row);
		return row.Game_length;
	}
    AddRecGameLine(dataItem, y)
    {
        //console.log(dataItem);
        var thisRow = this.get(dataItem.Description);
        if (thisRow != undefined)
        {
            thisRow.records.push(new RecGameItem(dataItem));
        }
    }
    RemoveLine(calendarLine)
    {
        var thisRow = this.get(calendarLine.Description);
        if (thisRow == undefined)
        {
            return;
        }
        var records=thisRow.records;
        var x;
        for (x = 0; x < records.length; x++)
        {
            if (records[x].dataItem.Source = calendarLine.Source && records[x].dataItem.line == calendarLine.line)
            {
                records.splice(x, 1);
                return;
            }
        }

    };

}
class RecGameItem
{
    constructor(dataItem)
    {
        this.dataItem = dataItem;
    }
    GetGameSlotCount(weekdate, gamelength)
    {
        var retval=[];
        var x;
        var startDate = new Date(this.dataItem.StartDate);
        var endDate = new Date(this.dataItem.EndDate);
        for(x=0; x< this.dataItem.DowList.length; x++)
        {
            var nDow=DecodeDOW(this.dataItem.DowList[x].cDOW);
            var gamedate = FormTimeFromDayHour(weekdate, nDow, 0);
            var isGameDate = false;
            if (!LDateIsLessThanRDate(gamedate, startDate))
            {
                if (!LDateIsLessThanRDate(endDate, gamedate))
                {
                    // dates overlap, now check for except dates
                    var y;
                    isGameDate = true;
                    for (y = 0; y < this.dataItem.Except.length; y++)
                    {
                        if (EqualDate(gamedate, this.dataItem.Except[y]))
                        {
                            isGameDate = false;
                        }
                    }

                }
            }
			
            if (isGameDate)
            {
                // this date is a game date
                var starttime = new Date(this.dataItem.StartTime);
                var endtime=new Date(this.dataItem.EndTime);
                var starthour = starttime.getHours() + starttime.getMinutes() / 60;
                var endhour = endtime.getHours() + endtime.getMinutes() / 60;
                
                while (starthour <= endhour - gamelength / 60)
                {
                    var permits = dataStore.m_Permits.GetAvailability(this.dataItem.Field, this.dataItem.DowList[x].cDOW, gamedate, starthour);
                    var assignments = dataStore.m_Assignments.GetAvailability(this.dataItem.Field, this.dataItem.DowList[x].cDOW, gamedate, starthour);

          
                    var j;
                    var hasSlot = false;
                        var assigned;
                        var permitted;
                        assigned = assignments.length;
                        permitted = permits.length;
                        if (permitted > 0)
                        {
                            // field is permitted don't care how much time
                            hasSlot = true;
                            for (j = 0; j < assigned; j++)
                            {
                                if (assignments[j].source != "Rec Games")
                                {
                                    hasSlot = false;
                                    
                                }
                                else
                                {
                                    if (assignments[j].lineno < this.dataItem.line)
                                    {
                                        // another, earlier, rec game kills this slot, unless they're both using splits
                                        if (assignments[j].splits == 0 || this.dataItem.splits == 0)
                                        {
                                           
                                            hasSlot = false;
                                        }
                                    }

                                }
                            }

                        }


                    if (hasSlot)
                    {
                        
                        var line = { field: this.dataItem.Field, time: starthour, source: this };
                        retval.push(line);
                        starthour += gamelength / 60;
                    } else
                    {
                        
                        starthour += .25;
                    }

               }
            }
        }
        return retval;
    }
}

class ScheduleItem  // represents one entry in a schedule, assignment or permit
{
    constructor(data, except)
    {

        this.m_StartDate = new Date(data.StartDate);
        this.m_EndDate = new Date(data.EndDate);
        this.m_EndDate.setHours(0);
        this.m_EndDate.setMinutes(0);
        var stime = new Date(data.StartTime);
        var etime = new Date(data.EndTime);
        if (LDateIsLessThanRDate(this.m_EndDate, this.m_StartDate))
        {
            throw "Start Date is After End Date";
        }
        this.m_StartTime = stime.getHours() + stime.getMinutes() / 60;
        this.m_EndTime = etime.getHours() + etime.getMinutes() / 60;
        if (this.m_StartTime > this.m_EndTime)
        {
            throw "Start Time is after End Time";
        }
        this.source = data.Source;
        this.lineno = data.line;
        this.Except = except;
        this.WholeField = data.WholeField;
        this.slots = data.slots;
        this.splits = data.splits;
        this.Description = data.Description;
        this.SplitString = data.SplitString;
    }
    Overlaps(date, hour)
    {
        if (LDateIsLessThanRDate(date, this.m_StartDate))
        {
            return false;
        }
        if (hour < this.m_StartTime)
        {
            return false;

        }

        if (LDateIsLessThanRDate(this.m_EndDate, date))
        {
            return false;
        }
        if (hour >= this.m_EndTime)
        {
            return false;

        }
        var x;
        for (x = 0; x < this.Except.length; x++)
        {
            if (EqualDate(date, this.Except[x]))
                return false;
        }
        return true;

    }
}

class CalendarRecord extends Map // base class for both permits and assignments objects, they have everything in common except the source data
    // this is a collection of ScheduleItem's
{
    ParseSheet(parentDataStore, data, sheetName)
    {
        this.parentDataStore = parentDataStore;
		if(data==undefined || data.length==0)
			return;
		try{
			this.GetHeaders(data[0]);
			}
		catch(e)
		{
                parentDataStore.LogError("Unable to load, missing header:"+e, sheetName, 0);
				return;
		}
        var x;
        for (x = 1; x < data.length; x++)
        {
            try
            {
                var dataItem = this.ParseRow(data[x], x, sheetName);
                var y;
                for (y = 0; y < dataItem.DowList.length; y++)
                {
                    this.Add(dataItem, y);
                }
            }
            catch (e)
            {
                parentDataStore.LogError(e, sheetName, x);

            }
        }
    }

    GetHeaders(headers)
    {


        this.nField = SafeHeader(headers, "Field");
        this.nDOW = SafeHeader(headers, "Day-of-week");
        this.nStartDate = SafeHeader(headers, "Start Date");
        this.nEndDate = SafeHeader(headers, "End Date");
        this.nStartTime = SafeHeader(headers, "Start Time");
        this.nEndTime = SafeHeader(headers, "End Time");
        this.nExcept = SafeHeader(headers, "Except");
        this.nDescription = headers.indexOf("Description");
        if (this.nDescription == -1)
        {
            this.nDescription = headers.indexOf("Division");
        }
        this.nSlots = headers.indexOf("Slots");


    }
    ParseRow(row, lineno, source)
    {

        var dataItem = {};
        dataItem.Source = source;
        dataItem.line = lineno;

        var cDOW = row[this.nDOW];
        dataItem.DowList = BreakDOWString_(cDOW);



        dataItem.Field = PoundStrippedName(row[this.nField]);
        if (dataItem.Field.length == 0)
        {

            if (CompareArray(row, BlankArray(row.length)))
            {
                // an empty line, just ignore
                // throw will cause processing of this row to stop, but an empty error will cause it to be ignored.
                throw "";
            }

            else
            {
                throw "Invalid Field Name";
            }
        }
        else
        {
            if (dataStore.Fields.get(dataItem.Field) == undefined)
            {
                throw "Invalid Field Name";
            }
        }

        if (cDOW.length == 0)
        {
            throw "Empty Day-of-Week";
        }
        if (dataItem.DowList.length == 0)
        {
            throw "Invalid Day-of-Week";
        }
        if (row[this.nExcept].trim().length > 0)
        {
			var exceptlist= row[this.nExcept].split(",");
            dataItem.Except = [];

            var z;
            for (z = 0; z < exceptlist.length; z++)
            {
				var tdate= new Date(exceptlist[z]);
				if(!isNaN(tdate.getTime()))
				{
					dataItem.Except.push(tdate) ;
				}
            }
        }
        else
        {
            dataItem.Except = [];
        }


        dataItem.StartDate = row[this.nStartDate];
        if (dataItem.StartDate.length == 0) throw "Invalid Start Date";
        dataItem.EndDate = row[this.nEndDate];
        if (dataItem.EndDate.length == 0) throw "Invalid End Date";

        dataItem.StartTime = row[this.nStartTime];
        if (dataItem.StartTime.length == 0) throw "Invalid Start Time";
        dataItem.EndTime = row[this.nEndTime];
        if (dataItem.EndTime.length == 0) throw "Invalid End Time";
        if (this.nDescription != -1)
        {
            dataItem.Description = row[this.nDescription];
        }
        else
        {
            dataItem.Description = "";
        }
        // check for slots
        if (this.nSlots != -1)
        {
            var slots = row[this.nSlots];
            if (slots.toString().toUpperCase() == "ALL")
            {
                dataItem.slots = 0;
                dataItem.WholeField = true;

            }
            else
            {
                // if spreadsheet has a slots column it has to be filled in
                if (slots.length == 0)
                {
                    throw ("Slots column is empty");
                }
                dataItem.slots = slots;
                dataItem.WholeField = false;
            }
        }
        else
        {
            dataItem.slots = 0;
            dataItem.WholeField = true;
        }
        // check for splits
        if (row[this.nField].indexOf("#") == -1)
        {

            dataItem.splits = 0;
            dataItem.SplitString = "";
        }
        else
        {
            dataItem.WholeField = false;
            dataItem.splits = ExpandSplitField(row[this.nField]).length;
            var pound;
            var fname = row[this.nField]
            pound = fname.indexOf("#");

            dataItem.SplitString = fname.substr(pound + 1, fname.length - pound);
        }

        return dataItem;
    }



    Add(data, DowNo)
    {

        var Dow = data.DowList[DowNo].cDOW;


        var ExceptDates = data.Except;
        if (data.DowList[DowNo].GamesOnly)
        {

            var NoGames = this.parentDataStore.GameDays.GetNonGameDates(Dow);
            ExceptDates = data.Except.concat(NoGames);;
            // add non-games to except list
        }


        var fieldrec = this.get(data.Field);
        if (fieldrec == undefined)
        {
            fieldrec = new Map();
            this.set(data.Field, fieldrec);
        }
        var DOWrec = fieldrec.get(Dow);
        if (DOWrec == undefined)
        {
            DOWrec = [];
            fieldrec.set(Dow, DOWrec);
        }
        DOWrec.push(new ScheduleItem(data, ExceptDates));


    }
    ////////////////
    AddSingleLine(calendarLine, rawSection)
    {
        this.GetHeaders(rawSection[0]);
        var dataItem;
            dataItem = this.ParseRow(rawSection[calendarLine.line], calendarLine.line, calendarLine.Source);

        var y;
        for (y = 0; y < dataItem.DowList.length; y++)
        {
            if(calendarLine.Source=="Rec Games")
            {
                this.parentDataStore.Divisions.AddRecGameLine(dataItem, y);
            }
            this.Add(dataItem, y);
        }

    }   
    RemoveSingleLine(calendarLine)
    {
        var fieldrec = this.get(calendarLine.Field);
        if (fieldrec == undefined)
        {
            return;
        }
        for (var x = 0; x < 7; x++)
        {
            var Dow = weekdays[x];
            var DOWrec = fieldrec.get(Dow);
            if (DOWrec != undefined)
            {
                var changed=false;
                var newDOWrec=[];
                for (var y = 0; y < DOWrec.length; y++)
                {
                    if(DOWrec[y].source==calendarLine.Source && DOWrec[y].lineno==calendarLine.line)
                    {
                        changed = true;
                    }
                    else
                    {
                        newDOWrec.push(DOWrec[y]);
                    }
                }
                if(changed)
                {
                    fieldrec.set(Dow, newDOWrec);
                }
            }
        }
    }
    UpdateLine(calendarLine, rawSection)
    {
        this.RemoveSingleLine(calendarLine);
        this.AddSingleLine(calendarLine, rawSection);
    }
    CompareNewData(oldRawData, newData, sheetName)
    {
        var len = oldRawData.length;
        if (len < newData.length)
        {
            len = newData.length;

        }
        this.GetHeaders(oldRawData[0]);
        var retFields = [];
        var x;
        for (x = 1; x < len; x++)
        {
            try
            {
            var calendarLine = {};
            if (x >= oldRawData.length) // row was added
            {
                oldRawData[x] = newData[x];
                calendarLine = {};
                calendarLine.line = x;
                calendarLine.Source = sheetName;
                calendarLine.Field = oldRawData[x][this.nField];

                this.AddSingleLine(calendarLine, oldRawData);
                var field = PoundStrippedName(calendarLine.Field)
                if (retFields.indexOf(field) == -1)
                {
                    retFields.push(field);
                }
            }
            else
            {

                if (x >= newData.length) // row was deleted
                {
                    if (oldRawData[x].length > 0) // not already a blank row
                    {
                        calendarLine = {};
                        calendarLine.line = x;
                        calendarLine.Source = sheetName;
                        calendarLine.Field = oldRawData[x][this.nField];
                        calendarLine.Description = oldRawData[x][this.nDescription];
                        var field = PoundStrippedName(calendarLine.Field)
                        if (retFields.indexOf(field) == -1)
                        {
                            retFields.push(field);
                        }
                        this.RemoveSingleLine(calendarLine);
                        if (calendarLine.Source == "Rec Games" && calendarLine.Field.length > 0)
                        {
                            dataStore.Divisions.RemoveLine(calendarLine);
                        }
                        oldRawData[x] = BlankArray(oldRawData[x].length);
                    }
                }
                else
                {
                    if (!CompareArray(oldRawData[x], newData[x]))
                    {

                        calendarLine.line = x;
                        calendarLine.Source = sheetName;
                        if (oldRawData[x].length > 0)
                        {
                            calendarLine.Field = oldRawData[x][this.nField];
                            calendarLine.Description = oldRawData[x][this.nDescription];
                            this.RemoveSingleLine(calendarLine);
                            if (calendarLine.Source == "Rec Games" && calendarLine.Field.length > 0)
                            {
                                dataStore.Divisions.RemoveLine(calendarLine);
                            }
                            var field = PoundStrippedName(calendarLine.Field)

                            if (retFields.indexOf(field) == -1)
                            {
                                retFields.push(field);
                            }
                        }
                        oldRawData[x] = newData[x];
                        this.AddSingleLine(calendarLine, oldRawData);
                        calendarLine.Field = oldRawData[x][this.nField];
                        calendarLine.Description = oldRawData[x][this.nDescription];
                        var field = PoundStrippedName(calendarLine.Field)

                        if (retFields.indexOf(field) == -1)
                        {
                            retFields.push(field);
                        }

                    }
                }
            }
            }
            catch (e)
            {
                this.parentDataStore.LogError(e, calendarLine.Source, calendarLine.line);
            }

        }
        return retFields;
    }
    ////////////
    GetAvailability(field, DOW, date, hour)
    {
        var retval = [];
        var fieldrec = this.get(field);
        if (fieldrec == undefined)
        {
            return retval;
        }
        var DOWrec = fieldrec.get(DOW);
        if (DOWrec == undefined)
        {
            return retval;
        }
        var x;
        for (x = 0; x < DOWrec.length; x++)
        {

            if (DOWrec[x].Overlaps(date, hour))
            {
                retval.push(DOWrec[x]);
            }


        }


        return retval;
    }




}

class Permits extends CalendarRecord
{
    Populate(parentDataStore, data)
    {
        this.ParseSheet(parentDataStore, data, "Permits");
    }
}

class Assignments extends CalendarRecord
{
    Populate(parentDataStore, data)
    {

        var x;
        var RecGamesElement = -1;
        for (x = 0; x < data.length; x++)
        {
            var line, sheetName;
            sheetName = data[x][0];
            line = data[x][1];

            if (sheetName == "NCSL Games")
            {
                this.ParseNCSLGames(parentDataStore, line, sheetName);
            }
            else
            {
                if (sheetName == "Rec Games")
                {
                    this.ParseRecGames(parentDataStore, line, sheetName)
                }
                else
                {
                    this.ParseSheet(parentDataStore, line, sheetName);
                }
            }
        }
    }
    ParseNCSLGames(parentDataStore, data, sheetName)
    {
        this.parentDataStore = parentDataStore;
        if (data.length == 0)
        {
            return;
        }
        var headers = data[0];
        var nDate = SafeHeader(headers, "GMDATE");
        var nTime = SafeHeader(headers, "GMTIME");
        var nField = SafeHeader(headers, "FIELD");
        var nHome = SafeHeader(headers, "HOME_TEAM");
        var nAway = SafeHeader(headers, "AWAY_TEAM");

        var x;

        for (x = 1; x < data.length; x++)
        {
		try {
			
            var Home = data[x][nHome];
            if (Home.indexOf("DCST") != -1)
            {
                var dataItem = {};
                var date = new Date(data[x][nDate]);
                var field = data[x][nField];
                if (field.indexOf(" ") != -1)
                {
                    field = field.split(" ")[0];
                }
                var Away = data[x][nAway];

                var cDOW = weekdays[date.getDay()];
                dataItem.DowList = BreakDOWString_(cDOW);



                dataItem.Field = field;
                dataItem.Except = [];


                dataItem.StartDate = date;

                dataItem.EndDate = dataItem.StartDate;


                dataItem.StartTime = data[x][nTime];
                if (dataItem.StartTime.length == 0) throw row;

                dataItem.EndTime = new Date(data[x][nTime]);
                dataItem.EndTime.setTime(dataItem.EndTime.getTime() + 1.5 * oneHour);


                dataItem.Source = sheetName;
                dataItem.line = x;
                dataItem.Description = Home + " vs " + Away;
                dataItem.slots = 0;
                dataItem.WholeField = true;


                dataItem.splits = 0;
                dataItem.SplitString = "";
                this.Add(dataItem, 0);
            }
			
			}
         catch (e)
            {
			console.log(e);
			console.log(e.length);

                this.parentDataStore.LogError("Invalid line", "NCSL Games", x+1);
            }
}
    }
    ParseRecGames(parentDataStore, data, sheetName)
    {
        this.parentDataStore = parentDataStore;
        this.GetHeaders(data[0]);
        var line;
        for (line = 1; line < data.length; line++)
        {
            try
            {

                var dataItem = this.ParseRow(data[line], line, sheetName);
                var y;
                for (y = 0; y < dataItem.DowList.length; y++)
                {
                    parentDataStore.Divisions.AddRecGameLine(dataItem, y);
                    this.Add(dataItem, y);
                }
            }
            catch (e)
            {
                this.parentDataStore.LogError(e, sheetName, line);

            }
        }
        // console.log(parentDataStore.Divisions);
    }


}

class GameDays extends Array
    // represents the game days for the season
{
    Populate(parentDataStore, data)
    {
        var x;
        for (x = 1; x < data.length; x++)
        {
            this.push(new Date(data[x]));
        }

        this.NonGameDates = new Map();
		if(this.length > 0)
		{
			for (x = 0; x < 7; x++)
			{
				this.NonGameDates.set(weekdays[x], this.GetNonGameweekDates_(x, this[0], this[this.length - 1]));
			}
		}
		else
		{
			parentDataStore.LogError("No Game Dates are Defined", "Game Dates", 1);
		}
    }


    GetNonGameweekDates_(p_nDOW, p_StartDate, p_EndDate)
    {
        var retval = [];


        var startDate = FormTimeFromDayHour(p_StartDate, p_nDOW, 0);
        var endDate = FormTimeFromDayHour(p_EndDate, p_EndDate.getDay(), 0);
        var testDate = new Date(startDate);

        var DOWDates = new Array(this.length);
        var x;
        for (x = 0; x < this.length; x++)
        {
            DOWDates[x] = FormTimeFromDayHour(this[x], p_nDOW, 0);

            // if the date is tuesday through friday it precedes the game, so we have to subtract seven days
            if (p_nDOW > 1 && p_nDOW < 6)
            {
                DOWDates[x] = AddDaysToDate(DOWDates[x], -7);
            }
        }
        while (testDate <= endDate)
        {
            var found = false;
            var x;
            for (x = 0; x < DOWDates.length && !found; x++)
            {
                if (testDate.getTime() == DOWDates[x].getTime())
                {
                    found = true;
                }
            }

            if (!found) //testDate isn't a game date
            {
                retval.push(testDate);

            }
            testDate = AddDaysToDate(testDate, 7);
        }

        return retval;

    }



    GetNonGameDates(cDOW)
    {
		if(this.length > 0)
		{
	        return this.NonGameDates.get(cDOW);
		
		}
		else
			return [];
    }
}

////////////////////////////////////////////////////////
//Utility static functions
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function SafeHeader(indata, label)
    //reads the header from the first row of a spreadsheet
    // throws an exception if the header isn't found (hence "safe", avoids problems later

{
	if(indata==undefined)
	{
		throw "No Header Row Present";
	}

    var retval = indata.indexOf(label);
    if (retval == -1)
    {
        console.log(label);
        throw "column not found:" + label;
    }
    return retval;
}
function EqualDate(date1, date2)
    //compares two date objects to see if they represent the same day
{
    if (date1.getFullYear() != date2.getFullYear())
    {
        return false;
    }
    if (date1.getMonth() != date2.getMonth())
    {
        return false;
    }
    return date1.getDate() == date2.getDate();

}
function LDateIsLessThanRDate(date1, date2)
{
    if (date1.getFullYear() != date2.getFullYear())
    {
        return date1.getFullYear() < date2.getFullYear();
    }

    if (date1.getMonth() != date2.getMonth())
    {
        return date1.getMonth() < date2.getMonth();
    }
    return date1.getDate() < date2.getDate();

}
function DtoC(date)
{
    var indate = new Date(date);

    var retval = CDOW(indate).substr(0, 3) + " " + (indate.getMonth() + 1) + '/' + indate.getDate() + '/' + indate.getFullYear();
    return retval;
}
function DtoS(date)
{
    var indate = new Date(date);

    var retval = (indate.getMonth() + 1) + '/' + indate.getDate() + '/' + indate.getFullYear();
    return retval;
}
function BreakDOWString_(p_DOWString)
{
    // takes a string of DOW's and returns an array of numbers.
    // the string can be either a single weekday, a range separated by a dash (Monday-Friday) or a series separated by commas (Monday, Wednesday, Friday)
    // can also be both (Monday-Wednesday, Friday)

    p_DOWString = p_DOWString.trim(); // take off those pesky trailing spaces

    var retval = new Array();

    if (p_DOWString.indexOf(",") > 0) // comma separated list
    {
        var DOWlist;
        DOWlist = p_DOWString.split(",");
        var x;
        for (x = 0; x < DOWlist.length; x++)
        {
            // call recursively, because there could be a dash-separated item on the list
            retval = retval.concat(BreakDOWString_(DOWlist[x].trim()));
        }

    }
    else
    {
        if (p_DOWString.indexOf("-") > 0)
        {
            // dash separated list.
            var DOWlist;
            DOWlist = p_DOWString.split("-");
            if (DOWlist.length == 2) // only valid list is two items
            {
                var startDOW = DecodeDOW(DOWlist[0].trim());
                var endDOW = DecodeDOW(DOWlist[1].trim());

                if (startDOW > endDOW)
                {
                    endDOW += 7;
                }
                var x;
                for (x = startDOW; x <= endDOW; x++)
                {
                    retval.push(new DOWArray_(x % 7, false));
                }

            }


        }

        else
        {
            if (p_DOWString.indexOf(" ") > 0) // check for the keyword "games"
            {
                var DOWlist;
                DOWlist = p_DOWString.split(" ");
                if (DOWlist.length == 2) // only valid list is two items
                {
                    if (DOWlist[1].toUpperCase().indexOf("GAMES") == 0)
                    {
                        var DOW = DecodeDOW(DOWlist[0]);
                        if (DOW >= 0)
                        {
                            retval.push(new DOWArray_(DOW, true));
                        }
                    }


                }
            }
            else
            {
                // just a single day
                var DOW = DecodeDOW(p_DOWString);
                if (DOW >= 0)
                {
                    retval.push(new DOWArray_(DOW, false));
                }
            }
        }
    }
    return retval;
}


class DOWArray_
{
    constructor(p_nDOW, p_GamesOnly)
    {
        this.cDOW = weekdays[p_nDOW];
        this.GamesOnly = p_GamesOnly;
    }
}

function CDOW(p_date)
{
    return weekdays[p_date.getDay()];
}

function PoundStrippedName(field)
{
    var pound;
    pound = field.indexOf("#");
    if (pound == -1)
    {
        return field;
    }

    return field.substring(0, pound - 1);


}

function ExpandSplitField(FieldName)
{
    // receives a field in the form "Hearst #1-3" and returns an array of the form {"Hearst #1", "Hearst #2", "Hearst #3"}

    var retval = new Array();
    var pound;
    pound = FieldName.indexOf("#");
    if (pound > 0)
    {
        var range = FieldName.substr(pound + 1, FieldName.length - pound);
        var dash;
        dash = range.indexOf("-");
        if (dash > 0)
        {
            var start = range.substr(0, dash);
            var end = range.substr(dash + 1, range.length - dash);
            var x;
            for (x = Number(start) ; x <= Number(end) ; x++)
            {
                retval.push(FieldName.substr(0, pound + 1) + x);
            }
        }
        else
        {
            retval.push(FieldName);
        }
    }
    else
    {
        retval.push(FieldName);
    }
    return retval;
}

function FormTimeFromDayHour(BaseDate, nDOW, nHour)
{

    var ndays = (nDOW - BaseDate.getDay() + 7) % 7;

    var mtime = AddDaysToDate(BaseDate, ndays);



    mtime.setHours(nHour);
    mtime.setMinutes(nHour % 1 * 60); // add the half hour

    mtime.setSeconds(0);

    return mtime;
}

//////////////////////////////////////////////////////////////////////
function AddDaysToDate(BaseDate, nDays)
{
    var retval = new Date(BaseDate);

    // due to daylight savings time, some days have 23 hours and some have 25. So not all times give the next day when 24 hours are added
    // however, when the time is 1:30AM adding 24 hours always gives the next day.
    var oldhours = BaseDate.getHours();
    var oldMinutes = BaseDate.getMinutes();
    retval.setHours(1);
    retval.setMinutes(30);
    retval.setTime(retval.getTime() + oneDay * nDays);
    retval.setHours(oldhours);
    retval.setMinutes(oldMinutes);

    return retval;
}

function GetDateRange(cDOW, begindate, enddate)
{
    var nDOW = DecodeDOW(cDOW)
    var mDate = FormTimeFromDayHour(begindate, nDOW, 0);

    var dates = [];

    while (LDateIsLessThanRDate(mDate, enddate))
    {
        dates.push(mDate);
        mDate = AddDaysToDate(mDate, 7);

    }
    if (!LDateIsLessThanRDate(enddate, mDate))
    {
        //mdate==enddate
        dates.push(mDate);
    }

    return dates;
}

var oneHour = 60 * 60 * 1000;
var oneDay = 24 * oneHour; // milliseconds in a day
var oneWeek = 7 * oneDay;

function DecodeDOW(p_DOW)
{
    var retval;
    retval = weekdays.indexOf(p_DOW);
    //if(retval < 0)
    // retval=0;
    return retval;
}

/*
function GetIncludedDates(p_DOW, p_StartDate, p_EndDate, p_ExceptList)
{

    var excludelist = [];
    if (p_DOW.GamesOnly)
    {
        excludelist = GetNonGameweekDates_(p_DOW.nDOW, p_StartDate, p_EndDate);
    }

    // 
    excludelist = excludelist.concat(p_ExceptList);
    if (excludelist.length == 0)
    {
        var weeklist;
        weeklist = new Array();
        weeklist[0] = new WeekBlock_(p_StartDate, p_EndDate)
        return weeklist;
    }
    var includelist = [];
    var startDate = FormTimeFromDayHour(p_StartDate, p_DOW.nDOW, 0);
    var endDate = FormTimeFromDayHour(p_EndDate, p_EndDate.getDay(), 0);
    var testDate = new Date(startDate);
    while (testDate.getTime() <= endDate.getTime())
    {
        var found = false;
        var x;
        for (x = 0; x < excludelist.length && !found; x++)
        {
            if (testDate.getTime() == excludelist[x].getTime())
            {
                found = true;
            }
        }

        if (!found) //testDate isn't a game date
        {
            includelist.push(testDate);
        }
        testDate = AddDaysToDate(testDate, 7);
    }
    // ok, now assemble the list of actual days
    var retval = [];
    if (includelist.length == 0)
    {
        return retval;
    }
    var x;
    var lastdate = includelist[0];
    var firstdate = lastdate;
    for (x = 1; x < includelist.length; x++)
    {
        if (includelist[x].getTime() - lastdate.getTime() > oneDay * 8)
        {
            // more than a week gap, break it (I do 8 instead of 7 to avoid DST hassles, they should all be the same day of the week anyway
            retval.push(new WeekBlock_(firstdate, lastdate));
            firstdate = includelist[x];
            lastdate = firstdate;
        }
        else
        {
            lastdate = includelist[x];
        }


    }
    retval.push(new WeekBlock_(firstdate, lastdate));

    return retval;

};


*/

function FormatTime(intime)
{
    var hour = Math.floor(intime);
    var minutes = (intime - hour) * 60;

    if (hour > 12)
    {
        hour -= 12;
    }
    if(minutes==0)
    {
        return hour;
    }
    else
    {
        if(minutes < 10)
        {
            minutes="0"+minutes;
        }
        return hour+":"+minutes;
    }
}
function toHHMM(intime)
{
    var retval = toHHMMSS(intime);
    retval = retval.substring(0,5) + retval.substring(8,11);
    return retval;
}
function toHHMMSS(intime)
{
    var d = new Date(intime);
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var suffix = "AM";
    if (hours > 12)
    {
        suffix = "PM";
        hours -= 12;
    }
    if (hours == 12)
    {
        suffix = "PM";
    }

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds+" "+suffix;
}
function MilitaryTime(intime) {
    var d = new Date(intime);
    var hours = d.getHours();
    var minutes = d.getMinutes();

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10)
        minutes = "0"+minutes;
    return hours + ':' + minutes;


}
function PrettyHour(intime)
{
    var hours = Math.round(intime - .4);
    var mins = (intime - hours) * 60 + 100;

    var suffix = "a";
    if (hours > 12)
    {
        suffix = "p";
        hours -= 12;
    }
    if (hours == 12)
    {
        suffix = "p";
    }
    var retval = hours.toString() + ":" + mins.toString().substr(1, 2) + suffix;
    return retval;
}

function CompareArray(array1, array2)
{
    if (array1.length != array2.length)
    {
        return false;

    }
    for (var x = 0; x < array1.length; x++)
    {
        if (array1[x] != array2[x])
        {
            return false;
        }
    }
    return true;
}

function BlankArray(len)
{
    var retval = [];
    for (var x = 0; x < len; x++)
    {
        retval[x] = "";
    }
    return retval;
}

