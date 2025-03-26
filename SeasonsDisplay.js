function CreateSeasonSummary()
{

    var table = document.getElementById("SeasonsTable");
    // console.log(v);
    while (table.rows.length > 0)
    {
        table.deleteRow(0);
    }
    var row, cell;
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.innerHTML = "<b>Season</b>";;
    cell = row.insertCell(-1);
    cell.innerHTML = "<b>Begins</b>";;
    cell = row.insertCell(-1);
    cell.innerHTML = "<b>Ends</b>";;
    var iterator = dataStore.Season.values();
    var defaultkey = dataStore.Season.Default();
    var currentkey = dataStore.Season.Current();
    for (x = 0; x < dataStore.Season.size ; x++)
    {

        var value = iterator.next().value;


        var seasonkey = value.Season_Name;
        
        if (seasonkey != "CURRENT")
        {
            row = table.insertRow(1);
            cell = row.insertCell(-1);
            if (defaultkey == seasonkey)
            {
                row.className = "DefaultSeason";
                cell.innerHTML += "*";
            }
            cell.innerHTML += seasonkey;;
            cell = row.insertCell(-1);
            cell.innerHTML = DtoC(value.Begin_Date);;
            cell = row.insertCell(-1);
            cell.innerHTML = DtoC(value.End_Date);;
            cell = row.insertCell(-1);
            if (currentkey != seasonkey)
            {
         
                cell.innerHTML = "<button  onclick='Hide(\"SeasonsTab\");Show(\"Loading\"); googleApi.GetAllData(\"" + seasonkey + "\")'>Load This Season</button>";

            }
            cell = row.insertCell(-1);
            cell.innerHTML = '<a href="https://docs.google.com/spreadsheet/ccc?key=' + value.Spreadsheet_Key + '" target="new">Open Spreadsheet</a>';

            cell = row.insertCell(-1);
            if (defaultkey == seasonkey)
            {
                cell.innerHTML = "*Default season for public calendar display and signup pages";;
            }
            else
            {
                cell.innerHTML = "<button  onclick='Hide(\"SeasonsTab\");Show(\"Loading\");googleApi.SetDefaultSeason(\"" + seasonkey + "\")'>Set as Default Season</button>";

            }
        }
    }

}
function CheckSeasonCreateButton()
{
    // check whether the create button should be disabled or enabled
    var CreateButton = document.getElementById("CreateSeasonButton");
    var StartDate = document.getElementById("SeasonBeginDate").value;
    var EndDate = document.getElementById("SeasonEndDate").value;
    if (StartDate.length == 0 || EndDate.length == 0)
        // if either is empty, disable the create button and clear all the checkboxes and return
    {
        CreateButton.disabled = "true";
        return;
    }
    StartDate = new Date(StartDate);
    EndDate = new Date(EndDate);
    // if EndDate isn't greater than start date, disable the create button, clear all the checkboxes and return
    if (LDateIsLessThanRDate(EndDate, StartDate))
    {
        CreateButton.disabled = "true";
        return;

    }
    var Name = document.getElementById("NewSeasonName").value;
    if (Name.length == 0)
    {
        CreateButton.disabled = "true";
        return;
    }
    CreateButton.removeAttribute("disabled");
}
function CreateSeason(e)
{
    Hide("SeasonsTab");
    Show("Loading");

    
    var gameDays= document.getElementsByName("GameDates");
    var x;
    var GameDates = [];
    for (x = 0; x < gameDays.length; x++)
    {

        var checkbox = gameDays[x];
        if (checkbox.checked)
        {

            var newDate = new Date(Number(checkbox.value));
            GameDates.push(newDate);

        }
    }
    var copySeason = document.getElementById("SeasonSeasonSelect").value;
    var seasonName = document.getElementById("NewSeasonName").value;
    var begindate = document.getElementById("SeasonBeginDate").value;
    var enddate = document.getElementById("SeasonEndDate").value
    
    googleApi.CreateNewSeason(seasonName, copySeason, GameDates, begindate, enddate)


    DoClose("CreateSeason");
}
function CreateNewSeason()
{
    var SeasonSelect = document.getElementById("SeasonSeasonSelect");
    
    SeasonSelect.innerHTML = "";

    var x;

    var innerStr = "";

    var iterator = dataStore.Season.values();

    for (x = 0; x < dataStore.Season.size ; x++)
    {

        var row = iterator.next().value;


        var seasonkey = row.Season_Name;
        if (seasonkey != "CURRENT")
        {
            innerStr += '<option value="' + seasonkey;
            innerStr += '">' + seasonkey + '</option>';

        }
    }
    SeasonSelect.innerHTML = innerStr;
    SeasonSelect.value = dataStore.Season.Current();


    var dialog = document.getElementById("CreateSeason");
    dialog.style.display = "block";


}

function SeasonCreated(data)
{ // called when a season create/change call returns successfully from google.
    dataStore.Season.Populate(dataStore, data[1]);
    Show("SeasonsTab");
    Hide("Loading");

    CreateSeasonSummary();
}

function SetSeasonDate()
{
    var div = document.getElementById("GameDays");
    div.innerHTML = "";
    CheckSeasonCreateButton();


    var StartDate = document.getElementById("SeasonBeginDate").value;
    var EndDate = document.getElementById("SeasonEndDate").value;
    if(StartDate.length==0 || EndDate.length==0)
    // if either is empty, disable the create button and clear all the checkboxes and return
    {
        return;
    }
    StartDate = new Date(StartDate);
    EndDate = new Date(EndDate);

    var dates = GetDateRange("Saturday", StartDate, EndDate);

    // now go through the list of days and 
    var DisplayCount = 0;
    var x;
    for (x = 0; x < dates.length; x++)
    {
        var desc = (x + 1).toString();
            var label = document.createElement("LABEL");
            var desctext = DtoC(dates[x]);
            var description = document.createTextNode(desctext);
            var checkbox = document.createElement("INPUT");

            checkbox.type = "checkbox";
            checkbox.name = "GameDates";
            checkbox.value = dates[x].getTime();
            checkbox.style.display = "compact";
            checkbox.id = "GameDate" + DisplayCount;
            DisplayCount++;
            checkbox.checked = true;
            
            
            label.style.display = "compact";

            label.appendChild(checkbox);
            label.appendChild(description);

            // add the label element to your div
            div.appendChild(label);
        }
    

}

function getNewSeasonDate(obj)
{
    var newDate = new Date(obj.value);

    SetSeasonDate();
};

$(function ()
{
    $("#SeasonBeginDate").datepicker({
        onSelect: function (dateText, inst) { getNewSeasonDate(this); }
    });
});
$(function ()
{
    $("#SeasonEndDate").datepicker({
        onSelect: function (dateText, inst) { getNewSeasonDate(this); }
    });
});
