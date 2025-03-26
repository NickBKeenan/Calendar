
function CreateFieldsSummary(AllAvailability)
{
    var table = document.getElementById("fieldlist");
    // console.log(v);
    while (table.rows.length > 0)
    {
        table.deleteRow(0);
    }
    // delete all the Field Summary tables
    var Summaries = document.getElementsByClassName("FieldSummary");

    while (Summaries.length > 0)
    {
        var elem = document.getElementById(Summaries[0].id);
        var p = elem.parentNode;
        p.removeChild(elem);

    }


    if (AllAvailability.length == 0)
    {
        var row, cell;
        row = table.insertRow(-1);
        cell = row.insertCell(0);
        cell.innerHTML = "No Space is Available";;
        return;
    }
    var x;
    for (x = 0; x < AllAvailability.length; x++)
    {

        var display = new FieldDisplay(AllAvailability[x]);
        display.CreateDisplayTables(table);
        display.CreateDisplay();

    }

}


function Expand(tableID, cDOW)
{

    Hide("fieldlist");
    Show(tableID);
    console.log(tableID, cDOW);

    var x;
    for (x = 0; x < 7; x++)
    {
        var style;
        if (cDOW == weekdays[x])
        {
            style = "table-cell";

        }
        else
        {
            style = "none";

        }
        var selector = "#" + tableID + " ." + weekdays[x];
        var cells = document.querySelectorAll(selector);
        var y;
        for (y = 0; y < cells.length; y++)
        {
            cells[y].style.display = style;
        }
    }
}


class FieldDisplay
    // creates both the short and long display of a field
    // creates a this.tbody section in an existing table to show the short display
    // creates a table for the long display
{
    constructor(availability)
    {
        this.availability = availability;
    }
    CreateFieldID()
    {
        this.fieldID = this.availability.Field;
        var space = this.fieldID.indexOf(" ");
        while (space > -1)
        {
            this.fieldID = this.fieldID.replace(" ", "_");
            space = this.fieldID.indexOf(" ");
        }
            this.fieldID = this.fieldID.replace("(", "_");
            this.fieldID = this.fieldID.replace(")", "_");

    }
    CreateDisplayTables(table)
    {
        this.tbody = table.appendChild(document.createElement('tbody'));
        this.newTable = document.getElementById("Availability").appendChild(document.createElement('table'));
        this.newTable.className = "calendar FieldSummary";
        this.CreateFieldID();
        this.newTable.id = this.fieldID;
        this.tbody.id = this.fieldID + "tbody";
        this.newTable.style.display = "none";

    }
    EmptyDisplayTables()
    {
        this.CreateFieldID();

        this.tbody = document.getElementById(this.fieldID + "tbody");
        this.newTable = document.getElementById(this.fieldID);
        if (this.tbody == undefined || this.newTable == undefined)
        {
            var table = document.getElementById("fieldlist");

            this.CreateDisplayTables(table);
            return;

        }

        while (this.newTable.rows.length > 0)
        {
            this.newTable.deleteRow(0);
        }
        while (this.tbody.rows.length > 0)
        {
            this.tbody.deleteRow(0);
        }

    }
    CreateDisplay()
    {

        var row, row2;
        row2 = this.newTable.insertRow(-1);
        var cell = row2.insertCell(-1);
        cell.innerHTML = '<span title="Close" onclick="Hide(' + "'" + this.newTable.id + "')" + ';Show(' + "'" + 'fieldlist' + "'" + ')" class="close">&times;</span>';
        row = this.tbody.insertRow(-1);
        var slotcapacity = dataStore.Fields.get(this.availability.Field).Slotcount;
        var weeklabels = this.availability.availabilityData.dates;

        // put in DOW headers
        cell = row.insertCell(-1);
        var weekCounts = []
        var lastDay = -1;
        var weekCount = 0;
        // count up the number of weeks for each DOW, will use in the next step
        for (var i = 0; i < weeklabels.length; i++)
        {
            if (weeklabels[i].getDay() != lastDay)
            {

                if (lastDay != -1)
                {
                    weekCounts[lastDay] = weekCount;

                }
                lastDay = weeklabels[i].getDay();
                weekCount = 0;
            }
            weekCount++;
        }
        weekCounts[lastDay] = weekCount;

        // put in DOW over each group of days
        for (var x = 0; x < 7; x++)
        {
            var day = (x + 6) % 7;
            cell = row.insertCell(-1);
            cell.colSpan = weekCounts[day];
            cell.innerHTML = '<font size="-1">' + weekdays[day] + '</font>';
            cell.className = weekdays[day];
            var clickID = this.newTable.id;

            cell.onclick = function ()
            {
                Expand(clickID, this.className);
            };

            // put in prev/next on detail view
            var cell = row2.insertCell(-1);
            var next = (day + 1) % 7;
            var prev = (day + 6) % 7; /// day-1, then add 7
            next = weekdays[next];
            prev = weekdays[prev];

            cell.innerHTML = '<span onclick="Expand(' + "'" + this.newTable.id + "', '" + prev + "')" + '" class="close">&lt;&nbsp;' + prev.substr(0, 3) + '</span>';
            cell.className += " " + weekdays[day];

            var cell = row2.insertCell(-1);
            cell.innerHTML = '<span class="DayHeading">' + weekdays[day] + '</span>';
            cell.className = weekdays[day];
            cell.colSpan = 4;

            var cell = row2.insertCell(-1);
            cell.innerHTML = '<span onclick="Expand(' + "'" + this.newTable.id + "', '" + next + "')" + '" class="close">' + next.substr(0, 3) + '&nbsp;&gt;' + '</span>';
            cell.className += " " + weekdays[day];
        }


        row = this.tbody.insertRow(-1);
        row2 = this.newTable.insertRow(-1);
        // put in the name of the field
        cell = row.insertCell(-1);
        var slotcount = this.availability.availabilityData.availabilities.length;
        cell.rowSpan = slotcount + 2;

        cell.innerHTML = this.availability.Field;
        var clickID = this.newTable.id;
        cell.onclick = function ()
        {
            Expand(clickID, "Saturday");
        };
        cell = row2.insertCell(-1);

        cell.rowSpan = slotcount + 2;
        cell.innerHTML = "<b>" + this.availability.Field + "</b>";
        cell.style.verticalAlign = "top";

        var n;
        var cDOW = "";
        // put in a row of dates at top of the table
        for (n = 0; n < weeklabels.length; n++)
        {

            if (weeklabels[n].getDay() != lastDay)
            {
                /// put in time;
                cell = row2.insertCell(-1);

                lastDay = weeklabels[n].getDay();
                cDOW = weekdays[lastDay];
                cell.className = cDOW;
            }
            cell = row2.insertCell(-1);

            cell.innerHTML = DtoC(weeklabels[n]);
            cell.className = cDOW;

        }

        var x;
        // now do each row in the table
        for (x = 0; x < slotcount ; x++)
        {

            var slotdata = this.availability.availabilityData.availabilities[x];

            row = this.tbody.insertRow(-1);
            row2 = this.newTable.insertRow(-1);

            var i;
            // for each row, do each column
            for (i = 0; i < weeklabels.length; i++)
            {

                if (weeklabels[i].getDay() != lastDay)
                {
                    /// put in time;
                    cell = row2.insertCell(-1);
                    cell.innerHTML = '<font size="-1">' + PrettyHour(slotdata.hour) + '</font>';
                    lastDay = weeklabels[i].getDay();
                    cDOW = weekdays[lastDay];
                    cell.className = cDOW;
                }

                cell = row.insertCell(-1);

                slotdata[i].formatCell(cell, this.fieldID, slotcapacity, true);
                cell = row2.insertCell(-1);
                slotdata[i].formatCell(cell, this.fieldID, slotcapacity, false);
                cell.className += " " + cDOW;

            }
        }

        row2 = this.newTable.insertRow(-1);
        // now put in dates for the footer
        for (n = 0; n < weeklabels.length; n++)
        {
            if (weeklabels[n].getDay() != lastDay)
            {
                /// put in time;
                cell = row2.insertCell(-1);
                lastDay = weeklabels[n].getDay();
                cDOW = weekdays[lastDay];
                cell.className = cDOW;
            }
            cell = row2.insertCell(-1);

            cell.innerHTML = DtoC(weeklabels[n]);
            cell.className = cDOW;

        }

    }
}


