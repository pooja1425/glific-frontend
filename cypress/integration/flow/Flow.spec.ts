describe('Flow', () => {
  let backend_url = "http://localhost:4000/gupshup"

  let contact = {
    "phone": "917834811231",
    "name": "Default receiver"
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

  it('should complete help flow', () => {
    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "help")
    })

    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "1")
    })

    cy.wait(2000)

    cy.get('div').should('contain', `Glific is designed specifically for NGOs in the social sector to enable them to interact with their users on a regular basis`)
  });

  it('should complete new contact flow', () => {
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

    cy.wait(2000)

    cy.get('div').should('contain', `Thank you for introducing yourself to us ${contact.name}`)

    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "9")
    })

    cy.request({
      url: backend_url,
      method: 'POST',
      body: create_message(contact, "1")
    })

    cy.wait(2000)

    cy.get('div').should('contain', `Glific is designed specifically for NGOs in the social sector to enable them to interact with their users on a regular basis`)
  });
});
