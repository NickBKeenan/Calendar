class GoogleApi
{
    Constructor()
    {
    }

	run(action, callback, key, data)
	{
        var params = {};
        params.CallBack = callback; 
        params.OnFail = "OnFail";
        params.Action = action;
		params.key=key;
		if(data != undefined)
		{
			params.data=JSON.stringify(data);
		}
        this.GetGoogleData(params);
	}
    GetGoogleData(params)
    {

        var script = document.createElement("script");
        // This script has a callback function that will run when the script has
        // finished loading.
// this comes from the script Scheduler
// URL is https://script.google.com/home/projects/1v1rsIcOP4WQIbIMyWhFLbHojd2w-aOU6fuicMB0b46Vvc9QV7BM2VQK5/edit


        var Scriptkey = "AKfycbwmGBwfsjshzO5sWtb8LPQTuG0dt0CSdahTy5BLJakhrkMr9p-hqUNwiQWvZ5xSKVAs2Q";


        script.src = "https://script.google.com/macros/s/"+Scriptkey+"/exec";


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
var google= new GoogleApi();
        
  window.onload=OnLoad();

 

        var scheduleData;
        var highlightDuplicates=true;
/*********************************************************************************************************/        
        function CreateNewSchedule(label)
        {
              Hide("Initializing");
              Hide("Wheel");
              Show("NewSchedule");
              var NewScheduleLabel=$("#NewScheduleLabel");
              NewScheduleLabel.empty();
              NewScheduleLabel.append(label);
              
        }
        
/*********************************************************************************************************/        
        function PickDivision(data)
        {
              Hide("Initializing");
              Hide("Wheel");
              Show("PickDivision");
			  var select=document.getElementById("Divisions");


			  var headers=data[0];
			  var nKey=data[0].indexOf("Spreadsheet Key");
			  var nDescription=data[0].indexOf("Description");
			  var x;
			  select.options[0]=new Option("", "");
			  for(x=1; x< data.length; x++)
			  {
				 select.options[x] = new Option(data[x][nDescription], data[x][nKey]);
			  }
			  console.log(data);
              var PickDivisionLabel=$("#PickDivisionLabel");
              PickDivisionLabel.empty();
              //PickDivisionLabel.append(label);
              //PickDivisionLabel.append(" Unable to continue. To continue, you must fix your spreadsheet and reload this page.");
              
              
        }
        
/*********************************************************************************************************/        
          function RecoverableError(info)
          {
              Hide("Initializing");
              Hide("Wheel");
              Show("RecoverableError");
              
            var table = document.getElementById("IssueList");
            while (table.rows.length > 0)
            {
                table.deleteRow(0);
            }
            var x;
               row = table.insertRow(-1);
               var cell;
               cell=row.insertCell(-1);
               cell.innerHTML="Date";
               cell=row.insertCell(-1);
               cell.innerHTML="Home Team";
               cell=row.insertCell(-1);
               cell.innerHTML="Away Team";
               cell=row.insertCell(-1);
               cell.innerHTML="Description";
            
            
            for(x=0; x<info.length; x++)
            {
               row = table.insertRow(-1);
               var cell;
               cell=row.insertCell(-1);
               cell.innerHTML=info[x][0];
               cell=row.insertCell(-1);
               cell.innerHTML=info[x][1];
               cell=row.insertCell(-1);
               cell.innerHTML=info[x][2];
               cell=row.insertCell(-1);
               cell.innerHTML=info[x][3];
            }

          }
/*********************************************************************************************************/        
function UnRecoverableError(info) {
    Hide("Initializing");
    Hide("Wheel");
    Show("RecoverableError");
    Hide("RecoveryButtons");

    var table = document.getElementById("IssueList");
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }
    var x;
    row = table.insertRow(-1);
    var cell;
    cell = row.insertCell(-1);
    cell.innerHTML = info;


}
/*********************************************************************************************************/
function ContinueToEdit()
{
              Show("Initializing");
              Show("Wheel");
              Hide("RecoverableError");
              
			google.run("StartSession", "onStartSuccess", Key());          
            //google.script.run.withSuccessHandler(onStartSuccess).withFailureHandler(FailHandler).StartSession(Key());
}

function GoBackAndRemake()
{
              Show("Initializing");
              Show("Wheel");
              Hide("RecoverableError");
              
          
			google.run("ClearScheduleData", "onStartSuccess", Key());          
            //google.script.run.withSuccessHandler(onStartSuccess).withFailureHandler(FailHandler).ClearScheduleData(Key());
}

function Reload()
{
  Hide("PickDivision");
  ContinueToEdit();
}

/*********************************************************************************************************/        
        function RequestNewSchedule()
        {
              Show("Initializing");
              Show("Wheel");
              Hide("NewSchedule");
              
          			google.run("PopulateSchedule", "onStartSuccess", Key());          

              //google.script.run.withSuccessHandler(onStartSuccess).withFailureHandler(FailHandler).PopulateSchedule(Key());
        }
        
/*********************************************************************************************************/
        function onStartSuccess(info)
        {
		console.log(info);
             // five possible outcomes
             // 1. Schedule is valid -- View it
             // 2. schedule is empty -- prompt to create new schedule (CreateNewSchedule) -- errorlevel 1

             // 3. Schedule has unrecoverable errors -- do PickDivision() -- error level 2
             // 4. Schedule was created with recoverable errors -- ask if they want to edit or recreate -- errorlevel 3
            // 5. No division is specified -- ask for division -- errorlevel 5
        
            if(info.length==2) // schedule isn't valid
            {
              if(info[0]==1) // schedule is empty
              {
                CreateNewSchedule(info[1]);
              }
              else
              {
                if(info[0]==2) // fatal error
                {
                  
                    UnRecoverableError(info[1]);
                }
                else
                {
                    if (info[0] == 3) // recoverable error
                    {
                        RecoverableError(info[1]);
                    }
                    else {
                        if (info[0] == 5) // recoverable error
                        {
                            PickDivision(info[1]);
                        }
                    }
                }
              }
            }
            else
            {

              scheduleData = new ScheduleData();
              scheduleData.Load(info);

              CreateTeamView();
              CreateFieldView();
              ViewScheduleByField();
              
              $("#MainHeading").empty();
              $("#MainHeading").append(info[5]);
            
              Hide("Initializing");
              Hide("Wheel");
            
              $("td.TDItem").click(function()
              {
                OnTDItemClick(this);
              });
            
              Menuize("td.TDMenu");
              Show("SwitchViewbutton");
              Show("highlightDuplicatesLabel");
            
            }
          
            //nick=nick.indexOf("x");

        }
        
/*********************************************************************************************************/        
        
        function Menuize(classname)
        {
                    $( classname )
                    .mouseover(function() {
                      $(this).addClass("ui-selected");
                    
                    })
                    .mouseout(function() {
                      $(this).removeClass("ui-selected");
    
                    }).
                    click(function()
                    {
                      MenuClicked(this);
                    });

        }
/*********************************************************************************************************/        
        function ToggleHighlightDupes(obj)
        {
            highlightDuplicates=obj.checked;
              CreateTeamView();
              CreateFieldView();
              $("td.TDItem").click(function()
              {
                OnTDItemClick(this);
              });
            
              Menuize("td.TDMenu");
        }
/*********************************************************************************************************/        
        function MenuClicked(obj)
        {
          var id = obj.id;
          
          if(id=="AddGame")
          {
            scheduleData.AddGame();
          }
          
          if(id=="RemoveGame")
          {
            scheduleData.RemoveGame();
          }
          
          
          if(id=="SwitchTimes")
          {
            scheduleData.SwitchTimes();
          }
          
          if(id=="SwitchOpponents")
          {
            scheduleData.SwitchOpponents();
          }
          
        }

/*********************************************************************************************************/
        function CreateTeamView()
        {
            var table = document.getElementById("TeamTable");
            while (table.rows.length > 0)
            {
                table.deleteRow(0);
            }




            var team;
            var TeamCount = scheduleData.TeamCount();
            var WeekCount = scheduleData.WeekCount();



            for (team = 0; team < TeamCount; team++)
            {
                var row;
                if (team % 10 == 0)
                {
                    row = table.insertRow(-1);
                    row.className = scheduleData.HeaderRowClassName();
                    var week;
                    var cell;
                    cell = row.insertCell(-1);
                    cell.innerHTML = "Team";
                    cell.className = scheduleData.HeaderClassname();
                    cell = row.insertCell(-1);
                    cell.innerHTML = "Division";
                    cell.className = scheduleData.HeaderClassname();

                    for (week = 0; week < WeekCount; week++)
                    {
                        cell = row.insertCell(-1);


                        cell.innerHTML = scheduleData.HeaderInnerHTML(week);

                        cell.className = scheduleData.HeaderClassname();

                    }
                }

                row = table.insertRow(-1);
                if (team % 2 == 1)
                {
                    row.className = "alt";
                }
                var week
                var cell;
                cell = row.insertCell(-1);
                cell.innerHTML = scheduleData.m_Teams.m_Teams[team].m_Name;
                cell.className = scheduleData.HeaderClassname();
                cell = row.insertCell(-1);
                cell.innerHTML = scheduleData.m_Teams.m_Teams[team].m_Division +' - '+ scheduleData.m_Teams.m_Teams[team].m_Notes;
                cell.className = scheduleData.HeaderClassname();
                
                for (week = 0; week < WeekCount; week++)
                {
                    cell = row.insertCell(-1);
                    cell.id = scheduleData.TeamCellID(team, week);
                                  
                    scheduleData.ShowGamebyTeam(cell, week, team);


                }

            }


        }
/*********************************************************************************************************/
        function CreateFieldView()
        {
            var table = document.getElementById("FieldTable");



            while (table.rows.length > 0)
            {
                table.deleteRow(0);
            }

            var FieldSlot;
            var FieldSlotCount = scheduleData.FieldSlotCount();
            var WeekCount = scheduleData.WeekCount();


            //table.insertHeader();
            //var header = table.createTHead();


            for (FieldSlot = 0; FieldSlot < FieldSlotCount; FieldSlot++)
            {
                var row;
                if (FieldSlot % 10 == 0)
                {
                    row = table.insertRow(-1);
                    row.className = scheduleData.HeaderRowClassName();
                    var week;
                    var cell;
                    cell = row.insertCell(-1);
                    cell.innerHTML = "Field"

                    cell.className = scheduleData.HeaderClassname();
                    cell = row.insertCell(-1);
                    cell.innerHTML = "Day"

                    cell.className = scheduleData.HeaderClassname();
                    cell = row.insertCell(-1);
                    cell.innerHTML = "Time"

                    cell.className = scheduleData.HeaderClassname();


                    for (week = 0; week < WeekCount; week++)
                    {
                        cell = row.insertCell(-1);


                        cell.innerHTML = scheduleData.HeaderInnerHTML(week)

                        cell.className = scheduleData.HeaderClassname();

                    }
                }

                row = table.insertRow(-1);

                if (FieldSlot % 2 == 1)
                {
                    row.className = "alt";
                }

                var week;
                var cell;
                cell = row.insertCell(-1);

                cell.innerHTML = scheduleData.m_FieldSlots.m_Slots[FieldSlot].m_Field;
                cell.className = scheduleData.HeaderClassname();
                cell = row.insertCell(-1);

                cell.innerHTML = scheduleData.m_FieldSlots.m_Slots[FieldSlot].m_DOW;
                cell.className = scheduleData.HeaderClassname();
                cell = row.insertCell(-1);

                cell.innerHTML = scheduleData.m_FieldSlots.m_Slots[FieldSlot].m_TimeStr;
                cell.className = scheduleData.HeaderClassname();

                for (week = 0; week < WeekCount; week++)
                {
                    cell = row.insertCell(-1);
                    cell.id = scheduleData.FieldCellID(FieldSlot, week);
                    scheduleData.ShowGamebyField(cell, week, FieldSlot);




                }

            }


        }
/*********************************************************************************************************/
        var Selected1;
        var Selected2;
        
        function ViewScheduleByField()
        {

            Hide("TeamTable");
            Show("FieldTable");
            Hide("Menu");

            $("#SwitchViewbutton").click(function() {ViewScheduleByTeam();});
            $("#SwitchViewbutton").val("View Schedule by Team");
            
            if(Selected1!=undefined)
            {
              $("#" + Selected1).removeClass("ui-selected");
              Selected1 = undefined;
            }
            if(Selected2!=undefined)
            {
              $("#" + Selected2).removeClass("ui-selected");
              Selected2 = undefined;
            }

            
        }
/*********************************************************************************************************/
        function ViewScheduleByTeam()
        {

            Show("TeamTable");
            Hide("FieldTable");
            Hide("Menu");

            $("#SwitchViewbutton").click(function () {ViewScheduleByField();});
            $("#SwitchViewbutton").val("View Schedule by Field");
            if(Selected1!=undefined)
            {
              $("#" + Selected1).removeClass("ui-selected");
              Selected1 = undefined;
            }
            if(Selected2!=undefined)
            {
              $("#" + Selected2).removeClass("ui-selected");
              Selected2 = undefined;
            }
            
        }
        
        function getTop(id)
        {
           var box = document.getElementById(id).getBoundingClientRect()
          var body = document.body

        var docElem = document.documentElement
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var clientTop = docElem.clientTop || body.clientTop || 0
    var top  = box.top +  scrollTop - clientTop
       return top;

          
         
        }

/*********************************************************************************************************/
        function OnTDItemClick(obj)
        {


            var id = obj.id;

            //var top = $(obj).position().top;
            var top =getTop(id);
            
            console.log(top);

            if (id == Selected2)
            {
                //clicked on an already selected cell, unselect it
                $("#" + Selected2).removeClass("ui-selected");
                Selected2 = undefined;
                if(Selected1 != undefined)
                {
                   //top = $("#" + Selected1).position().top;
                   top= getTop(Selected1);
                }
            console.log("using position:" +top);

            }
            else
            {
                if (id == Selected1)
                {
                    //clicked on an already selected cell, unselect it
                    $("#" + Selected1).removeClass("ui-selected");
                    Selected1 = Selected2;
                    Selected2 = undefined;
                    if(Selected1 != undefined)
                    {
                                        top= getTop(Selected1);

                    }
                                console.log("using position2: "+top);

                }

                else
                {
                    // click on an unclicked cell
                    $(obj).addClass("ui-selected");


                    if (Selected2 != undefined)
                    {
                        // we had two things selected, unselect the older one
                        $("#" + Selected2).removeClass("ui-selected");
                        
                        //not sure why I had this, shouldn't the one we just clicked on be active?
                        /*
                        if(Selected1 != undefined)
                        {
                          top = $("#" + Selected1).position().top;
                        }*/

                    }

                    if (Selected1 != undefined)
                    {
                        // one thing currently selected, have to be in same column
                        var Pair1 = new IDPair(Selected1);
                        var Pair2 = new IDPair(id);
                        if (Pair1.Week() != Pair2.Week())
                        {
                            $("#" + Selected1).removeClass("ui-selected");
                            

                            Selected2 = undefined;
                        }
                        else
                        {
                            Selected2 = Selected1;

                        }
                    }
                    else
                    {
                        Selected2 = undefined;
                    }

                    Selected1 = id;
                }

              }
                if (Selected2 != undefined)
                {
                    // two items are selected
                    
                    
                    Show("Menu");
                    Hide("AddGame");
                    Hide("RemoveGame");
                    if(scheduleData.SwitchableTimes(Selected1, Selected2))
                    {
                      Show("SwitchTimes");
                    }
                    else
                    {
                       Hide("SwitchTimes");
                    }
                    if(scheduleData.SwitchableOpponents(Selected1, Selected2))
                    {
                      Show("SwitchOpponents");
                    }
                    else
                    {
                      Hide("SwitchOpponents");
                    }
                    
                }
                else
                {
                    if (Selected1 != undefined)
                    {
                        // one item selected
                        
                        Show("Menu");

                        if(scheduleData.AddableGame(Selected1))
                        {
                          Show("AddGame");
                          Hide("RemoveGame");
                        }
                        else
                        {
                          Hide("AddGame");
                          Show("RemoveGame");
                        }  
                        Hide("SwitchTimes");
                        Hide("SwitchOpponents");
                        
                    }
                    else
                    {
                      // no items selected
                        Hide("Menu");
                    }

            }
            
          console.log("top= "+top);

            $('#Menu').css(
            {
                'top': top + "px"
                
            });

            
                  var newleft;
                  newleft=$(obj).position().left+$(obj).width() +10;
                  if(newleft > $( window ).width() - $('#Menu').width() -10)
                  {
                     newleft=$(obj).position().left-$('#Menu').width() -10;
                  };
                              console.log("newleft="+newleft);

                  $('#Menu').css(
                  {
                    'left': newleft + "px"
                
                  });




        }


        /*********************************************************************************************************/
        function OnLoad()
        {
            console.log(Key());
					google.run("StartSession", "onStartSuccess", Key());          

            //google.script.run.withSuccessHandler(onStartSuccess).withFailureHandler(FailHandler).StartSession(Key());
        }

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
                element.style.display = "block";
            }
            /*********************************************************************************************************/
        function OnFail(e)
        {
            alert("The called function failed");
            alert(e);
            
        }

        /*********************************************************************************************************/
        var f_Pending=false;
        function onUpdateSuccess(retval)
        {
            console.log("Update Success");
			console.log(retval);
            var result = $("#save-result");
            result.empty();
            result.append("All changes saved.");
            f_Pending=false;
            
            retval=retval[0];
          if(!retval) // failure
          {
            result.empty();
            result.append("Unable to save changes. Reload this sheet to continue");
            Hide("TeamTable");
            Hide("FieldTable");
            alert("Unable to save changes. Reload this sheet to continue");
   
          }
        }
        
