import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MockedProvider } from '@apollo/client/testing';
import ContactBar from './ContactBar';
import { contactCollectionsQuery } from '../../../../mocks/Contact';
import { MemoryRouter } from 'react-router';
import { getCollectionsQuery } from '../../../../mocks/Collection';
import { getPublishedFlowQuery } from '../../../../mocks/Flow';

const mocks = [contactCollectionsQuery, ...getCollectionsQuery, getPublishedFlowQuery];

const defaultProps = {
  displayName: 'Jane Doe',
  contactId: '2',
  lastMessageTime: new Date(),
  contactBspStatus: 'SESSION',
};
const propsWithBspStatusNone = { ...defaultProps, contactBspStatus: 'NONE' };

const component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <ContactBar {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render the name correctly', async () => {
  const { getByText } = render(component);

  const contactBarComponent = screen.getByTestId('beneficiaryName');
  expect(contactBarComponent).toBeInTheDocument();
  expect(getByText('Jane Doe')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Default Collection, Staff Collection')).toBeInTheDocument();
  });
});

test('it should have a session timer', async () => {
  const { getByText } = render(component);
  await waitFor(() => {
    expect(getByText('24')).toBeInTheDocument();
  });
});

describe('Menu test', () => {
  beforeEach(async () => {
    render(component);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('dropdownIcon')?.querySelector('svg'));
    });
  });

  test('it should open a menu when dropdown icon is clicked', async () => {
    expect(screen.getByText('View contact profile')).toBeInTheDocument();
  });

  test('clicking on add to collection button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('collectionButton'));
    await waitFor(() => {
      expect(screen.getByText('Add contact to collection')).toBeInTheDocument();
    });
  });

  test('clicking on Start flow should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('flowButton'));

    await waitFor(() => {
      expect(screen.getAllByText('Select flow')[0]).toBeInTheDocument();
    });
  });

  test('clicking on clear chat button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('clearChatButton'));

    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to clear all conversation for this contact?')
      ).toBeInTheDocument();
    });
  });

  test('clicking on block button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('blockButton'));

    await waitFor(() => {
      expect(screen.getByText('Do you want to block this contact')).toBeInTheDocument();
    });
  });

  const componentWithBspStatusNone = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ContactBar {...propsWithBspStatusNone} />
      </MemoryRouter>
    </MockedProvider>
  );

  test('Select flow should be blocked when Bsp Status is none', async () => {
    cleanup();
    const { getByTestId } = render(componentWithBspStatusNone);
    await waitFor(() => {
      fireEvent.click(getByTestId('dropdownIcon')?.querySelector('svg'));
    });
    await waitFor(() => {
      expect(getByTestId('disabledFlowButton')).toBeInTheDocument();
    });
  });
});
