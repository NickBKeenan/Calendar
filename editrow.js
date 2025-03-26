function EditRow(dataline)
{
    var dialog = document.getElementById('EditRow');
    dialog.style.display = "block";
    LoadFields();
    var cl = new CalendarLine;
    console.log(dataline);
    cl.UpdateEditor(dataline);
}

function CreateNewPermit()
{
    var linedata = {};
    linedata.Source = "Permits";
    linedata.line = -1;
    EditRow(linedata);
}
function CreateNewAssignment(source)
{
    var linedata = {};
    if (source == undefined)
    {
        linedata.Source = "";
    }
    else
    {
        linedata.Source = source;
    }
    linedata.line = -1;
    EditRow(linedata);
}

function EditPermit()
{

    var linedata = dataStore.GetLineData("Permits", this.lineNo);
    EditRow(linedata); // in editrow.js

}
function EditAssignment(e, source, line)
{
    e.stopPropagation();
    if (source == "NCSL Games")
    {
        alert("NCSL Games cannot be edited directly. To update NCSL games, download the current schedule from the NCSL website and copy it into the NCSL Games tab of the spreadsheet.")
        return;
    }
    var linedata = {};
    linedata.Source = source;
    linedata.line = line;
    linedata.Field = "";
    linedata.DowList = [];
    try
    {
        linedata = dataStore.GetLineData(source, line);
    }
    catch (e)
    {
    }
    EditRow(linedata); // in editrow.js
    // When the user clicks anywhere outside of the modal, close it
    // Show(form);
}




class CalendarLine
{

    UpdateEditor(dataItem)
    {
        //update the editor screen to reflect the contents of this object
        if (dataItem.Source == "Permits") {
            
            Hide("SlotDiv");
        }
        else {
            
            Show("SlotDiv");
        }
        if (dataItem.line > -1)
        {
            Show("ShowLineNumber");
            Show("EditrowSubmit");
            Hide("EditrowAdd");
            Show("EditrowDelete");
            this.SetTime("BeginTime", dataItem.StartTime);
            this.SetTime("EndTime", dataItem.EndTime);
            this.SetDate("BeginDate", dataItem.StartDate);
            this.SetDate("EndDate", dataItem.EndDate);
            this.SetDate("OneDate", dataItem.StartDate);

            document.getElementById("Field").value = dataItem.Field;
            UpdateSlots(dataItem.Field, dataItem.slots);

            var sd = new Date(dataItem.StartDate);
            var ed = new Date(dataItem.EndDate);

            if (EqualDate(sd, ed))
                // one-time event
            {
                var doc = document.getElementById("OneTime");

                doc.checked = true;
                ChangeRequestType(doc);
            }
            else
            {
                var doc = document.getElementById("Weekly");
                doc.checked = true;
                ChangeRequestType(doc);
            }

            document.getElementById("Description").value = dataItem.Description;

            if (dataItem.WholeField)
            {
                document.getElementById("FieldWhole").checked = true;
                WholeField();

            }
            else
            {
                if (dataItem.slots > 0)
                {
                    document.getElementById("FieldSlots").checked = true;
                    ShowSlots();
                }

                else
                {
                    document.getElementById("FieldSplits").checked = true;
                    document.getElementById("SplitsFields").value = dataItem.SplitString;
                    ShowSplits();
                }
            }


            var x;
            for (x = 0; x < weekdays.length; x++)
            {
                document.getElementById(weekdays[x]).checked = false;

            }
            document.getElementById("GamesOnly").checked = false;;
            for (x = 0; x < dataItem.DowList.length; x++)
            {
                document.getElementById(dataItem.DowList[x].cDOW).checked = true;
                if (dataItem.DowList[x].GamesOnly)
                {
                    document.getElementById("GamesOnly").checked = true;
                }
            }
            this.UpdateExceptions(dataItem.Except);

            document.getElementById("Source").innerHTML = dataItem.Source;
            document.getElementById("LineNo").innerHTML = dataItem.line;

            Show("EditClassification");
            Hide("AddClassification");

        }
        else
        {
            // new record
            Hide("ShowLineNumber");
            Hide("EditrowSubmit");
            Show("EditrowAdd");
            Hide("EditrowDelete");
            var x;
            for (x = 0; x < weekdays.length; x++)
            {
                document.getElementById(weekdays[x]).checked = false;

            }
            document.getElementById("GamesOnly").checked = false;;
            this.SetTime("BeginTime", new Date(1899, 11, 30, 8, 0, 0, 0));
            this.SetTime("EndTime",  new Date(1899, 11, 30, 18, 0, 0, 0));
            this.SetDate("BeginDate", dataStore.Season.CurrentRec().Begin_Date);
            this.SetDate("EndDate", dataStore.Season.CurrentRec().End_Date);
            var doc = document.getElementById("Weekly");
            doc.checked = true;
            dataItem.Except = [];
            this.UpdateExceptions(dataItem.Except);
            ChangeRequestType(doc);
            document.getElementById("FieldWhole").checked = true;
            WholeField();
            document.getElementById("Description").value = "";
            document.getElementById("Source").innerHTML = dataItem.Source;
            document.getElementById("LineNo").innerHTML = dataItem.line;
            UpdateSlots("", 0);
            if (dataItem.Source.length > 0)
            {
                Show("EditClassification");
                Hide("AddClassification");

            }
            else
            {
                Hide("EditClassification");
                Show("AddClassification");
            }
        }
        if (dataItem.Source == "Rec Games")
        {

            SetRecGamesDropDown( true , dataItem.Description);

        }
        else
        {
            SetRecGamesDropDown( false, "");

        }
        if (dataItem.Source == "Permits")
        {
            // 
            
            Hide("FieldAmt");
            Hide("DescDiv");
        }
        else
        {
           
            Show("FieldAmt");

        }
  

    }

