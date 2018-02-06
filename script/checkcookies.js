function checkBlockedCookies() {
    var x = document.getElementById("instructionsDiv");
    var cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled){ 
        document.cookie = "testcookie";
        cookieEnabled = document.cookie.indexOf("testcookie")!=-1;
        if(!cookieEnabled){        
            window.location.href = "/signin";                        
        }
    }
    else{
        console.log("cookies are still enabled, please repeat the instructions to proceed");
    }
}


