
var filesArray = [];
var auth, authid, token, repourl, curl, username, password, reponame, repo;


$("#finish-button").click(function(event){
    username = $("#f1-username").val();
    password = $("#f1-password").val();
    reponame = $("#f1-repo-name").val();

    $("#setup-screen").hide();
    $("#edit-screen").show();
});


var filesInput = document.getElementById("files");

//process files
filesInput.addEventListener("change", function (e) {
    console.log('event: ', e);
    var selectedFiles = e.target.files;
    for(i=0; i<selectedFiles.length; i++) {
        var file = selectedFiles[i];
        filesArray.push(file);
    }
    console.log('FILES: ', filesArray);
}, false);


$("#submit").click(function(event){
    getrepoandpostfiles(username, password, reponame);
});


function getrepos(username, password){
    $.ajax({
        type: "GET",
        url: "https://api.github.com/users/"+username+"/repos",
        dataType: "json",
        success: function(result) {
            repos = result;
            console.log(repos); 
        }
    });
}


function getrepo(username, password, reponame){
    $.ajax({
        type: "GET",
        url: "https://api.github.com/users/"+username+"/repos",
        dataType: "json",
        success: function(result) {
            for(var i in result ) {
                $("#repo-list").append("<li><a href='" + result[i].html_url + "' target='_blank'>" + result[i].name + "</a></li>");
                if(result[i].name === reponame){
                    repo = result[i];
                    break;
                }
                console.log("i: " + i);
            }
            console.log(result, "\n", repo);    
        }
    });
}


function getrepoandpostfiles(username, password, reponame){
    $.ajax({
        type: "GET",
        url: "https://api.github.com/users/"+username+"/repos",
        dataType: "json",
        success: function(result) {
            for(var i in result ) {
                if(result[i].name === reponame){
                    repo = result[i];
                    break;
                }
                console.log("i: " + i + " name: " + result[i].name);
            }
            console.log(result, "\n", repo);
            postfiles(username, password, repo);    
        }
    });
}


function postfiles(username, password, repo){
  $("#results").text("Uploading Files to GitHub Repository. "+filesArray.length+" files left to upload.");

  if(filesArray.length>0){

    var f = filesArray.pop();
    console.log(f);

    var filename = f.name;//f.webkitRelativePath;
    console.log("file: ", filename);
    var filemessage = "uploading a file";

    var reader = new FileReader();

    reader.onload = function(e) {

        var filecontent = reader.result;
        //var basecontent = btoa(filecontent);
        var basecontent = btoa(unescape(encodeURIComponent(filecontent)));
        ///repos/:owner/:repo/contents/:path
        var apiurl = repo.contents_url.replace('{+path}',filename);
        console.log('apiurl: ', apiurl);
        var filedata = '{"message":"'+filemessage+'","content":"'+basecontent+'"}';

        $.ajax({ 
            url: apiurl,
            type: 'PUT',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
            },
            data: filedata,
            success: function(response) {
                $("#results").text("Uploading...");
                postfiles();
            },
            error: function(err) {
                $("#results").text("File Upload Failed.");
                console.log(err);
                postfiles();
            }
        });
    }

    reader.readAsText(f,"UTF-8");

  } 
  else {
    $("#results").html('Finished.');
  }
}


/*function delauth(username, password){
    $.ajax({ 
        url: 'https://api.github.com/authorizations/'+authid,
        type: 'DELETE',
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Basic " + auth);
        }
    });

    var htmlcode = 'Finished. Check it out: <a href="'+repourl+'">'+repourl+'</a>';
    $("#results").html(htmlcode);
}*/