    SetTime(id, time)
    {
        //
        var invalue = "";
        time = new Date(time);
        if (time.getTime() != 0) {
            var hour = time.getHours();
            var minute = time.getMinutes();

            if (hour < 10) {
                invalue += "0";
            }
            invalue += hour + ":";
            if (minute < 10) {
                invalue += "0";
            }
            invalue += minute;

        }
        document.getElementById(id).value = invalue;

    }
    SetDate(id, date)
    {
        date = new Date(date);
        if (date.getTime() != 0) {
            var $datepicker = $('#' + id);

            $datepicker.datepicker('setDate', date);


        }
    }

    UpdateExceptions(exceptions)
    {
        //load the contents of the editor screen into this object

        if (document.getElementById("Weekly").checked) {

            this.ReadDOWs();
            if (exceptions == undefined) {
                this.ReadExcept();
            }
            else {
                this.Except = exceptions;
            }

            this.startDate = new Date(document.getElementById("BeginDate").value);
            this.endDate = new Date(document.getElementById("EndDate").value);
            this.GamesOnly = document.getElementById("GamesOnly").checked;
        }
        else {
            this.startDate = new Date(document.getElementById("OneDate").value);
            this.endDate = this.startDate;

            this.GamesOnly = false;
            this.Except = [];
            this.DOWs = [CDOW(this.startDate)];

        }

        var mdate = new Date(this.startDate);
        mdate.setHours(0);
        var dates = [];
        var NoGames = [];
        var x;
        if (this.GamesOnly) {
            for (x = 0; x < this.DOWs.length; x++) {
                NoGames = NoGames.concat(dataStore.GameDays.GetNonGameDates(this.DOWs[x]));
            }
        }

        while (mdate.getTime() <= this.endDate.getTime()) {
            var day = CDOW(mdate);
            if (this.DOWs.indexOf(day) > -1) {
                dates.push(new Date(mdate));
            }
            mdate.setTime(mdate.getTime() + 1000 * 60 * 60 * 24);
            // have to adjust for daylight savings time
            if (mdate.getHours() != 0) {
                // if we fell back, we're at 23, we have to add another hour
                if (mdate.getHours() == 23) {
                    mdate.setTime(mdate.getTime() + 1000 * 60 * 60);
                }
                else {
                    // spring forward just set it to 0
                    mdate.setHours(0)
                }
            }
        }

        // now go through the list of days and 
        var div = document.getElementById("ExceptDays");
        div.innerHTML = "";
        var DisplayCount = 0;
        for (x = 0; x < dates.length; x++) {
            var y;
            var displayThis = true;
            for (y = 0; y < NoGames.length; y++) {
                if (EqualDate(dates[x], NoGames[y])) {
                    displayThis = false;

                }
            }
            if (displayThis) {
                var desc = (x + 1).toString();
                var label = document.createElement("LABEL");
                var desctext = weekdays[dates[x].getDay()].substr(0, 3) + " " + (dates[x].getMonth() + 1) + "/" + dates[x].getDate();
                var description = document.createTextNode(desctext);
                var checkbox = document.createElement("INPUT");

                checkbox.type = "checkbox";
                checkbox.name = "ExceptDates";
                checkbox.value = dates[x].getTime();
                checkbox.style.display = "compact";
                checkbox.id = "Except" + DisplayCount;
                DisplayCount++;
                for (y = 0; y < this.Except.length; y++) {
                    if (EqualDate(dates[x], this.Except[y])) {
                        checkbox.checked = true;
                    }

                }
                label.style.display = "compact";

                label.appendChild(checkbox);
                label.appendChild(description);

                // add the label element to your div
                div.appendChild(label);
            }
        }

        document.getElementById("ExceptCount").value = DisplayCount;


    }

