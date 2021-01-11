export const showMessages = () => {
  if (window.screen.width < 768) {
    document.querySelector('.chatMessages')?.setAttribute('style', 'display: block ');
    document.querySelector('.chatConversations')?.setAttribute('style', 'display: none');
  }
};

export const showChats = () => {
  if (window.screen.width < 768) {
    document.querySelector('.chatMessages')?.setAttribute('style', 'display: none ');
    document
      .querySelector('.chatConversations')
      ?.setAttribute('style', 'display: block !important');
  }
};
