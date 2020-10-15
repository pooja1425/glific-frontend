import React, { useEffect } from 'react';
import clsx from 'clsx';
import { ListItem } from '@material-ui/core';
import { Link } from 'react-router-dom';
import moment from 'moment';

import styles from './ChatConversation.module.css';
import { DATE_FORMAT } from '../../../../common/constants';
import { MARK_AS_READ, MESSAGE_FRAGMENT } from '../../../../graphql/mutations/Chat';
import { useApolloClient, useMutation } from '@apollo/client';
import { WhatsAppToJsx } from '../../../../common/RichEditor';
import { Timer } from '../../../../components/UI/Timer/Timer';

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
  contactStatus: string;
  contactBspStatus: string;
  selected: boolean;
  senderLastMessage: any;
  onClick: (i: any) => void;
  index: number;
  lastMessage: {
    id: number;
    body: string;
    insertedAt: string;
    type: string;
    media: any;
    tags: Array<{
      id: number;
      label: string;
    }>;
  };
  highlightSearch?: string;
}

const updateMessageCache = (client: any, data: any) => {
  data.map((messageId: any) => {
    const message = client.readFragment({
      id: `Message:${messageId}`,
      fragment: MESSAGE_FRAGMENT,
    });
    const messageCopy = JSON.parse(JSON.stringify(message));
    messageCopy.tags = messageCopy.tags.filter((tag: any) => tag.label !== 'Unread');
    client.writeFragment({
      id: `Message:${messageId}`,
      fragment: MESSAGE_FRAGMENT,
      data: messageCopy,
    });
    return null;
  });
};

const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  // check if message is unread and style it differently
  const client = useApolloClient();
  let chatInfoClass = [styles.ChatInfo, styles.ChatInfoRead];
  let chatBubble = [styles.ChatBubble, styles.ChatBubbleRead];
  const { lastMessage, selected, contactId, contactName, index, highlightSearch } = props;
  let unread = false;
  const [markAsRead] = useMutation(MARK_AS_READ, {
    onCompleted: (mydata) => {
      updateMessageCache(client, mydata.markContactMessagesAsRead);
    },
  });

  // there might be some cases when there are no conversations againist the contact. So need to handle that
  // Also handle unread formatting only if tags array is set.
  if (Object.keys(lastMessage).length > 0 && lastMessage.tags.length > 0) {
    // TODO: Need check with the backend on unique identifier for this.
    if (lastMessage.tags.filter((tag) => tag.label === 'Unread').length > 0) {
      chatInfoClass = [styles.ChatInfo, styles.ChatInfoUnread];
      chatBubble = [styles.ChatBubble, styles.ChatBubbleUnread];
      unread = true;
    }
  }

  // display highlighted search message
  const BoldedText = (text: string, shouldBeBold: string | undefined) => {
    shouldBeBold = shouldBeBold ? shouldBeBold : '';
    const textArray = text.split(shouldBeBold);

    return (
      <span>
        {textArray.map((item, index) => (
          <>
            {item}
            {index !== textArray.length - 1 && (
              <span className={styles.TitleText}>{shouldBeBold}</span>
            )}
          </>
        ))}
      </span>
    );
  };

  useEffect(() => {
    if (unread && selected) {
      markAsRead({
        variables: { contactId: contactId.toString() },
      });
    }
  }, [unread, selected, contactId]);

  const name = contactName.length > 20 ? contactName.slice(0, 20) + '...' : contactName;

  let message;

  // checking if the last message type is text and displaying the message below the contact name
  // else displaying the type of message
  if (lastMessage.type === 'TEXT') {
    message = lastMessage.body;
  } else {
    message = lastMessage.type;
  }
  let displayMSG = WhatsAppToJsx(message);

  return (
    <ListItem
      data-testid="list"
      button
      disableRipple
      className={clsx(styles.StyledListItem, { [styles.SelectedColor]: selected })}
      component={Link}
      selected={selected}
      onClick={() => props.onClick(index)}
      to={'/chat/' + contactId + '/#search' + props.lastMessage.id}
    >
      <div>
        <div className={chatBubble.join(' ')} />
        <div className={styles.Timer}>
          <Timer
            time={props.senderLastMessage}
            contactStatus={props.contactStatus}
            contactBspStatus={props.contactBspStatus}
          />
        </div>
      </div>
      <div className={chatInfoClass.join(' ')}>
        <div className={styles.ChatName} data-testid="name">
          {name}
        </div>
        <div className={styles.MessageContent} data-testid="content">
          {displayMSG[0] ? BoldedText(displayMSG[0], highlightSearch):null}
        </div>
        <div className={styles.MessageDate} data-testid="date">
          {moment(lastMessage.insertedAt).format(DATE_FORMAT)}
        </div>
      </div>
    </ListItem>
  );
};

export default ChatConversation;
