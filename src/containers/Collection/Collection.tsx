import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as Collectionicon } from '../../assets/images/icons/Collections/Selected.svg';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Collection.module.css';
import { GET_COLLECTION } from '../../graphql/queries/Collection';
import {
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
} from '../../graphql/mutations/Collection';
import { GET_TAGS } from '../../graphql/queries/Tag';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Calendar } from '../../components/UI/Form/Calendar/Calendar';
import moment from 'moment';
import Loading from '../../components/UI/Layout/Loading/Loading';
import { Typography } from '@material-ui/core';

export interface CollectionProps {
  match?: any;
  type?: string;
  search?: any;
  handleCancel?: any;
  searchParam?: any;
}

const validation = {
  shortcode: Yup.string().required('Title is required.'),
  label: Yup.string().required('Description is required.'),
};
let FormSchema = Yup.object().shape({});

const dialogMessage = "You won't be able to use this collection again.";

const collectionIcon = <Collectionicon className={styles.Collectionicon} />;

const queries = {
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
};

export const Collection: React.SFC<CollectionProps> = ({
  match,
  type = 'save',
  search,
  ...props
}) => {
  const [shortcode, setShortcode] = useState('');
  const [label, setLabel] = useState('');
  const [term, setTerm] = useState('');
  const [includeTags, setIncludeTags] = useState([]);
  const [includeGroups, setIncludeGroups] = useState([]);
  const [dateFrom, setdateFrom] = useState(null);
  const [dateTo, setdateTo] = useState(null);
  const [formFields, setFormFields] = useState<any>([]);
  const [button, setButton] = useState<string>('Save');

  const states = { shortcode, label, term, includeTags, includeGroups, dateFrom, dateTo };
  const setStates = ({ shortcode, label, args }: any) => {
    setShortcode(shortcode);
    setLabel(label);
    setArgs(args);
  };

  const setArgs = (args: any) => {
    let filters = JSON.parse(args);
    Object.keys(filters.filter).map((key) => {
      switch (key) {
        case 'includeTags':
          if (filters.filter.hasOwnProperty('includeTags'))
            setIncludeTags(getObject(dataT.tags, filters.filter['includeTags']));
          break;
        case 'includeGroups':
          if (filters.filter.hasOwnProperty('includeGroups'))
            setIncludeGroups(getObject(data.groups, filters.filter['includeGroups']));
          break;
        case 'dateRange':
          if (filters.filter.hasOwnProperty('dateRange')) {
            setdateFrom(filters.filter.dateRange.from);
            setdateTo(filters.filter.dateRange.to);
          }
          break;
        case 'term':
          setTerm(filters.filter.term);
          break;
        default:
          break;
      }
    });
  };

  const getObject = (arr: any, data: any) => {
    if (arr && data) {
      let result: any = [];
      arr.map((obj: any) => {
        data.map((ID: any) => {
          if (obj.id === ID) result.push(obj);
        });
      });
      return result;
    }
  };

  const { data: dataT } = useQuery(GET_TAGS);
  const { data } = useQuery(GET_GROUPS);

  if (!data || !dataT) return <Loading />;

  const DataFields = [
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      placeholder: 'Collection Title',
    },
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Description',
      rows: 3,
      textArea: true,
    },
  ];

  const searchFields = [
    {
      component: Input,
      name: 'term',
      type: 'text',
      placeholder: 'Enter name, tag, keyword',
    },
    {
      component: AutoComplete,
      name: 'includeTags',
      label: 'Includes tags',
      options: dataT.tags,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Includes tags',
        // required: true,
        variant: 'outlined',
      },
      icon: <TagIcon className={styles.TagIcon} />,
    },
    {
      component: AutoComplete,
      name: 'includeGroups',
      placeholder: 'Includes groups',
      label: 'Includes groups',
      options: data.groups,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Includes groups',
        variant: 'outlined',
      },
    },
    {
      component: Calendar,
      name: 'dateFrom',
      type: 'date',
      placeholder: 'Date from',
      label: 'Date range',
    },
    {
      component: Calendar,
      name: 'dateTo',
      type: 'date',
      placeholder: 'Date to',
    },
  ];

  const setPayload = (payload: any) => {
    if (search) search(payload);
    if (props.searchParam) {
      payload.term = props.searchParam.term;
      payload.includeTags = props.searchParam.includeTags;
      payload.includeGroups = props.searchParam.includeGroups;
      payload.dateTo = props.searchParam.dateTo;
      payload.dateFrom = props.searchParam.dateFrom;
    }
    let args = {
      messageOpts: {
        offset: 0,
        limit: 10,
      },
      filter: {
        term: payload.term,
        includeTags: payload.includeTags.map((option: any) => option.id),
        includeGroups: payload.includeGroups.map((option: any) => option.id),
      },
      contactOpts: {
        offset: 0,
        limit: 20,
      },
    };

    if (payload.dateFrom && payload.dateFrom != 'Invalid date') {
      let dateRange = {
        dateRange: {
          to: moment(payload.dateTo).format('yyyy-MM-DD'),
          from: moment(payload.dateFrom).format('yyyy-MM-DD'),
        },
      };
      args.filter = Object.assign(args.filter, dateRange);
    }
    return {
      label: payload.label,
      shortcode: payload.shortcode,
      args: JSON.stringify(args),
    };
  };

  const advanceSearch = (data: any) => {
    // close dialogbox
    if (data === 'cancel') props.handleCancel();

    let heading;
    if (type === 'search') {
      heading = (
        <React.Fragment>
          <Typography variant="h5" className={styles.Title}>
            Search conversations
          </Typography>
          <Typography variant="subtitle1" className={styles.Title}>
            Apply more parameters to search for conversations.
          </Typography>
        </React.Fragment>
      );

      FormSchema = Yup.object().shape({});
    }

    if (type === 'saveSearch') {
      heading = (
        <React.Fragment>
          <Typography variant="h5" className={styles.Title}>
            Save search to collections
          </Typography>
        </React.Fragment>
      );
      addFieldsValidation(validation);
    }

    if (formFields.length === 0) {
      if (type === 'search') {
        setFormFields(searchFields);
        setButton('Search');
      }
      if (type === 'saveSearch') setFormFields(DataFields);
    }
    return {
      heading,
    };
  };

  const addFieldsValidation = (object: object) => {
    FormSchema = Yup.object().shape(object);
  };

  const getFields = () => {
    addFieldsValidation(validation);
    return [...DataFields, ...searchFields];
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="collection"
      dialogMessage={dialogMessage}
      formFields={formFields.length > 0 ? formFields : getFields()}
      redirectionLink="collection"
      cancelLink="collection"
      linkParameter="id"
      listItem="savedSearch"
      icon={collectionIcon}
      languageSupport={false}
      advanceSearch={advanceSearch}
      button={button}
      type={type}
    />
  );
};
