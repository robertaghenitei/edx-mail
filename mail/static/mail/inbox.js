document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // Compose new email and submit handler
  document.querySelector('#compose-form').addEventListener('submit', send_email);

    // By default, load the inbox
  load_mailbox('inbox');
}) ;



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


async function view_email(id){
    await fetch(`emails/${id}`).
      then(response=>response.json()).
        then(email=>{
              fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                read: true
               })
                  })
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'none';
              document.querySelector('#email-detail-view').style.display = 'block';
              document.querySelector('#email-header').innerHTML = `
              <h5>Sender: ${email.sender}</h5>
              <h5>Recipients: ${email.recipients}</h5>
              <h4>Subject: ${email.subject}</h4>
              `;
              document.querySelector('#email-body').innerHTML = `<p>${email.body}</p>`;
              document.querySelector('#email-footer').innerHTML = `<h6>${email.timestamp}</h6>`;
            if(email.archived){
                document.querySelector('#archive').innerHTML = "Unarchive";
                document.querySelector('#archive').className= 'btn btn-success';
                document.querySelector('#archive').onclick = () => {
                 fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: !email.archived
                    })}).then(()=>load_mailbox('inbox'))
                    
                
                };
            } else {
                document.querySelector('#archive').innerHTML = "Archive";
                document.querySelector('#archive').className= 'btn btn-danger';
                document.querySelector('#archive').onclick = () => {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: !email.archived
                    })
                  }).then(()=>load_mailbox('inbox'))
                 
                }
            }
            document.querySelector('#replay').addEventListener('click', ()=>{
              compose_email();
              document.querySelector('#compose-recipients').value = `${email.sender}`;
              document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
              document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: \n ${email.body} `
            });
    });
}



async function load_mailbox(mailbox) { 
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';
// Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`; 
  // Fetch emails from mailbox and display them 
    await fetch(`/emails/${mailbox}`)
     .then(response => response.json())
     .then(emails => {
        
        //loop through every email in the json  response and create a div element for each
        emails.forEach(email => {
          console.log(email);
          //create a div for every email 
          const row = document.createElement('div');
          row.classList.add('list-group-item');
          row.classList.add('border-style');
          row.innerHTML = `
            <h6>${email.sender}</h6>
            <h5>${email.subject}</h5>
            <p>${email.timestamp}</p>
            <br>
          `;
          row.classList.add(email.read ? 'read' : 'unread');

          row.addEventListener('click', function(){
            view_email(email.id);
          });

          document.querySelector('#emails-view').append(row);
          
        });
      })
     .catch(error => {
        console.error('Error fetching emails:', error);
      });
}


function send_email(event) {
  event.preventDefault(); // Prevent form submission
  console.log('am ajuns aici!!');
  // Get values from form fields and send email
  

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

      if (!recipients ||!subject ||!body) {
        alert('Please fill in all fields');
        return;
       }
    // Send email
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
        })
      })
    .then(response => response.json())
     .then(result => {
        console.log('Email sent!', result);
        alert('Email sent successfully');
        load_mailbox('sent');
       })
    .catch(error => {
       console.error('Error sending email:', error);
        alert('Error sending email');
     });
     // Clear compose form
    return false;
}