function UpdateFieldDisplay(Field)
{
    var expanded;
    var dow;
    var availability = [];
    availability.availabilityData = dataStore.GetFieldAllAvailability(Field);
    availability.Field = Field;
    var display = new FieldDisplay(availability);
    display.CreateFieldID();

    var parent = document.getElementById("fieldlist");
    if (parent.style.display == "none")
    {
        expanded = true;

        var x;
        for (x = 0; x < 7; x++)
        {
            var selector = "#" + display.fieldID + " ." + weekdays[x];
            var cells = document.querySelectorAll(selector);
            var y;
            for (y = 0; y < cells.length; y++)
            {
                var style;
                style = cells[y].style.display;
                if (style == "table-cell")
                {
                    dow = weekdays[x];
                    console.log(dow);
                };

            }
        }
    }
    else
    {
        expanded = false;
    }
    if (dow == undefined)
    {
        expanded = false;

    }
    display.EmptyDisplayTables();
    display.CreateDisplay();

    if (expanded)
    {
        Expand(display.fieldID, dow);
    }

};





function CompareArray(array1, array2)
{
    if (array1 == undefined) {
        console.log("array1 is undefined");
        return false;
    }
    if (array2 == undefined) {
        console.log("array2 is undefined");
        return false;
    }

    if (array1.length != array2.length)
    {
        return false;

    }
    for (var x = 0; x < array1.length; x++)
    {
        if (array1[x] == null)
        {
            if (!(array2[x] == null))
            {
                return false;
            }
        }
        else
        {
            if (array1[x].toString() != array2[x].toString())
            {
                var d1 = new Date(array1[x].toString());
                var d2 = new Date(array2[x].toString());
                if (d1.getTime() == 0)
                {
                    return false;

                }
                if (d2.getTime() == 0)
                {
                    return false;
                }
                if (d1.getTime() != d2.getTime())
                {
                    var difference = d1.getTime() - d2.getTime();
                    if (difference > 1000 || difference < -1000)
                    {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
