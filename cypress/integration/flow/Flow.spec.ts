describe('Flow', () => {
  let backend_url = "http://localhost:4000/gupshup"

  let contact = {
    "phone": "911234567891",
    "name": "John"
  }
  
  function create_message(contact, message_body) {
    let message_request_params = {
      "app": "GLIFICAPP",
      "timestamp": 1580227766370,
      "version": 2,
      "type": "message",
      "payload": {
        "type": "text",
        "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
        "source": contact.phone,
        "payload": {
          "text": message_body
        },
        "sender": {
          "phone": contact.phone,
          "name": contact.name,
          "country_code": "91",
          "dial_code": "78xxx1xxx1"
        }
      }
    }

    return message_request_params
  }

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/chat');
  });

  it('should load tag list', () => {
    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "newcontact")
    })

    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "2")
    })

    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, contact.name)
    })

    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "4")
    })

    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "2")
    })

    cy.get('div').should('contain', `Thank you for introducing yourself to us ${contact.name}`)
  });
});