    ReadEditor()
    {
        var fieldAmount=getRadioValue("FieldAmount");
        var UsingSlots;
        var UsingSplits;
        if(fieldAmount=="FieldSlots")
        {
            UsingSlots=true;
            UsingSplits=false;
        }
        else
        {
            if(fieldAmount=="FieldSplits")
            {
                UsingSlots=false;
                UsingSplits=true;
            }
            else
            {
                UsingSlots=false;
                UsingSplits = false;
                this.WholeField = true;
            }
        }


        this.line=Number(document.getElementById("LineNo").innerHTML);

        this.Source = document.getElementById("Source").innerHTML;
        if (this.Source.length == 0)
        {
            this.Source = getRadioValue("eventtype");
            console.log(this.Source);
        }
        if(UsingSlots)
        {
            this.Slots=document.getElementById("SlotCount").value;
        }
        else
        {
            this.Slots="";
        }
        this.FieldString = document.getElementById("Field").value;
        this.Field = this.FieldString;
        if (UsingSplits)
        {
            var SplitString = document.getElementById("SplitsFields").value;;
            if (SplitString.length > 0)
            {
                this.FieldString += " #" + SplitString;
            }
            else
            {
                //throw "Splits must be entered."
            }
        }
        if(document.getElementById("Weekly").checked)
        {
      
            this.ReadDOWs();
            this.ReadExcept();
    
            this.StartDate=DtoS(new Date(document.getElementById("BeginDate").value));
            this.EndDate=DtoS(new Date(document.getElementById("EndDate").value));
            this.GamesOnly=document.getElementById("GamesOnly").checked;
        }
        else
        {
            var d = new Date(document.getElementById("OneDate").value);
            this.StartDate=DtoS(d);
            this.EndDate=this.StartDate;
          
            this.GamesOnly=false;
            this.Except = [];
            
            this.DOWs=[weekdays[d.getDay()]];
          
        }
      

        
        
        this.StartTime=this.ReadTime("BeginTime" );
        this.EndTime=this.ReadTime("EndTime");
        this.ExceptString = "";
        for (var x = 0; x < this.Except.length; x++)
        {
            if (this.ExceptString.length > 0)
            {
                this.ExceptString += ", ";
            }
            var d=new Date(this.Except[x]);
            this.ExceptString += DtoS(d);
        }
        this.DOWString = "";
        for (var x = 0; x < this.DOWs.length; x++)
        {
            if (this.DOWString.length > 0)
            {
                this.DOWString += ", ";
            }
            
            this.DOWString += this.DOWs[x];
            if (this.GamesOnly)
            {
                this.DOWString += " games";
            }
        }
        if (this.Source == "Rec Games")
        {
            this.Description = document.getElementById("DivisionPicker").value;
        }
        else
        {

            this.Description = document.getElementById("Description").value;
        }
        console.log(this);

    }
    FormattedArray(headers, hmDateFormat)
    {
        var cr = new CalendarRecord();
        cr.GetHeaders(headers);
        var retval=BlankArray(headers.length);
        retval[cr.nField] = this.FieldString;
        retval[cr.nDOW] = this.DOWString;
        if (hmDateFormat)
        {
            retval[cr.nStartTime] = toHHMMSS(this.StartTime);
            retval[cr.nEndTime] = toHHMMSS(this.EndTime);

            retval[cr.nStartDate] = this.StartDate;
            retval[cr.nEndDate] = this.EndDate;

        }
        else
        {
            retval[cr.nStartTime] = this.StartTime;
            retval[cr.nEndTime] = this.EndTime;

            retval[cr.nStartDate] = JSON.parse(JSON.stringify(new Date(this.StartDate)));
            retval[cr.nEndDate] = JSON.parse(JSON.stringify(new Date(this.EndDate)));
            console.log(retval[cr.nEndDate]);
        }
        retval[cr.nExcept] = this.ExceptString;
        retval[cr.nDescription] = this.Description;
        if (this.WholeField)
        {
            retval[cr.nSlots] = "All";
        }
        else
        {
            retval[cr.nSlots] = this.Slots;
        }
        return retval;
    }

