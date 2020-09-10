import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import Popper from '@material-ui/core/Popper';
import { Button } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import Viewer from 'react-viewer';
import ReactPlayer from 'react-player';
import Download from '@axetroy/react-download';
import GetAppIcon from '@material-ui/icons/GetApp';

import { ReactComponent as TagIcon } from '../../../../assets/images/icons/Tags/Filled.svg';
import { ReactComponent as MessageIcon } from '../../../../assets/images/icons/Dropdown.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/images/icons/Close.svg';
import { AddToMessageTemplate } from '../AddToMessageTemplate/AddToMessageTemplate';
import { Tooltip } from '../../../../components/UI/Tooltip/Tooltip';
import styles from './ChatMessage.module.css';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../common/constants';
import { UPDATE_MESSAGE_TAGS } from '../../../../graphql/mutations/Chat';
import { setNotification } from '../../../../common/notification';
import { MessagesWithLinks } from '../MessagesWithLinks/MessagesWithLinks';
import Thumbnail from '../../../../assets/images/videoThumbnail.jpeg';

export interface ChatMessageProps {
  id: number;
  body: string;
  contactId: number;
  receiver: {
    id: number;
  };
  sender: {
    id: number;
  };
  type: string;
  media: any;
  insertedAt: string;
  onClick?: any;
  tags: Array<any>;
  popup: any;
  setDialog?: any;
  focus?: boolean;
  showMessage: boolean;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  let type = props.type;
  console.log(type);
  console.log(props.media);
  const client = useApolloClient();
  const [showSaveMessageDialog, setShowSaveMessageDialog] = useState(false);
  const Ref = useRef(null);
  const [showViewer, setShowViewer] = useState(false);
  const messageRef = useRef<null | HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const popperId = open ? 'simple-popper' : undefined;
  let tag: any;
  let deleteId: string | number;

  const { popup, focus, id } = props;

  useEffect(() => {
    if (popup) {
      setAnchorEl(Ref.current);
    } else {
      setAnchorEl(null);
    }
  }, [popup]);

  useEffect(() => {
    if (focus) {
      messageRef.current?.scrollIntoView();
    }
  }, [focus, id]);

  // tagging delete mutation
  const [deleteTag] = useMutation(UPDATE_MESSAGE_TAGS, {
    onCompleted: () => {
      setNotification(client, 'Tag deleted successfully');
    },
  });

  let iconLeft = false;
  let placement: any = 'bottom-end';
  let additionalClass = styles.Mine;
  let mineColor: string | null = styles.MineColor;
  let iconPlacement = styles.ButtonLeft;
  let datePlacement: string | null = styles.DateLeft;
  let tagContainer: string | null = styles.TagContainerSender;
  let tagMargin: string | null = styles.TagMargin;
  let messageDetails = styles.MessageDetails;

  if (props.sender.id === props.contactId) {
    additionalClass = styles.Other;
    mineColor = styles.OtherColor;
    iconLeft = true;
    placement = 'bottom-start';
    iconPlacement = styles.ButtonRight;
    datePlacement = null;
    tagContainer = null;
    tagMargin = null;
    messageDetails = styles.MessageDetailsSender;
  }

  const saveMessageTemplate = (display: boolean) => {
    setShowSaveMessageDialog(display);
  };

  let saveTemplateMessage;
  if (showSaveMessageDialog) {
    saveTemplateMessage = (
      <AddToMessageTemplate
        id={props.id}
        message={props.body}
        changeDisplay={saveMessageTemplate}
      />
    );
  }

  const deleteTagHandler = (event: any) => {
    deleteId = event.currentTarget.getAttribute('data-id');
    deleteTag({
      variables: {
        input: {
          messageId: props.id,
          addTagIds: [],
          deleteTagIds: [deleteId],
        },
      },
    });
  };

  if (props.tags && props.tags.length > 0)
    tag = props.tags.map((tag: any) => {
      return (
        <div
          key={tag.id}
          className={`${styles.Tag} ${tagMargin}`}
          style={{ color: tag.colorCode }}
          data-testid="tags"
        >
          <TagIcon className={styles.TagIcon} stroke={tag.colorCode ? tag.colorCode : '#0C976D'} />
          {tag.label}
          <CloseIcon
            className={styles.CloseIcon}
            onClick={deleteTagHandler}
            data-id={tag.id}
            data-testid="deleteIcon"
          />
        </div>
      );
    });

  const date = props.showMessage ? (
    <div className={`${styles.Date} ${datePlacement}`} data-testid="date">
      {moment(props.insertedAt).format(TIME_FORMAT)}
    </div>
  ) : null;

  const icon = (
    <MessageIcon
      onClick={props.onClick}
      ref={Ref}
      className={`${styles.Button} ${iconPlacement}`}
      data-testid="messageOptions"
    />
  );

  let messageBody;

  if (type === 'IMAGE') {
    messageBody = (
      <>
        <div
          data-testid="imageMessage"
          style={{ background: `url("${props.media.url}") no-repeat`, backgroundSize: 'cover' }}
          onClick={() => setShowViewer(true)}
          className={styles.Image}
        ></div>
        <Viewer
          visible={showViewer}
          onClose={() => {
            setShowViewer(false);
          }}
          images={[{ src: props.media.url, alt: '' }]}
        />
        <br />
        <MessagesWithLinks message={props.media.caption} />
      </>
    );
  } else if (type === 'AUDIO') {
    messageBody = (
      <audio controls data-testid="audioMessage">
        <source src={props.media.url} type="audio/ogg"></source>
      </audio>
    );
  } else if (type === 'VIDEO') {
    messageBody = (
      <div className={styles.Image}>
        <ReactPlayer
          className={styles.Image}
          url={props.media.url}
          controls={true}
          light={Thumbnail}
        />
      </div>
    );
  } else if (type === 'DOCUMENT') {
    messageBody = (
      <a href={props.media.url}>
        <Button startIcon={<GetAppIcon />} variant="contained" color="primary">
          {props.media.caption}
        </Button>
      </a>
    );
  } else {
    messageBody = (
      <Tooltip title={moment(props.insertedAt).format(DATE_FORMAT)} placement="right">
        <MessagesWithLinks message={props.body} />{' '}
      </Tooltip>
    );
  }

  return (
    <div className={additionalClass} ref={messageRef} data-testid="message">
      <div className={styles.Inline}>
        {iconLeft ? icon : null}
        <div className={`${styles.ChatMessage} ${mineColor}`}>
          <div className={styles.Content} data-testid="content">
            <div>{messageBody}</div>
          </div>

          <Popper
            id={popperId}
            open={open}
            modifiers={{
              preventOverflow: {
                enabled: true,
                boundariesElement: 'scrollParent',
              },
            }}
            anchorEl={anchorEl}
            placement={placement}
            transition
            data-testid="popup"
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper elevation={3}>
                  <Button
                    className={styles.Popper}
                    color="primary"
                    onClick={props.setDialog}
                    data-testid="dialogButton"
                  >
                    Assign tag
                  </Button>
                  <br />
                  <Button
                    className={styles.Popper}
                    color="primary"
                    onClick={() => setShowSaveMessageDialog(true)}
                  >
                    Add to speed sends
                  </Button>
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
        {iconLeft ? null : icon}
      </div>

      {saveTemplateMessage}

      <div className={messageDetails}>
        {date}
        {tag ? <div className={`${styles.TagContainer} ${tagContainer}`}>{tag}</div> : null}
      </div>
    </div>
  );
};

export default ChatMessage;