//classes        

///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function ScheduleData()
        {

            // this is the omnibus data collection for a schedule. What are the components in a schedule?
            // a collection of fieldslots -- referenced by number
            // a collection of game dates (aka weeks) referenced by number
            // a collection of teams -- referenced by pointers to team objects
            // a collection of games -- referenced by pointers to game objects
            // switch opponents
            //   
            // switch slots
            //
            // Find duplicate opponents
            // Go through the games for a team, and for each game look at the opponent, and see if there are duplicates



            this.TeamCount = function()
            {
                return this.m_TeamCount;
            }
            this.WeekCount = function()
            {
                return this.m_WeekCount;
            }
            this.FieldSlotCount = function()
            {
                return this.m_SlotCount;
            }

            // formatting functions for headers
            this.HeaderRowClassName = function()
            {
                return "";
            }
            this.HeaderInnerHTML = function(week)
            {
                var Label;
                Label = this.m_Weeks.m_Weeks[week].m_description;
                return Label;
            }
            this.HeaderClassname = function()
            {
                return "";
            }

            // formatting functions for team view
            this.TeamCellID = function(team, week)
            {
                return "T-" + team + "-" + week;
            }
            this.TeamInnerHTML = function(team, week)
            {
                return this.m_Teams.m_Teams[team].GameDescription(week);
            }
            this.TeamClassname = function(team, week)
            {
                var x;
                
                
                for(x=0; x<this.m_Teams.m_Teams[team].m_Games[week].length; x++)
                {
                  if (highlightDuplicates&& this.m_Teams.m_Teams[team].m_Games[week][x].m_Duplicate)
                  {
                  
                    return "TDItem duplicate-game";
                  }
                }
                return "TDItem";
            }
            this.ShowGamebyField= function(cell, week, FieldSlot)
            {
                
                cell.innerHTML = scheduleData.FieldInnerHTML(FieldSlot, week);
                cell.className = scheduleData.FieldClassname(FieldSlot, week);

            }
            this.ShowGamebyTeam = function (cell, week, team)
            {
            
                
                cell.innerHTML = scheduleData.TeamInnerHTML(team, week);
                cell.className = scheduleData.TeamClassname(team, week);
                
            }
            this.UpdateGamebyField= function(slot, week)
            {
              var cell;
              var id=this.FieldCellID(slot,week);
             
              cell =document.getElementById(id);
              
              this.ShowGamebyField(cell, week, slot);
            };
            this.UpdateGamebyTeams = function(game, week)
            {
              this.UpdateGamebyTeam(game.m_Home, week);
              this.UpdateGamebyTeam(game.m_Away, week);
            }
            this.UpdateGamebyTeam= function(team, week)
            {
              var slot=this.m_Teams.LookupTeam(team);
              var cell;
              var id=this.TeamCellID(slot,week);
              cell =document.getElementById(id);
              this.ShowGamebyTeam(cell, week, slot)
            }
            this.UpdateAllTeamGames = function (team)
            {
               
               team.FindDuplicateOpponents();
               var week;
               for(week=0; week<team.m_Games.length; week++)
               {
                 this.UpdateGamebyTeam(team, week);
                 var slot;
                 var game;
                 for(game=0; game<team.m_Games[week].length; game++)
                 {
                   slot=this.m_FieldSlots.LookupSlot(team.m_Games[week][game].m_Slot);
                   this.UpdateGamebyField(slot, week);
                 }
               }
            }

            // formatting functions for field view   
            this.FieldCellID = function(FieldSlot, week)
            {
                return "F-" + FieldSlot + "-" + week;
            }
            this.FieldInnerHTML = function(FieldSlot, week)
            {


                if (this.m_Games.m_Games[week][FieldSlot] == undefined)
                {
                    return "(available)";
                }
                return this.m_Games.m_Games[week][FieldSlot].MatchUp();
            }
            this.FieldClassname = function(FieldSlot, week)
            {
            
                if (this.m_Games.m_Games[week][FieldSlot] == undefined)
                {
                    return "TDItem";
                }
                return this.m_Games.m_Games[week][FieldSlot].ClassName();


            }


            this.Load = function(info)
            {
                // now go through the schedule and load the games into the table

                var teams = info[0];
                var Slots = info[1];
                var Schedule = info[2];
                var dates = info[3];
                var RestrictedSlots = info[4];
                this.m_TeamCount = teams.length;
                this.m_WeekCount = dates.length;
                this.m_SlotCount = Slots.length;

                this.m_Teams = new Teams(teams, dates.length);
                this.m_Weeks = new Weeks(dates);
                this.m_FieldSlots = new FieldSlots(Slots);


                this.m_Games = new Games(this.m_Weeks, this.m_FieldSlots, RestrictedSlots);
                var x;
                for (x = 0; x < Schedule.length; x++)
                {
                    var home = this.m_Teams.LookUp(Schedule[x][3]);
                    var away = this.m_Teams.LookUp(Schedule[x][4]);
                    
                    var field = Schedule[x][5];
                    var date = new Date(Schedule[x][0]);
                    var time = new Date(Schedule[x][1]);
                    var DOW = Schedule[x][2];
                    var slotno = this.m_FieldSlots.LookUp(field, time, DOW);
                    var slot = this.m_FieldSlots.m_Slots[slotno];
                    var week = this.m_Weeks.LookUp(date);

                    this.m_Games.AddGame(home, away, slotno, week, slot);
                }
                this.m_Teams.FindDuplicateOpponents();
            }
            
            this.SwitchableTimes = function(Selected1, Selected2)
            {
              // returns true if two ID's represent games that can be switched
              // only time it's not true is if one of the cells is for a team bye
             var Pair1 = new IDPair(Selected1);
             var Pair2 = new IDPair(Selected2);
             
             if(Pair1.Prefix()=="F") // field view
             {

              
                if (this.m_Games.m_Games[Pair1.Week()][Pair1.Row()] == undefined) // empty slot
                {
                    if (this.m_Games.m_Games[Pair2.Week()][Pair2.Row()] == undefined) // empty slot
                    {
                      // can't switch two empty slots
                      return false;
                    }
                    ;
                }
              }
              else
              {
                // team view
                // can't switch if either one is empty
                
                if (this.m_Teams.m_Teams[Pair1.Row()].m_Games[Pair1.Week()].length == 0) // empty slot
                {
                  return false;
                }
                
                if (this.m_Teams.m_Teams[Pair2.Row()].m_Games[Pair2.Week()].length == 0) // empty slot
                    {
                      // can't switch two empty slots
                      return false;
                    }
                    ;
                

              }

              return true;
            }
            
            this.SwitchableOpponents = function(Selected1, Selected2)
            {
              // returns true if two ID's represent games where it is possible to switch opponents
             var Pair1 = new IDPair(Selected1);
             var Pair2 = new IDPair(Selected2);
             
             if(Pair1.Prefix()=="F") // field view
             {

                // can't switch opponents with an empty game
                if (this.m_Games.m_Games[Pair1.Week()][Pair1.Row()] == undefined) // empty slot
                {
                  return false;
                }
                if (this.m_Games.m_Games[Pair2.Week()][Pair2.Row()] == undefined) // empty slot
                {
                      // can't switch with an  empty slots
                      return false;
                }
                
              }
              else
              {
                // team view
                // can't switch two empty slots
                
                if (this.m_Teams.m_Teams[Pair1.Row()].m_Games[Pair1.Week()].length == 0) // empty slot
                {
                  
                
                    if (this.m_Teams.m_Teams[Pair2.Row()].m_Games[Pair2.Week()].length == 0) // empty slot
                    {
                      // can't switch two empty slots
                      return false;
                    }
                    ;
                }


              }

              return true;
            }
            
            this.AddableGame =  function(Selected1)
            {
                 var Pair1 = new IDPair(Selected1);
             
                 if(Pair1.Prefix()=="F") // field view
                 {
                  if (this.m_Games.m_Games[Pair1.Week()][Pair1.Row()] == undefined) // empty slot
                  {
                    return true;
                  }
                 }
                 else
                 {
                   // team view
                    if (this.m_Teams.m_Teams[Pair1.Row()].m_Games[Pair1.Week()].length == 0) // empty slot
                    {
                      return true;
                    }
                 }

              return false;
            }
            
            this.InitiateUpdate = function (UpdateArray)
            {
                  console.log("Updating");
                  if(f_Pending)
                  {
                    // this should never happen -- can't have two update pending at the same time
                    var fvalue=[false];
                    onUpdateSuccess(fvalue);
                    return;
                  }
                 f_Pending=true;
                 var result=$("#save-result");
                 result.empty();
                 result.append("Updating...");
            
                console.log(UpdateArray);
				google.run("UpdateSchedule", "onUpdateSuccess", Key(), UpdateArray);          

                // google.script.run.withSuccessHandler(onUpdateSuccess).withFailureHandler(FailHandler).UpdateSchedule(Key(), UpdateArray);
  
            }
            
            this.AddGame = function()
            {
            
                 var Pair1 = new IDPair(Selected1);
                 var slotcount;
              
                 if(Pair1.Prefix()=="F") // field view
                 {
                   this.SetSelectTeams("SelectHome");
                   this.SetSelectTeams("SelectAway");
                   slotcount=this.SetSelectSlots(Pair1.Row(), Pair1.Week());
                 }
                 
                 else
                 {
                   this.SetSelectTeams("SelectHome", Pair1.Row());
                   this.SetSelectTeams("SelectAway");
                   slotcount=this.SetSelectSlots(0, Pair1.Week());
                 }
                 
                 if(slotcount > 0)
                 {
                 // what a mouthful!
                  $(function() {
                    $( "#AddDialog" ).dialog(
                    {
                      position:['middle', 20], 
                      modal: true,
                      buttons: 
                      {
                            "Cancel": function() 
                            {
                              $( this ).dialog( "close" );
                            },
                            "OK": function() 
                            {
                              
                              $( this ).dialog( "close" );
                              scheduleData.DoAddGame();
                            }
                        }
                      }); // this paren closes dialog

                    }); // this paren closes $
                 }  
                 else
                 {
                   // no slots, put up no slot message.
                   $(function() {
                    $( "#NoSlotDialog" ).dialog(
                    {
                      position:['middle', 20], 
                      modal: true,
                      buttons: 
                      {
                            "OK": function() 
                            {
                              $( this ).dialog( "close" );
                              $("#" + Selected1).removeClass("ui-selected");
                              Hide("AddGame");
                              Selected1=undefined;

                            }
                        }
                      }); // this paren closes dialog

                    }); // this paren closes $
                   
                 }

          }
          
          this.DoAddGame= function()
          {
             if(f_Pending)
             {
               return;
             }
             

             var SelectHome=document.getElementById("SelectHome");
             var SelectAway=document.getElementById("SelectAway");
             var SelectField=document.getElementById("SelectField");
             var Pair = new IDPair(Selected1);
             
             var home = this.m_Teams.m_Teams[SelectHome.selectedIndex];
             var away = this.m_Teams.m_Teams[SelectAway.selectedIndex];
                    
                    
             var slotno = SelectField.value;
             var slot = this.m_FieldSlots.m_Slots[slotno];
                    
             var week = Pair.Week();

             this.m_Games.AddGame(home, away, slotno, week, slot);

             var cell;
             var id;
             id= this.FieldCellID(slotno, week);
             cell=document.getElementById(id);
             this.ShowGamebyField(cell, week, slotno);
                    
             var teamh, teama;
             var game;
             game=this.m_Games.m_Games[week][slotno];
             teamh=game.m_Home;
             teama=game.m_Away;
           
             teamh.ClearDuplicates();
             teama.ClearDuplicates();
               
             this.UpdateAllTeamGames(teamh);
             this.UpdateAllTeamGames(teama);
            
              
              var UpdateArray = new Array(); // contains the results to send back to the server
              var gameChange= new GameChange();
              
              
              gameChange.AddGame(game);
              UpdateArray.push(gameChange.Description());
              
              this.InitiateUpdate(UpdateArray);
               
               
              $("#" + Selected1).removeClass("ui-selected");
              Hide("AddGame");
              Selected1=undefined;

            }
            
            this.SetSelectTeams= function(id, startTeam)
            {
              var select=document.getElementById(id);
              
              
              if(select.options.length==0)
              {
                var x;
                for(x=0; x<this.m_Teams.m_Teams.length; x++)
                {
                  var team = document.createElement("option");
                  team.text = this.m_Teams.m_Teams[x].m_Name;

                  select.appendChild(team);
                  
                }
              }
              select.selectedIndex=startTeam;
              
            }
            
            
            
            this.SetSelectSlots = function (startRow, week)
            {
              
              var x;
              
              var select=document.getElementById("SelectField");
              
              while(select.options.length > 0)
              {
                
                select.removeChild(select.options[0]);
              }
              var selected=0;
              for(x=0; x<this.m_FieldSlots.m_Slots.length; x++)
              {
              
                  if(this.m_Games.m_Games[week][x]==undefined)
                  {
                    var venue = document.createElement("option");
            
                    venue.text = this.m_FieldSlots.m_Slots[x].Venue();
                    venue.value=x;

                    select.appendChild(venue);
                    
                    if(x==startRow)
                    {
                      selected=select.length-1;
                      
                      
                    }
                 }  
                  
              
              }
              select.selectedIndex=selected;
              return select.options.length;
              
            }
            this.RemoveGame = function()
            {
            
                $(function() 
                {
                    $( "#DeleteDialog" ).dialog(
                    {
                      position:['middle', 20], 
                      modal: true,
                      buttons: 
                      {
                         "Cancel": function() 
                         {
                              $( this ).dialog( "close" );
                         },
                         "OK": function() 
                         {
                              $( this ).dialog( "close" );
                              scheduleData.DoRemoveGame();
                          }
                       }
                     });
                });
                    

              }
              
              this.DoRemoveGame= function()
              {
               if(f_Pending)
               {
                 return;
               }

              
                  var Pair = new IDPair(Selected1);
                  var game;
                  var slot;
                  var week;
                  week=Pair.Week();
              
                  if(Pair.Prefix()=="F") // field view
                   {
                     slot=Pair.Row();
                     game=this.m_Games.m_Games[week][slot];
                     
                     
                   }
                   else
                   {
                   // team view
                     
                     game=this.m_Teams.m_Teams[Pair.Row()].m_Games[week][0];
                     slot=this.m_FieldSlots.LookupSlot(game.m_Slot);
                     

                   }
                   
                   this.m_Games.m_Games[week][slot]= undefined;
                    var cell;
                    var id;
                    id= this.FieldCellID(slot, week);
                    cell=document.getElementById(id);
                    this.ShowGamebyField(cell, week, slot);
                    
                    var teamh, teama;
                    teamh=game.m_Home;
                    teama=game.m_Away;
              
                    teama.UnregisterGame(game, week);
                    teamh.UnregisterGame(game, week);
                    
              

                   teamh.ClearDuplicates();
                   teama.ClearDuplicates();
               
                   this.UpdateAllTeamGames(teamh);
                   this.UpdateAllTeamGames(teama);
              

                    var UpdateArray = new Array(); // contains the results to send back to the server
                    var gameChange= new GameChange();

                    gameChange.DeleteGame(game);
                    UpdateArray.push(gameChange.Description());
                    this.InitiateUpdate(UpdateArray);
                    
                    $("#" + Selected1).removeClass("ui-selected");
                    Hide("RemoveGame");
                    Selected1=undefined;
               
            }
            
            this.SwitchTimes = function()
            {
              // this is the simpler switch, because it doesn't affect duplicate opponents, it just affects the two games
              // do the switch on the m_Slot members of the two games
              
              // once you do the switch, you have to update six cells:
              // the two slot cells on the By Field view
              // the four involved teams on the By Team view
              
             if(f_Pending) // can't have multiple updates pending
             {
               return;
             }

              
             var Pair1 = new IDPair(Selected1);
             var Pair2 = new IDPair(Selected2);
             var game1,game2;
             var slot1, slot2;
             var week=Pair1.Week();
             
             var UpdateArray = new Array(); // contains the results to send back to the server
              
              
              
             
             if(Pair1.Prefix()=="F") // field view
             {
             
               game1=this.m_Games.m_Games[week][Pair1.Row()];
               game2=this.m_Games.m_Games[week][Pair2.Row()];
               slot1=Pair1.Row();
               slot2=Pair2.Row();
             }
             else
             {
               // team view
               game1=this.m_Teams.m_Teams[Pair1.Row()].m_Games[week][0];
               game2=this.m_Teams.m_Teams[Pair2.Row()].m_Games[week][0];
               slot1=this.m_FieldSlots.LookupSlot(game1.m_Slot);
               slot2=this.m_FieldSlots.LookupSlot(game2.m_Slot);
             }
              // then redraw the games in both the fields view and the teams view
              
              
              var id1=document.getElementById(Selected1);
              var id2=document.getElementById(Selected2);
              
              this.m_Games.m_Games[week][slot1]=game2;
              this.m_Games.m_Games[week][slot2]=game1;
               
               if(game1 != undefined)
               {
              
                 var gameChange1= new GameChange();
              
                 gameChange1.SetOldGame(game1);
              
                 
                 game1.m_Slot=this.m_FieldSlots.m_Slots[slot2];
                 this.UpdateGamebyField(slot2, week);
                 this.UpdateGamebyTeams(game1, week);
              
                 gameChange1.SetNewGame(game1);
                 UpdateArray.push(gameChange1.Description());
              
               }
               else
               {
                 // slot1 was empty, draw slot2 as an empty game
                 this.ShowGamebyField(id2, week, slot2);
               }
               if(game2 != undefined)
               {
              
                 var gameChange2= new GameChange();
                 gameChange2.SetOldGame(game2);
                 game2.m_Slot=this.m_FieldSlots.m_Slots[slot1];
                 this.UpdateGamebyField(slot1, week);
                 this.UpdateGamebyTeams(game2, week);
              
                 gameChange2.SetNewGame(game2);
                 UpdateArray.push(gameChange2.Description());
               }
               else
               {
               
               // slot2 was empty, draw slot1 as an empty game
                 this.ShowGamebyField(id1, week, slot1);
               }
               
              
               $(id1).addClass("ui-selected");
               $(id2).addClass("ui-selected");
               this.InitiateUpdate(UpdateArray);
              
            }
            this.SwitchOpponents = function()
            {
             if(f_Pending) // can't have multiple updates pending
             {
               return;
             }

            
            // switch opponents is like switch time, with the added twist that you have to update the duplicates for the four teams involved.
             var Pair1 = new IDPair(Selected1);
             var Pair2 = new IDPair(Selected2);
             var game1,game2;
             
             var week=Pair1.Week();
             var UpdateArray = new Array(); // contains the results to send back to the server
               var gameChange1=new GameChange();
               var gameChange2=new GameChange();
             
             if(Pair1.Prefix()=="F") // field view
             {
               // the simplest case
               // in field view, if we have A@B and C@D, switch it to A@C and D@B. That way we can cycle through the four possibilities by repeating
               var team1h, team1a, team2h, team2a;
               
               game1=this.m_Games.m_Games[week][Pair1.Row()];
               team1h=game1.m_Home;
               team1a=game1.m_Away;
               game2=this.m_Games.m_Games[week][Pair2.Row()];
               team2h=game2.m_Home;
               team2a=game2.m_Away;
               
               gameChange1.SetOldGame(game1);
               gameChange2.SetOldGame(game2);

               team1a.UnregisterGame(game1, week);
               team1a.RegisterGame(game2, week);
               team2h.UnregisterGame(game2, week);
               team2h.RegisterGame(game1, week);
               game1.m_Away=team2h;
               game2.m_Home=team2a;
               game2.m_Away=team1a;

               gameChange1.SetNewGame(game1);
               gameChange2.SetNewGame(game2);

               team1h.ClearDuplicates();
               team1a.ClearDuplicates();
               team2h.ClearDuplicates();
               team2a.ClearDuplicates();
               
               this.UpdateAllTeamGames(team1h);
               this.UpdateAllTeamGames(team1a);
               this.UpdateAllTeamGames(team2h);
               this.UpdateAllTeamGames(team2a);
               
                 UpdateArray.push(gameChange1.Description());
                   UpdateArray.push(gameChange2.Description());
               
             }
             else
             {
               // team view
               // this is more complicated, because it is possible to do a switch with an empty team. When that happens the 
               // other team is left with an empty game.
               // When it's not an empty game, we do the switch differently, the two teams in the selected cells are switched.
               game1=this.m_Teams.m_Teams[Pair1.Row()].m_Games[week][0];
               game2=this.m_Teams.m_Teams[Pair2.Row()].m_Games[week][0];
               var team1,team2; // the teams not to switch
               team1=this.m_Teams.m_Teams[Pair1.Row()];
               team2=this.m_Teams.m_Teams[Pair2.Row()];
               var team1s, team2s// the teams to switch
               var gameChange1=new GameChange();
               var gameChange2=new GameChange();
             
              
               
               if(game1 == undefined)
               {
                 console.log("game 1 undefined");
                 // this only happens in the team view
                 // team1 has no game, we're going to give team1 team2's game and leave team2 with no game
                    var team2s;
                   gameChange2.SetOldGame(game2);

                   if(game2.m_Home==team2)
                   {
                     game2.m_Home=team1;
                     team2s=game2.m_Away
                   }
                   else
                   {
                     game2.m_Away=team1;
                     team2s=game2.m_Home;
                     
                   }
                   team2.UnregisterGame(game2, week);
                   team1.RegisterGame(game2, week);

                   team1.ClearDuplicates();
                   team2.ClearDuplicates();
                   team2s.ClearDuplicates();
               
                   this.UpdateAllTeamGames(team1);
                   this.UpdateAllTeamGames(team2);
                   this.UpdateAllTeamGames(team2s);
                   gameChange2.SetNewGame(game2);

                   UpdateArray.push(gameChange2.Description());
                 

               }
               else
               {
                 if(game2 == undefined)
                 {
                 console.log("game 1 undefined");
                 // this only happens in the team view
                 // team2 has no game, we're going to give team2 team1's game and leave team1 with no game
                    var team1s;
                   gameChange1.SetOldGame(game1);

                   if(game1.m_Home==team1)
                   {
                     game1.m_Home=team2;
                     team1s=game1.m_Away
                   }
                   else
                   {
                     game1.m_Away=team2;
                     team1s=game1.m_Home;
                     
                   }
                   team1.UnregisterGame(game1, week);
                   team2.RegisterGame(game1, week);

                   team1.ClearDuplicates();
                   team2.ClearDuplicates();
                   team1s.ClearDuplicates();
               
                   this.UpdateAllTeamGames(team1);
                   this.UpdateAllTeamGames(team2);
                   this.UpdateAllTeamGames(team1s);
                   gameChange1.SetNewGame(game1);

                   UpdateArray.push(gameChange1.Description());
               
                 }
                 else
                 {
                   // both teams have games. how we switch depends upon the view
                   
                   // in team view, the teams in the cell are switched
                   gameChange1.SetOldGame(game1);
                   gameChange2.SetOldGame(game2);

                   
                   if(game1.m_Home==team1)
                   {
                     team1s=game1.m_Away;
                   }
                   else
                   {
                     team1s=game1.m_Home;
                   }
                   if(game2.m_Home==team2)
                   {
                     team2s=game2.m_Away;
                     game2.m_Away=team1s;
                   }
                   else
                   {
                     team2s=game2.m_Home;
                     game2.m_Home=team1s;
                   }
                   
                   if(game1.m_Home==team1)
                   {
                     game1.m_Away=team2s;
                   }
                   else
                   {
                     game1.m_Home=team2s;
                   }
                   team1s.UnregisterGame(game1, week);
                   team1s.RegisterGame(game2, week);
                   team2s.UnregisterGame(game2, week);
                   team2s.RegisterGame(game1, week);
                   team1.ClearDuplicates();
                   team1s.ClearDuplicates();
                   team2.ClearDuplicates();
                   team2s.ClearDuplicates();
               
                   this.UpdateAllTeamGames(team1);
                   this.UpdateAllTeamGames(team1s);
                   this.UpdateAllTeamGames(team2);
                   this.UpdateAllTeamGames(team2s);

                   gameChange1.SetNewGame(game1);
                   gameChange2.SetNewGame(game2);
                   UpdateArray.push(gameChange1.Description());
                   UpdateArray.push(gameChange2.Description());
               
                 }
               }
              } 
               
              var id1=document.getElementById(Selected1);
              var id2=document.getElementById(Selected2);
              $(id1).addClass("ui-selected");
              $(id2).addClass("ui-selected");
               this.InitiateUpdate(UpdateArray);

  
             
              
            }


        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        
        function IDPair(id)
        {
            // id is of the form L-WW-RR;
            // where L -- a letter
            // a dash
            // WW-- one or more week identifiers
            // a dash
            // RR -- one or more row identifiers
            var parseStr = id.substring(2, id.length);
            var split = parseStr.split("-");
            this.m_Prefix=id.substr(0,1);
            this.m_Week = split[1];
            this.m_Row = split[0];
            this.Week = function()
            {

                return this.m_Week;
            }
            this.Row = function()
            {
                return this.m_Row;
            }
            this.Prefix = function()
            {
              return this.m_Prefix;
            }
        }

        
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function Weeks(dates)
        {

            // holds an array of game dates for a season

            // parameter is an array of dates in getTime format.
            this.m_Weeks = new Array(dates.length);
            var x;
            for (x = 0; x < dates.length; x++)
            {
                this.m_Weeks[x] = new Week(dates[x][0], dates[x][1]);
            }

            this.Length = function()
            {
                return this.m_Weeks.length;
            }
            this.LookUp = function(date)
            {
                var x;
                for (x = 0; x < this.m_Weeks.length; x++)
                {
                    if (this.m_Weeks[x].Matches(date))
                    {
                        return x;
                    }
                }
                return -1;
            }
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function Week(date, description)
        {
            this.m_date = new Date(date);
            this.m_description = description;

            this.Matches = function(date)
            {
                if (this.m_date.getTime() == date.getTime())
                {
                    return true;
                }
                return false;
            }
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function FieldSlots(Slots)
        {
            // this is a list of all of our field/slot combinations
            // Slots is an array from the slots tab in the spreadsheet, we care about the first two items, field and time
            var x;
            this.m_Slots = new Array(Slots.length);
            for (x = 0; x < Slots.length; x++)
            {
                this.m_Slots[x] = new FieldSlot(Slots[x][0], Slots[x][1], Slots[x][2], Slots[x][3]);
            }

            this.LookUp = function(field, time, DOW)
            {
                var x;
                for (x = 0; x < this.m_Slots.length; x++)
                {
                    if (this.m_Slots[x].Matches(field, time, DOW))
                    {
                        return x;
                    }
                }
                return -1;
            }
            this.LookupSlot = function(pSlot)
            {
                var x;
                for (x = 0; x < this.m_Slots.length; x++)
                {
                    if (this.m_Slots[x]==pSlot)
                    {
                        return x;
                    }
                }
                return -1;
            }
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function FieldSlot(field, DOW, time, timeStr)
        {
            // holds an available field at an available time
            // field name
            // time
            // DOW
            this.m_Field = field;
            this.m_Time = new Date(time);
            this.m_DOW = DOW;
            this.m_TimeStr = timeStr

            this.Matches = function(field, time, DOW)
            {
                if (this.m_Field != field)
                {
                    return false;
                }
                if (this.m_Time.getTime() != time.getTime())
                {
                    return false;
                }
                if (this.m_DOW != DOW)
                {
                    return false;
                }
                return true;
            }

            this.Venue = function()
            {
                return this.m_Field + " " + this.m_DOW + " " + this.m_TimeStr;
            }
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function Games(Weeks, FieldSlots, RawSlots)
        {
            // this is an array of games, two-dimensional. first dimension is the week, second is the fieldslot. Payload can be one of three things:
            //  a Game object
            // an "unavailble" object
            // undefined if the slot is available

            this.m_Games = new Array(Weeks.Length());
            var x;
            for (x = 0; x < this.m_Games.length; x++)
            {
                this.m_Games[x] = new Array(FieldSlots.m_Slots.length);
            }

            for (x = 0; x < RawSlots.length; x++)
            {
                if (RawSlots[x][4].toUpperCase() === "NO")
                {


                    var field = RawSlots[x][0];
                    var date = new Date(RawSlots[x][3]);
                    var time = new Date(RawSlots[x][2]);
                    var DOW = RawSlots[x][1];
                    var slotno = FieldSlots.LookUp(field, time, DOW);
                    var week = Weeks.LookUp(date);
                    this.m_Games[week][slotno] = new UnavailableSlot();

                }
            }
            x = 0;
            this.AddGame = function(home, away, slotno, week, slot)
            {
                this.m_Games[week][slotno] = new Game(home, away, slot, week);
            };
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function UnavailableSlot()
        {
            this.MatchUp = function()
            {
                return "Unavailable";
            }
            this.ClassName = function()
            {
                return "TDUnavailable";
            }

        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function Game(home, away, slot, week)
        {
            // a data structure to represent one game. What does a game consist of?
            // a fieldslot
            // a game date
            // a home team
            // an away team
            this.m_Home = home;
            this.m_Away = away;
            this.m_Slot = slot;
            this.m_Week = week;
            this.m_Home.RegisterGame(this, week);
            this.m_Away.RegisterGame(this, week);
            this.m_Duplicate=false;
            this.Venue = function()
            {
                return this.m_Slot.Venue();
            }
            this.MatchUp = function()
            {
                var retval;
                retval='<div title="'+this.m_Home.m_Division+' - '+this.m_Home.m_Notes+'">'+this.m_Home.m_Name+'<p>';
                retval+='<div title="'+this.m_Away.m_Division+' - '+this.m_Away.m_Notes+'">'+this.m_Away.m_Name;
                return retval;
            }
            this.ClassName = function()
            {
                   if (highlightDuplicates && this.m_Duplicate)
                  {
                    return "TDItem duplicate-game"
                  }

                return "TDItem";
            }
            this.CheckDuplicate= function(pGame)
            {
              if((this.m_Home==pGame.m_Home && this.m_Away==pGame.m_Away) || (this.m_Home==pGame.m_Away && this.m_Away==pGame.m_Home))
              {
                
                this.m_Duplicate=true;
                pGame.m_Duplicate=true;
              }
             
            }

        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function Teams(teamlist, seasonlength)
        {
            // all of the teams in this schedule
            // an array of objects of type team
            this.m_Teams = new Array(teamlist.length);

            var x;
            for (x = 0; x < teamlist.length; x++)
            {
                this.m_Teams[x] = new Team(teamlist[x], seasonlength);
            }
            this.LookUp = function(name)
            {
                //return a pointer to a team object by name;

                var x;
                for (x = 0; x < this.m_Teams.length; x++)
                {
                    if (this.m_Teams[x].Matches(name))
                    {
                        return this.m_Teams[x];
                    }
                }
                console.log(name);
                return undefined;

            }
            this.LookupTeam= function(pTeam)
            {
            //return the offset of  a team object

                var x;
                for (x = 0; x < this.m_Teams.length; x++)
                {
                    if (this.m_Teams[x]== pTeam)
                    {
                        return x;
                    }
                }
                console.log("lookup failed");
                return -1;
            }
            this.FindDuplicateOpponents = function() 
            {
              var x; 
              for (x = 0; x < this.m_Teams.length; x++)
              {
                this.m_Teams[x].FindDuplicateOpponents();
              }

            }


        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
        function Team(info, seasonlength)
        {
            // data structure to represent one team 
            this.m_Games = new Array(seasonlength);
            var x;
            for (x = 0; x < seasonlength; x++)
            {
                this.m_Games[x] = new Array();
            }
            this.m_Name = info[0];
            this.m_Division=info[1];
            this.m_Notes=info[2];

            this.RegisterGame = function(game, week)
            {

                this.m_Games[week].push(game);


            }
            this.FindDuplicateOpponents = function() 
            {
              var week;
              for(week=0; week< this.m_Games.length; week++)
              {
                var nGame;
                for(nGame=0; nGame<this.m_Games[week].length;nGame++)
                {
                    var innerweek;
                    var innerGame=nGame+1;
                    for(innerweek=week; innerweek <this.m_Games.length; innerweek++)
                    {
                      
                      for(; innerGame < this.m_Games[innerweek].length;innerGame++)
                      {
                        this.m_Games[week][nGame].CheckDuplicate(this.m_Games[innerweek][innerGame]);
                      }
                      innerGame=0;
                    }
                }
              
              }
            }
            this.ClearDuplicates = function()
            {
              var week;
              var game;
              for(week=0; week< this.m_Games.length; week++)
              {
                var nGame;
                for(nGame=0; nGame<this.m_Games[week].length;nGame++)
                {
                  this.m_Games[week][nGame].m_Duplicate=false;
                }
                
              }
              
            }


            this.UnregisterGame = function(game, week) 
            {
                var oldarray=this.m_Games[week];
                this.m_Games[week]=new Array();
                var x;
                for(x=0; x< oldarray.length; x++)
                {
                  if(oldarray[x]!=game)
                  {
                    this.m_Games[week].push(oldarray[x]);
                  }
                }
                
            }
            this.Matches = function(name)
            {
                if (this.m_Name == name)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

            this.GameDescription = function(week)
            {
                var retval = "";
                var x;
                for (x = 0; x < this.m_Games[week].length; x++)
                {
                    if (retval.length > 0)
                    {
                        retval += "<p>";
                    }
                    var opponent;
                    
                    
                    if (this.m_Games[week][x].m_Home == this)
                    {
                        
                        opponent=this.m_Games[week][x].m_Away;
                    }
                    else
                    {

                        opponent =this.m_Games[week][x].m_Home;
                    }
                    retval+='<div title="'+ opponent.m_Division+' - '+opponent.m_Notes+'">';
                    retval += opponent.m_Name;
                    retval += "<p>" + this.m_Games[week][x].Venue() + "</div> ";

                }
                return retval;
            }
        }
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
      
      function GameChange()
      {
        // structure for transmitting game changes to the server
        this.m_Games=new Array(2);
        
        this.SetGame = function (game)
        {
          var retval=new Array();
          
          retval.push(scheduleData.m_Weeks.m_Weeks[game.m_Week].m_date.getTime());
          retval.push(game.m_Slot.m_Time.getTime());
          retval.push(game.m_Slot.m_DOW);
          retval.push(game.m_Home.m_Name);
          retval.push(game.m_Away.m_Name);
          retval.push(game.m_Slot.m_Field);
          
          return retval;
          
        }
        this.AddGame = function(game)
        {
             this.SetNewGame(game);
        };
        this.DeleteGame = function(game)
        {
          this.SetOldGame(game);
          
          
        };
        this.SetOldGame = function(game)
        {
        
          this.m_Games[0]=this.SetGame(game);
        
        };
        this.SetNewGame = function (game)
        {
        
          this.m_Games[1]=this.SetGame(game);
        
        };
        this.Description = function()
        {
       
          return this.m_Games;
        }
      }

var g_Key="";

function OnDivisionChanged(value)
{
	g_Key=value;
}

function Key()
{
    //return getUrlParam("key", "1hMsZ8DwvMTKmkMCV_qIdj_Yf39Av38k4kAhSCuW3h18");
    if (g_Key == "" || g_Key == undefined)
	{
        g_Key = getUrlParam("key", "undefined");
        console.log(g_Key);
	}
	return g_Key;
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}