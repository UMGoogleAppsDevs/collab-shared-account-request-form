function Initialize(){
  
  /* Collect existing triggers for this app */
  var triggers = ScriptApp.getProjectTriggers();
  
  /* Purge existing triggers in this app */
  for(var i in triggers){
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  /* Create a new trigger that runs on submit */
  ScriptApp.newTrigger("SendFormResults").forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onFormSubmit().create();
  
}

function SendFormResults(e){
  try {
    /* Snag the email address to send to. In this test, we want the user filling out the form */
    var email = "Collab.Shared.Account.Requests@umich.edu";
    
    /* Declare the variable we're going to use for the body of the ticket. */
    var message = "";
    
    /* Determine the subject line of the email, which should become the 'Short Description' of the generated ticket in ServiceLink. */
    if(e.namedValues['Account Type'] == 'M+Box'){
      var subject = 'M+Box: Shared Account Creation Request';
    } else if(e.namedValues['Account Type'] == 'M+Google'){
      var subject = 'M+Google: Shared Account Creation Request';
    } else {
      var subject = 'M+Google/M+Box: Shared Account Creation Request';
    }
    
    /* Now, let's generate the body of the message... */
    /* Set the account type in the message */
    message += "Requested Account Type(s): " + e.namedValues['Account Type'] + '\n';
    
    /* If the user requested extra security for their M+Box account, let's include that line. */
    if(e.namedValues['M+Box for Sensitive Data'] == 'Yes'){
      message += "\t[M+Box] Secure account for sensitive data: Yes\n";
    }
    
    /* If the user requested a larger accounts size for M+Box, include that line. */
    if(e.namedValues['M+Box Account Quota'] == '500GB'){
      message += "\t[M+Box] Increase Quota to 500GB: Yes\n"
    }
    
    /* Now, let's generate the chunk of the message that talks about the MCommunity group to use, based on the user-specified status. */
    /* If the user wants a new group created... */
    if(e.namedValues['MCommunity Group Status'] == 'New'){
      
      /* First, let's include the desired account name and display name */
      message += "Requested Account Name: " + e.namedValues['Account Name'] + '\n';
      message += "Requested Display Name: " + e.namedValues['Display Name'] + '\n';
      
      /* Now, let's set ownership stuff up. */
      message += "Requested Account Owners:\n";
      if(e.namedValues["Requestor Opt-Out"] != ""){
        message += e.namedValues['Additional Owners'] + '\n';
      } else {
        message += e.namedValues['Username'] + ' ' + e.namedValues['Additional Owners'] + '\n';
      }
   /* Otherwise, let's log the info for the existing MComm group */ 
   } else {
     message += "Existing Mcommunity Group: " + e.namedValues['MCommunity Group Name'] + '\n';
   }
   
   /* Since we can't make the email send as the requestor, let's throw their uniqname in the message. */
    message += "Requestor: " + e.namedValues['Username'] + '\n';
    
   /* Finally, let's include the additional instructions from the user into the message. */
    if(e.namedValues['Additional Instructions'] != ""){
      message += "\nAdditional Instructions:\n" + e.namedValues['Additional Instructions'];
    }
    
    /* Send that message! */
    MailApp.sendEmail(email, subject, message);
          
  } catch(e) {
    Logger.log(e.toString());
  }
}