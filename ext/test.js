$(document).ready(function(){
   var sidebar = new Sidebar($("#lockon"));
   sidebar.add_caption("test1", function(){console.log("test1")});
   sidebar.add_caption("test2", function(){console.log("test2")});
   sidebar.add_caption("test3", function(){console.log("test3")});
   sidebar.bind_settings(function(){console.log("settings")});
   sidebar.bind_request(function(){console.log("request")});
})