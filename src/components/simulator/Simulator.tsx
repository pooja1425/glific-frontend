import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Draggable from 'react-draggable';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import CallIcon from '@material-ui/icons/Call';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VideocamIcon from '@material-ui/icons/Videocam';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import ClearIcon from '@material-ui/icons/Clear';
import axios from 'axios';
import moment from 'moment';

import styles from './Simulator.module.css';
import DefaultWhatsappImage from '../../assets/images/whatsappDefault.jpg';
import { ReactComponent as SimulatorIcon } from '../../assets/images/icons/Simulator.svg';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import { SEARCH_QUERY_VARIABLES, TIME_FORMAT, SIMULATOR_CONTACT } from '../../common/constants';
import { GUPSHUP_CALLBACK_URL } from '../../config';
import { ChatMessageType } from '../../containers/Chat/ChatMessages/ChatMessage/ChatMessageType/ChatMessageType';

export interface SimulatorProps {
  showSimulator: boolean;
  setShowSimulator: any;
  simulatorIcon?: boolean;
  message?: any;
}

export const Simulator: React.FC<SimulatorProps> = ({
  showSimulator,
  setShowSimulator,
  simulatorIcon = true,
  message = {},
}: SimulatorProps) => {
  const [inputMessage, setInputMessage] = useState('');

  let messages = [];
  let simulatorId = '';

  const { data: allConversations }: any = useQuery(SEARCH_QUERY, {
    variables: SEARCH_QUERY_VARIABLES,
    fetchPolicy: 'cache-only',
  });

  if (allConversations) {
    // currently setting the simulated contact as the default receiver
    const simulatedContact = allConversations.search.filter(
      (item: any) => item.contact.phone === SIMULATOR_CONTACT
    );
    if (simulatedContact.length > 0) {
      messages = simulatedContact[0].messages;
      simulatorId = simulatedContact[0].contact.id;
    }
  }

  const getStyleForDirection = (direction: string): string => {
    return direction === 'send' ? styles.SendMessage : styles.ReceivedMessage;
  };

  const renderMessage = (
    text: string,
    direction: string,
    index: number,
    insertedAt: string,
    type: string,
    media: any,
    location: any
  ) => {
    return (
      <div className={getStyleForDirection(direction)} key={index}>
        <ChatMessageType type={type} media={media} body={text} location={location} />
        <span className={direction === 'received' ? styles.TimeSent : styles.TimeReceived}>
          {moment(insertedAt).format(TIME_FORMAT)}
        </span>
        {direction === 'send' ? <DoneAllIcon /> : null}
      </div>
    );
  };

  const simulatedMessages = messages
    .map((simulatorMessage: any, index: number) => {
      const { body, insertedAt, type, media, location } = simulatorMessage;
      if (simulatorMessage.receiver.id === simulatorId) {
        return renderMessage(body, 'received', index, insertedAt, type, media, location);
      }
      return renderMessage(body, 'send', index, insertedAt, type, media, location);
    })
    .reverse();

  const sendMessage = () => {
    const sendMessageText =
      inputMessage === '' && message ? `${message.type}:${message.keyword}` : inputMessage;
    axios({
      method: 'POST',
      url: GUPSHUP_CALLBACK_URL,
      data: {
        type: 'message',
        payload: {
          type: 'text',
          payload: {
            text: sendMessageText,
          },
          sender: {
            // this number will be the simulated contact number
            phone: SIMULATOR_CONTACT,
            name: 'Simulator',
          },
        },
      },
    });
    setInputMessage('');
  };

  useEffect(() => {
    if (message.keyword !== undefined) {
      sendMessage();
    }
  }, [message.keyword]);

  const messageRef = useCallback(
    (node: any) => {
      if (node !== null) {
        const nodeCopy = node;
        nodeCopy.scrollTop = node.scrollHeight;
      }
    },
    [messages]
  );

  const simulator = (
    <Draggable>
      <div className={styles.SimContainer}>
        <div>
          <div id="simulator" className={styles.Simulator}>
            <ClearIcon
              className={styles.ClearIcon}
              onClick={() => setShowSimulator(false)}
              data-testid="clearIcon"
            />
            <div className={styles.Screen}>
              <div className={styles.Header}>
                <ArrowBackIcon />
                <img src={DefaultWhatsappImage} alt="default" />
                <span data-testid="beneficiaryName">Beneficiary</span>
                <div>
                  <VideocamIcon />
                  <CallIcon />
                  <MoreVertIcon />
                </div>
              </div>
              <div className={styles.Messages} ref={messageRef}>
                {simulatedMessages}
              </div>
              <div className={styles.Controls}>
                <div>
                  <InsertEmoticonIcon className={styles.Icon} />
                  <input
                    type="text"
                    data-testid="simulatorInput"
                    onKeyPress={(event: any) => {
                      if (event.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                    value={inputMessage}
                    placeholder="Type a message"
                    onChange={(event) => setInputMessage(event.target.value)}
                  />
                  <AttachFileIcon className={styles.AttachFileIcon} />
                  <CameraAltIcon className={styles.Icon} />
                </div>

                <Button
                  variant="contained"
                  color="primary"
                  className={styles.SendButton}
                  onClick={() => sendMessage()}
                >
                  <MicIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );

  const handleSimulator = () => {
    setShowSimulator(!showSimulator);
  };

  return (
    <>
      {showSimulator ? simulator : null}
      {simulatorIcon ? (
        <SimulatorIcon
          data-testid="simulatorIcon"
          className={showSimulator ? styles.SimulatorIconClicked : styles.SimulatorIconNormal}
          onClick={() => handleSimulator()}
        />
      ) : null}
    </>
  );
};
