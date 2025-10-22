import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GroupSelectionModal } from './group-selection-modal';

interface GroupOption {
  name: string;
  channelCount: number;
}

interface ChannelGroupButtonProps {
  groups: GroupOption[];
  selectedGroupName: string;
  onGroupSelect: (groupName: string) => void;
}

export function ChannelGroupButton({
  groups,
  selectedGroupName,
  onGroupSelect,
}: ChannelGroupButtonProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getDisplayText = () => {
    if (!selectedGroupName) {
      return 'All Channels';
    }
    return selectedGroupName;
  };

  const handleButtonPress = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleGroupSelect = (groupName: string) => {
    onGroupSelect(groupName);
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        title={getDisplayText()}
        onPress={handleButtonPress}
        variant="secondary"
        icon="folder"
        accessibilityLabel={`Currently showing ${getDisplayText()}. Tap to change channel group`}
        accessibilityHint="Opens channel group selection modal"
      />

      <GroupSelectionModal
        visible={isModalVisible}
        onClose={handleModalClose}
        groups={groups}
        selectedGroupName={selectedGroupName}
        onGroupSelect={handleGroupSelect}
      />
    </>
  );
}