    ReadTime(id)
    {
        var inval = document.getElementById(id).value;
        var hour = Number(inval.substr(0, 2));
        var min = Number(inval.substr(3, 2));
        return new Date(1899, 11, 30, hour, min, 0, 0);
    }
    ReadExcept()
    {
        this.Except = [];
        var ExceptCount = Number(document.getElementById("ExceptCount").value);

        var x;
        for (x = 0; x < ExceptCount; x++) {

            var checkbox = document.getElementById("Except" + x);
            if (checkbox.checked) {

                var newDate = new Date(Number(checkbox.value));
                this.Except.push(newDate);

            }
        }

    }
    ReadDOWs()
    {
        // pull from dialog into this.DOWs;
        this.DOWs = [];
        var x;
        for (x = 0; x < 7 ; x++) {
            if (document.getElementById(weekdays[x]).checked) {
                this.DOWs.push(weekdays[x]);
            }
        }
    }


}

function FailHandler(e)
{
    console.log("onfailure");
    alert("The called function failed");
    alert(e.message);
}


$(function ()
{
    $("#BeginDate").datepicker({
        onSelect: function (dateText, inst) { getNewDate(this); }
    });
});
$(function ()
{
    $("#EndDate").datepicker({
        onSelect: function (dateText, inst) { getNewDate(this); }
    });
});
$(function ()
{
    $("#OneDate").datepicker({
        onSelect: function (dateText, inst) { getNewDate(this); }
    });


});

/*********************************************************************************************************/
function Hide(id)
{

    var element = document.getElementById(id);
    element.style.display = "none";
}
/*********************************************************************************************************/
function Show(id)
{

    var element = document.getElementById(id);
    element.style.display = "";
}



function getNewDate(obj)
{
    var newDate = new Date(obj.value);

    SetExceptions();
};


function ChangeRequestType(x)
{
    // called when the request type changes from one-time to weekly or vice versa
    if (x.id == "OneTime") {
        Show("OneTimeDiv");
        Hide("WeeklyDiv");
    }
    else {
        Show("WeeklyDiv");
        Hide("OneTimeDiv");
    };

}

