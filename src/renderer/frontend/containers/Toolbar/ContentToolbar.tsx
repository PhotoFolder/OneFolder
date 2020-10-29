import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { KeyCombo } from '@blueprintjs/core';
import { Tooltip } from '.';
import { IconSet } from 'components';
import {
  ToolbarButton,
  ToolbarToggleButton,
  ToolbarMenuButton,
  Menu,
  MenuRadioGroup,
  MenuRadioItem,
} from 'components/menu';
import { IFile } from '../../../entities/File';
import { FileOrder } from '../../../backend/DBRepository';
import StoreContext from '../../contexts/StoreContext';
import { FileRemoval } from 'src/renderer/frontend/components/RemovalAlert';
import Searchbar from './Searchbar';

const FileSelection = observer(() => {
  const { uiStore, fileStore } = useContext(StoreContext);
  const { fileSelection } = uiStore;

  const allFilesSelected =
    fileSelection.size > 0 && fileSelection.size === fileStore.fileList.length;
  // If everything is selected, deselect all. Else, select all
  const handleToggleSelect = () =>
    allFilesSelected ? uiStore.clearFileSelection() : uiStore.selectAllFiles();

  return (
    <ToolbarToggleButton
      showLabel="always"
      icon={allFilesSelected ? IconSet.SELECT_ALL_CHECKED : IconSet.SELECT_ALL}
      onClick={handleToggleSelect}
      pressed={allFilesSelected}
      text={fileSelection.size}
      tooltip={Tooltip.Select}
    />
  );
});

const RemoveFilesPopover = observer(() => {
  const { uiStore } = useContext(StoreContext);
  return (
    <>
      <ToolbarButton
        icon={IconSet.DELETE}
        disabled={uiStore.fileSelection.size === 0}
        onClick={uiStore.openToolbarFileRemover}
        text="Delete"
        tooltip={Tooltip.Delete}
        // Giving it a warning intent will make it stand out more - it is usually hidden so it might not be obviously discovered
        // intent="warning"
      />
      <FileRemoval />
    </>
  );
});

const sortMenuData: Array<{ prop: keyof IFile; icon: JSX.Element; text: string }> = [
  // { prop: 'tags', icon: IconSet.TAG, text: 'Tag' },
  { prop: 'name', icon: IconSet.FILTER_NAME_UP, text: 'Name' },
  { prop: 'extension', icon: IconSet.FILTER_FILE_TYPE, text: 'File type' },
  { prop: 'size', icon: IconSet.FILTER_FILTER_DOWN, text: 'File size' },
  { prop: 'dateAdded', icon: IconSet.FILTER_DATE, text: 'Date added' },
  { prop: 'dateModified', icon: IconSet.FILTER_DATE, text: 'Date modified' },
  { prop: 'dateCreated', icon: IconSet.FILTER_DATE, text: 'Date created' },
];

export const SortMenuItems = observer(() => {
  const { fileStore } = useContext(StoreContext);
  const { fileOrder, orderBy, orderFilesBy, switchFileOrder } = fileStore;
  const orderIcon = fileOrder === FileOrder.DESC ? IconSet.ARROW_DOWN : IconSet.ARROW_UP;

  return (
    <MenuRadioGroup>
      {sortMenuData.map(({ prop, icon, text }) => (
        <MenuRadioItem
          key={prop}
          icon={icon}
          text={text}
          checked={orderBy === prop}
          accelerator={orderBy === prop ? orderIcon : undefined}
          onClick={() => (orderBy === prop ? switchFileOrder() : orderFilesBy(prop))}
        />
      ))}
    </MenuRadioGroup>
  );
});

export const LayoutMenuItems = observer(() => {
  const { uiStore } = useContext(StoreContext);
  return (
    <MenuRadioGroup>
      <MenuRadioItem
        icon={IconSet.VIEW_LIST}
        onClick={uiStore.setMethodList}
        checked={uiStore.isList}
        text="List View"
        accelerator={<KeyCombo minimal combo={uiStore.hotkeyMap.viewList} />}
      />
      <MenuRadioItem
        icon={IconSet.VIEW_GRID}
        onClick={uiStore.setMethodGrid}
        checked={uiStore.isGrid}
        text="Grid View"
        accelerator={<KeyCombo minimal combo={uiStore.hotkeyMap.viewGrid} />}
      />
    </MenuRadioGroup>
  );
});

const SlideModeToolbar = observer(() => {
  const { uiStore } = useContext(StoreContext);
  return (
    <ToolbarButton
      showLabel="always"
      icon={IconSet.ARROW_LEFT}
      onClick={uiStore.disableSlideMode}
      text="Return"
      tooltip={Tooltip.Back}
    />
  );
});

const ContentToolbar = observer(() => {
  const { uiStore, fileStore } = useContext(StoreContext);

  if (uiStore.isSlideMode) {
    return <SlideModeToolbar />;
  } else {
    return (
      <>
        <FileSelection />

        <Searchbar />

        {/* TODO: Put back tag button (or just the T hotkey) */}
        {fileStore.showsMissingContent ? (
          // Only show option to remove selected files in toolbar when viewing missing files */}
          <RemoveFilesPopover />
        ) : (
          // Only show when not viewing missing files (so it is replaced by the Delete button)
          // <FileTags files={fileSelection.size > 0 ? uiStore.clientFileSelection : []} />
          // Doesn't exist anymore :(
          // <TagFilesPopover
          //   files={uiStore.clientFileSelection}
          //   disabled={fileSelection.length <= 0 || fileStore.fileList.length <= 0}
          //   isOpen={uiStore.isToolbarTagSelectorOpen}
          //   close={uiStore.closeToolbarTagSelector}
          //   toggle={uiStore.toggleToolbarTagSelector}
          //   hidden={fileStore.content === 'missing'}
          // />
          <></>
        )}

        <ToolbarMenuButton
          showLabel="never"
          icon={IconSet.FILTER}
          text="Sort"
          tooltip={Tooltip.Filter}
          id="__sort-menu"
          controls="__sort-options"
        >
          <Menu id="__sort-options" labelledby="__sort-menu">
            <SortMenuItems />
          </Menu>
        </ToolbarMenuButton>

        <ToolbarMenuButton
          showLabel="never"
          icon={IconSet.THUMB_BG}
          text="View"
          tooltip={Tooltip.View}
          id="__layout-menu"
          controls="__layout-options"
        >
          <Menu id="__layout-options" labelledby="__layout-menu">
            <LayoutMenuItems />
          </Menu>
        </ToolbarMenuButton>
      </>
    );
  }
});

export default ContentToolbar;
