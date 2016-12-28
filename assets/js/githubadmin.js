var dataTypeToSend = 0;


var filesArray = [];
var auth, authid, token, repourl, curl, username, password, reponame, repo;


$(document).ready(function(){
    $(".sortable").sortable();
    $(".sortable").disableSelection();
});


$("#finish-button").click(function(event){
    username = $("#f1-username").val();
    password = $("#f1-password").val();
    reponame = $("#f1-repo-name").val();

    //$("#setup-screen").hide();
    //$("#edit-screen").show();
    //Edit progress bar text
    $("#setup-screen > div > div:nth-child(2) > div > form > h3").html("Edit your site");
    $("#setup-screen > div > div:nth-child(2) > div > form > p").html("Click the publish button to save your changes.")
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
    getrepoandpublish(username, password, reponame, true);
});


$("#publish").click(function(event){
    getrepoandpublish(username, password, reponame, true);
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


function getrepoandpublish(username, password, reponame, isUpload){
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

            switch (dataTypeToSend){
                //Upload
                case 0:
                    postfiles(username, password, repo); 
                    break;

                //Create a post
                case 1:
                    createfileandpost(username, password, repo);
                    break;

                default:
                    break;
            }
        }
    });
}

function createfileandpost(username, password, repo){
    $("#results").text("Uploading Files to GitHub Repository. "+filesArray.length+" files left to upload.");

    var basecontent = btoa(unescape(encodeURIComponent(filecontent)));
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
            $("#results").text("Finished...");
            postfiles();
        },
        error: function(err) {
            $("#results").text("File Upload Failed.");
            console.log(err);
            postfiles();
        }
    });
}


function postfiles(username, password, repo){
  $("#results").text("Uploading Files to GitHub Repository. "+filesArray.length+" files left to upload.");

  if(filesArray.length>0){

    var f = filesArray.pop();
    console.log(f);

    var fileType = f.type;
    console.log(fileType);
    var filename = f.name;//f.webkitRelativePath;
    console.log("file: ", filename);

    var reader = new FileReader();

    reader.onload = function(e) {
        var filecontent = reader.result;
        var basecontent = btoa(unescape(encodeURIComponent(filecontent)));
        if(fileType.indexOf('image') !== 0){
            sendfile(username, password, filename, basecontent, repo);
        }
        else {
            var dataurl = getimagebase64andsend(username, password, f, repo);
            }
    }
    reader.readAsText(f,"UTF-8");
  } 
  else {
    $("#results").html('Finished.');
  }
}


function sendfile(username, password, filename, basecontent, repo){
    var filemessage = "uploading a file";
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

function getimagebase64andsend(username, password, file, repo) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        var dataurl = reader.result;
        console.log('\nRES:\n', dataurl);
        $("body").append('<img alt="Embedded Image" src="'+dataurl+'"/>');
        sendfile(username, password, file.name + ".b64is", btoa(unescape(encodeURIComponent(dataurl))), repo);
         $("body").append('<img alt="Embedded Image" src="'+atob(btoa(unescape(encodeURIComponent(dataurl))+'"/>')));
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
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