function DoSubmit()
{
    var r = new CalendarLine();
    r.ReadEditor();
    try
    {
        dataStore.UpdateCalendarLine(r);
        onSubmitSuccess();
    }
    catch (e)
    {
        alert(e);
    }
}
function DoAdd()
{
    var r = new CalendarLine();
    r.ReadEditor();
    console.log(r);
    try
    {
        dataStore.AddCalendarLine(r);
        onSubmitSuccess();
    }
    catch (e)
    {
        alert(e);
    }
}
function DoDelete()
{
    var r = new CalendarLine();
    r.ReadEditor();
    console.log(r);
    dataStore.DeleteCalendarLine(r);
    onSubmitSuccess();

}
function onSubmitSuccess()
{
    CloseIt();
}
function DoCancel()
{
    CloseIt();
}

function CloseIt()
{
    var dialog = document.getElementById('EditRow');
    dialog.style.display = "none";

}

function WholeField()
{
    Hide("SlotsAmount");
    Hide("SplitsAmount");
}
function ShowSlots()
{
    Show("SlotsAmount");
    Hide("SplitsAmount");
}

function ShowSplits()
{
    Hide("SlotsAmount");
    Show("SplitsAmount");

}

function LoadFields()
{
    var Field = document.getElementById("Field");
    Field.style.display = "inline";
    var i;
    var outstr = '<option value=""></option>';
    var Fields = dataStore.Fields;
    var iterator = Fields.keys();

    var x;
    for (x = 0; x < Fields.size ; x++) {

        var fname = iterator.next().value;

        outstr += '<option value="' + fname + '">' + fname + '</option>';

    }
    Field.innerHTML = outstr;


}

function GetSlotCount(field)
{
    if (field.length > 0)
    {

        return dataStore.Fields.GetSlotCount(field);
    }
    else
    {
        return 0;
    }
}

function ChangeSlotCount(select)
{
    // called when the field changes
    var field;
    var slots;
    field = select.value;
    slots = Number(document.getElementById("SlotCount").value);
    UpdateSlots(field, slots);
}
function UpdateSlots(field, slotsused)
{
    var div = document.getElementById("SlotsAmount");

    var innerHTML = 'Number of Slots:<select id="SlotCount"><option value=""></option>';




    var slotcount = GetSlotCount(field);


    if (slotsused > slotcount) {
        slotsused = slotcount;
    }


    for (x = 0; x < slotcount; x++) {
        innerHTML += '<option value="' + (x + 1) + '"';
        if (x == slotsused - 1) {
            innerHTML += " selected ";
        }
        innerHTML += '>' + (x + 1) + '</option>';

    }
    innerHTML += '</select>';
    div.innerHTML = innerHTML;

}

function SetExceptions()
{
    // called to set up the except for dates when either a DOW is clicked or a date is selected
    var r = new CalendarLine();
    r.ReadEditor();
    r.UpdateExceptions();

}


function getRadioValue(name)
{
    var val;
    // get list of radio buttons with specified name
    var form = document.getElementById("Form");
    var radios = form.elements[name];

    // loop through list of radio buttons
    for (var i = 0, len = radios.length; i < len; i++) {
        if (radios[i].checked) { // radio checked?
            val = radios[i].id; // if so, hold its value in val
            break; // and break out of for loop
        }
    }
    return val; // return value of checked radio or undefined if none checked
}

function SetRecGamesDropDown( isRecGames, description)
{
    // called when the source changes to or from rec games
    // If changed to rec games, hide the description box, show the game splits box, show the dropdown for divisions, and populate it from the datastore
    
    if (isRecGames)
    {
        Hide("DescDiv");
        Show("DivisionDropDown");
        Hide("FieldSlotsSpan");
        Show("FieldSplitsSpan");
        var picker = document.getElementById("DivisionPicker");
            var divisions = dataStore.GetDivisions();
            var outstr = '<option value=""></option>';


            var x;
            for (x = 0; x < divisions.length ; x++)
            {

                var fname = divisions[x].AgeGroup;
                outstr += '<option';
                if (description == fname)
                {
                    outstr += " selected ";
                }
                outstr+=' value="' + fname + '">' + fname + '</option>';

            }
            picker.innerHTML = outstr;
          
    }
    else
    {
        Show("DescDiv");
        Hide("DivisionDropDown");
        Show("FieldSlotsSpan");
        Hide("FieldSplitsSpan");
    }
}